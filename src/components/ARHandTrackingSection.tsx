import React, { useState, useCallback } from "react";
import { CameraView } from "./CameraView";
import { FloatingARPanel } from "./FloatingARPanel";
import { TensesQuiz } from "./TensesQuiz";
import { PanelTransform, ActiveAppMode, StudentProfile } from "../types";
import { Hand, RotateCcw, ArrowLeft, Eye, EyeOff, Camera, HelpCircle, GraduationCap } from "lucide-react";

interface ARHandTrackingSectionProps {
  onNavigate: (mode: ActiveAppMode) => void;
  studentProfile: StudentProfile | null;
  onOpenProfileModal: () => void;
}

export const ARHandTrackingSection: React.FC<ARHandTrackingSectionProps> = ({
  onNavigate,
  studentProfile,
  onOpenProfileModal,
}) => {
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);
  const [showDebugSkeleton, setShowDebugSkeleton] = useState(false);
  const [isTouchOnlyMode, setIsTouchOnlyMode] = useState(false);

  // Floating Panel Transform State (Persisted across questions)
  const [panelTransform, setPanelTransform] = useState<PanelTransform>({
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    isLocked: true,
    isDragging: false,
  });

  const handleUpdatePanelTransform = (updated: Partial<PanelTransform>) => {
    setPanelTransform((prev) => ({ ...prev, ...updated }));
  };

  // Handle Raycast Pointer Click triggered by Pinch (Thumb + Index)
  const handlePointerClick = useCallback((targetId: string | null) => {
    if (!targetId) return;

    if (targetId.startsWith("option-") || targetId === "btn-next-question" || targetId === "btn-restart-quiz") {
      const el = document.getElementById(targetId);
      if (el) {
        el.click();
      }
    }
  }, []);

  return (
    <div className="relative w-full h-[85vh] sm:h-[90vh] rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl flex flex-col">
      {/* Simple Clean AR Top Bar */}
      <div className="relative z-30 flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate("dashboard")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Dashboard</span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold">
            <Hand className="w-3.5 h-3.5" />
            <span>AR 5-Finger Tracking (Non-Mirror)</span>
          </div>
        </div>

        {/* Quick Gesture Guide Pill */}
        <div className="text-[11px] text-slate-300 bg-slate-950/80 px-3 py-1 rounded-xl border border-slate-800 hidden md:block">
          👉 <span className="text-amber-400 font-semibold">Arahkan Telunjuk</span> (Highlight) • 🤏{" "}
          <span className="text-emerald-400 font-semibold">Pinch Jempol+Telunjuk</span> (Pilih Jawaban)
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onNavigate("quiz_biasa")}
            className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow transition active:scale-95"
          >
            Quiz Biasa (Sentuh)
          </button>
        </div>
      </div>

      {/* Main AR Camera Viewport */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        <CameraView
          onPointerClick={handlePointerClick}
          hoveredElementId={hoveredElementId}
          onHoverTargetChange={setHoveredElementId}
          showDebugSkeleton={showDebugSkeleton}
          onToggleDebugSkeleton={() => setShowDebugSkeleton((prev) => !prev)}
          isTouchOnlyMode={isTouchOnlyMode}
          onToggleTouchMode={setIsTouchOnlyMode}
        >
          {/* Simple Floating AR Card */}
          <FloatingARPanel
            panelTransform={panelTransform}
            onUpdateTransform={handleUpdatePanelTransform}
            hoveredElementId={hoveredElementId}
            title="MADJUKA TENSIS AR QUIZ"
            badge="HANDS-FREE"
          >
            <TensesQuiz
              hoveredElementId={hoveredElementId}
              studentProfile={studentProfile}
              onSwitchToGuide={() => onNavigate("dashboard")}
            />
          </FloatingARPanel>
        </CameraView>
      </div>
    </div>
  );
};
