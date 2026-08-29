import React, { useState } from "react";
import { StudentProfile, SmpGrade } from "../types";
import {
  User,
  GraduationCap,
  Sparkles,
  School,
  CheckCircle2,
  ArrowRight,
  BookOpen,
} from "lucide-react";

interface StudentProfileModalProps {
  isOpen: boolean;
  onSave: (profile: StudentProfile) => void;
  onClose?: () => void;
  currentProfile: StudentProfile | null;
  targetModeName?: string;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onSave,
  onClose,
  currentProfile,
  targetModeName = "Quiz",
}) => {
  const [name, setName] = useState(currentProfile?.name || "");
  const [grade, setGrade] = useState<SmpGrade>(
    currentProfile?.grade || "1 SMP (Kelas 7)"
  );
  const [school, setSchool] = useState(currentProfile?.school || "");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Silakan isi nama Anda terlebih dahulu.");
      return;
    }
    setError("");
    onSave({
      name: name.trim(),
      grade,
      school: school.trim() || undefined,
    });
  };

  const gradesList: { value: SmpGrade; label: string; desc: string; iconColor: string }[] = [
    {
      value: "1 SMP (Kelas 7)",
      label: "1 SMP (Kelas 7)",
      desc: "Fokus: Simple Present & Present Continuous",
      iconColor: "text-sky-400 border-sky-500/40 bg-sky-500/10",
    },
    {
      value: "2 SMP (Kelas 8)",
      label: "2 SMP (Kelas 8)",
      desc: "Fokus: Simple Past, Past Continuous & Future",
      iconColor: "text-indigo-400 border-indigo-500/40 bg-indigo-500/10",
    },
    {
      value: "3 SMP (Kelas 9)",
      label: "3 SMP (Kelas 9)",
      desc: "Fokus: 16 Tenses Comprehensive & Exam Prep",
      iconColor: "text-amber-400 border-amber-500/40 bg-amber-500/10",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-sky-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-sky-950/50 space-y-6 my-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-slate-950 shadow-lg shadow-sky-500/30 mb-1">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Data Peserta {targetModeName}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300">
            Isi nama dan pilih kelas Anda sebelum memulai latihan tenses.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input Nama */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <User className="w-4 h-4 text-sky-400" />
              <span>Nama Lengkap / Nama Panggilan: *</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Muhammad Farhan / Alya"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition"
              autoFocus
            />
          </div>

          {/* Pilih Kelas SMP */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Pilih Kelas SMP: *</span>
            </label>
            <div className="grid grid-cols-1 gap-2">
              {gradesList.map((g) => {
                const isSelected = grade === g.value;
                return (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setGrade(g.value)}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? "bg-sky-500/20 border-sky-400 text-white ring-2 ring-sky-400/40 shadow-md"
                        : "bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <p className="font-bold text-sm text-white">{g.label}</p>
                      <p className="text-[11px] text-slate-400">{g.desc}</p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Input Asal Sekolah (Opsional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <School className="w-4 h-4 text-indigo-400" />
              <span>Asal Sekolah (Opsional):</span>
            </label>
            <input
              type="text"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              placeholder="Contoh: SMP Negeri 1 Madjuka"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 text-xs focus:outline-none focus:border-indigo-400 transition"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20 text-center font-semibold">
              {error}
            </p>
          )}

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
              >
                Batal
              </button>
            )}
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-sky-500/25 transition active:scale-95"
            >
              <span>MULAI LATIHAN SEKARANG</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
