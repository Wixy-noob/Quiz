import { GestureState, HandTrackingData, Point2D, Point3D, FingerLandmarks } from "../types";
import { Point2DSmoother, OneEuroFilter } from "./oneEuroFilter";

// MediaPipe joint index mapping
// 0: WRIST
// 1-4: THUMB (CMC, MCP, IP, TIP)
// 5-8: INDEX (MCP, PIP, DIP, TIP)
// 9-12: MIDDLE (MCP, PIP, DIP, TIP)
// 13-16: RING (MCP, PIP, DIP, TIP)
// 17-20: PINKY (MCP, PIP, DIP, TIP)

export const PINCH_START_THRESHOLD = 0.045; // Start pinch when distance < 4.5% of screen
export const PINCH_RELEASE_THRESHOLD = 0.068; // Release pinch when distance > 6.8%
export const PINCH_COOLDOWN_MS = 350; // Minimum time between consecutive clicks

export class HandTrackingEngine {
  private pointerSmoother = new Point2DSmoother(1.5, 0.1);
  private distanceSmoother = new OneEuroFilter(1.0, 0.05);
  private fingerSmoothers: Point2DSmoother[] = Array.from({ length: 21 }, () => new Point2DSmoother(1.2, 0.08));

  private currentState: GestureState = GestureState.NO_HAND;
  private isPinching: boolean = false;
  private lastPinchTime: number = 0;
  private framesSinceLastDetection: number = 0;
  private maxGraceFrames: number = 10; // Grace period to prevent flicker on temporary occlusion
  private lastGoodData: HandTrackingData | null = null;
  private consecutivePinchFrames: number = 0;
  private consecutiveReleaseFrames: number = 0;

  // FPS tracking
  private lastTimestamp: number = performance.now();
  private frameCount: number = 0;
  private currentFps: number = 60;

