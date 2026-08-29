import { EnglishTense, QuizQuestion } from "../types";

export const ALL_16_TENSES: EnglishTense[] = [
  // 1. Simple Present
  {
    id: "simple-present",
    name: "Simple Present Tense",
    indonesianName: "Waktu Sekarang Sederhana",
    category: "Present",
    formula: {
      positive: "S + V1 (s/es) + O / S + to be (am/is/are) + Adj/Noun",
      negative: "S + do/does + not + V1 + O / S + to be + not + Adj/Noun",
      interrogative: "Do/Does + S + V1 + O? / To be + S + Adj/Noun?",
    },
    functionDesc: "Menyatakan fakta umum, kebiasaan rutin (habits), atau kebenaran mutlak.",
    timeSignals: ["every day", "always", "usually", "often", "sometimes", "seldom", "never", "every month"],
    examples: [
      { en: "The sun rises in the east.", id: "Matahari terbit di sebelah timur." },
      { en: "She drinks coffee every morning.", id: "Dia minum kopi setiap pagi." },
    ],
    tips: "Gunakan 'does/s/es' hanya untuk subjek tunggal (He, She, It).",
  },
  // 2. Present Continuous
  {
    id: "present-continuous",
    name: "Present Continuous Tense",
    indonesianName: "Waktu Sekarang Sedang Berlangsung",
    category: "Present",
    formula: {
      positive: "S + to be (am/is/are) + V-ing + O",
      negative: "S + to be + not + V-ing + O",
      interrogative: "To be + S + V-ing + O?",
    },
    functionDesc: "Menyatakan aksi yang sedang terjadi sekarang pada saat dibicarakan.",
    timeSignals: ["now", "right now", "at the moment", "currently", "Look!", "Listen!"],
    examples: [
      { en: "Listen! The birds are singing.", id: "Dengarkan! Burung-burung sedang bernyanyi." },
      { en: "They are studying English right now.", id: "Mereka sedang belajar bahasa Inggris sekarang." },
    ],
    tips: "Kata kerja statif (seperti know, like, love, believe) jarang menggunakan bentuk continuous.",
  },
  // 3. Present Perfect
  {
    id: "present-perfect",
    name: "Present Perfect Tense",
    indonesianName: "Waktu Sekarang Telah Selesai",
    category: "Present",
    formula: {
      positive: "S + have/has + V3 (Past Participle) + O",
      negative: "S + have/has + not + V3 + O",
      interrogative: "Have/Has + S + V3 + O?",
    },
    functionDesc: "Menyatakan kejadian yang sudah selesai di masa lalu namun akibat/hasilnya masih relevan sampai sekarang.",
    timeSignals: ["already", "just", "yet", "ever", "never", "since 2020", "for 3 years", "so far"],
    examples: [
      { en: "I have already finished my homework.", id: "Saya sudah menyelesaikan PR saya." },
      { en: "She has lived in Jakarta since 2018.", id: "Dia telah tinggal di Jakarta sejak 2018." },
    ],
    tips: "Gunakan 'has' untuk He/She/It dan 'have' untuk I/You/They/We.",
  },
  // 4. Present Perfect Continuous
  {
    id: "present-perfect-continuous",
    name: "Present Perfect Continuous Tense",
    indonesianName: "Waktu Sekarang Telah & Masih Berlangsung",
    category: "Present",
    formula: {
      positive: "S + have/has + been + V-ing + O",
      negative: "S + have/has + not + been + V-ing + O",
      interrogative: "Have/Has + S + been + V-ing + O?",
    },
    functionDesc: "Menyatakan tindakan yang dimulai di masa lalu dan masih berlangsung terus-menerus hingga saat ini.",
    timeSignals: ["for 2 hours", "since morning", "all day", "how long", "lately"],
    examples: [
      { en: "It has been raining all day.", id: "Hujan telah turun sepanjang hari (dan masih turun)." },
      { en: "He has been waiting for two hours.", id: "Dia telah menunggu selama dua jam." },
    ],
    tips: "Menekankan durasi (duration) aktivitas.",
  },
  // 5. Simple Past
  {
    id: "simple-past",
    name: "Simple Past Tense",
    indonesianName: "Waktu Lampau Sederhana",
    category: "Past",
    formula: {
      positive: "S + V2 (Past form) + O / S + was/were + Adj/Noun",
      negative: "S + did not + V1 + O / S + was/were + not + Adj/Noun",
      interrogative: "Did + S + V1 + O? / Was/Were + S + Adj/Noun?",
    },
    functionDesc: "Menyatakan peristiwa atau tindakan yang terjadi dan berakhir di masa lampau pada waktu yang spesifik.",
    timeSignals: ["yesterday", "last night", "two days ago", "in 1995", "last week", "just now"],
    examples: [
      { en: "We visited the Monas monument yesterday.", id: "Kami mengunjungi monumen Monas kemarin." },
      { en: "He was very happy last night.", id: "Dia sangat bahagia tadi malam." },
    ],
    tips: "Setelah kata kerja bantu 'did' atau 'did not', kata kerja selalu kembali ke V1 (infinitive).",
  },
  // 6. Past Continuous
  {
    id: "past-continuous",
    name: "Past Continuous Tense",
    indonesianName: "Waktu Lampau Sedang Berlangsung",
    category: "Past",
    formula: {
      positive: "S + was/were + V-ing + O",
      negative: "S + was/were + not + V-ing + O",
      interrogative: "Was/Were + S + V-ing + O?",
    },
    functionDesc: "Menyatakan tindakan yang sedang berlangsung di masa lampau ketika kejadian lain terjadi (diinterupsi).",
    timeSignals: ["when", "while", "at 7 PM yesterday", "all yesterday morning"],
    examples: [
      { en: "I was reading a book when the phone rang.", id: "Saya sedang membaca buku ketika telepon berdering." },
      { en: "While mother was cooking, father was reading.", id: "Ketika ibu sedang memasak, ayah sedang membaca." },
    ],
    tips: "Klausa dengan 'while' biasanya diikuti Past Continuous, sedangkan 'when' diikuti Simple Past.",
  },
  // 7. Past Perfect
  {
    id: "past-perfect",
    name: "Past Perfect Tense",
    indonesianName: "Waktu Lampau Telah Selesai",
    category: "Past",
    formula: {
      positive: "S + had + V3 + O",
      negative: "S + had + not + V3 + O",
      interrogative: "Had + S + V3 + O?",
    },
    functionDesc: "Menyatakan aksi yang telah selesai terjadi SEBELUM aksi lain terjadi di masa lampau (kejadian yang lebih dulu).",
    timeSignals: ["before", "after", "by the time", "until that day", "already"],
    examples: [
      { en: "The train had left before we arrived at the station.", id: "Kereta sudah berangkat sebelum kami tiba di stasiun." },
    ],
    tips: "Past Perfect digunakan untuk kejadian masa lampau yang terjadi lebih dahulu dari Simple Past.",
  },
  // 8. Past Perfect Continuous
  {
    id: "past-perfect-continuous",
    name: "Past Perfect Continuous Tense",
    indonesianName: "Waktu Lampau Telah & Sedang Berlangsung",
    category: "Past",
    formula: {
      positive: "S + had + been + V-ing + O",
      negative: "S + had + not + been + V-ing + O",
      interrogative: "Had + S + been + V-ing + O?",
    },
    functionDesc: "Menyatakan tindakan yang telah sedang berlangsung selama kurun waktu tertentu sebelum peristiwa lain di masa lampau.",
    timeSignals: ["for 3 hours before", "since morning when", "by the time"],
    examples: [
      { en: "She had been working there for 5 years before she resigned.", id: "Dia telah bekerja di sana selama 5 tahun sebelum dia mengundurkan diri." },
    ],
    tips: "Menunjukkan durasi tindakan masa lampau sebelum titik acuan lampau lainnya.",
  },
  // 9. Simple Future
  {
    id: "simple-future",
    name: "Simple Future Tense",
    indonesianName: "Waktu Akan Datang Sederhana",
    category: "Future",
    formula: {
      positive: "S + will + V1 + O / S + is/am/are + going to + V1",
      negative: "S + will not (won't) + V1 + O / S + to be + not + going to + V1",
      interrogative: "Will + S + V1 + O? / To be + S + going to + V1?",
    },
    functionDesc: "Menyatakan tindakan atau rencana yang akan dilakukan di masa depan.",
    timeSignals: ["tomorrow", "next week", "soon", "tonight", "in 2030", "later"],
    examples: [
      { en: "We will explore the Eiffel Tower tomorrow.", id: "Kita akan menjelajahi Menara Eiffel besok." },
      { en: "I am going to study abroad next year.", id: "Saya akan belajar di luar negeri tahun depan." },
    ],
    tips: "'Will' untuk keputusan spontan/prediksi; 'be going to' untuk rencana matang atau bukti nyata.",
  },
  // 10. Future Continuous
  {
    id: "future-continuous",
    name: "Future Continuous Tense",
    indonesianName: "Waktu Akan Datang Sedang Berlangsung",
    category: "Future",
    formula: {
      positive: "S + will + be + V-ing + O",
      negative: "S + will + not + be + V-ing + O",
      interrogative: "Will + S + be + V-ing + O?",
    },
    functionDesc: "Menyatakan tindakan yang dipastikan sedang berlangsung pada jam tertentu di masa depan.",
    timeSignals: ["at this time tomorrow", "at 8 AM next Monday", "all next week"],
    examples: [
      { en: "At 10 AM tomorrow, I will be flying to Tokyo.", id: "Pukul 10 pagi besok, saya akan sedang terbang ke Tokyo." },
    ],
    tips: "Selalu menggunakan 'will be + V-ing'.",
  },
  // 11. Future Perfect
  {
    id: "future-perfect",
    name: "Future Perfect Tense",
    indonesianName: "Waktu Akan Datang Telah Selesai",
    category: "Future",
    formula: {
      positive: "S + will + have + V3 + O",
      negative: "S + will + not + have + V3 + O",
      interrogative: "Will + S + have + V3 + O?",
    },
    functionDesc: "Menyatakan tindakan yang akan SUDAH selesai sebelum batas waktu tertentu di masa depan.",
    timeSignals: ["by tomorrow", "by next year", "by the end of this month", "by 2028"],
    examples: [
      { en: "By next year, they will have completed the new MRT line.", id: "Menjelang tahun depan, mereka akan sudah menyelesaikan jalur MRT baru." },
    ],
    tips: "Ciri khas time signal utama adalah 'By + future time'.",
  },
  // 12. Future Perfect Continuous
  {
    id: "future-perfect-continuous",
    name: "Future Perfect Continuous Tense",
    indonesianName: "Waktu Akan Datang Telah & Masih Berlangsung",
    category: "Future",
    formula: {
      positive: "S + will + have + been + V-ing + O",
      negative: "S + will + not + have + been + V-ing + O",
      interrogative: "Will + S + have + been + V-ing + O?",
    },
    functionDesc: "Menyatakan durasi aksi yang akan sudah berlangsung sampai titik waktu tertentu di masa depan.",
    timeSignals: ["for 10 years by 2030", "by the end of this year for 5 years"],
    examples: [
      { en: "By 2030, I will have been teaching for 15 years.", id: "Menjelang 2030, saya akan sudah mengajar selama 15 tahun." },
    ],
    tips: "Kombinasi antara durasi (for ...) dan batas waktu masa depan (by ...).",
  },
  // 13. Past Future
  {
    id: "past-future",
    name: "Past Future Tense",
    indonesianName: "Waktu Lampau Akan Datang",
    category: "Past Future",
    formula: {
      positive: "S + would/should + V1 + O / S + was/were + going to + V1",
      negative: "S + would/should + not + V1 + O",
      interrogative: "Would/Should + S + V1 + O?",
    },
    functionDesc: "Menyatakan peristiwa yang tadinya direncanakan akan terjadi di masa lalu, atau pengandaian (conditional type 2).",
    timeSignals: ["the day before", "the following week", "if I had money (conditional)"],
    examples: [
      { en: "He promised that he would come to my party.", id: "Dia berjanji bahwa dia akan datang ke pestaku." },
      { en: "If I were rich, I would travel around the world.", id: "Jika saya kaya, saya akan berkeliling dunia." },
    ],
    tips: "Bentuk lampau dari Simple Future ('will' berubah jadi 'would').",
  },
  // 14. Past Future Continuous
  {
    id: "past-future-continuous",
    name: "Past Future Continuous Tense",
    indonesianName: "Waktu Lampau Akan Datang Sedang Berlangsung",
    category: "Past Future",
    formula: {
      positive: "S + would + be + V-ing + O",
      negative: "S + would + not + be + V-ing + O",
      interrogative: "Would + S + be + V-ing + O?",
    },
    functionDesc: "Menyatakan peristiwa yang tadinya sedang direncanakan berlangsung di masa lampau.",
    timeSignals: ["at that time yesterday", "at 9 PM the previous day"],
    examples: [
      { en: "She said she would be waiting for me at the station at 3 PM.", id: "Dia bilang dia akan sedang menunggu saya di stasiun pada jam 3 sore itu." },
    ],
    tips: "Menggunakan 'would be + V-ing'.",
  },
  // 15. Past Future Perfect
  {
    id: "past-future-perfect",
    name: "Past Future Perfect Tense",
    indonesianName: "Waktu Lampau Akan Datang Telah Selesai",
    category: "Past Future",
    formula: {
      positive: "S + would + have + V3 + O",
      negative: "S + would + not + have + V3 + O",
      interrogative: "Would + S + have + V3 + O?",
    },
    functionDesc: "Menyatakan peristiwa yang seharusnya sudah selesai di masa lampau namun tidak terlaksana (Conditional type 3).",
    timeSignals: ["if + Past Perfect", "by that time yesterday"],
    examples: [
      { en: "If you had told me, I would have helped you.", id: "Jika kamu memberitahuku, aku pasti sudah membantumu." },
    ],
    tips: "Sangat sering digunakan pada Conditional Sentence Type 3 (penyesalan masa lalu).",
  },
  // 16. Past Future Perfect Continuous
  {
    id: "past-future-perfect-continuous",
    name: "Past Future Perfect Continuous Tense",
    indonesianName: "Waktu Lampau Akan Datang Telah & Masih Berlangsung",
    category: "Past Future",
    formula: {
      positive: "S + would + have + been + V-ing + O",
      negative: "S + would + not + have + been + V-ing + O",
      interrogative: "Would + S + have + been + V-ing + O?",
    },
    functionDesc: "Menyatakan aksi yang seharusnya telah dan masih sedang berlangsung pada titik waktu lampau tertentu jika syarat terpenuhi.",
    timeSignals: ["for 5 years by last December", "if clause + duration"],
    examples: [
      { en: "By last year, I would have been working here for a decade if I hadn't moved.", id: "Menjelang tahun lalu, saya seharusnya sudah bekerja di sini selama satu dekade jika saya tidak pindah." },
    ],
    tips: "Tense paling kompleks yang menggabungkan modal 'would', perfect 'have', dan continuous 'been + V-ing'.",
  },
];

