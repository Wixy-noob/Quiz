import React, { useState, useEffect } from "react";
import { QuizQuestion, ActiveAppMode, StudentProfile } from "../types";
import { QUESTION_BANK, ALL_16_TENSES } from "../data/tensesData";
import confetti from "canvas-confetti";
import {
  Award,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Hand,
  GraduationCap,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface StandardQuizProps {
  onNavigate: (mode: ActiveAppMode) => void;
  studentProfile: StudentProfile | null;
  onOpenProfileModal: () => void;
}

export const StandardQuiz: React.FC<StandardQuizProps> = ({
  onNavigate,
  studentProfile,
  onOpenProfileModal,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<"All" | "Easy" | "Medium" | "Hard">("All");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Filtered Questions by level
  const filteredQuestions = QUESTION_BANK.filter(
    (q) => selectedLevel === "All" || q.level === selectedLevel
  );

  const currentQuestion: QuizQuestion =
    filteredQuestions[currentIndex] || filteredQuestions[0] || QUESTION_BANK[0];
  const currentTenseInfo = ALL_16_TENSES.find((t) => t.id === currentQuestion?.tenseId);

  // Keyboard shortcut listener (1/2/3/4 or A/B/C/D or Enter for next)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCompleted) return;

      if (!isLocked) {
        if (e.key === "a" || e.key === "A" || e.key === "1") handleSelectAnswer("A");
        if (e.key === "b" || e.key === "B" || e.key === "2") handleSelectAnswer("B");
        if (e.key === "c" || e.key === "C" || e.key === "3") handleSelectAnswer("C");
        if (e.key === "d" || e.key === "D" || e.key === "4") handleSelectAnswer("D");
      } else {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleNextQuestion();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLocked, isCompleted, currentIndex, filteredQuestions.length]);

  const handleSelectAnswer = (label: "A" | "B" | "C" | "D") => {
    if (isLocked) return;
    setSelectedAnswer(label);
    setIsLocked(true);

    const isCorrect = label === currentQuestion.correctLabel;
    if (isCorrect) {
      const earned = 100 + streak * 20;
      setScore((s) => s + earned);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > highestStreak) setHighestStreak(newStreak);

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#38bdf8", "#34d399", "#94a3b8"],
      });
    } else {
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsLocked(false);
      setAiExplanation(null);
    } else {
      setIsCompleted(true);
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });
    }
  };

  const restartQuiz = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsLocked(false);
    setScore(0);
    setStreak(0);
    setIsCompleted(false);
    setAiExplanation(null);
  };

  const fetchAiExplanation = async () => {
    if (!selectedAnswer) return;
    setIsLoadingAi(true);
    try {
      const res = await fetch("/api/tenses/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenseName: currentQuestion.tenseName,
          formula: currentTenseInfo?.formula.positive || "",
          question: currentQuestion.question,
          selectedAnswer: currentQuestion.options.find((o) => o.label === selectedAnswer)?.text || "",
          correctAnswer:
            currentQuestion.options.find((o) => o.label === currentQuestion.correctLabel)?.text || "",
        }),
      });
      const data = await res.json();
      if (data.explanation) {
        setAiExplanation(data.explanation);
      }
    } catch (err) {
      console.error("AI tutor error:", err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  if (isCompleted) {
    const accuracy = Math.round((score / (filteredQuestions.length * 100)) * 100);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="max-w-xl mx-auto py-6 text-center space-y-5 pb-24"
      >
        <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400">
          <Award className="w-7 h-7" />
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Quiz Selesai</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Latihan soal Madjuka Tensis telah rampung.
          </p>
        </div>

        {/* Certificate Result Card */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl text-left space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-sky-400" />
              <span className="font-semibold text-xs text-slate-200">
                Hasil Latihan Siswa
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {new Date().toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 text-[11px]">Nama Siswa:</span>
              <p className="text-sm font-bold text-white">
                {studentProfile ? studentProfile.name : "Siswa Madjuka Tensis"}
              </p>
            </div>

            <div>
              <span className="text-slate-400 text-[11px]">Kelas:</span>
              <p className="text-sm font-semibold text-slate-200">
                {studentProfile ? studentProfile.grade : "Kelas SMP"}
              </p>
            </div>

            {studentProfile?.school && (
              <div className="sm:col-span-2">
                <span className="text-slate-400 text-[11px]">Sekolah:</span>
                <p className="font-medium text-slate-300">{studentProfile.school}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400">Total Skor</span>
              <p className="text-lg font-bold text-sky-400">{score}</p>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400">Streak</span>
              <p className="text-lg font-bold text-slate-200">{highestStreak}x</p>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400">Akurasi</span>
              <p className="text-lg font-bold text-emerald-400">{Math.min(100, accuracy)}%</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 justify-center pt-2">
          <button
            onClick={restartQuiz}
            className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-xl text-xs transition active:scale-95 shadow-md"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Ulangi Quiz</span>
          </button>

          <button
            onClick={() => onNavigate("ar_quiz")}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 font-medium rounded-xl border border-slate-700 text-xs transition active:scale-95"
          >
            <Hand className="w-3.5 h-3.5 text-slate-400" />
            <span>Coba AR Tracking</span>
          </button>

          <button
            onClick={() => onNavigate("dashboard")}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 font-medium rounded-xl border border-slate-700 text-xs transition active:scale-95"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>Kembali ke Materi</span>
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 py-2 pb-24">
      {/* Quiz Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-900 border border-slate-800 rounded-2xl">
        {/* Student identification badge */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-sky-400 flex items-center justify-center font-bold text-xs">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-white text-xs">
                {studentProfile ? studentProfile.name : "Siswa"}
              </span>
              <button
                onClick={onOpenProfileModal}
                className="text-[10px] text-sky-400 hover:underline"
              >
                (Ubah)
              </button>
            </div>
            <span className="text-[10px] text-slate-400">
              {studentProfile ? studentProfile.grade : "Kelas SMP"}
            </span>
          </div>
        </div>

        {/* Level Filters */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-slate-400 text-[11px] mr-1">Level:</span>
          {(["All", "Easy", "Medium", "Hard"] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => {
                setSelectedLevel(lvl);
                setCurrentIndex(0);
                setSelectedAnswer(null);
                setIsLocked(false);
              }}
              className={`px-2.5 py-1 rounded-lg font-medium transition text-xs ${
                selectedLevel === lvl
                  ? "bg-slate-800 text-sky-300 border border-slate-700 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="text-xs text-slate-300">
          Skor: <span className="text-sky-400 font-bold">{score}</span>
        </div>
      </div>

      {/* Progress & Question Info */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>
            Soal {currentIndex + 1} dari {filteredQuestions.length}
          </span>
          <span className="px-2 py-0.5 rounded-md text-[10px] bg-slate-900 border border-slate-800 text-slate-400">
            {currentQuestion.level}
          </span>
        </div>

        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-sky-500 transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / filteredQuestions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Question Card with AnimatePresence */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`std-q-${currentIndex}`}
          initial={{ opacity: 0, x: 20, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -20, scale: 0.98 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-400 uppercase tracking-wide">
              {currentQuestion.tenseName}
            </span>
            {currentQuestion.timeSignal && (
              <span className="text-xs text-slate-300 font-mono bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-800">
                Sinyal: {currentQuestion.timeSignal}
              </span>
            )}
          </div>

          <p className="text-base sm:text-lg font-semibold text-white leading-relaxed">
            {currentQuestion.question}
          </p>

          {/* Answer Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {currentQuestion.options.map((opt, optIdx) => {
              const isSelected = selectedAnswer === opt.label;
              const isCorrect = isLocked && opt.label === currentQuestion.correctLabel;
              const isWrong = isLocked && isSelected && opt.label !== currentQuestion.correctLabel;

              let btnStyle =
                "bg-slate-950 border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-slate-200";

              if (isLocked) {
                if (isCorrect) {
                  btnStyle = "bg-emerald-950/60 border-emerald-600 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.2)]";
                } else if (isWrong) {
                  btnStyle = "bg-rose-950/60 border-rose-600 text-rose-200";
                } else {
                  btnStyle = "bg-slate-950/40 border-slate-900 text-slate-600 opacity-40";
                }
              }

              return (
                <motion.button
                  key={opt.label}
                  onClick={() => handleSelectAnswer(opt.label)}
                  disabled={isLocked}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: optIdx * 0.04, duration: 0.2 }}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left font-medium transition-all ${btnStyle}`}
                >
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      isCorrect
                        ? "bg-emerald-500 text-slate-950"
                        : isWrong
                        ? "bg-rose-500 text-white"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {opt.label}
                  </span>
                  <span className="text-xs sm:text-sm font-medium flex-1">{opt.text}</span>
                  {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  {isWrong && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                </motion.button>
              );
            })}
          </div>

          {/* Feedback Section when Locked */}
          {isLocked && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2.5"
            >
              <div className="flex items-center gap-2 text-xs font-semibold">
                {selectedAnswer === currentQuestion.correctLabel ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Jawaban Benar!
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center gap-1">
                    <XCircle className="w-4 h-4" /> Kunci Jawaban: {currentQuestion.correctLabel}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{currentQuestion.explanation}</p>

              {/* Formula Hint */}
              {currentTenseInfo && (
                <div className="text-xs bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-slate-300">
                  <span className="font-semibold text-slate-400">Formula: </span>
                  {currentTenseInfo.formula.positive}
                </div>
              )}

              {/* AI Tutor Button / Response */}
              {aiExplanation ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-slate-300 text-xs space-y-1"
                >
                  <div className="flex items-center gap-1.5 font-semibold text-sky-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Penjelasan AI Tutor:</span>
                  </div>
                  <p>{aiExplanation}</p>
                </motion.div>
              ) : (
                <button
                  onClick={fetchAiExplanation}
                  disabled={isLoadingAi}
                  className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 font-medium transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isLoadingAi ? "AI sedang memproses..." : "Minta penjelasan detail AI Tutor"}</span>
                </button>
              )}

              {/* Next Button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleNextQuestion}
                  className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-xl text-xs transition active:scale-95 shadow-md shadow-sky-900/30"
                >
                  <span>Soal Berikutnya</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Shortcut hint */}
      <div className="text-center text-[11px] text-slate-500">
        Tekan keyboard 1, 2, 3, 4 atau A, B, C, D dan Enter untuk memilih jawaban.
      </div>
    </div>
  );
};
