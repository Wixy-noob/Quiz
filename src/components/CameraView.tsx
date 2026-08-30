import React, { useEffect, useRef, useState, useCallback } from "react";
import { CameraPipelineManager, CameraFacing } from "../lib/cameraManager";
import { HandTrackingEngine } from "../lib/handTracking";
import { HandTrackingData, GestureState } from "../types";
import { HandPointerOverlay } from "./HandPointerOverlay";
import { RefreshCw, Camera, AlertCircle, Eye, EyeOff, Sparkles, Smartphone, FlipHorizontal, Hand } from "lucide-react";

interface CameraViewProps {
  onPointerClick?: (targetId: string | null) => void;
  onDualHandNext?: () => void;
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
  onDualHandNext,
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
  const [isMirrored, setIsMirrored] = useState<boolean>(true);
  const [cameraStatus, setCameraStatus] = useState<"initializing" | "running" | "error">("initializing");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [containerDimensions, setContainerDimensions] = useState<{ width: number; height: number }>({
    width: 1280,
    height: 720,
  });

  // Keep track of recent hovered element to prevent miss during fist clench
  const lastHoveredRef = useRef<{ id: string | null; timestamp: number }>({
    id: null,
    timestamp: 0,
  });

  // Dwell click timer ref
  const dwellHoverRef = useRef<{ targetId: string | null; startTime: number }>({
    targetId: null,
    startTime: 0,
  });

  const [trackingData, setTrackingData] = useState<HandTrackingData>({
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
    fps: 60,
    handsCount: 0,
    allHands: [],
    isDualHandNextTriggered: false,
  });

  // Find interactive elements via raycasting
  const findHoveredTarget = useCallback(
    (pointerXNorm: number, pointerYNorm: number, mirrored: boolean): string | null => {
      if (!containerRef.current) return null;
      const rect = containerRef.current.getBoundingClientRect();

      const adjustedXNorm = mirrored ? 1 - pointerXNorm : pointerXNorm;
      const clientX = rect.left + adjustedXNorm * rect.width;
      const clientY = rect.top + pointerYNorm * rect.height;

      const interactiveElements = document.querySelectorAll("[data-clickable-id]");
      let foundId: string | null = null;

      interactiveElements.forEach((el) => {
        const elRect = el.getBoundingClientRect();
        // Give a generous 8px hit box padding for comfort
        if (
          clientX >= elRect.left - 8 &&
          clientX <= elRect.right + 8 &&
          clientY >= elRect.top - 8 &&
          clientY <= elRect.bottom + 8
        ) {
          foundId = el.getAttribute("data-clickable-id");
        }
      });

      return foundId;
    },
    []
  );