export const QUESTION_BANK: QuizQuestion[] = [
  {
    id: "q1",
    tenseId: "simple-present",
    tenseName: "Simple Present Tense",
    question: "The Earth _______ around the Sun once every 365 days.",
    options: [
      { label: "A", text: "revolves" },
      { label: "B", text: "is revolving" },
      { label: "C", text: "revolved" },
      { label: "D", text: "has revolved" },
    ],
    correctLabel: "A",
    explanation: "Fakta ilmiah umum (general truth) selalu menggunakan Simple Present Tense dengan subjek tunggal 'The Earth' + verb (revolves).",
    timeSignal: "every 365 days (General Fact)",
    level: "Easy",
  },
  {
    id: "q2",
    tenseId: "present-continuous",
    tenseName: "Present Continuous Tense",
    question: "Look! The tourists _______ photos of the historical museum right now.",
    options: [
      { label: "A", text: "take" },
      { label: "B", text: "are taking" },
      { label: "C", text: "took" },
      { label: "D", text: "were taking" },
    ],
    correctLabel: "B",
    explanation: "Kata 'Look!' dan 'right now' menandakan peristiwa yang sedang terjadi detik ini (Present Continuous: are taking).",
    timeSignal: "Look! / right now",
    level: "Easy",
  },
  {
    id: "q3",
    tenseId: "present-perfect",
    tenseName: "Present Perfect Tense",
    question: "Sarah _______ three UNESCO world heritage sites so far this year.",
    options: [
      { label: "A", text: "visited" },
      { label: "B", text: "is visiting" },
      { label: "C", text: "has visited" },
      { label: "D", text: "had visited" },
    ],
    correctLabel: "C",
    explanation: "'So far' (sejauh ini) adalah penanda waktu khas Present Perfect (has + V3) untuk subjek tunggal 'Sarah'.",
    timeSignal: "so far this year",
    level: "Medium",
  },
  {
    id: "q4",
    tenseId: "present-perfect-continuous",
    tenseName: "Present Perfect Continuous Tense",
    question: "He looks exhausted because he _______ in line for tickets for four hours.",
    options: [
      { label: "A", text: "has been standing" },
      { label: "B", text: "is standing" },
      { label: "C", text: "stands" },
      { label: "D", text: "was standing" },
    ],
    correctLabel: "A",
    explanation: "Menekankan durasi yang masih berefek ke kondisi sekarang (Present Perfect Continuous: has been standing).",
    timeSignal: "for four hours (continuous effect)",
    level: "Medium",
  },
  {
    id: "q5",
    tenseId: "simple-past",
    tenseName: "Simple Past Tense",
    question: "Thomas Stamford Raffles _______ the rediscovery of Borobudur Temple in 1814.",
    options: [
      { label: "A", text: "initiates" },
      { label: "B", text: "initiated" },
      { label: "C", text: "has initiated" },
      { label: "D", text: "was initiating" },
    ],
    correctLabel: "B",
    explanation: "Tahun lampau yang spesifik 'in 1814' wajib menggunakan Simple Past (V2: initiated).",
    timeSignal: "in 1814",
    level: "Easy",
  },
  {
    id: "q6",
    tenseId: "past-continuous",
    tenseName: "Past Continuous Tense",
    question: "While we _______ through the old city quarter, heavy rain suddenly poured down.",
    options: [
      { label: "A", text: "were walking" },
      { label: "B", text: "walked" },
      { label: "C", text: "are walking" },
      { label: "D", text: "had walked" },
    ],
    correctLabel: "A",
    explanation: "Klausa 'While' menunjukkan kegiatan yang sedang berlangsung di masa lampau (were walking) sebelum diinterupsi oleh 'suddenly poured down'.",
    timeSignal: "While ... suddenly",
    level: "Medium",
  },
  {
    id: "q7",
    tenseId: "past-perfect",
    tenseName: "Past Perfect Tense",
    question: "By the time the museum opened, hundreds of visitors _______ outside.",
    options: [
      { label: "A", text: "gathered" },
      { label: "B", text: "had gathered" },
      { label: "C", text: "have gathered" },
      { label: "D", text: "will gather" },
    ],
    correctLabel: "B",
    explanation: "Kejadian berkumpul terjadi lebih dulu sebelum museum dibuka di masa lampau (Past Perfect: had gathered).",
    timeSignal: "By the time ... (past reference)",
    level: "Medium",
  },
  {
    id: "q8",
    tenseId: "past-perfect-continuous",
    tenseName: "Past Perfect Continuous Tense",
    question: "They _______ for over six months before they finally discovered the ancient ruin.",
    options: [
      { label: "A", text: "had been excavating" },
      { label: "B", text: "have been excavating" },
      { label: "C", text: "were excavating" },
      { label: "D", text: "excavated" },
    ],
    correctLabel: "A",
    explanation: "Menyatakan aksi berkelanjutan di masa lampau sebelum peristiwa lampau lainnya (had been excavating).",
    timeSignal: "for over six months before ... (past)",
    level: "Hard",
  },
  {
    id: "q9",
    tenseId: "simple-future",
    tenseName: "Simple Future Tense",
    question: "The tour guide promises that tomorrow we _______ the royal palace gardens.",
    options: [
      { label: "A", text: "will visit" },
      { label: "B", text: "visited" },
      { label: "C", text: "have visited" },
      { label: "D", text: "are visiting" },
    ],
    correctLabel: "A",
    explanation: "'Tomorrow' dengan janji/prediksi menggunakan Simple Future (will visit).",
    timeSignal: "tomorrow",
    level: "Easy",
  },
  {
    id: "q10",
    tenseId: "future-continuous",
    tenseName: "Future Continuous Tense",
    question: "At 9:00 AM tomorrow morning, our flight _______ over Mount Fuji.",
    options: [
      { label: "A", text: "will be flying" },
      { label: "B", text: "flies" },
      { label: "C", text: "will fly" },
      { label: "D", text: "is flying" },
    ],
    correctLabel: "A",
    explanation: "Waktu spesifik di masa depan 'At 9:00 AM tomorrow morning' menyatakan aksi yang akan sedang berlangsung (will be flying).",
    timeSignal: "At 9:00 AM tomorrow morning",
    level: "Medium",
  },
  {
    id: "q11",
    tenseId: "future-perfect",
    tenseName: "Future Perfect Tense",
    question: "By the end of next month, the restoration team _______ the ancient monument.",
    options: [
      { label: "A", text: "will have repaired" },
      { label: "B", text: "will repair" },
      { label: "C", text: "repaired" },
      { label: "D", text: "has repaired" },
    ],
    correctLabel: "A",
    explanation: "Penanda 'By the end of next month' adalah ciri mutlak Future Perfect (will have + V3).",
    timeSignal: "By the end of next month",
    level: "Hard",
  },
  {
    id: "q12",
    tenseId: "future-perfect-continuous",
    tenseName: "Future Perfect Continuous Tense",
    question: "By 2030, the architectural historian _______ the pyramid structure for twenty years.",
    options: [
      { label: "A", text: "will have been researching" },
      { label: "B", text: "will be researching" },
      { label: "C", text: "has been researching" },
      { label: "D", text: "had researched" },
    ],
    correctLabel: "A",
    explanation: "Kombinasi batas waktu 'By 2030' dan durasi 'for twenty years' membutuhkan Future Perfect Continuous (will have been researching).",
    timeSignal: "By 2030 ... for twenty years",
    level: "Hard",
  },
  {
    id: "q13",
    tenseId: "past-future",
    tenseName: "Past Future Tense",
    question: "The architect told the press that he _______ a new sustainable city pavilion.",
    options: [
      { label: "A", text: "would design" },
      { label: "B", text: "will design" },
      { label: "C", text: "designs" },
      { label: "D", text: "is designing" },
    ],
    correctLabel: "A",
    explanation: "Indirect speech dari masa lampau (told) merubah 'will' menjadi Past Future 'would design'.",
    timeSignal: "told (reported speech past)",
    level: "Medium",
  },
  {
    id: "q14",
    tenseId: "past-future-continuous",
    tenseName: "Past Future Continuous Tense",
    question: "He mentioned that at noon the following day, he _______ the monument delegates.",
    options: [
      { label: "A", text: "would be guiding" },
      { label: "B", text: "will be guiding" },
      { label: "C", text: "guided" },
      { label: "D", text: "is guiding" },
    ],
    correctLabel: "A",
    explanation: "Past Future Continuous (would be guiding) digunakan untuk rencana yang tadinya sedang berjalan pada waktu lampau tertentu.",
    timeSignal: "at noon the following day (in past context)",
    level: "Hard",
  },
  {
    id: "q15",
    tenseId: "past-future-perfect",
    tenseName: "Past Future Perfect Tense",
    question: "If we had reserved the museum tickets earlier, we _______ the queue.",
    options: [
      { label: "A", text: "would have avoided" },
      { label: "B", text: "will have avoided" },
      { label: "C", text: "would avoid" },
      { label: "D", text: "avoided" },
    ],
    correctLabel: "A",
    explanation: "Conditional Sentence Type 3: 'If + had V3' berpasangan dengan Past Future Perfect 'would have + V3'.",
    timeSignal: "If + had reserved (Conditional 3)",
    level: "Hard",
  },
  {
    id: "q16",
    tenseId: "past-future-perfect-continuous",
    tenseName: "Past Future Perfect Continuous Tense",
    question: "If the museum hadn't closed down in 2020, they _______ visitors for 50 years by last month.",
    options: [
      { label: "A", text: "would have been welcoming" },
      { label: "B", text: "will have been welcoming" },
      { label: "C", text: "had been welcoming" },
      { label: "D", text: "would welcome" },
    ],
    correctLabel: "A",
    explanation: "Pengandaian bersyarat lampau dengan durasi (would have been + V-ing).",
    timeSignal: "If + hadn't closed ... for 50 years by last month",
    level: "Hard",
  },
];

