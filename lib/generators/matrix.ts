import type { Difficulty, Fill, Question, ShapeKind, ShapeSpec } from "../types";
import { type Rng, pick, shuffle, shuffleOptions } from "../random";

type Pattern = "const" | "row" | "col" | "latin" | "latin2";

const ALL_SHAPES: ShapeKind[] = ["circle", "square", "triangle", "diamond", "star", "pentagon"];
// Shapes whose rotation by 90° and 180° is visually distinguishable.
const ROTATABLE: ShapeKind[] = ["triangle", "arrow", "pentagon"];
const FILLS: Fill[] = ["none", "solid", "striped"];
const ROTATIONS = [0, 90, 180];

const RULES: Record<Difficulty, Record<keyof ShapeSpec, Pattern>> = {
  1: { kind: "row", count: "col", fill: "const", rotation: "const" },
  2: { kind: "row", count: "col", fill: "latin", rotation: "const" },
  3: { kind: "latin", count: "col", fill: "row", rotation: "const" },
  4: { kind: "latin", count: "latin2", fill: "row", rotation: "col" },
  5: { kind: "latin2", count: "latin", fill: "col", rotation: "row" },
};

function index(p: Pattern, r: number, c: number): number {
  switch (p) {
    case "const": return 0;
    case "row": return r;
    case "col": return c;
    case "latin": return (r + c) % 3;
    case "latin2": return (r + 2 * c) % 3;
  }
}

const key = (s: ShapeSpec) => `${s.kind}|${s.count}|${s.fill}|${s.rotation}`;

/** Raven-style 3×3 matrix: every attribute follows a row/column/latin-square rule. */
export function generateMatrix(rng: Rng, difficulty: Difficulty, id: string): Question {
  const rules = RULES[difficulty];
  const usesRotation = rules.rotation !== "const";
  const values = {
    kind: shuffle(rng, usesRotation ? ROTATABLE : ALL_SHAPES).slice(0, 3),
    count: difficulty <= 2 ? [1, 2, 3] : shuffle(rng, [1, 2, 3, 4]).slice(0, 3),
    fill: shuffle(rng, FILLS),
    rotation: shuffle(rng, ROTATIONS),
  };

  const cellAt = (r: number, c: number): ShapeSpec => ({
    kind: values.kind[index(rules.kind, r, c)],
    count: values.count[index(rules.count, r, c)],
    fill: values.fill[index(rules.fill, r, c)],
    rotation: usesRotation ? values.rotation[index(rules.rotation, r, c)] : 0,
  });

  const cells: (ShapeSpec | null)[] = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) cells.push(cellAt(r, c));
  const correct = cells[8]!;
  cells[8] = null;

  // Distractors differ from the answer in one or two attributes.
  const alternatives: Record<keyof ShapeSpec, (string | number)[]> = {
    kind: (usesRotation ? ROTATABLE : ALL_SHAPES).filter((k) => k !== correct.kind),
    count: [1, 2, 3, 4].filter((n) => n !== correct.count),
    fill: FILLS.filter((f) => f !== correct.fill),
    rotation: usesRotation ? ROTATIONS.filter((x) => x !== correct.rotation) : [],
  };
  const attrs = (Object.keys(alternatives) as (keyof ShapeSpec)[]).filter(
    (a) => alternatives[a].length > 0,
  );
  const seen = new Set([key(correct)]);
  const distractors: ShapeSpec[] = [];
  for (let tries = 0; distractors.length < 5 && tries < 200; tries++) {
    const changes = tries < 40 ? 1 : 2;
    const candidate = { ...correct } as Record<string, string | number>;
    for (const a of shuffle(rng, attrs).slice(0, changes)) {
      candidate[a] = pick(rng, alternatives[a]);
    }
    const spec = candidate as unknown as ShapeSpec;
    if (!seen.has(key(spec))) {
      seen.add(key(spec));
      distractors.push(spec);
    }
  }

  const { options, answer } = shuffleOptions(rng, correct, distractors);
  return {
    id,
    section: "matrix",
    difficulty,
    prompt: "کدام گزینه جای خالی ماتریس را کامل می‌کند؟",
    stimulus: { type: "matrix", cells },
    options: options.map((cell) => ({ visual: { type: "cell", cell } })),
    answer,
    explanation:
      "در هر ردیف و ستون، ویژگی‌های شکل، تعداد، رنگ‌آمیزی و جهت طبق یک قاعده ثابت تغییر می‌کنند.",
  };
}
