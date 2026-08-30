import React, { useState } from "react";
import { StudentProfile, SmpGrade } from "../types";
import {
  User,
  GraduationCap,
  School,
  CheckCircle2,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

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

  const gradesList: { value: SmpGrade; label: string; desc: string }[] = [
    {
      value: "1 SMP (Kelas 7)",
      label: "1 SMP (Kelas 7)",
      desc: "Simple Present & Present Continuous",
    },
    {
      value: "2 SMP (Kelas 8)",
      label: "2 SMP (Kelas 8)",
      desc: "Simple Past, Past Continuous & Future",
    },
    {
      value: "3 SMP (Kelas 9)",
      label: "3 SMP (Kelas 9)",
      desc: "16 Tenses Lengkap & Persiapan Ujian",
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop Blur Fade In */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Card Spring Scale In */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
            className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 my-8 z-10"
          >
            {/* Header */}
            <div className="text-center space-y-1">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/40 text-sky-400 mb-1 shadow-lg">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Data Siswa ({targetModeName})
              </h3>
              <p className="text-xs text-slate-400">
                Isi nama dan kelas Anda untuk memulai latihan interaktif.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Input Nama */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-sky-400" />
                  <span>Nama Lengkap: *</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Farhan / Alya"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-sky-500 transition"
                  autoFocus
                />
              </div>

              {/* Pilih Kelas SMP */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  <span>Pilih Kelas: *</span>
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {gradesList.map((g) => {
                    const isSelected = grade === g.value;
                    return (
                      <button
                        key={g.value}
                        type="button"
                        onClick={() => setGrade(g.value)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "bg-slate-800 border-sky-500 text-white shadow-sm"
                            : "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <p className="font-semibold text-xs text-white">{g.label}</p>
                          <p className="text-[10px] text-slate-400">{g.desc}</p>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Input Asal Sekolah (Opsional) */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-slate-400" />
                  <span>Sekolah (Opsional):</span>
                </label>
                <input
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="Contoh: SMPN 1"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 text-xs focus:outline-none focus:border-slate-600 transition"
                />
              </div>

              {error && (
                <p className="text-xs text-rose-400 bg-rose-950/40 p-2 rounded-lg border border-rose-800/40 text-center">
                  {error}
                </p>
              )}

              {/* Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                {onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium transition"
                  >
                    Batal
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition active:scale-95 shadow-lg shadow-sky-900/30"
                >
                  <span>Mulai Latihan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
