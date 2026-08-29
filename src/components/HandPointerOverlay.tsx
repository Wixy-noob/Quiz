import React from "react";
import { HandTrackingData, GestureState } from "../types";
import { PINCH_START_THRESHOLD, PINCH_RELEASE_THRESHOLD } from "../lib/handTracking";

interface HandPointerOverlayProps {
  trackingData: HandTrackingData;
  hoveredElementId: string | null;
  showDebugSkeleton: boolean;
  containerWidth: number;
  containerHeight: number;
}

// MediaPipe hand joint connections for skeleton rendering
const HAND_CONNECTIONS = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle
  [0, 9], [9, 10], [10, 11], [11, 12],
  // Ring
  [0, 13], [13, 14], [14, 15], [15, 16],
  // Pinky
  [0, 17], [17, 18], [18, 19], [19, 20],
  // Palm base
  [5, 9], [9, 13], [13, 17],
];

export const HandPointerOverlay: React.FC<HandPointerOverlayProps> = ({
  trackingData,
  hoveredElementId,
  showDebugSkeleton,
  containerWidth,
  containerHeight,
}) => {
  const { isDetected, pointer, isPinching, pinchDistance, rawDistance, gestureState, confidence, fps, landmarks } =
    trackingData;

  const pointerPixelX = pointer.x * containerWidth;
  const pointerPixelY = pointer.y * containerHeight;

  // Pinch progress (0 = far, 1 = fully pinched)
  const pinchProgress = Math.max(
    0,
    Math.min(1, (PINCH_RELEASE_THRESHOLD - pinchDistance) / (PINCH_RELEASE_THRESHOLD - PINCH_START_THRESHOLD))
  );

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
      {/* 1. Optional Debug Skeleton Rendering */}
      {showDebugSkeleton && isDetected && landmarks && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Bone lines */}
          {HAND_CONNECTIONS.map(([startIdx, endIdx], i) => {
            const startPt = landmarks.rawLandmarks[startIdx];
            const endPt = landmarks.rawLandmarks[endIdx];
            if (!startPt || !endPt) return null;

            return (
              <line
                key={`bone-${i}`}
                x1={startPt.x * containerWidth}
                y1={startPt.y * containerHeight}
                x2={endPt.x * containerWidth}
                y2={endPt.y * containerHeight}
                stroke="rgba(56, 189, 248, 0.7)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            );
          })}

          {/* 21 Joints */}
          {landmarks.rawLandmarks.map((pt, idx) => {
            const isTip = [4, 8, 12, 16, 20].includes(idx);
            const isIndexTip = idx === 8;
            const isThumbTip = idx === 4;

            let fillColor = "#38bdf8"; // default cyan
            let radius = 4;

            if (isIndexTip) {
              fillColor = isPinching ? "#10b981" : "#f59e0b"; // amber / emerald
              radius = 7;
            } else if (isThumbTip) {
              fillColor = isPinching ? "#10b981" : "#ec4899"; // pink / emerald
              radius = 6;
            } else if (isTip) {
              fillColor = "#818cf8"; // indigo tip
              radius = 5;
            }

            return (
              <circle
                key={`joint-${idx}`}
                cx={pt.x * containerWidth}
                cy={pt.y * containerHeight}
                r={radius}
                fill={fillColor}
                stroke="#0f172a"
                strokeWidth="1.5"
              />
            );
          })}

          {/* Pinch distance line between thumb & index */}
          {landmarks.rawLandmarks[4] && landmarks.rawLandmarks[8] && (
            <line
              x1={landmarks.rawLandmarks[4].x * containerWidth}
              y1={landmarks.rawLandmarks[4].y * containerHeight}
              x2={landmarks.rawLandmarks[8].x * containerWidth}
              y2={landmarks.rawLandmarks[8].y * containerHeight}
              stroke={isPinching ? "#10b981" : "rgba(244, 63, 94, 0.8)"}
              strokeWidth="2"
              strokeDasharray="3 3"
            />
          )}
        </svg>
      )}

      {/* 2. Debug HUD Metrics Panel (Top-Right) */}
      {showDebugSkeleton && (
        <div className="absolute top-4 right-4 bg-slate-900/90 text-white backdrop-blur-md border border-slate-700/80 rounded-xl p-3 text-xs font-mono shadow-2xl space-y-1.5 w-64">
          <div className="flex items-center justify-between border-b border-slate-700 pb-1 font-semibold text-sky-400">
            <span>HAND ENGINE DEBUG</span>
            <span className="text-emerald-400">{fps} FPS</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Status:</span>
            <span className={isDetected ? "text-emerald-400 font-bold" : "text-rose-400"}>
              {isDetected ? "TRACKED (5 Fingers)" : "LOST / NO HAND"}
            </span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Gesture State:</span>
            <span className="text-amber-300 font-bold">{gestureState}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Confidence:</span>
            <span>{Math.round(confidence * 100)}%</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Pinch Distance:</span>
            <span>{(pinchDistance * 100).toFixed(1)}%</span>
          </div>
          {/* Distance Meter Bar */}
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
            <div
              className={`h-full transition-all duration-75 ${
                isPinching ? "bg-emerald-500" : pinchProgress > 0.6 ? "bg-amber-500" : "bg-sky-500"
              }`}
              style={{ width: `${Math.max(5, Math.min(100, (1 - pinchDistance / 0.15) * 100))}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>START: {(PINCH_START_THRESHOLD * 100).toFixed(1)}%</span>
            <span>RELEASE: {(PINCH_RELEASE_THRESHOLD * 100).toFixed(1)}%</span>
          </div>
          <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-800">
            <span>Hover Target:</span>
            <span className="text-sky-300 font-semibold truncate max-w-[120px]">
              {hoveredElementId || "None"}
            </span>
          </div>
        </div>
      )}

      {/* 3. Primary AR Index Finger Pointer Cursor */}
      {isDetected && (
        <div
          className="absolute transition-transform duration-75 ease-out"
          style={{
            left: `${pointerPixelX}px`,
            top: `${pointerPixelY}px`,
            transform: "translate(-50%, -50%)",
          }}
        >
          {/* Outer dynamic reticle */}
          <div
            className={`relative flex items-center justify-center transition-all duration-150 ${
              isPinching
                ? "w-14 h-14 scale-110"
                : hoveredElementId
                ? "w-12 h-12 scale-105"
                : "w-9 h-9 scale-100"
            }`}
          >
            {/* Outer ring */}
            <div
              className={`absolute inset-0 rounded-full border-2 transition-all duration-150 ${
                isPinching
                  ? "border-emerald-400 bg-emerald-500/25 shadow-[0_0_20px_rgba(16,185,129,0.8)]"
                  : hoveredElementId
                  ? "border-amber-400 bg-amber-500/15 shadow-[0_0_15px_rgba(245,158,11,0.6)] animate-pulse"
                  : "border-sky-400 bg-sky-500/10 shadow-[0_0_10px_rgba(56,189,248,0.4)]"
              }`}
              style={{
                borderRadius: "50%",
                transform: `scale(${1 - pinchProgress * 0.25})`,
              }}
            />

            {/* Crosshair ticks */}
            <div className="absolute w-full h-[2px] bg-sky-300/60" />
            <div className="absolute h-full w-[2px] bg-sky-300/60" />

            {/* Inner Center Core Dot */}
            <div
              className={`w-3.5 h-3.5 rounded-full transition-transform ${
                isPinching
                  ? "bg-emerald-300 scale-125 shadow-[0_0_12px_#34d399]"
                  : hoveredElementId
                  ? "bg-amber-300 scale-110 shadow-[0_0_8px_#fbbf24]"
                  : "bg-sky-400 scale-100 shadow-[0_0_6px_#38bdf8]"
              }`}
            />

            {/* Gesture feedback tooltip */}
            <div
              className={`absolute -bottom-7 whitespace-nowrap px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wide shadow-md backdrop-blur-md transition-all ${
                isPinching
                  ? "bg-emerald-600 text-white scale-105"
                  : hoveredElementId
                  ? "bg-amber-500/90 text-slate-900"
                  : "bg-slate-900/80 text-sky-300 text-[10px]"
              }`}
            >
              {isPinching ? "PINCH CLICK! 🤏" : hoveredElementId ? "PINCH TO SELECT" : "INDEX POINTER ☝"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
