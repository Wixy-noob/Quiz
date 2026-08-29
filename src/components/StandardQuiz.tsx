import React, { useState, useEffect } from "react";
import { QuizQuestion, EnglishTense, ActiveAppMode, StudentProfile } from "../types";
import { QUESTION_BANK, ALL_16_TENSES } from "../data/tensesData";
import confetti from "canvas-confetti";
import {
  Award,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Flame,
  BookOpen,
  Filter,
  Volume2,
  HelpCircle,
  Hand,
  Check,
  User,
  GraduationCap,
  Calendar,
} from "lucide-react";

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
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#38bdf8", "#34d399", "#fbbf24"],
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
        particleCount: 150,
        spread: 100,
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
      <div className="max-w-2xl mx-auto py-8 text-center space-y-6 animate-fadeIn pb-32">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-500 to-sky-500 flex items-center justify-center text-slate-950 shadow-2xl">
          <Award className="w-10 h-10" />
        </div>

        <div>
          <h2 className="text-3xl font-black text-white">QUIZ SELESAI!</h2>
          <p className="text-sm text-slate-300 mt-1">
            Luar biasa! Anda telah menyelesaikan latihan Madjuka Tensis.
          </p>
        </div>

        {/* Certificate Style Result Card */}
        <div className="p-6 bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 border border-sky-500/40 rounded-3xl text-left space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-sky-400" />
              <span className="font-bold text-xs uppercase tracking-wider text-sky-300">
                Sertifikat Hasil Latihan Siswa
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
              <p className="text-base font-black text-white">
                {studentProfile ? studentProfile.name : "Siswa Madjuka Tensis"}
              </p>
            </div>

            <div>
              <span className="text-slate-400 text-[11px]">Kelas:</span>
              <p className="text-base font-black text-amber-400">
                {studentProfile ? studentProfile.grade : "Kelas SMP"}
              </p>
            </div>

            {studentProfile?.school && (
              <div className="sm:col-span-2">
                <span className="text-slate-400 text-[11px]">Asal Sekolah:</span>
                <p className="font-semibold text-slate-200">{studentProfile.school}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400">Total Skor</span>
              <p className="text-xl font-black text-sky-400">{score}</p>
            </div>
            <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400">Max Streak</span>
              <p className="text-xl font-black text-amber-400">{highestStreak} 🔥</p>
            </div>
            <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400">Akurasi</span>
              <p className="text-xl font-black text-emerald-400">{Math.min(100, accuracy)}%</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-center pt-2">
          <button
            onClick={restartQuiz}
            className="flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-lg transition active:scale-95 text-xs sm:text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>ULANGI QUIZ</span>
          </button>

          <button
            onClick={() => onNavigate("ar_quiz")}
            className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg transition active:scale-95 text-xs sm:text-sm"
          >
            <Hand className="w-4 h-4" />
            <span>COBA VERSI AR HAND-TRACKING</span>
          </button>

          <button
            onClick={() => onNavigate("dashboard")}
            className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold rounded-xl border border-slate-700 transition active:scale-95 text-xs sm:text-sm"
          >
            <BookOpen className="w-4 h-4" />
            <span>KEMBALI KE MATERI</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4 pb-32">
      {/* Quiz Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
        {/* Student identification badge */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-black text-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-xs">
                {studentProfile ? studentProfile.name : "Siswa"}
              </span>
              <button
                onClick={onOpenProfileModal}
                className="text-[10px] text-sky-400 hover:underline"
              >
                (Ubah)
              </button>
            </div>
            <span className="text-[10px] text-amber-300 font-semibold">
              {studentProfile ? studentProfile.grade : "1 SMP (Kelas 7)"}
            </span>
          </div>
        </div>

        {/* Level Filters */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 text-[11px]">Level:</span>
          {(["All", "Easy", "Medium", "Hard"] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => {
                setSelectedLevel(lvl);
                setCurrentIndex(0);
                setSelectedAnswer(null);
                setIsLocked(false);
              }}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                selectedLevel === lvl
                  ? "bg-sky-500 text-slate-950 font-bold"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs">
          {streak > 0 && (
            <div className="flex items-center gap-1 text-amber-400 font-bold animate-bounce">
              <Flame className="w-4 h-4 fill-amber-400" />
              <span>{streak}x Streak</span>
            </div>
          )}
          <div className="text-slate-300">
            Skor: <span className="text-emerald-400 font-bold text-sm">{score}</span>
          </div>
        </div>
      </div>

      {/* Progress & Question Info */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-sky-400">
            SOAL #{currentIndex + 1} / {filteredQuestions.length}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {currentQuestion.level}
          </span>
        </div>

        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / filteredQuestions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-sky-400 uppercase tracking-wide">
            {currentQuestion.tenseName}
          </span>
          {currentQuestion.timeSignal && (
            <span className="text-xs text-amber-300 font-mono bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
              Sinyal Waktu: {currentQuestion.timeSignal}
            </span>
          )}
        </div>

        <p className="text-lg sm:text-xl font-bold text-white leading-relaxed">
          {currentQuestion.question}
        </p>

        {/* Answer Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {currentQuestion.options.map((opt) => {
            const isSelected = selectedAnswer === opt.label;
            const isCorrect = isLocked && opt.label === currentQuestion.correctLabel;
            const isWrong = isLocked && isSelected && opt.label !== currentQuestion.correctLabel;

            let btnStyle =
              "bg-slate-800/80 border-slate-700 hover:bg-slate-750 hover:border-slate-600 text-slate-200";

            if (isLocked) {
              if (isCorrect) {
                btnStyle =
                  "bg-emerald-500/20 border-emerald-400 text-emerald-100 ring-2 ring-emerald-500/50";
              } else if (isWrong) {
                btnStyle = "bg-rose-500/20 border-rose-400 text-rose-100";
              } else {
                btnStyle = "bg-slate-900/40 border-slate-800 text-slate-600 opacity-50";
              }
            }

            return (
              <button
                key={opt.label}
                onClick={() => handleSelectAnswer(opt.label)}
                disabled={isLocked}
                className={`flex items-center gap-3 p-4 rounded-2xl border text-left font-medium transition-all active:scale-98 ${btnStyle}`}
              >
                <span
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    isCorrect
                      ? "bg-emerald-400 text-slate-950 font-black"
                      : isWrong
                      ? "bg-rose-500 text-white"
                      : "bg-slate-700 text-slate-200"
                  }`}
                >
                  {opt.label}
                </span>
                <span className="text-sm font-semibold flex-1">{opt.text}</span>
                {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                {isWrong && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Feedback Section when Locked */}
        {isLocked && (
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 animate-fadeIn">
            <div className="flex items-center gap-2 text-sm font-bold">
              {selectedAnswer === currentQuestion.correctLabel ? (
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> JAWABAN BENAR (+{100 + streak * 20} pts)
                </span>
              ) : (
                <span className="text-rose-400 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4" /> KURANG TEPAT (Kunci Jawaban:{" "}
                  {currentQuestion.correctLabel})
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{currentQuestion.explanation}</p>

            {/* Formula Hint */}
            {currentTenseInfo && (
              <div className="text-xs bg-sky-950/40 p-2.5 rounded-xl border border-sky-800/40 text-sky-200">
                <span className="font-semibold text-sky-400">Formula Positif: </span>
                {currentTenseInfo.formula.positive}
              </div>
            )}

            {/* AI Tutor Button / Response */}
            {aiExplanation ? (
              <div className="p-3 bg-indigo-950/50 rounded-xl border border-indigo-700/50 text-indigo-200 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-indigo-300">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Penjelasan AI Tutor:</span>
                </div>
                <p>{aiExplanation}</p>
              </div>
            ) : (
              <button
                onClick={fetchAiExplanation}
                disabled={isLoadingAi}
                className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isLoadingAi ? "AI Sedang Berpikir..." : "Tanya Penjelasan Detail ke AI Tutor"}</span>
              </button>
            )}

            {/* Next Button */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleNextQuestion}
                className="flex items-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition active:scale-95"
              >
                <span>SOAL BERIKUTNYA</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Shortcut hint */}
      <div className="text-center text-[11px] text-slate-500">
        💡 Tip: Anda juga dapat menggunakan keyboard tombol 1, 2, 3, 4 atau A, B, C, D dan Enter.
      </div>
    </div>
  );
};
