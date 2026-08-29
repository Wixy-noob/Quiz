import React from "react";
import { ActiveAppMode } from "../types";
import { Sparkles, BookOpen, Camera, Award, Smartphone, Hand, LayoutDashboard } from "lucide-react";

interface HeaderNavProps {
  activeMode: ActiveAppMode;
  onSelectMode: (mode: ActiveAppMode) => void;
  onOpenApkModal: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeMode,
  onSelectMode,
  onOpenApkModal,
}) => {
  return (
    <header className="relative z-40 w-full bg-slate-900/90 border-b border-slate-800 backdrop-blur-xl px-4 py-3 select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Title */}
        <div
          onClick={() => onSelectMode("dashboard")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-amber-400 p-0.5 shadow-lg shadow-sky-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-sky-400 font-black text-sm tracking-wider">
              MT
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-white tracking-tight">
                MADJUKA TENSIS
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                16 TENSES & AR TOURISM
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Dashboard Materi 16 Tenses • Quiz Biasa • Photo Tourism • AR Hand-Tracking
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs font-semibold overflow-x-auto max-w-full">
          <button
            id="nav-dashboard"
            onClick={() => onSelectMode("dashboard")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all shrink-0 ${
              activeMode === "dashboard"
                ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard & Materi</span>
          </button>

          <button
            id="nav-quiz-biasa"
            onClick={() => onSelectMode("quiz_biasa")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all shrink-0 ${
              activeMode === "quiz_biasa"
                ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Quiz Biasa (Standar)</span>
          </button>

          <button
            id="nav-tourism"
            onClick={() => onSelectMode("photo_tourism")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all shrink-0 ${
              activeMode === "photo_tourism"
                ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Photo Tourism & Audio</span>
          </button>

          <button
            id="nav-ar-quiz"
            onClick={() => onSelectMode("ar_quiz")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all shrink-0 ${
              activeMode === "ar_quiz"
                ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 font-black"
                : "text-amber-400/80 hover:text-amber-300"
            }`}
          >
            <Hand className="w-3.5 h-3.5" />
            <span>Quiz AR Hand-Tracking</span>
          </button>
        </div>

        {/* Action: Install APK / Mobile App */}
        <button
          id="btn-open-install-apk"
          onClick={onOpenApkModal}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition active:scale-95 shrink-0"
        >
          <Smartphone className="w-4 h-4" />
          <span>INSTALL APK / APP</span>
        </button>
      </div>
    </header>
  );
};
