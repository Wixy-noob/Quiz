import React, { useState } from "react";
import { ALL_16_TENSES } from "../data/tensesData";
import { TenseCategory, EnglishTense } from "../types";
import { BookOpen, Sparkles, CheckCircle, Clock, Zap, ArrowRight } from "lucide-react";

interface TensesGuideProps {
  onStartQuizWithTense?: (tenseId: string) => void;
}

export const TensesGuide: React.FC<TensesGuideProps> = ({ onStartQuizWithTense }) => {
  const [selectedCategory, setSelectedCategory] = useState<TenseCategory | "All">("All");
  const [selectedTense, setSelectedTense] = useState<EnglishTense | null>(ALL_16_TENSES[0]);

  const categories: (TenseCategory | "All")[] = ["All", "Present", "Past", "Future", "Past Future"];

  const filteredTenses =
    selectedCategory === "All"
      ? ALL_16_TENSES
      : ALL_16_TENSES.filter((t) => t.category === selectedCategory);

  return (
    <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-sky-400" />
            <span>PANDUAN LENGKAP 16 ENGLISH TENSES</span>
          </h2>
          <p className="text-xs text-slate-400">
            Kuasai rumus, fungsi, sinyal waktu, dan contoh kalimat 16 Tenses.
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 border transition-all ${
              selectedCategory === cat
                ? "bg-sky-500/20 border-sky-400 text-sky-300"
                : "bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {cat === "All" ? "Semua (16 Tenses)" : cat}
          </button>
        ))}
      </div>

      {/* 16 Tenses Grid Selection */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {filteredTenses.map((tense) => {
          const isSelected = selectedTense?.id === tense.id;
          return (
            <button
              key={tense.id}
              onClick={() => setSelectedTense(tense)}
              className={`p-2.5 rounded-2xl border text-left text-xs transition-all ${
                isSelected
                  ? "bg-sky-500/20 border-sky-400 text-white ring-2 ring-sky-400/40 shadow-lg"
                  : "bg-slate-800/60 border-slate-700/70 text-slate-300 hover:bg-slate-750"
              }`}
            >
              <span className="text-[10px] font-bold text-sky-400 block uppercase">
                {tense.category}
              </span>
              <p className="font-bold text-white truncate mt-0.5">{tense.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{tense.indonesianName}</p>
            </button>
          );
        })}
      </div>

      {/* Active Tense Comprehensive Detail Card */}
      {selectedTense && (
        <div className="p-5 bg-slate-900/90 border border-slate-700 rounded-3xl space-y-4 shadow-2xl animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-700">
            <div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                {selectedTense.category} Tense
              </span>
              <h3 className="text-lg font-black text-white mt-1">{selectedTense.name}</h3>
              <p className="text-xs text-sky-300 italic">{selectedTense.indonesianName}</p>
            </div>

            {onStartQuizWithTense && (
              <button
                onClick={() => onStartQuizWithTense(selectedTense.id)}
                className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-lg transition active:scale-95 self-start"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Latihan AR Quiz</span>
              </button>
            )}
          </div>

          {/* Fungsi Tense */}
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Fungsi & Kegunaan
            </span>
            <p className="text-xs text-slate-200 leading-relaxed bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
              {selectedTense.functionDesc}
            </p>
          </div>

          {/* Formula Table */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Rumus / Struktur Pola Kalimat
            </span>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="p-2.5 bg-emerald-950/40 border border-emerald-800/50 rounded-xl text-emerald-200 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-[10px]">
                  (+)
                </span>
                <span>{selectedTense.formula.positive}</span>
              </div>
              <div className="p-2.5 bg-rose-950/40 border border-rose-800/50 rounded-xl text-rose-200 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-rose-500/20 text-rose-300 flex items-center justify-center font-bold text-[10px]">
                  (-)
                </span>
                <span>{selectedTense.formula.negative}</span>
              </div>
              <div className="p-2.5 bg-indigo-950/40 border border-indigo-800/50 rounded-xl text-indigo-200 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-[10px]">
                  (?)
                </span>
                <span>{selectedTense.formula.interrogative}</span>
              </div>
            </div>
          </div>

          {/* Time Signals */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> Sinyal Waktu Khas (Time Markers)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {selectedTense.timeSignals.map((signal, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono"
                >
                  {signal}
                </span>
              ))}
            </div>
          </div>

          {/* Contoh Kalimat */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Contoh Kalimat Riil
            </span>
            <div className="space-y-2">
              {selectedTense.examples.map((ex, i) => (
                <div
                  key={i}
                  className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 text-xs space-y-0.5"
                >
                  <p className="font-semibold text-white">{ex.en}</p>
                  <p className="text-slate-400 italic text-[11px]">{ex.id}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tips Madjuka Tensis */}
          <div className="p-3 bg-sky-950/40 border border-sky-700/50 rounded-2xl text-xs space-y-1">
            <span className="font-bold text-sky-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tips & Trik Mengingat:</span>
            </span>
            <p className="text-slate-300">{selectedTense.tips}</p>
          </div>
        </div>
      )}
    </div>
  );
};
