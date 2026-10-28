export type SectionId =
  | "numerical"
  | "verbal"
  | "logical"
  | "matrix"
  | "spatial"
  | "memory";

export type Difficulty = 1 | 2 | 3 | 4 | 5;

export type ShapeKind =
  | "circle"
  | "square"
  | "triangle"
  | "diamond"
  | "arrow"
  | "pentagon"
  | "star";

export type Fill = "none" | "solid" | "striped";

export interface ShapeSpec {
  kind: ShapeKind;
  count: number;
  fill: Fill;
  rotation: number;
}

/** A grid of filled cells, used by the spatial section. */
export type Grid = boolean[][];

export type Visual =
  | { type: "matrix"; cells: (ShapeSpec | null)[] }
  | { type: "cell"; cell: ShapeSpec }
  | { type: "grid"; grid: Grid };

export interface Option {
  text?: string;
  visual?: Visual;
}

export interface Question {
  id: string;
  section: SectionId;
  difficulty: Difficulty;
  prompt: string;
  stimulus?: Visual;
  /** Content shown for a limited time before the question appears. */
  memorize?: { content: string; seconds: number };
  options: Option[];
  answer: number;
  explanation?: string;
}

/** Static questions are authored with the correct option first. */
export interface BankItem {
  id: string;
  difficulty: Difficulty;
  prompt: string;
  options: string[];
  explanation?: string;
}

export type ModeId = "full" | "quick" | "adaptive" | "practice";

export interface AnswerRecord {
  questionId: string;
  section: SectionId;
  difficulty: Difficulty;
  chosen: number | null;
  correct: boolean;
  timeMs: number;
}

export interface TestResult {
  id: string;
  mode: ModeId;
  section?: SectionId;
  date: string;
  iq: number;
  correct: number;
  total: number;
  durationMs: number;
  sections: Partial<Record<SectionId, { correct: number; total: number }>>;
}
