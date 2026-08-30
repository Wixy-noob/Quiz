import { GestureState, HandTrackingData, SingleHandData, Point2D, Point3D, FingerLandmarks } from "../types";
import { Point2DSmoother, OneEuroFilter } from "./oneEuroFilter";

// MediaPipe joint index mapping
// 0: WRIST
// 1-4: THUMB (CMC, MCP, IP, TIP)
// 5-8: INDEX (MCP, PIP, DIP, TIP)
// 9-12: MIDDLE (MCP, PIP, DIP, TIP)
// 13-16: RING (MCP, PIP, DIP, TIP)
// 17-20: PINKY (MCP, PIP, DIP, TIP)

export const FIST_CLOSE_THRESHOLD = 0.65; // Hand closure >= 65% triggers Fist Click
export const FIST_RELEASE_THRESHOLD = 0.42; // Hand closure <= 42% releases Fist Click
export const PINCH_START_THRESHOLD = 0.045; // Start pinch when distance < 4.5%
export const PINCH_RELEASE_THRESHOLD = 0.068; // Release pinch when distance > 6.8%
export const CLICK_COOLDOWN_MS = 320; // Minimum time between consecutive clicks
export const DUAL_HAND_NEXT_COOLDOWN_MS = 1200; // Minimum time between consecutive dual hand next triggers

class SingleHandProcessor {
  public pointerSmoother = new Point2DSmoother(0.8, 0.035, 0.001);
  public distanceSmoother = new OneEuroFilter(0.8, 0.04, 1.0, 0.001);
  public fistSmoother = new OneEuroFilter(0.9, 0.04, 1.0, 0.001);
  public fingerSmoothers: Point2DSmoother[] = Array.from(
    { length: 21 },
    () => new Point2DSmoother(0.8, 0.035, 0.001)
  );

  public currentState: GestureState = GestureState.NO_HAND;
  public isPinching: boolean = false;
  public isClosedFist: boolean = false;
  public isOpenHand: boolean = false;
  public consecutiveFistFrames: number = 0;
  public consecutiveFistReleaseFrames: number = 0;
  public consecutivePinchFrames: number = 0;
  public consecutivePinchReleaseFrames: number = 0;

  // Pointer lock during closure
  public lockedPointerPos: Point2D | null = null;
  public isPointerLocked: boolean = false;

