import React from "react";
import { HandTrackingData, GestureState } from "../types";
import { FIST_CLOSE_THRESHOLD } from "../lib/handTracking";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HandPointerOverlayProps {
  trackingData: HandTrackingData;
  hoveredElementId: string | null;
  showDebugSkeleton: boolean;
  containerWidth: number;
  containerHeight: number;
  isMirrored?: boolean;
}

// MediaPipe hand joint connections for skeleton rendering
const HAND_CONNECTIONS = [
  // Thumb
  { start: 0, end: 1, finger: "thumb" },
  { start: 1, end: 2, finger: "thumb" },
  { start: 2, end: 3, finger: "thumb" },
  { start: 3, end: 4, finger: "thumb" },

  // Index
  { start: 0, end: 5, finger: "index" },
  { start: 5, end: 6, finger: "index" },
  { start: 6, end: 7, finger: "index" },
  { start: 7, end: 8, finger: "index" },

  // Middle
  { start: 0, end: 9, finger: "middle" },
  { start: 9, end: 10, finger: "middle" },
  { start: 10, end: 11, finger: "middle" },
  { start: 11, end: 12, finger: "middle" },

  // Ring
  { start: 0, end: 13, finger: "ring" },
  { start: 13, end: 14, finger: "ring" },
  { start: 14, end: 15, finger: "ring" },
  { start: 15, end: 16, finger: "ring" },

  // Pinky
  { start: 0, end: 17, finger: "pinky" },
  { start: 17, end: 18, finger: "pinky" },
  { start: 18, end: 19, finger: "pinky" },
  { start: 19, end: 20, finger: "pinky" },

  // Palm base
  { start: 5, end: 9, finger: "palm" },
  { start: 9, end: 13, finger: "palm" },
  { start: 13, end: 17, finger: "palm" },
];