// ==========================================
// MATERI TAMBAHAN LENGKAP UNTUK SISWA SMP (KELAS 7, 8, 9)
// ==========================================

export interface IrregularVerb {
  v1: string;
  v2: string;
  v3: string;
  vIng: string;
  meaning: string;
  category: "SMP Dasar" | "SMP Menengah" | "SMP Lanjutan";
}

export const IRREGULAR_VERBS_LIST: IrregularVerb[] = [
  { v1: "go", v2: "went", v3: "gone", vIng: "going", meaning: "pergi", category: "SMP Dasar" },
  { v1: "see", v2: "saw", v3: "seen", vIng: "seeing", meaning: "melihat", category: "SMP Dasar" },
  { v1: "eat", v2: "ate", v3: "eaten", vIng: "eating", meaning: "makan", category: "SMP Dasar" },
  { v1: "drink", v2: "drank", v3: "drunk", vIng: "drinking", meaning: "minum", category: "SMP Dasar" },
  { v1: "write", v2: "wrote", v3: "written", vIng: "writing", meaning: "menulis", category: "SMP Dasar" },
  { v1: "read", v2: "read", v3: "read", vIng: "reading", meaning: "membaca", category: "SMP Dasar" },
  { v1: "speak", v2: "spoke", v3: "spoken", vIng: "speaking", meaning: "berbicara", category: "SMP Dasar" },
  { v1: "take", v2: "took", v3: "taken", vIng: "taking", meaning: "mengambil", category: "SMP Dasar" },
  { v1: "give", v2: "gave", v3: "given", vIng: "giving", meaning: "memberi", category: "SMP Dasar" },
  { v1: "come", v2: "came", v3: "come", vIng: "coming", meaning: "datang", category: "SMP Dasar" },
  { v1: "buy", v2: "bought", v3: "bought", vIng: "buying", meaning: "membeli", category: "SMP Menengah" },
  { v1: "bring", v2: "brought", v3: "brought", vIng: "bringing", meaning: "membawa", category: "SMP Menengah" },
  { v1: "teach", v2: "taught", v3: "taught", vIng: "teaching", meaning: "mengajar", category: "SMP Menengah" },
  { v1: "think", v2: "thought", v3: "thought", vIng: "thinking", meaning: "berpikir", category: "SMP Menengah" },
  { v1: "make", v2: "made", v3: "made", vIng: "making", meaning: "membuat", category: "SMP Menengah" },
  { v1: "know", v2: "knew", v3: "known", vIng: "knowing", meaning: "mengetahui", category: "SMP Menengah" },
  { v1: "fly", v2: "flew", v3: "flown", vIng: "flying", meaning: "terbang", category: "SMP Menengah" },
  { v1: "find", v2: "found", v3: "found", vIng: "finding", meaning: "menemukan", category: "SMP Menengah" },
  { v1: "swim", v2: "swam", v3: "swum", vIng: "swimming", meaning: "berenang", category: "SMP Menengah" },
  { v1: "run", v2: "ran", v3: "run", vIng: "running", meaning: "berlari", category: "SMP Menengah" },
  { v1: "become", v2: "became", v3: "become", vIng: "becoming", meaning: "menjadi", category: "SMP Lanjutan" },
  { v1: "begin", v2: "began", v3: "begun", vIng: "beginning", meaning: "memulai", category: "SMP Lanjutan" },
  { v1: "choose", v2: "chose", v3: "chosen", vIng: "choosing", meaning: "memilih", category: "SMP Lanjutan" },
  { v1: "drive", v2: "drove", v3: "driven", vIng: "driving", meaning: "mengemudi", category: "SMP Lanjutan" },
  { v1: "fall", v2: "fell", v3: "fallen", vIng: "falling", meaning: "jatuh", category: "SMP Lanjutan" },
  { v1: "feel", v2: "felt", v3: "felt", vIng: "feeling", meaning: "merasa", category: "SMP Lanjutan" },
  { v1: "hear", v2: "heard", v3: "heard", vIng: "hearing", meaning: "mendengar", category: "SMP Lanjutan" },
  { v1: "leave", v2: "left", v3: "left", vIng: "leaving", meaning: "meninggalkan", category: "SMP Lanjutan" },
  { v1: "sleep", v2: "slept", v3: "slept", vIng: "sleeping", meaning: "tidur", category: "SMP Lanjutan" },
  { v1: "understand", v2: "understood", v3: "understood", vIng: "understanding", meaning: "memahami", category: "SMP Lanjutan" },
];

