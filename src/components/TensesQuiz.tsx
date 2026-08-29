import React, { useState, useEffect } from "react";
import { QuizQuestion, EnglishTense, StudentProfile } from "../types";
import { QUESTION_BANK, ALL_16_TENSES } from "../data/tensesData";
import confetti from "canvas-confetti";
import { CheckCircle2, XCircle, Sparkles, ArrowRight, BookOpen, Flame, Award, HelpCircle, GraduationCap } from "lucide-react";

interface TensesQuizProps {
  hoveredElementId: string | null;
  studentProfile?: StudentProfile | null;
  onSelectAnswerByPinch?: (label: "A" | "B" | "C" | "D") => void;
  onNextQuestionByPinch?: () => void;
  onSwitchToGuide?: (tenseId?: string) => void;
}

export const TensesQuiz: React.FC<TensesQuizProps> = ({
  hoveredElementId,
  studentProfile,
  onSelectAnswerByPinch,
  onNextQuestionByPinch,
  onSwitchToGuide,
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

  // Listen to pinch events from parent
  useEffect(() => {
    if (!hoveredElementId) return;

    if (hoveredElementId.startsWith("option-")) {
      const label = hoveredElementId.replace("option-", "") as "A" | "B" | "C" | "D";
      if (onSelectAnswerByPinch) {
        // Parent will call handleSelectAnswer
      }
    }
  }, [hoveredElementId, onSelectAnswerByPinch]);

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
      <div className="text-center py-6 space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
          <Award className="w-9 h-9" />
        </div>
        <div>
          <h2 className="text-xl font-black text-white">AR QUIZ COMPLETED!</h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Selamat <strong className="text-amber-400">{studentProfile?.name || "Siswa"}</strong> ({studentProfile?.grade || "SMP"}), Anda telah menyelesaikan latihan Madjuka Tensis!
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
          <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
            <span className="text-[11px] text-slate-400">Total Score</span>
            <p className="text-xl font-black text-sky-400">{score}</p>
          </div>
          <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
            <span className="text-[11px] text-slate-400">Max Streak</span>
            <p className="text-xl font-black text-amber-400">{highestStreak} 🔥</p>
          </div>
        </div>

        <div className="flex gap-2 justify-center pt-2">
          <button
            id="btn-restart-quiz"
            data-clickable-id="btn-restart-quiz"
            onClick={restartQuiz}
            className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-lg transition active:scale-95 text-xs"
          >
            PLAY AGAIN (PINCH)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quiz Progress & Stats Bar */}
      <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-700/60">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-sky-400">#{currentIndex + 1}/{QUESTION_BANK.length}</span>
          {studentProfile && (
            <span className="text-[10px] text-amber-300 font-semibold truncate max-w-[100px]">
              • {studentProfile.name}
            </span>
          )}
          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {currentQuestion.level}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {streak > 0 && (
            <div className="flex items-center gap-1 text-amber-400 font-bold text-xs animate-bounce">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span>{streak}x Streak</span>
            </div>
          )}
          <div className="text-slate-300 font-semibold">
            Score: <span className="text-emerald-400 font-bold">{score}</span>
          </div>
        </div>
      </div>

      {/* Target Tense Title */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-sky-300 uppercase tracking-wide">
          {currentQuestion.tenseName}
        </span>
        {currentQuestion.timeSignal && (
          <span className="text-[10px] text-amber-300/90 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            Signal: {currentQuestion.timeSignal}
          </span>
        )}
      </div>

      {/* Question Text */}
      <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800">
        <p className="text-base font-semibold text-white leading-relaxed">
          {currentQuestion.question}
        </p>
      </div>

      {/* Answer Options (A, B, C, D) - Raycast Targets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {currentQuestion.options.map((opt) => {
          const isHovered = hoveredElementId === `option-${opt.label}`;
          const isSelected = selectedAnswer === opt.label;
          const isCorrect = isLocked && opt.label === currentQuestion.correctLabel;
          const isWrong = isLocked && isSelected && opt.label !== currentQuestion.correctLabel;

          let btnStyles = "bg-slate-800/80 border-slate-700/80 text-slate-200 hover:bg-slate-700/80";

          if (isLocked) {
            if (isCorrect) {
              btnStyles = "bg-emerald-600/30 border-emerald-400 text-emerald-200 ring-2 ring-emerald-500/50";
            } else if (isWrong) {
              btnStyles = "bg-rose-600/30 border-rose-400 text-rose-200";
            } else {
              btnStyles = "bg-slate-900/40 border-slate-800 text-slate-500 opacity-60";
            }
          } else if (isHovered) {
            // INDEX POINTING HOVER ONLY HIGHLIGHTS!
            btnStyles =
              "bg-amber-500/25 border-amber-400 text-amber-100 ring-2 ring-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-[1.02]";
          }

          return (
            <button
              key={opt.label}
              id={`option-${opt.label}`}
              data-clickable-id={`option-${opt.label}`}
              onClick={() => handleSelectAnswer(opt.label)}
              className={`flex items-center gap-3 p-3 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all duration-150 active:scale-95 ${btnStyles}`}
              title={`Point with index to highlight, Pinch to select option ${opt.label}`}
            >
              <span
                className={`w-7 h-7 shrink-0 rounded-xl flex items-center justify-center font-bold text-xs ${
                  isCorrect
                    ? "bg-emerald-500 text-slate-950 font-black"
                    : isWrong
                    ? "bg-rose-500 text-white"
                    : isHovered
                    ? "bg-amber-400 text-slate-950 font-black"
                    : "bg-slate-700 text-slate-300"
                }`}
              >
                {opt.label}
              </span>
              <span className="flex-1 truncate">{opt.text}</span>
              {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              {isWrong && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Answer Feedback & AI Explanation Section */}
      {isLocked && (
        <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-700/80 space-y-2.5 animate-fadeIn">
          <div className="flex items-start gap-2">
            {selectedAnswer === currentQuestion.correctLabel ? (
              <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> BENAR (+{100 + streak * 20} pts)
              </span>
            ) : (
              <span className="text-rose-400 font-bold text-xs flex items-center gap-1">
                <XCircle className="w-4 h-4" /> KURANG TEPAT (Kunci: {currentQuestion.correctLabel})
              </span>
            )}
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">{currentQuestion.explanation}</p>

          {/* Formula Helper */}
          {currentTenseInfo && (
            <div className="text-[11px] bg-sky-950/40 p-2 rounded-xl border border-sky-800/40 text-sky-200">
              <span className="font-semibold text-sky-400">Formula: </span>
              {currentTenseInfo.formula.positive}
            </div>
          )}

          {/* AI Adaptive Coach explanation */}
          {aiExplanation ? (
            <div className="text-xs p-2.5 bg-indigo-950/50 rounded-xl border border-indigo-700/50 text-indigo-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-indigo-300">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>AI Tenses Tutor:</span>
              </div>
              <p>{aiExplanation}</p>
            </div>
          ) : (
            <button
              onClick={fetchAiExplanation}
              disabled={isLoadingAi}
              className="flex items-center gap-1.5 text-[11px] text-indigo-300 hover:text-indigo-200 font-semibold transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isLoadingAi ? "Thinking..." : "Tanya Penjelasan Detail ke AI Tutor"}</span>
            </button>
          )}

          {/* NEXT QUESTION BUTTON (Raycast Target: 'btn-next-question') */}
          <div className="pt-1 flex justify-end">
            <button
              id="btn-next-question"
              data-clickable-id="btn-next-question"
              onClick={handleNextQuestion}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg active:scale-95 ${
                hoveredElementId === "btn-next-question"
                  ? "bg-amber-400 text-slate-950 ring-2 ring-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.6)] scale-105"
                  : "bg-sky-600 hover:bg-sky-500 text-white"
              }`}
              title="Point with index & Pinch to advance to next question"
            >
              <span>SOAL BERIKUTNYA</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