  public processRawLandmarks(
    rawLandmarks: { x: number; y: number; z?: number }[] | null | undefined,
    handedness: "Left" | "Right" = "Right",
    confidence: number = 0.9
  ): {
    trackingData: HandTrackingData;
    clickTriggered: boolean;
  } {
    const now = performance.now();
    this.frameCount++;
    if (now - this.lastTimestamp >= 500) {
      this.currentFps = Math.round((this.frameCount * 1000) / (now - this.lastTimestamp));
      this.frameCount = 0;
      this.lastTimestamp = now;
    }

    let clickTriggered = false;

    // If no landmarks detected in this frame
    if (!rawLandmarks || rawLandmarks.length < 21) {
      this.framesSinceLastDetection++;

      // If within grace period, return last good data with HOLD state so UI doesn't drop
      if (this.lastGoodData && this.framesSinceLastDetection <= this.maxGraceFrames) {
        return {
          trackingData: {
            ...this.lastGoodData,
            fps: this.currentFps,
            confidence: Math.max(0.3, this.lastGoodData.confidence - 0.08 * this.framesSinceLastDetection),
          },
          clickTriggered: false,
        };
      }

      // Truly lost
      this.currentState = GestureState.NO_HAND;
      this.isPinching = false;
      this.consecutivePinchFrames = 0;
      this.pointerSmoother.reset();
      this.distanceSmoother.reset();
      this.fingerSmoothers.forEach((s) => s.reset());

      const emptyData: HandTrackingData = {
        isDetected: false,
        handedness: "Right",
        confidence: 0,
        gestureState: GestureState.NO_HAND,
        pointer: { x: 0.5, y: 0.5 },
        isPinching: false,
        pinchDistance: 1.0,
        rawDistance: 1.0,
        fps: this.currentFps,
      };
      this.lastGoodData = emptyData;
      return { trackingData: emptyData, clickTriggered: false };
    }

    // Hand successfully detected
    this.framesSinceLastDetection = 0;

    // In a non-mirror camera view, x ranges from 0 to 1 directly.
    // Smooth all 21 joints
    const smoothed21: Point3D[] = rawLandmarks.map((pt, i) => {
      const smoothed = this.fingerSmoothers[i].filter(pt.x, pt.y, now);
      return {
        x: smoothed.x,
        y: smoothed.y,
        z: pt.z || 0,
      };
    });

    const wrist = smoothed21[0];
    const thumbTip = smoothed21[4];
    const indexTip = smoothed21[8];
    const indexPip = smoothed21[6];
    const middleTip = smoothed21[12];
    const ringTip = smoothed21[16];
    const pinkyTip = smoothed21[20];

    // Smooth index finger tip for pointer position
    const smoothedPointer = this.pointerSmoother.filter(indexTip.x, indexTip.y, now);

    // Calculate 3D/2D distance between Thumb tip (4) and Index tip (8)
    const dx = thumbTip.x - indexTip.x;
    const dy = thumbTip.y - indexTip.y;
    const rawDist = Math.sqrt(dx * dx + dy * dy);
    const smoothedDist = this.distanceSmoother.filter(rawDist, now);

    // Gesture State Machine evaluation
    const isIndexExtended = indexTip.y < indexPip.y || Math.abs(indexTip.y - wrist.y) > 0.12;
    const isPinchClose = smoothedDist < PINCH_START_THRESHOLD;
    const isPinchFar = smoothedDist > PINCH_RELEASE_THRESHOLD;

    if (isPinchClose) {
      this.consecutivePinchFrames++;
      this.consecutiveReleaseFrames = 0;
    } else if (isPinchFar) {
      this.consecutiveReleaseFrames++;
      this.consecutivePinchFrames = 0;
    }

    // State transition logic with multi-frame hysteresis
    let nextState = this.currentState;

    if (!this.isPinching) {
      if (this.consecutivePinchFrames >= 2) {
        // Pinch started!
        const timeSinceLastPinch = now - this.lastPinchTime;
        if (timeSinceLastPinch > PINCH_COOLDOWN_MS) {
          nextState = GestureState.PINCH_START;
          this.isPinching = true;
          this.lastPinchTime = now;
          clickTriggered = true; // 1 pinch = 1 click trigger
        } else {
          nextState = GestureState.READY_TO_PINCH;
        }
      } else if (smoothedDist < PINCH_START_THRESHOLD * 1.5) {
        nextState = GestureState.READY_TO_PINCH;
      } else if (isIndexExtended) {
        nextState = GestureState.INDEX_POINTING;
      } else {
        nextState = GestureState.TRACKING;
      }
    } else {
      // Currently pinching
      if (this.consecutiveReleaseFrames >= 2) {
        nextState = GestureState.PINCH_RELEASE;
        this.isPinching = false;
      } else {
        nextState = GestureState.PINCH_HOLD;
      }
    }

    this.currentState = nextState;

    const fingerLandmarks: FingerLandmarks = {
      wrist,
      thumb: smoothed21.slice(1, 5),
      index: smoothed21.slice(5, 9),
      middle: smoothed21.slice(9, 13),
      ring: smoothed21.slice(13, 17),
      pinky: smoothed21.slice(17, 21),
      rawLandmarks: smoothed21,
    };

    const trackingData: HandTrackingData = {
      isDetected: true,
      handedness,
      confidence,
      gestureState: this.currentState,
      pointer: {
        x: Math.max(0, Math.min(1, smoothedPointer.x)),
        y: Math.max(0, Math.min(1, smoothedPointer.y)),
      },
      isPinching: this.isPinching,
      pinchDistance: smoothedDist,
      rawDistance: rawDist,
      fps: this.currentFps,
      landmarks: fingerLandmarks,
    };

    this.lastGoodData = trackingData;
    return { trackingData, clickTriggered };
  }

  public reset(): void {
    this.currentState = GestureState.NO_HAND;
    this.isPinching = false;
    this.lastGoodData = null;
    this.pointerSmoother.reset();
    this.distanceSmoother.reset();
    this.fingerSmoothers.forEach((s) => s.reset());
  }
}
