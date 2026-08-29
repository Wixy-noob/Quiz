import React, { useEffect, useRef, useState, useCallback } from "react";
import { CameraPipelineManager, CameraFacing } from "../lib/cameraManager";
import { HandTrackingEngine } from "../lib/handTracking";
import { HandTrackingData, GestureState } from "../types";
import { HandPointerOverlay } from "./HandPointerOverlay";
import { RefreshCw, Camera, AlertCircle, Eye, EyeOff, Sparkles, Smartphone } from "lucide-react";

interface CameraViewProps {
  onPointerClick?: (targetId: string | null) => void;
  hoveredElementId: string | null;
  onHoverTargetChange: (targetId: string | null) => void;
  showDebugSkeleton: boolean;
  onToggleDebugSkeleton: () => void;
  isTouchOnlyMode: boolean;
  onToggleTouchMode: (touchOnly: boolean) => void;
  children?: React.ReactNode;
}

export const CameraView: React.FC<CameraViewProps> = ({
  onPointerClick,
  hoveredElementId,
  onHoverTargetChange,
  showDebugSkeleton,
  onToggleDebugSkeleton,
  isTouchOnlyMode,
  onToggleTouchMode,
  children,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cameraManagerRef = useRef<CameraPipelineManager>(new CameraPipelineManager());
  const handEngineRef = useRef<HandTrackingEngine>(new HandTrackingEngine());

  const [facingMode, setFacingMode] = useState<CameraFacing>("user");
  const [cameraStatus, setCameraStatus] = useState<"initializing" | "running" | "error">("initializing");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [containerDimensions, setContainerDimensions] = useState<{ width: number; height: number }>({
    width: 1280,
    height: 720,
  });

  const [trackingData, setTrackingData] = useState<HandTrackingData>({
    isDetected: false,
    handedness: "Right",
    confidence: 0,
    gestureState: GestureState.NO_HAND,
    pointer: { x: 0.5, y: 0.5 },
    isPinching: false,
    pinchDistance: 1.0,
    rawDistance: 1.0,
    fps: 60,
  });

  // Track raycasting targets
  const findHoveredTarget = useCallback((pointerXNorm: number, pointerYNorm: number): string | null => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = rect.left + pointerXNorm * rect.width;
    const clientY = rect.top + pointerYNorm * rect.height;

    // Find all interactive elements with [data-clickable-id] attribute
    const interactiveElements = document.querySelectorAll("[data-clickable-id]");
    let foundId: string | null = null;

    interactiveElements.forEach((el) => {
      const elRect = el.getBoundingClientRect();
      if (
        clientX >= elRect.left &&
        clientX <= elRect.right &&
        clientY >= elRect.top &&
        clientY <= elRect.bottom
      ) {
        foundId = el.getAttribute("data-clickable-id");
      }
    });

    return foundId;
  }, []);

  // Handle MediaPipe hands detection results
  const handleMediaPipeResults = useCallback(
    (results: any) => {
      if (isTouchOnlyMode) return;

      const rawLandmarks = results.multiHandLandmarks?.[0];
      const handedness = results.multiHandedness?.[0]?.label || "Right";
      const confidence = results.multiHandedness?.[0]?.score || 0.9;

      const { trackingData: processed, clickTriggered } = handEngineRef.current.processRawLandmarks(
        rawLandmarks,
        handedness as "Left" | "Right",
        confidence
      );

      setTrackingData(processed);

      // Perform Raycast check with index finger pointer
      if (processed.isDetected) {
        const target = findHoveredTarget(processed.pointer.x, processed.pointer.y);
        onHoverTargetChange(target);

        // If pinch gesture clicked
        if (clickTriggered && onPointerClick) {
          onPointerClick(target);
        }
      } else {
        onHoverTargetChange(null);
      }
    },
    [isTouchOnlyMode, findHoveredTarget, onHoverTargetChange, onPointerClick]
  );

  // Initialize camera
  const initCamera = useCallback(
    async (facing: CameraFacing = "user") => {
      if (!videoRef.current) return;
      setCameraStatus("initializing");
      setErrorMessage("");

      const res = await cameraManagerRef.current.startCamera(videoRef.current, facing, handleMediaPipeResults);

      if (res.success) {
        setCameraStatus("running");
        setFacingMode(facing);
      } else {
        setCameraStatus("error");
        setErrorMessage(res.error || "Failed to start camera stream");
      }
    },
    [handleMediaPipeResults]
  );

  // Switch camera front <-> back
  const handleSwitchCamera = async () => {
    if (!videoRef.current) return;
    const res = await cameraManagerRef.current.switchCamera(videoRef.current, handleMediaPipeResults);
    if (res.success) {
      setFacingMode(res.facing);
    } else {
      setErrorMessage(res.error || "Failed to switch camera");
    }
  };

  // Resize observer for responsive coordinate math
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Mount camera on start
  useEffect(() => {
    initCamera(facingMode);
    return () => {
      cameraManagerRef.current.stopCameraStream();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="ar-camera-container"
      className="relative w-full h-full min-h-[500px] overflow-hidden bg-slate-950 flex items-center justify-center select-none"
    >
      {/* 1. Camera Video Feed - STRICTLY NON-MIRROR */}
      <video
        ref={videoRef}
        id="camera-video-feed"
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{
          transform: "none",
          WebkitTransform: "none",
        }}
      />

      {/* Subtle AR Grid & Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40" />

      {/* 2. Top-Left Controls & Status Pill Bar */}
      <div className="absolute top-4 left-4 z-40 flex flex-wrap items-center gap-2 pointer-events-auto">
        {/* Switch Camera Button */}
        <button
          id="btn-switch-camera"
          onClick={handleSwitchCamera}
          className="flex items-center gap-2 px-3 py-2 bg-slate-900/85 hover:bg-slate-800 text-white rounded-xl border border-slate-700/80 text-xs font-semibold backdrop-blur-md shadow-lg transition-all active:scale-95"
          title="Switch between front and back camera"
        >
          <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
          <span>{facingMode === "user" ? "Front (Non-Mirror)" : "Back Camera"}</span>
        </button>

        {/* Debug Hand Skeleton Toggle Button */}
        <button
          id="btn-toggle-debug"
          onClick={onToggleDebugSkeleton}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold backdrop-blur-md shadow-lg transition-all active:scale-95 ${
            showDebugSkeleton
              ? "bg-amber-500/25 border-amber-400 text-amber-300"
              : "bg-slate-900/85 border-slate-700/80 text-slate-300 hover:text-white"
          }`}
          title="Toggle 21-Joint Skeleton & State Machine Debug"
        >
          {showDebugSkeleton ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>Debug 5-Finger Skeleton</span>
        </button>

        {/* Touch Mode vs Hand Mode Toggle */}
        <button
          id="btn-toggle-touch-mode"
          onClick={() => onToggleTouchMode(!isTouchOnlyMode)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold backdrop-blur-md shadow-lg transition-all active:scale-95 ${
            isTouchOnlyMode
              ? "bg-purple-500/25 border-purple-400 text-purple-300"
              : "bg-slate-900/85 border-slate-700/80 text-slate-300 hover:text-white"
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>{isTouchOnlyMode ? "Touch Mode Active" : "5-Finger AR Pinch Active"}</span>
        </button>

        {/* Hand Status Badge */}
        {!isTouchOnlyMode && (
          <div
            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl border text-xs font-semibold backdrop-blur-md ${
              trackingData.isDetected
                ? "bg-emerald-950/80 border-emerald-600/80 text-emerald-400"
                : "bg-slate-900/80 border-slate-700 text-slate-400"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                trackingData.isDetected ? "bg-emerald-400 animate-ping" : "bg-slate-500"
              }`}
            />
            <span>{trackingData.isDetected ? "5 Fingers Ready" : "Raise Hand ☝"}</span>
          </div>
        )}
      </div>

      {/* 3. Error Fallback Card */}
      {cameraStatus === "error" && (
        <div className="absolute z-50 max-w-md p-6 bg-slate-900/95 border border-rose-500/50 rounded-2xl text-center shadow-2xl backdrop-blur-xl space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Camera Unavailable</h3>
            <p className="text-xs text-slate-300 mt-1">
              {errorMessage || "Unable to access camera. Please allow camera permissions in your browser or app settings."}
            </p>
          </div>
          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={() => initCamera(facingMode)}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-md active:scale-95"
            >
              RETRY
            </button>
            <button
              onClick={() => onToggleTouchMode(true)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-xl text-xs font-semibold active:scale-95"
            >
              USE NORMAL / TOUCH MODE
            </button>
          </div>
        </div>
      )}

      {/* 4. Hand Pointer & Skeleton Debug Overlay */}
      {!isTouchOnlyMode && (
        <HandPointerOverlay
          trackingData={trackingData}
          hoveredElementId={hoveredElementId}
          showDebugSkeleton={showDebugSkeleton}
          containerWidth={containerDimensions.width}
          containerHeight={containerDimensions.height}
        />
      )}

      {/* 5. Floating Children / Content Layers */}
      <div className="relative z-30 w-full h-full pointer-events-none flex items-center justify-center p-4">
        {children}
      </div>
    </div>
  );
};
