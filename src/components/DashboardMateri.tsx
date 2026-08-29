import React, { useState } from "react";
import {
  ALL_16_TENSES,
  SMP_CURRICULUM_DATA,
  IRREGULAR_VERBS_LIST,
  TENSE_COMPARISONS,
} from "../data/tensesData";
import { TenseCategory, EnglishTense, ActiveAppMode, StudentProfile } from "../types";
import {
  BookOpen,
  Sparkles,
  Zap,
  HelpCircle,
  Camera,
  Award,
  Clock,
  Search,
  CheckCircle2,
  Layers,
  ArrowRight,
  Hand,
  Compass,
  GraduationCap,
  Table,
  Check,
  Split,
  FileText,
  User,
  Edit3,
} from "lucide-react";

interface DashboardMateriProps {
  onNavigateWithProfileCheck: (mode: ActiveAppMode) => void;
  studentProfile: StudentProfile | null;
  onOpenProfileModal: () => void;
}

export const DashboardMateri: React.FC<DashboardMateriProps> = ({
  onNavigateWithProfileCheck,
  studentProfile,
  onOpenProfileModal,
}) => {
  // Materi tab switching
  const [activeMateriTab, setActiveMateriTab] = useState<
    "matrix16" | "smpCurriculum" | "irregularVerbs" | "comparisons" | "verbalNominal"
  >("matrix16");

  // 16 Tenses filter state
  const [selectedCategory, setSelectedCategory] = useState<TenseCategory | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTense, setSelectedTense] = useState<EnglishTense | null>(ALL_16_TENSES[0]);

  // Irregular verbs filter
  const [verbSearch, setVerbSearch] = useState("");
  const [verbCategory, setVerbCategory] = useState<"All" | "SMP Dasar" | "SMP Menengah" | "SMP Lanjutan">("All");

  const categories: (TenseCategory | "All")[] = ["All", "Present", "Past", "Future", "Past Future"];

  const filteredTenses = ALL_16_TENSES.filter((t) => {
    const matchesCategory = selectedCategory === "All" || t.category === selectedCategory;
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.indonesianName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.timeSignals.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const filteredVerbs = IRREGULAR_VERBS_LIST.filter((v) => {
    const matchesCat = verbCategory === "All" || v.category === verbCategory;
    const matchesQuery =
      v.v1.toLowerCase().includes(verbSearch.toLowerCase()) ||
      v.v2.toLowerCase().includes(verbSearch.toLowerCase()) ||
      v.v3.toLowerCase().includes(verbSearch.toLowerCase()) ||
      v.meaning.toLowerCase().includes(verbSearch.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-10 pb-32 overflow-y-auto w-full">
      {/* 1. STATUS PROFIL SISWA & INTRO HEADER */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900/90 border border-slate-800 rounded-3xl backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-sky-500/20 shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Selamat Belajar,</span>
              {studentProfile ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {studentProfile.grade}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Belum Isi Profil
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              {studentProfile ? studentProfile.name : "Siswa / Siswi Madjuka Tensis"}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenProfileModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-750 text-sky-300 rounded-xl border border-slate-700 text-xs font-bold transition active:scale-95"
          >
            <User className="w-3.5 h-3.5" />
            <span>{studentProfile ? "Ganti Nama / Kelas" : "Isi Nama & Kelas"}</span>
          </button>
        </div>
      </section>

      {/* 2. PUSAT MATERI LENGKAP & TAB NAVIGASI MATERI */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
              <BookOpen className="w-7 h-7 text-sky-400" />
              <span>Pusat Materi Lengkap 16 Tenses</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Pelajari seluruh konsep tenses, rumus verbal/nominal, kurikulum SMP kelas 1, 2, 3,
              serta tabel perubahan kata kerja.
            </p>
          </div>

          {/* Materi Sub-Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setActiveMateriTab("matrix16")}
              className={`px-3 py-2 rounded-xl transition ${
                activeMateriTab === "matrix16"
                  ? "bg-sky-500 text-slate-950 shadow-md font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              16 Modul Tenses
            </button>

            <button
              onClick={() => setActiveMateriTab("smpCurriculum")}
              className={`px-3 py-2 rounded-xl transition ${
                activeMateriTab === "smpCurriculum"
                  ? "bg-sky-500 text-slate-950 shadow-md font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Panduan SMP (Kelas 7, 8, 9)
            </button>

            <button
              onClick={() => setActiveMateriTab("comparisons")}
              className={`px-3 py-2 rounded-xl transition ${
                activeMateriTab === "comparisons"
                  ? "bg-sky-500 text-slate-950 shadow-md font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Perbandingan Tenses
            </button>

            <button
              onClick={() => setActiveMateriTab("irregularVerbs")}
              className={`px-3 py-2 rounded-xl transition ${
                activeMateriTab === "irregularVerbs"
                  ? "bg-sky-500 text-slate-950 shadow-md font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Tabel Irregular Verbs
            </button>

            <button
              onClick={() => setActiveMateriTab("verbalNominal")}
              className={`px-3 py-2 rounded-xl transition ${
                activeMateriTab === "verbalNominal"
                  ? "bg-sky-500 text-slate-950 shadow-md font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Verbal vs Nominal
            </button>
          </div>
        </div>

        {/* TAB 1: 16 MODUL TENSES MATRIKS */}
        {activeMateriTab === "matrix16" && (
          <div className="space-y-6">
            {/* Search & Category Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 border transition-all ${
                      selectedCategory === cat
                        ? "bg-sky-500/20 border-sky-400 text-sky-300 shadow-md"
                        : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {cat === "All" ? "Semua 16 Tenses" : `${cat} Tenses`}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari tense / sinyal waktu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Grid 16 Tenses */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {filteredTenses.map((tense) => {
                const isSelected = selectedTense?.id === tense.id;
                return (
                  <button
                    key={tense.id}
                    onClick={() => setSelectedTense(tense)}
                    className={`p-3 rounded-2xl border text-left text-xs transition-all ${
                      isSelected
                        ? "bg-sky-500/20 border-sky-400 text-white ring-2 ring-sky-400/40 shadow-lg scale-[1.01]"
                        : "bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-sky-400 uppercase">
                        {tense.category}
                      </span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />}
                    </div>
                    <p className="font-bold text-white truncate mt-1">{tense.name}</p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {tense.indonesianName}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Detailed Selected Tense Card */}
            {selectedTense && (
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-5 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      {selectedTense.category} Tense
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                      {selectedTense.name}
                    </h3>
                    <p className="text-xs text-sky-300 italic">{selectedTense.indonesianName}</p>
                  </div>

                  <button
                    onClick={() => onNavigateWithProfileCheck("quiz_biasa")}
                    className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs shadow-lg transition active:scale-95 self-start sm:self-auto"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Latihan Soal Tense Ini</span>
                  </button>
                </div>

                {/* Formula Section */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Rumus & Pola Struktur Kalimat
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs font-mono">
                    <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/40 rounded-2xl text-emerald-200">
                      <div className="text-[10px] font-bold text-emerald-400 mb-1 flex items-center gap-1">
                        <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[9px]">
                          +
                        </span>
                        <span>BENTUK POSITIF</span>
                      </div>
                      <p>{selectedTense.formula.positive}</p>
                    </div>

                    <div className="p-3.5 bg-rose-950/40 border border-rose-800/40 rounded-2xl text-rose-200">
                      <div className="text-[10px] font-bold text-rose-400 mb-1 flex items-center gap-1">
                        <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center text-[9px]">
                          -
                        </span>
                        <span>BENTUK NEGATIF</span>
                      </div>
                      <p>{selectedTense.formula.negative}</p>
                    </div>

                    <div className="p-3.5 bg-indigo-950/40 border border-indigo-800/40 rounded-2xl text-indigo-200">
                      <div className="text-[10px] font-bold text-indigo-400 mb-1 flex items-center gap-1">
                        <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-[9px]">
                          ?
                        </span>
                        <span>BENTUK TANYA</span>
                      </div>
                      <p>{selectedTense.formula.interrogative}</p>
                    </div>
                  </div>
                </div>

                {/* Function & Usage */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Fungsi & Kegunaan
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60">
                    {selectedTense.functionDesc}
                  </p>
                </div>

                {/* Time Signals */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" /> Sinyal Waktu Khas (Time Markers)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedTense.timeSignals.map((signal, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-semibold"
                      >
                        {signal}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Real Sentence Examples */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Contoh Kalimat Riil
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedTense.examples.map((ex, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-slate-800/70 rounded-2xl border border-slate-700/70 text-xs space-y-1"
                      >
                        <p className="font-bold text-white text-sm">{ex.en}</p>
                        <p className="text-slate-400 italic text-xs">{ex.id}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tips & Memory Trick */}
                <div className="p-4 bg-sky-950/40 border border-sky-800/50 rounded-2xl text-xs space-y-1.5">
                  <span className="font-bold text-sky-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>Tips Mengingat Cepat Madjuka Tensis:</span>
                  </span>
                  <p className="text-slate-300 leading-relaxed">{selectedTense.tips}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PANDUAN KURIKULUM SMP (KELAS 7, 8, 9) */}
        {activeMateriTab === "smpCurriculum" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SMP_CURRICULUM_DATA.map((smp) => (
                <div
                  key={smp.smpLevel}
                  className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-sky-500/20 text-sky-300 border border-sky-500/30">
                        {smp.gradeTitle}
                      </span>
                      <GraduationCap className="w-5 h-5 text-sky-400" />
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{smp.description}</p>

                    {/* Focus Tenses */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">
                        Fokus Tenses:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {smp.focusTenses.map((f, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 text-sky-200 text-[11px] font-semibold border border-slate-700"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Grammar Points */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">
                        Poin Materi Penting:
                      </span>
                      <ul className="space-y-1 text-[11px] text-slate-300 list-disc list-inside">
                        {smp.grammarPoints.map((gp, i) => (
                          <li key={i}>{gp}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Example Dialogue */}
                    <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
                      <span className="font-bold text-amber-400 text-[11px]">Contoh Percakapan:</span>
                      {smp.sampleDialogue.map((d, i) => (
                        <div key={i} className="text-[11px]">
                          <span className="font-semibold text-slate-200">{d.speaker}: </span>
                          <span className="text-sky-300 italic">"{d.text}"</span>
                          <p className="text-slate-400 text-[10px] pl-2">{d.translation}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Rules */}
                  <div className="p-3 bg-indigo-950/40 rounded-2xl border border-indigo-800/40 text-[11px] text-indigo-200 space-y-1 mt-2">
                    <span className="font-bold text-indigo-300">Aturan Emas:</span>
                    {smp.keyRules.map((kr, i) => (
                      <p key={i}>• {kr}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PERBANDINGAN TENSES YANG SERING TERTUKAR */}
        {activeMateriTab === "comparisons" && (
          <div className="space-y-5 animate-fadeIn">
            {TENSE_COMPARISONS.map((comp, idx) => (
              <div
                key={idx}
                className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <Split className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-black text-white">{comp.title}</h3>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60">
                  {comp.conceptDiff}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-4 bg-slate-950 rounded-2xl border border-sky-500/30 space-y-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      {comp.tenseA}
                    </span>
                    <p className="font-bold text-white text-sm pt-1">{comp.exampleA.en}</p>
                    <p className="text-slate-400 italic text-xs">{comp.exampleA.id}</p>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-2xl border border-indigo-500/30 space-y-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {comp.tenseB}
                    </span>
                    <p className="font-bold text-white text-sm pt-1">{comp.exampleB.en}</p>
                    <p className="text-slate-400 italic text-xs">{comp.exampleB.id}</p>
                  </div>
                </div>

                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>
                    <strong>Tips Cepat Ujian:</strong> {comp.keyTip}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: TABEL IRREGULAR VERBS */}
        {activeMateriTab === "irregularVerbs" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {(["All", "SMP Dasar", "SMP Menengah", "SMP Lanjutan"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setVerbCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                      verbCategory === cat
                        ? "bg-sky-500 text-slate-950 font-bold"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari kata kerja / arti..."
                  value={verbSearch}
                  onChange={(e) => setVerbSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-300 uppercase tracking-wider border-b border-slate-800 text-[11px]">
                  <tr>
                    <th className="p-3.5 font-black text-sky-400">V1 (Infinitive)</th>
                    <th className="p-3.5 font-black text-emerald-400">V2 (Past Simple)</th>
                    <th className="p-3.5 font-black text-indigo-400">V3 (Past Participle)</th>
                    <th className="p-3.5 font-black text-amber-400">V-ing (Continuous)</th>
                    <th className="p-3.5 font-bold text-slate-300">Arti (Bahasa Indonesia)</th>
                    <th className="p-3.5 font-bold text-slate-400">Kategori</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono">
                  {filteredVerbs.map((v, i) => (
                    <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-3.5 font-bold text-sky-300">{v.v1}</td>
                      <td className="p-3.5 font-bold text-emerald-300">{v.v2}</td>
                      <td className="p-3.5 font-bold text-indigo-300">{v.v3}</td>
                      <td className="p-3.5 text-amber-300">{v.vIng}</td>
                      <td className="p-3.5 font-sans font-medium text-slate-200">{v.meaning}</td>
                      <td className="p-3.5 font-sans">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                          {v.category}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: POLA KALIMAT VERBAL VS NOMINAL */}
        {activeMateriTab === "verbalNominal" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Verbal Card */}
              <div className="p-6 bg-slate-900 border border-emerald-500/30 rounded-3xl space-y-4 shadow-xl">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                  <h3 className="text-xl font-black text-white">Kalimat Verbal (Verbal Sentence)</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Kalimat yang predikatnya berupa <strong>kata kerja aksi</strong> (seperti study,
                  play, cook, run, write).
                </p>

                <div className="space-y-2 text-xs font-mono">
                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                    <span className="text-emerald-400 font-bold">(+)</span> S + Verb + (O/Adverb)
                    <p className="text-slate-300 font-sans mt-1">Ex: They study English every day.</p>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                    <span className="text-rose-400 font-bold">(-)</span> S + Do/Does/Did + not + V1
                    <p className="text-slate-300 font-sans mt-1">Ex: They do not study English.</p>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                    <span className="text-indigo-400 font-bold">(?)</span> Do/Does/Did + S + V1?
                    <p className="text-slate-300 font-sans mt-1">Ex: Do they study English?</p>
                  </div>
                </div>
              </div>

              {/* Nominal Card */}
              <div className="p-6 bg-slate-900 border border-sky-500/30 rounded-3xl space-y-4 shadow-xl">
                <div className="flex items-center gap-2 text-sky-400">
                  <BookOpen className="w-6 h-6" />
                  <h3 className="text-xl font-black text-white">Kalimat Nominal (Nominal Sentence)</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Kalimat yang predikatnya <strong>TIDAK menggunakan kata kerja aksi</strong>,
                  melainkan Kata Sifat (Adjective), Kata Benda (Noun), atau Keterangan (Adverb) yang
                  dihubungkan oleh <strong>To Be</strong> (is/am/are/was/were).
                </p>

                <div className="space-y-2 text-xs font-mono">
                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                    <span className="text-emerald-400 font-bold">(+)</span> S + To Be + ANA (Adj/Noun/Adv)
                    <p className="text-slate-300 font-sans mt-1">Ex: She is very smart. (Adjective)</p>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                    <span className="text-rose-400 font-bold">(-)</span> S + To Be + not + ANA
                    <p className="text-slate-300 font-sans mt-1">Ex: She is not lazy.</p>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                    <span className="text-indigo-400 font-bold">(?)</span> To Be + S + ANA?
                    <p className="text-slate-300 font-sans mt-1">Ex: Is she smart?</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 3. BAGIAN BAWAH: PANEL AKSI & MENU QUIZ / PHOTO TOURISM / AR HAND-TRACKING */}
      {/* ========================================================================= */}
      <section className="space-y-6 pt-6 border-t border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Pilihan Latihan & Interaksi</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Pusat Ujian, Wisata AI & AR Sandbox
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Pilih mode pengerjaan yang Anda inginkan setelah mempelajari materi di atas.
          </p>
        </div>

        {/* 3 Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Quiz Biasa (Standar) */}
          <div className="p-6 bg-gradient-to-br from-slate-900 to-sky-950 border border-sky-500/30 rounded-3xl space-y-4 shadow-xl flex flex-col justify-between hover:border-sky-400/60 transition">
            <div className="space-y-2.5">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">1. Quiz Biasa (Standar)</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Latihan soal tenses pilihan ganda langsung lewat layar sentuh, mouse, atau keyboard
                shortcut (1/2/3/4). Dilengkapi AI Grammar Tutor.
              </p>
            </div>

            <button
              onClick={() => onNavigateWithProfileCheck("quiz_biasa")}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-sky-500/25 transition active:scale-95 mt-2"
            >
              <span>MULAI QUIZ BIASA</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: Photo Tourism AI */}
          <div className="p-6 bg-gradient-to-br from-slate-900 to-indigo-950 border border-indigo-500/30 rounded-3xl space-y-4 shadow-xl flex flex-col justify-between hover:border-indigo-400/60 transition">
            <div className="space-y-2.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">2. Photo Tourism AI</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Eksplorasi landmark monumen dunia, rekognisi visual AI Gemini, dan dengarkan narasi
                sejarah berbahasa Inggris dan Indonesia.
              </p>
            </div>

            <button
              onClick={() => onNavigateWithProfileCheck("photo_tourism")}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-indigo-600/25 transition active:scale-95 mt-2"
            >
              <span>BUKA PHOTO TOURISM</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 3: Quiz AR Hand-Tracking */}
          <div className="p-6 bg-gradient-to-br from-slate-900 to-amber-950 border border-amber-500/30 rounded-3xl space-y-4 shadow-xl flex flex-col justify-between hover:border-amber-400/60 transition">
            <div className="space-y-2.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Hand className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">3. Quiz AR Hand-Tracking</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Pengalaman hands-free kamera non-mirror dengan deteksi 5 jari MediaPipe. Arahkan
                telunjuk dan lakukan pinch untuk menjawab.
              </p>
            </div>

            <button
              onClick={() => onNavigateWithProfileCheck("ar_quiz")}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition active:scale-95 mt-2"
            >
              <span>BUKA QUIZ AR HAND-TRACKING</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
