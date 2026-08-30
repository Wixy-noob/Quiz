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
  Camera,
  Award,
  Clock,
  Search,
  CheckCircle2,
  ArrowRight,
  Hand,
  GraduationCap,
  Split,
  User,
  Check,
  Sparkles,
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
    <div className="space-y-8 pb-20 w-full">
      {/* 1. STATUS PROFIL SISWA */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400 font-bold shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Profil Belajar</span>
              {studentProfile ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {studentProfile.grade}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                  Belum Diisi
                </span>
              )}
            </div>
            <h2 className="text-sm sm:text-base font-bold text-white">
              {studentProfile ? studentProfile.name : "Siswa Madjuka Tensis"}
            </h2>
          </div>
        </div>

        <button
          onClick={onOpenProfileModal}
          className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-lg border border-slate-700 text-xs font-medium transition active:scale-95 self-start sm:self-auto"
        >
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span>{studentProfile ? "Ubah Data Siswa" : "Isi Nama & Kelas"}</span>
        </button>
      </section>

      {/* 2. PUSAT MATERI LENGKAP */}
      <section className="space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-sky-400" />
              <span>Pusat Materi Tenses</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Rangkuman rumus, kurikulum SMP, irregular verbs, dan perbedaan bentuk kalimat.
            </p>
          </div>

          {/* Sub-Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs">
            <button
              onClick={() => setActiveMateriTab("matrix16")}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeMateriTab === "matrix16"
                  ? "bg-slate-800 text-white font-semibold border border-slate-700"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              16 Tenses
            </button>

            <button
              onClick={() => setActiveMateriTab("smpCurriculum")}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeMateriTab === "smpCurriculum"
                  ? "bg-slate-800 text-white font-semibold border border-slate-700"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Materi SMP (7, 8, 9)
            </button>

            <button
              onClick={() => setActiveMateriTab("comparisons")}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeMateriTab === "comparisons"
                  ? "bg-slate-800 text-white font-semibold border border-slate-700"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Perbandingan
            </button>

            <button
              onClick={() => setActiveMateriTab("irregularVerbs")}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeMateriTab === "irregularVerbs"
                  ? "bg-slate-800 text-white font-semibold border border-slate-700"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Irregular Verbs
            </button>

            <button
              onClick={() => setActiveMateriTab("verbalNominal")}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeMateriTab === "verbalNominal"
                  ? "bg-slate-800 text-white font-semibold border border-slate-700"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Verbal vs Nominal
            </button>
          </div>
        </div>

        {/* TAB 1: 16 MODUL TENSES MATRIKS */}
        {activeMateriTab === "matrix16" && (
          <div className="space-y-5">
            {/* Search & Category Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 border transition ${
                      selectedCategory === cat
                        ? "bg-slate-800 border-slate-600 text-sky-300"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {cat === "All" ? "Semua (16)" : cat}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari tense / sinyal..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-600"
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
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      isSelected
                        ? "bg-slate-800 border-sky-500/60 text-white shadow-sm"
                        : "bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium text-slate-400 uppercase">
                        {tense.category}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-sky-400" />}
                    </div>
                    <p className="font-semibold text-white truncate mt-1">{tense.name}</p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {tense.indonesianName}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Detailed Selected Tense Card */}
            {selectedTense && (
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                      {selectedTense.category} Tense
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                      {selectedTense.name}
                    </h3>
                    <p className="text-xs text-slate-400 italic">{selectedTense.indonesianName}</p>
                  </div>

                  <button
                    onClick={() => onNavigateWithProfileCheck("quiz_biasa")}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-lg text-xs transition active:scale-95 self-start sm:self-auto"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Latihan Tense Ini</span>
                  </button>
                </div>

                {/* Formula Section */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-400">
                    Pola Struktur Kalimat:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs font-mono">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <div className="text-[10px] font-bold text-emerald-400 mb-0.5">
                        (+) POSITIF
                      </div>
                      <p className="text-slate-200">{selectedTense.formula.positive}</p>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <div className="text-[10px] font-bold text-rose-400 mb-0.5">
                        (-) NEGATIF
                      </div>
                      <p className="text-slate-200">{selectedTense.formula.negative}</p>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <div className="text-[10px] font-bold text-sky-400 mb-0.5">
                        (?) TANYA
                      </div>
                      <p className="text-slate-200">{selectedTense.formula.interrogative}</p>
                    </div>
                  </div>
                </div>

                {/* Function & Usage */}
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400">
                    Fungsi & Kegunaan:
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                    {selectedTense.functionDesc}
                  </p>
                </div>

                {/* Time Signals */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> Sinyal Waktu Khas:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTense.timeSignals.map((signal, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs font-mono"
                      >
                        {signal}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Real Sentence Examples */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-400">
                    Contoh Kalimat:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedTense.examples.map((ex, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-0.5"
                      >
                        <p className="font-semibold text-white">{ex.en}</p>
                        <p className="text-slate-400 text-xs">{ex.id}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tips & Memory Trick */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                  <span className="font-semibold text-sky-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Tips Cepat:</span>
                  </span>
                  <p className="text-slate-300 leading-relaxed">{selectedTense.tips}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PANDUAN KURIKULUM SMP */}
        {activeMateriTab === "smpCurriculum" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SMP_CURRICULUM_DATA.map((smp) => (
              <div
                key={smp.smpLevel}
                className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-800 text-sky-300 border border-slate-700">
                      {smp.gradeTitle}
                    </span>
                    <GraduationCap className="w-4 h-4 text-slate-400" />
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{smp.description}</p>

                  {/* Focus Tenses */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">
                      Fokus Tenses:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {smp.focusTenses.map((f, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 text-[11px] border border-slate-800"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Grammar Points */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">
                      Poin Materi:
                    </span>
                    <ul className="space-y-0.5 text-[11px] text-slate-300 list-disc list-inside">
                      {smp.grammarPoints.map((gp, i) => (
                        <li key={i}>{gp}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Example Dialogue */}
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                    <span className="font-semibold text-slate-300 text-[11px]">Contoh Percakapan:</span>
                    {smp.sampleDialogue.map((d, i) => (
                      <div key={i} className="text-[11px]">
                        <span className="font-medium text-slate-200">{d.speaker}: </span>
                        <span className="text-sky-300">"{d.text}"</span>
                        <p className="text-slate-400 text-[10px] pl-1">{d.translation}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Rules */}
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-0.5 mt-2">
                  <span className="font-semibold text-slate-200">Aturan Inti:</span>
                  {smp.keyRules.map((kr, i) => (
                    <p key={i} className="text-slate-400">• {kr}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: PERBANDINGAN TENSES */}
        {activeMateriTab === "comparisons" && (
          <div className="space-y-4">
            {TENSE_COMPARISONS.map((comp, idx) => (
              <div
                key={idx}
                className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3"
              >
                <div className="flex items-center gap-2">
                  <Split className="w-4 h-4 text-sky-400" />
                  <h3 className="text-base font-bold text-white">{comp.title}</h3>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {comp.conceptDiff}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-sky-300">
                      {comp.tenseA}
                    </span>
                    <p className="font-semibold text-white text-sm pt-0.5">{comp.exampleA.en}</p>
                    <p className="text-slate-400 italic text-xs">{comp.exampleA.id}</p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-sky-300">
                      {comp.tenseB}
                    </span>
                    <p className="font-semibold text-white text-sm pt-0.5">{comp.exampleB.en}</p>
                    <p className="text-slate-400 italic text-xs">{comp.exampleB.id}</p>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 flex items-center gap-2">
                  <span className="font-semibold text-slate-200">Tips Ujian:</span>
                  <span className="text-slate-400">{comp.keyTip}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: TABEL IRREGULAR VERBS */}
        {activeMateriTab === "irregularVerbs" && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {(["All", "SMP Dasar", "SMP Menengah", "SMP Lanjutan"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setVerbCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition ${
                      verbCategory === cat
                        ? "bg-slate-800 border-slate-700 text-white"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari kata kerja / arti..."
                  value={verbSearch}
                  onChange={(e) => setVerbSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800 text-[10px]">
                  <tr>
                    <th className="p-3 font-semibold text-slate-300">V1 (Infinitive)</th>
                    <th className="p-3 font-semibold text-slate-300">V2 (Past Simple)</th>
                    <th className="p-3 font-semibold text-slate-300">V3 (Past Participle)</th>
                    <th className="p-3 font-semibold text-slate-300">V-ing</th>
                    <th className="p-3 font-semibold text-slate-300">Arti</th>
                    <th className="p-3 font-semibold text-slate-400">Tingkat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredVerbs.map((v, i) => (
                    <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-semibold text-sky-300">{v.v1}</td>
                      <td className="p-3 font-semibold text-emerald-300">{v.v2}</td>
                      <td className="p-3 font-semibold text-slate-200">{v.v3}</td>
                      <td className="p-3 text-slate-300">{v.vIng}</td>
                      <td className="p-3 font-sans text-slate-300">{v.meaning}</td>
                      <td className="p-3 font-sans">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Verbal Card */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Kalimat Verbal</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Predikat menggunakan <strong>kata kerja aksi</strong> (seperti study, play, cook, run, write).
              </p>

              <div className="space-y-1.5 text-xs font-mono">
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-emerald-400 font-bold">(+)</span> S + Verb + (O/Adverb)
                  <p className="text-slate-400 font-sans mt-0.5 text-[11px]">Ex: They study English every day.</p>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-rose-400 font-bold">(-)</span> S + Do/Does/Did + not + V1
                  <p className="text-slate-400 font-sans mt-0.5 text-[11px]">Ex: They do not study English.</p>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-sky-400 font-bold">(?)</span> Do/Does/Did + S + V1?
                  <p className="text-slate-400 font-sans mt-0.5 text-[11px]">Ex: Do they study English?</p>
                </div>
              </div>
            </div>

            {/* Nominal Card */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-sky-400">
                <BookOpen className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Kalimat Nominal</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Predikat menggunakan <strong>To Be</strong> (is/am/are/was/were) diikuti Adjective, Noun, atau Adverb.
              </p>

              <div className="space-y-1.5 text-xs font-mono">
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-emerald-400 font-bold">(+)</span> S + To Be + ANA (Adj/Noun/Adv)
                  <p className="text-slate-400 font-sans mt-0.5 text-[11px]">Ex: She is very smart.</p>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-rose-400 font-bold">(-)</span> S + To Be + not + ANA
                  <p className="text-slate-400 font-sans mt-0.5 text-[11px]">Ex: She is not lazy.</p>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-sky-400 font-bold">(?)</span> To Be + S + ANA?
                  <p className="text-slate-400 font-sans mt-0.5 text-[11px]">Ex: Is she smart?</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 3. BAGIAN BAWAH: PILIHAN LATIHAN & INTERAKSI */}
      {/* ========================================================================= */}
      <section className="space-y-4 pt-4 border-t border-slate-800">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white">
            Pilihan Latihan & Interaksi
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Pilih mode pengerjaan yang diinginkan setelah membaca materi.
          </p>
        </div>

        {/* 3 Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Card 1: Quiz Standar */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between hover:border-slate-700 transition">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 text-sky-400 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Quiz Standar</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Latihan soal pilihan ganda langsung lewat mouse/layar sentuh atau tombol keyboard (1/2/3/4).
              </p>
            </div>

            <button
              onClick={() => onNavigateWithProfileCheck("quiz_biasa")}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition active:scale-95 mt-2"
            >
              <span>Mulai Quiz Standar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: Photo Tourism AI */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between hover:border-slate-700 transition">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 text-indigo-400 flex items-center justify-center font-bold">
                <Camera className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Photo Tourism AI</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Eksplorasi landmark monumen dunia, analisis visual, dan narasi sejarah audio dwibahasa.
              </p>
            </div>

            <button
              onClick={() => onNavigateWithProfileCheck("photo_tourism")}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-semibold text-xs transition active:scale-95 mt-2"
            >
              <span>Buka Photo Tourism</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: Quiz AR Hand-Tracking */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between hover:border-slate-700 transition">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 text-amber-400 flex items-center justify-center font-bold">
                <Hand className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">AR Hand-Tracking</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pengalaman hands-free kamera non-mirror dengan deteksi 5 jari MediaPipe dan gesture pinch.
              </p>
            </div>

            <button
              onClick={() => onNavigateWithProfileCheck("ar_quiz")}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-semibold text-xs transition active:scale-95 mt-2"
            >
              <span>Buka AR Tracking</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