export const HandPointerOverlay: React.FC<HandPointerOverlayProps> = ({
  trackingData,
  hoveredElementId,
  showDebugSkeleton,
  containerWidth,
  containerHeight,
  isMirrored = false,
}) => {
  const {
    isDetected,
    pointer,
    isPinching,
    isClosedFist,
    isClicking,
    clickType,
    fistProgress,
    gestureState,
    fps,
    landmarks,
    allHands = [],
    isDualHandNextTriggered,
    dualHandState,
  } = trackingData;

  const getRenderX = (normX: number) => {
    const adjustedX = isMirrored ? 1 - normX : normX;
    return adjustedX * containerWidth;
  };

  const getRenderY = (normY: number) => {
    return normY * containerHeight;
  };

  const pointerPixelX = getRenderX(pointer.x);
  const pointerPixelY = getRenderY(pointer.y);

  // Radial charging gauge
  const chargePercent = Math.max(0, Math.min(100, (fistProgress / FIST_CLOSE_THRESHOLD) * 100));
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (chargePercent / 100) * circumference;

  const handsToRender: { landmarks: any; isPrimary: boolean; isFist: boolean; isOpen: boolean; handedness: string }[] =
    allHands.length > 0
      ? allHands.map((h, idx) => ({
          landmarks: h.landmarks,
          isPrimary: idx === 0,
          isFist: h.isClosedFist,
          isOpen: h.isOpenHand,
          handedness: h.handedness,
        }))
      : landmarks
      ? [
          {
            landmarks,
            isPrimary: true,
            isFist: isClosedFist,
            isOpen: fistProgress < 0.35,
            handedness: trackingData.handedness,
          },
        ]
      : [];

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
      {/* 1. Full Hand Skeletons for All Detected Hands */}
      {isDetected && handsToRender.length > 0 && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none filter drop-shadow-[0_0_8px_rgba(56,189,248,0.35)]">
          {handsToRender.map((handItem, hIdx) => {
            const handLandmarks = handItem.landmarks;
            if (!handLandmarks?.rawLandmarks) return null;

            return (
              <g key={`hand-group-${hIdx}`}>
                {/* Bone lines */}
                {HAND_CONNECTIONS.map((conn, i) => {
                  const startPt = handLandmarks.rawLandmarks[conn.start];
                  const endPt = handLandmarks.rawLandmarks[conn.end];
                  if (!startPt || !endPt) return null;

                  const isInteractive = conn.finger === "thumb" || conn.finger === "index";

                  let strokeColor = "rgba(148, 163, 184, 0.4)";
                  let strokeW = "1.5";

                  if (handItem.isFist) {
                    strokeColor = "rgba(52, 211, 153, 0.85)";
                    strokeW = isInteractive ? "3" : "2";
                  } else if (handItem.isOpen) {
                    strokeColor = "rgba(56, 189, 248, 0.85)";
                    strokeW = isInteractive ? "3" : "2";
                  } else if (isInteractive) {
                    if (isClicking && handItem.isPrimary) {
                      strokeColor = "rgba(52, 211, 153, 0.95)";
                      strokeW = "3.5";
                    } else if (hoveredElementId && handItem.isPrimary) {
                      strokeColor = "rgba(251, 191, 36, 0.9)";
                      strokeW = "3";
                    } else {
                      strokeColor =
                        conn.finger === "index" ? "rgba(56, 189, 248, 0.85)" : "rgba(99, 102, 241, 0.75)";
                      strokeW = "2.5";
                    }
                  }

                  return (
                    <line
                      key={`bone-${hIdx}-${i}`}
                      x1={getRenderX(startPt.x)}
                      y1={getRenderY(startPt.y)}
                      x2={getRenderX(endPt.x)}
                      y2={getRenderY(endPt.y)}
                      stroke={strokeColor}
                      strokeWidth={strokeW}
                      strokeLinecap="round"
                    />
                  );
                })}

                {/* Laser between Thumb & Index */}
                {handLandmarks.rawLandmarks[4] && handLandmarks.rawLandmarks[8] && (
                  <line
                    x1={getRenderX(handLandmarks.rawLandmarks[4].x)}
                    y1={getRenderY(handLandmarks.rawLandmarks[4].y)}
                    x2={getRenderX(handLandmarks.rawLandmarks[8].x)}
                    y2={getRenderY(handLandmarks.rawLandmarks[8].y)}
                    stroke={
                      isClicking && handItem.isPrimary
                        ? "#34d399"
                        : isPinching && handItem.isPrimary
                        ? "#10b981"
                        : "rgba(56, 189, 248, 0.4)"
                    }
                    strokeWidth={isClicking && handItem.isPrimary ? "2.5" : "1.5"}
                    strokeDasharray="3 3"
                  />
                )}

                {/* 21 Joints */}
                {handLandmarks.rawLandmarks.map((pt: any, idx: number) => {
                  const isThumbTip = idx === 4;
                  const isIndexTip = idx === 8;
                  const isThumbJoint = idx >= 1 && idx <= 4;
                  const isIndexJoint = idx >= 5 && idx <= 8;
                  const isTip = [4, 8, 12, 16, 20].includes(idx);
                  const isInteractive = isThumbJoint || isIndexJoint;

                  let fillColor = "#64748b";
                  let strokeColor = "#0f172a";
                  let r = 2.5;

                  if (isIndexTip) {
                    fillColor =
                      isClicking && handItem.isPrimary
                        ? "#10b981"
                        : hoveredElementId && handItem.isPrimary
                        ? "#f59e0b"
                        : "#38bdf8";
                    strokeColor = "#ffffff";
                    r = 6.5;
                  } else if (isThumbTip) {
                    fillColor = isClicking && handItem.isPrimary ? "#10b981" : "#38bdf8";
                    strokeColor = "#ffffff";
                    r = 5.5;
                  } else if (isInteractive) {
                    fillColor = "#38bdf8";
                    r = 3.5;
                  } else if (isTip) {
                    fillColor = "#94a3b8";
                    r = 3.5;
                  }

                  return (
                    <circle
                      key={`joint-${hIdx}-${idx}`}
                      cx={getRenderX(pt.x)}
                      cy={getRenderY(pt.y)}
                      r={r}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={isIndexTip || isThumbTip ? "2" : "1"}
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>
      )}

      {/* 2. Dual Hand Next Gesture Animated Indicator Toast */}
      <AnimatePresence>
        {(dualHandState?.hasOneOpenOneFist || isDualHandNextTriggered) && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-slate-900/95 text-white backdrop-blur-xl border border-emerald-400 shadow-[0_0_35px_rgba(52,211,153,0.6)]"
          >
            <div className="flex items-center gap-1.5 text-lg font-black">
              <span className="p-1.5 rounded-xl bg-sky-500/30 border border-sky-400/50">🖐️ Buka</span>
              <span className="text-emerald-400 font-black">+</span>
              <span className="p-1.5 rounded-xl bg-emerald-500/30 border border-emerald-400/50">✊ Mengepal</span>
            </div>
            <div className="border-l border-white/20 pl-3">
              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-300 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                <span>Gestur Next Soal Terdeteksi!</span>
              </div>
              <p className="text-[11px] text-slate-300">
                {isDualHandNextTriggered ? "Maju ke pertanyaan berikutnya..." : "Tahan sejenak untuk berpindah soal"}
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-emerald-400 animate-bounce" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Debug HUD Metrics Panel (Top-Right) */}
      {showDebugSkeleton && (
        <div className="absolute top-4 right-4 bg-slate-900/90 text-white backdrop-blur-md border border-slate-700/80 rounded-xl p-3 text-xs font-mono shadow-2xl space-y-1.5 w-64">
          <div className="flex items-center justify-between border-b border-slate-700 pb-1 font-semibold text-sky-400">
            <span>HAND TRACKING HUD</span>
            <span className="text-emerald-400">{fps} FPS</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Status:</span>
            <span className={isDetected ? "text-emerald-400 font-bold" : "text-rose-400"}>
              {isDetected ? `${handsToRender.length} TANGAN AKTIF` : "NO HAND"}
            </span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Mirroring:</span>
            <span className={isMirrored ? "text-sky-400 font-bold" : "text-slate-300"}>
              {isMirrored ? "MIRROR ON" : "NON-MIRROR"}
            </span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Dual Next Gesture:</span>
            <span
              className={
                dualHandState?.hasOneOpenOneFist
                  ? "text-emerald-400 font-bold animate-pulse"
                  : "text-slate-400"
              }
            >
              {dualHandState?.hasOneOpenOneFist ? "🖐️ + ✊ TERDETEKSI" : "STANDBY"}
            </span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Gesture Primer:</span>
            <span className="text-amber-300 font-bold">{gestureState}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Tutup Tangan (Fist):</span>
            <span className={isClosedFist ? "text-emerald-400 font-bold" : "text-slate-300"}>
              {Math.round(fistProgress * 100)}% {isClosedFist ? "✊ CLICK" : ""}
            </span>
          </div>
          {/* Fist Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
            <div
              className={`h-full transition-all duration-75 ${
                isClosedFist ? "bg-emerald-500" : fistProgress > 0.4 ? "bg-amber-500" : "bg-sky-500"
              }`}
              style={{ width: `${Math.min(100, (fistProgress / FIST_CLOSE_THRESHOLD) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-800">
            <span>Hover Target:</span>
            <span className="text-sky-300 font-semibold truncate max-w-[120px]">
              {hoveredElementId || "None"}
            </span>
          </div>
        </div>
      )}

      {/* 4. Primary Smooth AR Precision Pointer Cursor */}
      {isDetected && (
        <div
          className="absolute will-change-transform"
          style={{
            left: `${pointerPixelX}px`,
            top: `${pointerPixelY}px`,
            transform: "translate(-50%, -50%)",
            transition: "transform 0.04s ease-out",
          }}
        >
          <div className="relative flex items-center justify-center">
            {/* Radial Gauge for Closing Hand ("Tutup Tangan") */}
            <svg
              className={`w-14 h-14 -rotate-90 transition-transform duration-100 ${
                isClicking ? "scale-110" : hoveredElementId ? "scale-105" : "scale-100"
              }`}
            >
              <circle
                cx="28"
                cy="28"
                r={radius}
                className="stroke-slate-700/60"
                strokeWidth="2"
                fill="transparent"
              />

              <circle
                cx="28"
                cy="28"
                r={radius}
                className={`transition-all duration-75 ${
                  isClicking
                    ? "stroke-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                    : fistProgress > 0.35
                    ? "stroke-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]"
                    : hoveredElementId
                    ? "stroke-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]"
                    : "stroke-sky-400/80"
                }`}
                strokeWidth={isClicking ? "4" : hoveredElementId ? "3" : "2.5"}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill={
                  isClicking
                    ? "rgba(16, 185, 129, 0.25)"
                    : hoveredElementId
                    ? "rgba(245, 158, 11, 0.15)"
                    : "rgba(15, 23, 42, 0.25)"
                }
              />
            </svg>

            {/* Target Crosshairs */}
            <div
              className={`absolute w-3 h-[1.5px] -left-2 transition-colors ${
                isClicking ? "bg-emerald-400" : hoveredElementId ? "bg-amber-400" : "bg-sky-400/80"
              }`}
            />
            <div
              className={`absolute w-3 h-[1.5px] -right-2 transition-colors ${
                isClicking ? "bg-emerald-400" : hoveredElementId ? "bg-amber-400" : "bg-sky-400/80"
              }`}
            />
            <div
              className={`absolute h-3 w-[1.5px] -top-2 transition-colors ${
                isClicking ? "bg-emerald-400" : hoveredElementId ? "bg-amber-400" : "bg-sky-400/80"
              }`}
            />
            <div
              className={`absolute h-3 w-[1.5px] -bottom-2 transition-colors ${
                isClicking ? "bg-emerald-400" : hoveredElementId ? "bg-amber-400" : "bg-sky-400/80"
              }`}
            />

            {/* Center Precision Core Dot */}
            <div
              className={`absolute w-3.5 h-3.5 rounded-full transition-all duration-100 ${
                isClicking
                  ? "bg-emerald-400 scale-125 shadow-[0_0_12px_#34d399]"
                  : hoveredElementId
                  ? "bg-amber-300 scale-110 shadow-[0_0_8px_#fde047]"
                  : "bg-sky-400 scale-100 shadow-[0_0_6px_#38bdf8]"
              }`}
            />

            {/* Click / Hover Badge Tooltip */}
            <div
              className={`absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-tight shadow-lg backdrop-blur-md transition-all duration-150 border ${
                isClicking
                  ? "bg-emerald-600 text-white border-emerald-400 scale-105"
                  : hoveredElementId
                  ? "bg-slate-900/95 text-amber-300 border-amber-500/50"
                  : "bg-slate-900/90 text-slate-300 border-slate-700/80"
              }`}
            >
              {isClicking
                ? clickType === "fist"
                  ? "✊ KLIK TERTANGKAP!"
                  : "🤏 PINCH KLIK!"
                : hoveredElementId
                ? "✊ Tutup Tangan untuk Klik"
                : "☝ Arahkan • ✊ Tutup Tangan Klik • 🖐️+✊ Next Soal"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
