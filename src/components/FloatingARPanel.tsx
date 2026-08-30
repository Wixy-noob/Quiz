import React, { useState, useRef, useEffect } from "react";
import { PanelTransform } from "../types";
import { Move, Lock, Unlock, RotateCw, Maximize2 } from "lucide-react";

interface FloatingARPanelProps {
  panelTransform: PanelTransform;
  onUpdateTransform: (updated: Partial<PanelTransform>) => void;
  hoveredElementId: string | null;
  children: React.ReactNode;
  title?: string;
  badge?: string;
}

export const FloatingARPanel: React.FC<FloatingARPanelProps> = ({
  panelTransform,
  onUpdateTransform,
  hoveredElementId,
  children,
  title = "MADJUKA TENSIS AR PANEL",
  badge = "AR FLOATING",
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [isMouseDragging, setIsMouseDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; panelX: number; panelY: number }>({
    x: 0,
    y: 0,
    panelX: 0,
    panelY: 0,
  });

  // Mouse / Touch drag handlers (for touch mode / fallback)
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsMouseDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panelX: panelTransform.x,
      panelY: panelTransform.y,
    };
    onUpdateTransform({ isDragging: true, isLocked: false });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsMouseDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        panelX: panelTransform.x,
        panelY: panelTransform.y,
      };
      onUpdateTransform({ isDragging: true, isLocked: false });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDragging) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      onUpdateTransform({
        x: dragStartRef.current.panelX + dx,
        y: dragStartRef.current.panelY + dy,
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isMouseDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - dragStartRef.current.x;
      const dy = e.touches[0].clientY - dragStartRef.current.y;
      onUpdateTransform({
        x: dragStartRef.current.panelX + dx,
        y: dragStartRef.current.panelY + dy,
      });
    };

    const handleMouseUp = () => {
      if (isMouseDragging) {
        setIsMouseDragging(false);
        onUpdateTransform({ isDragging: false, isLocked: true });
      }
    };

    if (isMouseDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isMouseDragging, onUpdateTransform]);

  const isDragHovered = hoveredElementId === "panel-drag-handle";

  return (
    <div
      ref={panelRef}
      id="floating-ar-card-container"
      className="pointer-events-auto transition-all duration-100 ease-out select-none will-change-transform"
      style={{
        transform: `translate(${panelTransform.x}px, ${panelTransform.y}px) scale(${panelTransform.scale}) rotate(${panelTransform.rotation}deg)`,
      }}
    >
      {/* Glassmorphic AR Card Container */}
      <div
        className={`relative w-full max-w-xl bg-slate-900/50 text-slate-100 backdrop-blur-xl border rounded-3xl shadow-2xl overflow-hidden transition-all ${
          panelTransform.isDragging
            ? "border-emerald-400/80 shadow-[0_0_40px_rgba(16,185,129,0.3)] ring-2 ring-emerald-400/50"
            : isDragHovered
            ? "border-amber-400/80 shadow-[0_0_30px_rgba(245,158,11,0.3)]"
            : "border-white/20 shadow-black/60"
        }`}
      >
        {/* AR Header / Drag Bar (Raycast Target: 'panel-drag-handle') */}
        <div
          data-clickable-id="panel-drag-handle"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className={`flex items-center justify-between px-5 py-3 border-b border-white/10 cursor-grab active:cursor-grabbing transition-colors ${
            isDragHovered
              ? "bg-amber-500/25 text-amber-200"
              : panelTransform.isDragging
              ? "bg-emerald-600/35 text-emerald-200"
              : "bg-slate-950/40 hover:bg-slate-900/60"
          }`}
          title="Drag or pinch to move AR panel"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1 rounded-md bg-sky-500/25 text-sky-300 border border-sky-400/30">
              <Move className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs tracking-wider uppercase text-white drop-shadow-sm">{title}</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-sky-500/20 text-sky-200 border border-sky-400/30 backdrop-blur-sm">
                  {badge}
                </span>
              </div>
              <p className="text-[10px] text-slate-300">
                {panelTransform.isDragging
                  ? "Menggeser Panel di Ruang AR..."
                  : isDragHovered
                  ? "Tahan untuk menggeser"
                  : panelTransform.isLocked
                  ? "Posisi Terkunci"
                  : "Panel Transparan Glassmorphism"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onUpdateTransform({ isLocked: !panelTransform.isLocked })}
              className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-200 text-xs border border-white/10 backdrop-blur-md transition"
              title={panelTransform.isLocked ? "Panel is locked in place" : "Panel is unlocked"}
            >
              {panelTransform.isLocked ? <Lock className="w-3.5 h-3.5 text-emerald-400" /> : <Unlock className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => onUpdateTransform({ x: 0, y: 0, rotation: 0, scale: 1 })}
              className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-200 text-xs border border-white/10 backdrop-blur-md transition"
              title="Reset panel ke tengah"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Panel Main Content Area */}
        <div className="p-4 sm:p-5">{children}</div>
      </div>
    </div>
  );
};