export interface SmpCurriculumGuide {
  gradeTitle: string;
  smpLevel: string;
  focusTenses: string[];
  description: string;
  grammarPoints: string[];
  sampleDialogue: { speaker: string; text: string; translation: string }[];
  keyRules: string[];
}

export const SMP_CURRICULUM_DATA: SmpCurriculumGuide[] = [
  {
    gradeTitle: "Kelas 1 SMP (Kelas 7)",
    smpLevel: "7",
    focusTenses: ["Simple Present Tense", "Present Continuous Tense"],
    description:
      "Fokus pada perkenalan diri (Greeting & Self Introduction), aktivitas rutin sehari-hari (Daily Routine), fakta umum, dan hal yang sedang dilakukan saat berbicara.",
    grammarPoints: [
      "Subject-Verb Agreement (I/You/They/We + V1 vs He/She/It + V1-s/es)",
      "Penggunaan To Be Present: Is, Am, Are pada kalimat Nominal (She is a student)",
      "Kalimat Tanya Yes/No & 5W+1H dengan Do/Does (Do you study English?)",
      "Pola sedang berlangsung: S + is/am/are + Verb-ing (They are playing football now)",
      "Adverb of Frequency: always, usually, often, sometimes, never",
    ],
    sampleDialogue: [
      {
        speaker: "Budi (Siswa 7A)",
        text: "What do you usually do on Sunday morning, Rina?",
        translation: "Apa yang biasanya kamu lakukan di Minggu pagi, Rina?",
      },
      {
        speaker: "Rina (Siswi 7A)",
        text: "I always help my mother in the kitchen. Look! Right now, my brother is washing his bicycle.",
        translation: "Aku selalu membantu ibuku di dapur. Lihat! Saat ini, kakakku sedang mencuci sepedanya.",
      },
    ],
    keyRules: [
      "Jika Subject adalah He, She, It, atau 1 orang/benda tunggal: tambahkan -s/-es pada V1 (Watch -> Watches, Study -> Studies).",
      "Jangan campur To Be (is/am/are) dengan Verb 1 dasar! Salah: 'He is play football', Benar: 'He plays football' atau 'He is playing football'.",
    ],
  },
  {
    gradeTitle: "Kelas 2 SMP (Kelas 8)",
    smpLevel: "8",
    focusTenses: ["Simple Past Tense", "Past Continuous Tense", "Present Perfect Tense", "Simple Future Tense"],
    description:
      "Fokus pada menceritakan pengalaman liburan atau masa lalu (Recount Text), kegiatan yang sedang terjadi di masa lampau saat kejadian lain memotong (When/While), dan rencana masa depan.",
    grammarPoints: [
      "Perubahan Regular Verbs (-ed: visited, played) & Irregular Verbs (go -> went, eat -> ate)",
      "Penggunaan To Be Past: Was (I/He/She/It) & Were (You/They/We)",
      "Pola kejadian terpotong: 'When S + V2, S + was/were + V-ing' atau 'While S + was/were + V-ing, S + V2'",
      "Present Perfect untuk pengalaman yang sudah pernah dilakukan: S + have/has + V3 (I have visited Borobudur twice)",
      "Rencana masa depan: 'Will + V1' (spontan) vs 'Be going to + V1' (rencana matang)",
    ],
    sampleDialogue: [
      {
        speaker: "Dimas (Siswa 8B)",
        text: "Where did you go last holiday, Galih?",
        translation: "Kemana kamu pergi liburan lalu, Galih?",
      },
      {
        speaker: "Galih (Siswa 8B)",
        text: "I went to Yogyakarta. While I was taking photos at Malioboro, I met our English teacher!",
        translation: "Aku pergi ke Yogyakarta. Saat aku sedang berfoto di Malioboro, aku bertemu guru Bahasa Inggris kita!",
      },
    ],
    keyRules: [
      "Pada kalimat tanya dan negatif Simple Past, kata kerja KEMBALI KE V1 karena sudah ada 'Did/Didn't'. Contoh: 'Did you see?' (Bukan 'Did you saw?').",
      "Gunakan 'Since' untuk titik awal waktu (since 2020) dan 'For' untuk total durasi waktu (for 3 years).",
    ],
  },
  {
    gradeTitle: "Kelas 3 SMP (Kelas 9)",
    smpLevel: "9",
    focusTenses: ["16 Tenses Comprehensive", "Past Perfect", "Future Continuous", "Passive Voice & Conditional"],
    description:
      "Fokus pada persiapan Ujian Sekolah, teks naratif dongeng (Narrative Text), teks prosedur & laporan ilmiah (Report/Procedure Text), kalimat pasif (Passive Voice), dan 16 Tenses komprehensif.",
    grammarPoints: [
      "Past Perfect (had + V3): Menunjukkan peristiwa yang terjadi LEBIH DULU sebelum peristiwa lampau lainnya (Before I arrived, the train had left).",
      "Hubungan 16 Tenses (Simple, Continuous, Perfect, Perfect Continuous pada 4 dimensi waktu).",
      "Passive Voice: S + To Be (sesuai tenses) + V3 (The monument was built in 1961).",
      "Conditional Sentences Type 1 & 2 (If it rains, we will stay at home).",
      "Time signals lanjutan: by the time, by next year, for the last 5 years.",
    ],
    sampleDialogue: [
      {
        speaker: "Rizky (Siswa 9C)",
        text: "Had you finished your English assignment before the teacher came yesterday?",
        translation: "Apakah kamu sudah menyelesaikan tugas Bahasa Inggrismu sebelum guru datang kemarin?",
      },
      {
        speaker: "Alya (Siswi 9C)",
        text: "Yes, I had completed it. By next week, our class will have finished the entire 16 tenses syllabus!",
        translation: "Ya, aku sudah menyelesaikannya. Menjelang minggu depan, kelas kita akan sudah menyelesaikan seluruh silabus 16 tenses!",
      },
    ],
    keyRules: [
      "Past Perfect 'had + V3' selalu terjadi LEBIH AWAL daripada Simple Past 'V2'. Contoh: 'The train had left (terjadi duluan) before we arrived (terjadi belakangan)'.",
      "Passive voice selalu memerlukan formula 'Be + V3'. Jangan pernah menggunakan V1 atau V2 dalam passive voice!",
    ],
  },
];