  // Handle MediaPipe hands results
  const handleMediaPipeResults = useCallback(
    (results: any) => {
      if (isTouchOnlyMode) return;

      const { trackingData: processed, clickTriggered, isDualHandNextTriggered } =
        handEngineRef.current.processMultiHandLandmarks(
          results.multiHandLandmarks,
          results.multiHandedness
        );

      setTrackingData(processed);

      // 1. Dual Hand Next Question Trigger ("1 Open + 1 Fist")
      if (isDualHandNextTriggered) {
        if (onDualHandNext) {
          onDualHandNext();
        }
        // Direct click fallback
        const nextBtn = document.getElementById("btn-next-question");
        if (nextBtn) {
          nextBtn.click();
        }
      }

      // 2. Pointer Raycasting & Target Resolution
      if (processed.isDetected) {
        const currentTarget = findHoveredTarget(processed.pointer.x, processed.pointer.y, isMirrored);
        onHoverTargetChange(currentTarget);

        const now = performance.now();
        if (currentTarget) {
          lastHoveredRef.current = { id: currentTarget, timestamp: now };
        }

        // Dwell Click Check (auto-clicks if hovering over same target for 1.4s)
        if (currentTarget) {
          if (dwellHoverRef.current.targetId === currentTarget) {
            if (now - dwellHoverRef.current.startTime >= 1400) {
              if (onPointerClick) {
                onPointerClick(currentTarget);
              }
              // Reset dwell timer to prevent rapid duplicate clicks
              dwellHoverRef.current.startTime = now + 1000;
            }
          } else {
            dwellHoverRef.current = { targetId: currentTarget, startTime: now };
          }
        } else {
          dwellHoverRef.current = { targetId: null, startTime: 0 };
        }

        // Fist / Pinch Click Trigger
        if (clickTriggered && onPointerClick) {
          // If currentTarget is null (e.g. slight movement when closing fingers), use recently hovered target
          const targetToClick =
            currentTarget ||
            (now - lastHoveredRef.current.timestamp < 350 ? lastHoveredRef.current.id : null);
          
          if (targetToClick) {
            onPointerClick(targetToClick);
          }
        }
      } else {
        onHoverTargetChange(null);
        dwellHoverRef.current = { targetId: null, startTime: 0 };
      }
    },
    [isTouchOnlyMode, findHoveredTarget, onHoverTargetChange, onPointerClick, onDualHandNext, isMirrored]
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
        if (facing === "environment") {
          setIsMirrored(false);
        }
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
      if (res.facing === "environment") {
        setIsMirrored(false);
      } else {
        setIsMirrored(true);
      }
    } else {
      setErrorMessage(res.error || "Failed to switch camera");
    }
  };

  const toggleMirrorMode = () => {
    setIsMirrored((prev) => !prev);
  };

  // Resize observer
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
      {/* 1. Camera Video Feed with Mirror / Non-Mirror mode */}
      <video
        ref={videoRef}
        id="camera-video-feed"
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-transform duration-200"
        style={{
          transform: isMirrored ? "scaleX(-1)" : "none",
          WebkitTransform: isMirrored ? "scaleX(-1)" : "none",
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
          title="Ganti kamera depan / belakang"
        >
          <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
          <span>{facingMode === "user" ? "Kamera Depan" : "Kamera Belakang"}</span>
        </button>

        {/* Mirror / Non-Mirror Toggle Button */}
        <button
          id="btn-toggle-mirror"
          onClick={toggleMirrorMode}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold backdrop-blur-md shadow-lg transition-all active:scale-95 ${
            isMirrored
              ? "bg-sky-500/25 border-sky-400 text-sky-300"
              : "bg-slate-900/85 border-slate-700/80 text-slate-300 hover:text-white"
          }`}
          title="Aktifkan / nonaktifkan efek cermin (Mirror)"
        >
          <FlipHorizontal className="w-3.5 h-3.5" />
          <span>{isMirrored ? "Mirror: Aktif" : "Mirror: Nonaktif"}</span>
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
          <span>HUD Debug</span>
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
          <span>{isTouchOnlyMode ? "Touch Mode" : "AR Hand Tracking"}</span>
        </button>

        {/* Hand Detection Status Badge */}
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
            <span>
              {trackingData.isDetected
                ? `${trackingData.handsCount} Tangan Terdeteksi`
                : "Angkat Tangan ☝"}
            </span>
          </div>
        )}
      </div>

      {/* 3. Floating AR Panel Container (Children) */}
      <div className="relative z-30 flex items-center justify-center p-4 w-full h-full pointer-events-none">
        {children}
      </div>

      {/* 4. Real-time AR Hand Tracking Precision Overlay */}
      {!isTouchOnlyMode && (
        <HandPointerOverlay
          trackingData={trackingData}
          hoveredElementId={hoveredElementId}
          showDebugSkeleton={showDebugSkeleton}
          containerWidth={containerDimensions.width}
          containerHeight={containerDimensions.height}
          isMirrored={isMirrored}
        />
      )}

      {/* Camera Loading State */}
      {cameraStatus === "initializing" && (
        <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-4">
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-sky-500/20 border-t-sky-400 rounded-full animate-spin" />
            <Camera className="w-6 h-6 text-sky-400 absolute" />
          </div>
          <div className="text-center space-y-1">
            <p className="font-bold text-sm tracking-wide">MENYIAPKAN KAMERA & MEDIA PIPE HANDS...</p>
            <p className="text-xs text-slate-400">Silakan izinkan akses kamera di browser Anda.</p>
          </div>
        </div>
      )}

      {/* Camera Error State */}
      {cameraStatus === "error" && (
        <div className="absolute inset-0 z-50 bg-slate-950/95 flex flex-col items-center justify-center text-white p-6 space-y-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="font-bold text-base text-rose-300">Kamera Tidak Dapat Dibuka</h3>
            <p className="text-xs text-slate-400">{errorMessage || "Pastikan izin kamera sudah diberikan."}</p>
          </div>
          <button
            onClick={() => initCamera(facingMode)}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg transition active:scale-95"
          >
            Coba Lagi
          </button>
        </div>
      )}
    </div>
  );
};
