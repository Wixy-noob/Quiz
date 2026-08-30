/**
 * Camera Stream and MediaPipe Hands Pipeline
 * High-precision multi-hand tracking with smooth non-blocking frame pipeline.
 */

export type CameraFacing = "user" | "environment";

export class CameraPipelineManager {
  private currentStream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private facingMode: CameraFacing = "user";
  private isProcessing: boolean = false;
  private animFrameId: number | null = null;
  private handsInstance: any = null;
  private onResultsCallback: ((results: any) => void) | null = null;
  private isHandsLoaded: boolean = false;

  constructor() {}

  public async loadMediaPipeHands(): Promise<boolean> {
    if (this.isHandsLoaded && this.handsInstance) return true;

    try {
      // Dynamic import from installed package or CDN
      let HandsConstructor: any;
      try {
        const mpHands = await import("@mediapipe/hands");
        HandsConstructor = (mpHands as any).Hands || (window as any).Hands;
      } catch (err) {
        console.warn("NPM import failed, falling back to CDN script...", err);
      }

      if (!HandsConstructor && typeof window !== "undefined") {
        if (!(window as any).Hands) {
          await this.loadScriptFromCdn("https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js");
        }
        HandsConstructor = (window as any).Hands;
      }

      if (!HandsConstructor) {
        throw new Error("Hands library constructor could not be resolved.");
      }

      this.handsInstance = new HandsConstructor({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        },
      });

      this.handsInstance.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.45,
        minTrackingConfidence: 0.45,
      });

      this.handsInstance.onResults((results: any) => {
        if (this.onResultsCallback) {
          this.onResultsCallback(results);
        }
      });

      this.isHandsLoaded = true;
      return true;
    } catch (err) {
      console.error("Failed to load MediaPipe Hands:", err);
      return false;
    }
  }

  private loadScriptFromCdn(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.crossOrigin = "anonymous";
      script.onload = () => resolve();
      script.onerror = (e) => reject(e);
      document.head.appendChild(script);
    });
  }

  public async startCamera(
    videoEl: HTMLVideoElement,
    facing: CameraFacing = "user",
    onResults: (results: any) => void
  ): Promise<{ success: boolean; error?: string }> {
    this.videoElement = videoEl;
    this.facingMode = facing;
    this.onResultsCallback = onResults;

    // 1. Stop old streams
    this.stopCameraStream();

    // 2. Load hands model
    const handsReady = await this.loadMediaPipeHands();
    if (!handsReady) {
      console.warn("Hand tracking model could not be initialized. Camera will still display.");
    }

    // 3. Acquire new MediaStream with requested facingMode
    try {
      const constraints: MediaStreamConstraints = {
        audio: false,
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.currentStream = stream;
      videoEl.srcObject = stream;

      await new Promise<void>((resolve) => {
        videoEl.onloadedmetadata = () => {
          videoEl.play();
          resolve();
        };
      });

      // 4. Start processing frame loop
      this.isProcessing = true;
      this.startProcessingLoop();

      return { success: true };
    } catch (err: any) {
      console.error("getUserMedia error:", err);
      return {
        success: false,
        error: err.name === "NotAllowedError" ? "Camera permission denied" : err.message || "Failed to start camera",
      };
    }
  }

  public async switchCamera(
    videoEl: HTMLVideoElement,
    onResults: (results: any) => void
  ): Promise<{ success: boolean; facing: CameraFacing; error?: string }> {
    const nextFacing: CameraFacing = this.facingMode === "user" ? "environment" : "user";
    const res = await this.startCamera(videoEl, nextFacing, onResults);
    return {
      success: res.success,
      facing: nextFacing,
      error: res.error,
    };
  }

  private startProcessingLoop(): void {
    if (!this.videoElement || !this.handsInstance) return;

    let isBusy = false;

    const loop = async () => {
      if (!this.isProcessing) return;

      if (
        this.videoElement &&
        this.videoElement.readyState >= 2 &&
        !this.videoElement.paused &&
        !isBusy &&
        this.handsInstance
      ) {
        isBusy = true;
        try {
          await this.handsInstance.send({ image: this.videoElement });
        } catch (e) {
          // Frame error ignored
        } finally {
          isBusy = false;
        }
      }

      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  public stopCameraStream(): void {
    this.isProcessing = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.currentStream) {
      this.currentStream.getTracks().forEach((track) => track.stop());
      this.currentStream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
  }

  public getFacing(): CameraFacing {
    return this.facingMode;
  }
}
