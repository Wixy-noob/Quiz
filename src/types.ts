export type LandmarkHotspot = {
  title: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  description: string;
};

export type LandmarkRecognitionResult = {
  landmarkName: string;
  city: string;
  country: string;
  era: string;
  architecturalStyle: string;
  confidence: "High" | "Medium" | "Low";
  shortDescription: string;
  hotspots: LandmarkHotspot[];
};

export type SearchSource = {
  title: string;
  url: string;
};

export type LandmarkHistoryResult = {
  historyMarkdown: string;
  sources: SearchSource[];
};

// 16 English Tenses Data Models
export type TenseCategory = "Present" | "Past" | "Future" | "Past Future";

export type EnglishTense = {
  id: string;
  name: string;
  indonesianName: string;
  category: TenseCategory;
  formula: {
    positive: string;
    negative: string;
    interrogative: string;
  };
  functionDesc: string;
  timeSignals: string[];
  examples: {
    en: string;
    id: string;
  }[];
  tips: string;
};

export type QuizQuestion = {
  id: string;
  tenseId: string;
  tenseName: string;
  question: string;
  options: {
    label: "A" | "B" | "C" | "D";
    text: string;
  }[];
  correctLabel: "A" | "B" | "C" | "D";
  explanation: string;
  timeSignal: string;
  level: "Easy" | "Medium" | "Hard";
};

// Hand Tracking & Gesture State Types
export enum GestureState {
  NO_HAND = "NO_HAND",
  TRACKING = "TRACKING",
  INDEX_POINTING = "INDEX_POINTING",
  READY_TO_PINCH = "READY_TO_PINCH",
  PINCH_START = "PINCH_START",
  PINCH_HOLD = "PINCH_HOLD",
  PINCH_RELEASE = "PINCH_RELEASE",
}

export type Point2D = {
  x: number; // Normalized 0.0 - 1.0 (screen relative)
  y: number; // Normalized 0.0 - 1.0 (screen relative)
};

export type Point3D = {
  x: number;
  y: number;
  z: number;
};

export type FingerLandmarks = {
  thumb: Point3D[]; // 4 points (CMC, MCP, IP, TIP)
  index: Point3D[]; // 4 points (MCP, PIP, DIP, TIP)
  middle: Point3D[];
  ring: Point3D[];
  pinky: Point3D[];
  wrist: Point3D;
  rawLandmarks: Point3D[]; // 21 joints
};

export type HandTrackingData = {
  isDetected: boolean;
  handedness: "Left" | "Right";
  confidence: number;
  gestureState: GestureState;
  pointer: Point2D; // Index tip smoothed coordinates (0-1)
  isPinching: boolean;
  pinchDistance: number;
  rawDistance: number;
  fps: number;
  landmarks?: FingerLandmarks;
};

export type PanelTransform = {
  x: number; // pixels or relative %
  y: number;
  scale: number;
  rotation: number;
  isLocked: boolean;
  isDragging: boolean;
};

export type SmpGrade = "1 SMP (Kelas 7)" | "2 SMP (Kelas 8)" | "3 SMP (Kelas 9)";

export type StudentProfile = {
  name: string;
  grade: SmpGrade;
  school?: string;
};

export type ActiveAppMode = "dashboard" | "quiz_biasa" | "photo_tourism" | "ar_quiz";
