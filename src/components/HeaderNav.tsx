import React from "react";
import { ActiveAppMode } from "../types";
import { BookOpen, Camera, Award, Hand, LayoutDashboard } from "lucide-react";

interface HeaderNavProps {
  activeMode: ActiveAppMode;
  onSelectMode: (mode: ActiveAppMode) => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeMode,
  onSelectMode,
}) => {
  return (
    <header className="relative z-40 w-full bg-slate-900/90 border-b border-slate-800 backdrop-blur-md px-4 sm:px-6 py-3 select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Title */}
        <div
          onClick={() => onSelectMode("dashboard")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400 font-bold text-sm tracking-wider group-hover:border-sky-500/50 transition-colors">
            MT
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Madjuka Tensis
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                16 Tenses
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Media Pembelajaran & Latihan Interaktif
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-medium overflow-x-auto max-w-full">
          <button
            id="nav-dashboard"
            onClick={() => onSelectMode("dashboard")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all shrink-0 ${
              activeMode === "dashboard"
                ? "bg-slate-800 text-white font-semibold shadow-sm border border-slate-700"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Materi & Dashboard</span>
          </button>

          <button
            id="nav-quiz-biasa"
            onClick={() => onSelectMode("quiz_biasa")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all shrink-0 ${
              activeMode === "quiz_biasa"
                ? "bg-slate-800 text-white font-semibold shadow-sm border border-slate-700"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Quiz Standar</span>
          </button>

          <button
            id="nav-tourism"
            onClick={() => onSelectMode("photo_tourism")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all shrink-0 ${
              activeMode === "photo_tourism"
                ? "bg-slate-800 text-white font-semibold shadow-sm border border-slate-700"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Photo Tourism</span>
          </button>

          <button
            id="nav-ar-quiz"
            onClick={() => onSelectMode("ar_quiz")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all shrink-0 ${
              activeMode === "ar_quiz"
                ? "bg-slate-800 text-sky-300 font-semibold shadow-sm border border-slate-700"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Hand className="w-3.5 h-3.5" />
            <span>AR Tracking</span>
          </button>
        </div>
      </div>
    </header>
  );
};