  private dist3D(p1: { x: number; y: number; z?: number }, p2: { x: number; y: number; z?: number }): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const dz = (p1.z || 0) - (p2.z || 0);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  public process(
    rawLandmarks: { x: number; y: number; z?: number }[],
    handedness: "Left" | "Right",
    confidence: number,
    now: number
  ): SingleHandData & { clickTriggered: boolean; clickType: "fist" | "pinch" | null } {
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
    const indexMcp = smoothed21[5];
    const indexPip = smoothed21[6];
    const indexTip = smoothed21[8];
    const middleMcp = smoothed21[9];
    const middleTip = smoothed21[12];
    const ringMcp = smoothed21[13];
    const ringTip = smoothed21[16];
    const pinkyMcp = smoothed21[17];
    const pinkyTip = smoothed21[20];

    // Reference Palm Scale
    const palmScale = Math.max(0.08, this.dist3D(wrist, middleMcp));

    // Finger Curls
    const indexDistToWrist = this.dist3D(indexTip, wrist) / palmScale;
    const middleDistToWrist = this.dist3D(middleTip, wrist) / palmScale;
    const ringDistToWrist = this.dist3D(ringTip, wrist) / palmScale;
    const pinkyDistToWrist = this.dist3D(pinkyTip, wrist) / palmScale;

    const curlIndex = Math.max(0, Math.min(1, (1.6 - indexDistToWrist) / 0.85));
    const curlMiddle = Math.max(0, Math.min(1, (1.7 - middleDistToWrist) / 0.9));
    const curlRing = Math.max(0, Math.min(1, (1.6 - ringDistToWrist) / 0.85));
    const curlPinky = Math.max(0, Math.min(1, (1.5 - pinkyDistToWrist) / 0.8));

    const rawFistClosure = curlIndex * 0.35 + curlMiddle * 0.25 + curlRing * 0.2 + curlPinky * 0.2;
    const smoothedFistClosure = this.fistSmoother.filter(rawFistClosure, now);

    // Open hand condition: low curl across all fingers
    this.isOpenHand = smoothedFistClosure <= 0.35 && curlIndex < 0.4 && curlMiddle < 0.4;

    // Pinch calculation
    const rawPinchDist = this.dist3D(thumbTip, indexTip);
    const smoothedPinchDist = this.distanceSmoother.filter(rawPinchDist, now);

    // Pointer smoothing & stabilization lock
    const rawPointer = this.pointerSmoother.filter(indexTip.x, indexTip.y, now);
    let finalPointer: Point2D;

    if (smoothedFistClosure > 0.40 || this.isClosedFist) {
      if (!this.isPointerLocked || !this.lockedPointerPos) {
        this.lockedPointerPos = { ...rawPointer };
        this.isPointerLocked = true;
      }
      finalPointer = this.lockedPointerPos;
    } else {
      this.isPointerLocked = false;
      this.lockedPointerPos = null;
      finalPointer = rawPointer;
    }

    // Fist State Machine
    const isFistClosedNow = smoothedFistClosure >= FIST_CLOSE_THRESHOLD;
    const isFistOpenNow = smoothedFistClosure <= FIST_RELEASE_THRESHOLD;

    if (isFistClosedNow) {
      this.consecutiveFistFrames++;
      this.consecutiveFistReleaseFrames = 0;
    } else if (isFistOpenNow) {
      this.consecutiveFistReleaseFrames++;
      this.consecutiveFistFrames = 0;
    }

    // Pinch State Machine
    const isPinchCloseNow = smoothedPinchDist < PINCH_START_THRESHOLD;
    const isPinchFarNow = smoothedPinchDist > PINCH_RELEASE_THRESHOLD;

    if (isPinchCloseNow) {
      this.consecutivePinchFrames++;
      this.consecutivePinchReleaseFrames = 0;
    } else if (isPinchFarNow) {
      this.consecutivePinchReleaseFrames++;
      this.consecutivePinchFrames = 0;
    }

    let clickTriggered = false;
    let clickType: "fist" | "pinch" | null = null;

    if (!this.isClosedFist) {
      if (this.consecutiveFistFrames >= 2) {
        this.isClosedFist = true;
        clickTriggered = true;
        clickType = "fist";
      }
    } else {
      if (this.consecutiveFistReleaseFrames >= 2) {
        this.isClosedFist = false;
      }
    }

    if (!clickTriggered && !this.isClosedFist) {
      if (!this.isPinching) {
        if (this.consecutivePinchFrames >= 2) {
          this.isPinching = true;
          clickTriggered = true;
          clickType = "pinch";
        }
      } else {
        if (this.consecutivePinchReleaseFrames >= 2) {
          this.isPinching = false;
        }
      }
    }

    // Determine state
    let state = GestureState.TRACKING;
    if (this.isClosedFist) {
      state = GestureState.CLOSED_FIST;
    } else if (smoothedFistClosure > 0.38) {
      state = GestureState.CLOSING_HAND;
    } else if (this.isPinching) {
      state = GestureState.PINCH_HOLD;
    } else if (smoothedPinchDist < PINCH_START_THRESHOLD * 1.5) {
      state = GestureState.READY_TO_PINCH;
    } else if (curlIndex < 0.35 && curlMiddle > 0.45) {
      state = GestureState.INDEX_POINTING;
    }

    this.currentState = state;

    const fingerLandmarks: FingerLandmarks = {
      wrist,
      thumb: smoothed21.slice(1, 5),
      index: smoothed21.slice(5, 9),
      middle: smoothed21.slice(9, 13),
      ring: smoothed21.slice(13, 17),
      pinky: smoothed21.slice(17, 21),
      rawLandmarks: smoothed21,
    };

    return {
      handedness,
      confidence,
      gestureState: state,
      pointer: {
        x: Math.max(0.02, Math.min(0.98, finalPointer.x)),
        y: Math.max(0.02, Math.min(0.98, finalPointer.y)),
      },
      isPinching: this.isPinching,
      isClosedFist: this.isClosedFist,
      isOpenHand: this.isOpenHand,
      fistProgress: Math.max(0, Math.min(1, smoothedFistClosure)),
      pinchDistance: smoothedPinchDist,
      landmarks: fingerLandmarks,
      clickTriggered,
      clickType,
    };
  }