export interface TenseComparison {
  title: string;
  tenseA: string;
  tenseB: string;
  conceptDiff: string;
  exampleA: { en: string; id: string };
  exampleB: { en: string; id: string };
  keyTip: string;
}

export const TENSE_COMPARISONS: TenseComparison[] = [
  {
    title: "Simple Past vs Present Perfect (Sering Membingungkan!)",
    tenseA: "Simple Past (S + V2)",
    tenseB: "Present Perfect (S + have/has + V3)",
    conceptDiff:
      "Simple Past memiliki waktu yang SPESIFIK dan SUDAH SELESAI di masa lampau (yesterday, last year). Present Perfect fokus pada HASIL atau PENGALAMAN tanpa menyebutkan waktu pasti, atau masih ada hubungannya dengan sekarang.",
    exampleA: {
      en: "I lost my keys yesterday. (Waktu spesifik kemarin)",
      id: "Saya kehilangan kunci kemarin.",
    },
    exampleB: {
      en: "I have lost my keys! (Hasil: sekarang kuncinya masih belum ketemu)",
      id: "Saya telah kehilangan kunci saya (sekarang masih hilang).",
    },
    keyTip: "Jika ada keterangan waktu lampau tegas (yesterday, in 2021, two days ago) -> WAJIB Simple Past (V2).",
  },
  {
    title: "Simple Present vs Present Continuous",
    tenseA: "Simple Present (S + V1)",
    tenseB: "Present Continuous (S + is/am/are + V-ing)",
    conceptDiff:
      "Simple Present untuk kebiasaan berulang / fakta abadi. Present Continuous untuk kegiatan yang SEDANG BERLANGSUNG tepat saat berbicara (now, right now, at the moment).",
    exampleA: {
      en: "She drinks coffee every morning.",
      id: "Dia minum kopi setiap pagi (kebiasaan rutin).",
    },
    exampleB: {
      en: "She is drinking juice right now.",
      id: "Dia sedang minum jus saat ini juga.",
    },
    keyTip: "Hati-hati dengan kata kerja Stative (feel, know, understand, love) yang biasanya TIDAK memakai -ing.",
  },
  {
    title: "Will vs Be Going To (Simple Future)",
    tenseA: "Will + V1 (Spontan / Prediksi)",
    tenseB: "Be Going To + V1 (Rencana Matang / Bukti Jelas)",
    conceptDiff:
      "'Will' digunakan untuk keputusan spontan saat itu juga atau janji. 'Be Going To' digunakan untuk rencana yang sudah dipersiapkan sebelumnya atau ada bukti nyata di depan mata.",
    exampleA: {
      en: "The phone is ringing. I will answer it! (Spontan)",
      id: "Telepon berdering. Saya yang akan mengangkatnya!",
    },
    exampleB: {
      en: "Look at the dark clouds! It is going to rain. (Ada bukti awan hitam)",
      id: "Lihat awan gelap itu! Sebentar lagi akan hujan.",
    },
    keyTip: "'Going to' selalu didahului To Be (am/is/are) dan diikuti kata kerja bentuk pertama (V1).",
  },
];
