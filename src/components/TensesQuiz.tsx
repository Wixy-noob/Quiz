import React, { useState, useEffect } from "react";
import { QuizQuestion, StudentProfile } from "../types";
import { QUESTION_BANK, ALL_16_TENSES } from "../data/tensesData";
import confetti from "canvas-confetti";
import { CheckCircle2, XCircle, Sparkles, ArrowRight, Flame, Award } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TensesQuizProps {
  hoveredElementId: string | null;
  studentProfile?: StudentProfile | null;
  onSelectAnswerByPinch?: (label: "A" | "B" | "C" | "D") => void;
  onNextQuestionByPinch?: () => void;
  onSwitchToGuide?: (tenseId?: string) => void;
  nextQuestionTriggerSignal?: number;
}

export const TensesQuiz: React.FC<TensesQuizProps> = ({
  hoveredElementId,
  studentProfile,
  onSelectAnswerByPinch,
  onNextQuestionByPinch,
  onSwitchToGuide,
  nextQuestionTriggerSignal,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQuestion: QuizQuestion = QUESTION_BANK[currentIndex] || QUESTION_BANK[0];
  const currentTenseInfo = ALL_16_TENSES.find((t) => t.id === currentQuestion.tenseId);

  // Handle Next Question
  const handleNextQuestion = () => {
    if (currentIndex < QUESTION_BANK.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsLocked(false);
      setAiExplanation(null);
    } else {
      setIsCompleted(true);
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
      });
    }
  };

  // Listen to external dual-hand next question trigger signal
  useEffect(() => {
    if (nextQuestionTriggerSignal && nextQuestionTriggerSignal > 0) {
      if (isCompleted) {
        restartQuiz();
      } else {
        handleNextQuestion();
      }
    }
  }, [nextQuestionTriggerSignal]);

  // Handle Answer Selection
  const handleSelectAnswer = (label: "A" | "B" | "C" | "D") => {
    if (isLocked) return;
    setSelectedAnswer(label);
    setIsLocked(true);

    const isCorrect = label === currentQuestion.correctLabel;
    if (isCorrect) {
      setScore((s) => s + 100 + streak * 20);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > highestStreak) setHighestStreak(newStreak);

      // Trigger celebratory mini confetti
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#38bdf8", "#34d399", "#fbbf24"],
      });
    } else {
      setStreak(0);
    }
  };

  // Request AI Tutor explanation
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
          correctAnswer: currentQuestion.options.find((o) => o.label === currentQuestion.correctLabel)?.text || "",
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

  const restartQuiz = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsLocked(false);
    setScore(0);
    setStreak(0);
    setIsCompleted(false);
    setAiExplanation(null);
  };

  if (isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="text-center py-5 space-y-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
          className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 backdrop-blur-md shadow-lg shadow-emerald-950/40"
        >
          <Award className="w-9 h-9" />
        </motion.div>
        <div>
          <h2 className="text-xl font-black text-white drop-shadow-md">AR QUIZ SELESAI!</h2>
          <p className="text-xs text-slate-200 mt-0.5">
            Selamat <strong className="text-amber-300">{studentProfile?.name || "Siswa"}</strong> ({studentProfile?.grade || "SMP"}), Anda telah menyelesaikan latihan Madjuka Tensis!
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
          <div className="p-3 bg-slate-900/45 backdrop-blur-xl rounded-2xl border border-white/15 shadow-inner">
            <span className="text-[11px] text-slate-300 font-medium">Total Skor</span>
            <p className="text-xl font-black text-sky-300 drop-shadow">{score}</p>
          </div>
          <div className="p-3 bg-slate-900/45 backdrop-blur-xl rounded-2xl border border-white/15 shadow-inner">
            <span className="text-[11px] text-slate-300 font-medium">Max Streak</span>
            <p className="text-xl font-black text-amber-300 drop-shadow">{highestStreak} 🔥</p>
          </div>
        </div>

        <div className="flex gap-2 justify-center pt-2">
          <button
            id="btn-restart-quiz"
            data-clickable-id="btn-restart-quiz"
            onClick={restartQuiz}
            className="px-5 py-2.5 bg-sky-600/80 hover:bg-sky-500/90 text-white font-bold rounded-xl shadow-lg border border-sky-400/40 backdrop-blur-md transition active:scale-95 text-xs"
          >
            MAIN LAGI (TUTUP TANGAN / KLIK)
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3.5">
      {/* Quiz Progress & Stats Bar with Glassmorphic pill */}
      <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sky-300 drop-shadow-sm">#{currentIndex + 1}/{QUESTION_BANK.length}</span>
          {studentProfile && (
            <span className="text-[10px] text-amber-300 font-semibold truncate max-w-[120px] bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-400/20">
              {studentProfile.name}
            </span>
          )}
          <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-indigo-500/25 text-indigo-200 border border-indigo-400/30 backdrop-blur-sm">
            {currentQuestion.level}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {streak > 0 && (
            <div className="flex items-center gap-1 text-amber-300 font-bold text-xs animate-bounce bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/30">
              <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{streak}x Streak</span>
            </div>
          )}
          <div className="text-slate-200 text-xs font-semibold">
            Skor: <span className="text-emerald-400 font-black">{score}</span>
          </div>
        </div>
      </div>

      {/* Target Tense Title */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-sky-300 uppercase tracking-wider drop-shadow-sm">
          {currentQuestion.tenseName}
        </span>
        {currentQuestion.timeSignal && (
          <span className="text-[10px] text-amber-300 font-mono bg-amber-500/15 px-2.5 py-0.5 rounded-lg border border-amber-400/25 backdrop-blur-sm">
            Signal: {currentQuestion.timeSignal}
          </span>
        )}
      </div>

      {/* Question & Options Area with Smooth Transitions on Change */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`q-${currentIndex}`}
          initial={{ opacity: 0, x: 20, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -20, scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="space-y-3"
        >
          {/* Question Text Card */}
          <div className="p-4 bg-slate-950/40 backdrop-blur-md rounded-2xl border border-white/15 shadow-inner">
            <p className="text-sm sm:text-base font-semibold text-white leading-relaxed drop-shadow-sm">
              {currentQuestion.question}
            </p>
          </div>

          {/* Answer Options (A, B, C, D) - Staggered Motion */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {currentQuestion.options.map((opt, optIndex) => {
              const isHovered = hoveredElementId === `option-${opt.label}`;
              const isSelected = selectedAnswer === opt.label;
              const isCorrect = isLocked && opt.label === currentQuestion.correctLabel;
              const isWrong = isLocked && isSelected && opt.label !== currentQuestion.correctLabel;

              let btnStyles = "bg-slate-900/40 hover:bg-slate-800/60 border-white/15 text-slate-100 backdrop-blur-md shadow-sm";

              if (isLocked) {
                if (isCorrect) {
                  btnStyles = "bg-emerald-600/50 border-emerald-400 text-white ring-2 ring-emerald-400/60 shadow-[0_0_20px_rgba(52,211,153,0.4)] backdrop-blur-lg";
                } else if (isWrong) {
                  btnStyles = "bg-rose-600/50 border-rose-400 text-rose-100 ring-2 ring-rose-400/40 backdrop-blur-lg";
                } else {
                  btnStyles = "bg-slate-950/30 border-white/5 text-slate-400 opacity-50 backdrop-blur-sm";
                }
              } else if (isHovered) {
                btnStyles =
                  "bg-amber-500/35 border-amber-400 text-white ring-2 ring-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.5)] scale-[1.02] backdrop-blur-xl";
              }

              return (
                <motion.button
                  key={opt.label}
                  id={`option-${opt.label}`}
                  data-clickable-id={`option-${opt.label}`}
                  onClick={() => handleSelectAnswer(opt.label)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: optIndex * 0.04, duration: 0.2 }}
                  className={`flex items-center gap-3 p-3 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all duration-150 active:scale-95 ${btnStyles}`}
                  title={`Arahkan telunjuk, lalu Tutup Tangan (genggam) atau Pinch untuk memilih ${opt.label}`}
                >
                  <span
                    className={`w-7 h-7 shrink-0 rounded-xl flex items-center justify-center font-black text-xs shadow-md transition-colors ${
                      isCorrect
                        ? "bg-emerald-400 text-slate-950"
                        : isWrong
                        ? "bg-rose-500 text-white"
                        : isHovered
                        ? "bg-amber-400 text-slate-950"
                        : "bg-slate-800/80 text-sky-300 border border-white/10"
                    }`}
                  >
                    {opt.label}
                  </span>
                  <span className="flex-1 font-medium">{opt.text}</span>
                  {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  {isWrong && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Feedback Bar & AI Explanation Modal */}
      <AnimatePresence>
        {isLocked && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="pt-2 space-y-3"
          >
            <div
              className={`p-3.5 rounded-2xl border backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                selectedAnswer === currentQuestion.correctLabel
                  ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-200"
                  : "bg-rose-950/60 border-rose-500/40 text-rose-200"
              }`}
            >
              <div>
                <p className="font-bold text-xs sm:text-sm flex items-center gap-1.5">
                  {selectedAnswer === currentQuestion.correctLabel ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Jawaban Benar! (+100 poin)</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-400" />
                      <span>Kurang Tepat. Jawaban yang benar adalah {currentQuestion.correctLabel}.</span>
                    </>
                  )}
                </p>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  {currentQuestion.explanation}
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {/* AI Tutor Explain Button */}
                <button
                  id="btn-ai-explain"
                  data-clickable-id="btn-ai-explain"
                  onClick={fetchAiExplanation}
                  disabled={isLoadingAi}
                  className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600/70 hover:bg-indigo-500/80 text-white rounded-xl text-xs font-semibold border border-indigo-400/30 backdrop-blur-md transition active:scale-95 disabled:opacity-50"
                  title="Tanya AI Tutor untuk penjelasan mendalam"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isLoadingAi ? "Menganalisis..." : "Tanya AI"}</span>
                </button>

                {/* Next Question Button (Raycast Target: 'btn-next-question') */}
                <button
                  id="btn-next-question"
                  data-clickable-id="btn-next-question"
                  onClick={handleNextQuestion}
                  className={`flex items-center gap-1.5 px-4 py-2 text-white font-bold rounded-xl text-xs shadow-lg transition active:scale-95 border ${
                    hoveredElementId === "btn-next-question"
                      ? "bg-amber-500 border-amber-300 ring-2 ring-amber-300 scale-105 text-slate-950"
                      : "bg-sky-600/80 hover:bg-sky-500/90 border-sky-400/40 backdrop-blur-md"
                  }`}
                  title="Arahkan pointer lalu Tutup Tangan atau gunakan gestur 🖐️+✊ (1 Buka + 1 Mengepal)"
                >
                  <span>Lanjut</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Dual-Hand Gesture Banner Hint */}
            <div className="flex items-center justify-between px-3 py-2 bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-xl text-[11px] text-slate-300">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30">
                  🖐️ + ✊ Gestur Lanjut
                </span>
                <span>1 tangan terbuka + 1 tangan mengepal untuk otomatis ke soal berikutnya</span>
              </div>
            </div>

            {/* AI Explanation Box */}
            {aiExplanation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl backdrop-blur-xl text-indigo-100 text-xs space-y-2"
              >
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <Sparkles className="w-4 h-4" />
                  <span>Penjelasan Tutor AI:</span>
                </div>
                <p className="leading-relaxed whitespace-pre-line text-slate-200">
                  {aiExplanation}
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