  public reset(): void {
    this.currentState = GestureState.NO_HAND;
    this.isPinching = false;
    this.isClosedFist = false;
    this.isOpenHand = false;
    this.isPointerLocked = false;
    this.lockedPointerPos = null;
    this.consecutiveFistFrames = 0;
    this.consecutivePinchFrames = 0;
    this.consecutiveFistReleaseFrames = 0;
    this.consecutivePinchReleaseFrames = 0;
    this.pointerSmoother.reset();
    this.distanceSmoother.reset();
    this.fistSmoother.reset();
    this.fingerSmoothers.forEach((s) => s.reset());
  }
}

export class HandTrackingEngine {
  private handProcessors: [SingleHandProcessor, SingleHandProcessor] = [
    new SingleHandProcessor(),
    new SingleHandProcessor(),
  ];

  private lastClickTime: number = 0;
  private lastDualHandTriggerTime: number = 0;
  private dualHandConsecutiveFrames: number = 0;

  private framesSinceLastDetection: number = 0;
  private maxGraceFrames: number = 10;
  private lastGoodData: HandTrackingData | null = null;

  // FPS tracking
  private lastTimestamp: number = performance.now();
  private frameCount: number = 0;
  private currentFps: number = 60;

  public processMultiHandLandmarks(
    multiHandLandmarks: { x: number; y: number; z?: number }[][] | null | undefined,
    multiHandedness: { label: "Left" | "Right"; score: number }[] | null | undefined
  ): {
    trackingData: HandTrackingData;
    clickTriggered: boolean;
    isDualHandNextTriggered: boolean;
  } {
    const now = performance.now();
    this.frameCount++;
    if (now - this.lastTimestamp >= 500) {
      this.currentFps = Math.round((this.frameCount * 1000) / (now - this.lastTimestamp));
      this.frameCount = 0;
      this.lastTimestamp = now;
    }

    const detectedCount = multiHandLandmarks ? Math.min(multiHandLandmarks.length, 2) : 0;

    // 1. No hands detected
    if (detectedCount === 0) {
      this.framesSinceLastDetection++;

      if (this.lastGoodData && this.framesSinceLastDetection <= this.maxGraceFrames) {
        return {
          trackingData: {
            ...this.lastGoodData,
            fps: this.currentFps,
            confidence: Math.max(0.2, this.lastGoodData.confidence - 0.05 * this.framesSinceLastDetection),
          },
          clickTriggered: false,
          isDualHandNextTriggered: false,
        };
      }

      this.resetState();
      const emptyData: HandTrackingData = {
        isDetected: false,
        handedness: "Right",
        confidence: 0,
        gestureState: GestureState.NO_HAND,
        pointer: { x: 0.5, y: 0.5 },
        isPinching: false,
        isClosedFist: false,
        isClicking: false,
        clickType: null,
        fistProgress: 0,
        pinchDistance: 1.0,
        rawDistance: 1.0,
        fps: this.currentFps,
        handsCount: 0,
        allHands: [],
        isDualHandNextTriggered: false,
      };
      this.lastGoodData = emptyData;
      return { trackingData: emptyData, clickTriggered: false, isDualHandNextTriggered: false };
    }

    // 2. Hands detected
    this.framesSinceLastDetection = 0;

    const processedHands: SingleHandData[] = [];
    let clickTriggered = false;
    let clickType: "fist" | "pinch" | null = null;

    for (let i = 0; i < detectedCount; i++) {
      const landmarks = multiHandLandmarks![i];
      const handedness = multiHandedness?.[i]?.label || (i === 0 ? "Right" : "Left");
      const confidence = multiHandedness?.[i]?.score || 0.9;

      const res = this.handProcessors[i].process(landmarks, handedness as "Left" | "Right", confidence, now);
      processedHands.push(res);

      if (res.clickTriggered) {
        const timeSinceLastClick = now - this.lastClickTime;
        if (timeSinceLastClick > CLICK_COOLDOWN_MS) {
          clickTriggered = true;
          clickType = res.clickType;
          this.lastClickTime = now;
        }
      }
    }

    // 3. Dual Hand Gesture: "1 Tangan Buka + 1 Tangan Genggam/Mengepal" -> Next Question
    let isDualHandNextTriggered = false;
    let hasOneOpenOneFist = false;
    let openHandSide: "Left" | "Right" | undefined;
    let fistHandSide: "Left" | "Right" | undefined;

    if (processedHands.length >= 2) {
      const hand0 = processedHands[0];
      const hand1 = processedHands[1];

      const caseA = hand0.isOpenHand && hand1.isClosedFist;
      const caseB = hand0.isClosedFist && hand1.isOpenHand;

      if (caseA) {
        hasOneOpenOneFist = true;
        openHandSide = hand0.handedness;
        fistHandSide = hand1.handedness;
      } else if (caseB) {
        hasOneOpenOneFist = true;
        openHandSide = hand1.handedness;
        fistHandSide = hand0.handedness;
      }

      if (hasOneOpenOneFist) {
        this.dualHandConsecutiveFrames++;
        if (this.dualHandConsecutiveFrames >= 2) {
          const timeSinceLastDual = now - this.lastDualHandTriggerTime;
          if (timeSinceLastDual > DUAL_HAND_NEXT_COOLDOWN_MS) {
            isDualHandNextTriggered = true;
            this.lastDualHandTriggerTime = now;
            // Suppress single-hand clicks during dual hand gesture
            clickTriggered = false;
          }
        }
      } else {
        this.dualHandConsecutiveFrames = 0;
      }
    } else {
      this.dualHandConsecutiveFrames = 0;
    }

    // 4. Primary Hand Selection for Pointer & Single Interactions
    // Prefer the pointing hand or right hand or non-fist hand
    let primaryHand = processedHands[0];
    if (processedHands.length > 1) {
      if (processedHands[1].gestureState === GestureState.INDEX_POINTING || (!processedHands[1].isClosedFist && processedHands[0].isClosedFist)) {
        primaryHand = processedHands[1];
      }
    }

    const isClicking = primaryHand.isClosedFist || primaryHand.isPinching;

    const trackingData: HandTrackingData = {
      isDetected: true,
      handedness: primaryHand.handedness,
      confidence: primaryHand.confidence,
      gestureState: primaryHand.gestureState,
      pointer: primaryHand.pointer,
      isPinching: primaryHand.isPinching,
      isClosedFist: primaryHand.isClosedFist,
      isClicking,
      clickType: clickType || (primaryHand.isClosedFist ? "fist" : primaryHand.isPinching ? "pinch" : null),
      fistProgress: primaryHand.fistProgress,
      pinchDistance: primaryHand.pinchDistance,
      rawDistance: primaryHand.pinchDistance,
      fps: this.currentFps,
      landmarks: primaryHand.landmarks,
      handsCount: processedHands.length,
      allHands: processedHands,
      isDualHandNextTriggered,
      dualHandState: {
        hasOneOpenOneFist,
        openHandSide,
        fistHandSide,
      },
    };

    this.lastGoodData = trackingData;
    return { trackingData, clickTriggered, isDualHandNextTriggered };
  }

  // Single-hand fallback compatibility method
  public processRawLandmarks(
    rawLandmarks: { x: number; y: number; z?: number }[] | null | undefined,
    handedness: "Left" | "Right" = "Right",
    confidence: number = 0.9
  ): {
    trackingData: HandTrackingData;
    clickTriggered: boolean;
    isDualHandNextTriggered: boolean;
  } {
    if (!rawLandmarks) {
      return this.processMultiHandLandmarks(null, null);
    }
    return this.processMultiHandLandmarks([rawLandmarks], [{ label: handedness, score: confidence }]);
  }

  private resetState(): void {
    this.handProcessors[0].reset();
    this.handProcessors[1].reset();
    this.dualHandConsecutiveFrames = 0;
  }

  public reset(): void {
    this.resetState();
    this.lastGoodData = null;
  }
}
