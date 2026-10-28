import type { Difficulty, Grid, Question } from "../types";
import { type Rng, randInt, shuffle, shuffleOptions } from "../random";

const rotate = (g: Grid): Grid =>
  g[0].map((_, c) => g.map((row) => row[c]).reverse());
const mirror = (g: Grid): Grid => g.map((row) => [...row].reverse());
const gridKey = (g: Grid) => g.map((r) => r.map((v) => (v ? 1 : 0)).join("")).join("/");

function crop(g: Grid): Grid {
  const rows = g.map((r, i) => (r.some(Boolean) ? i : -1)).filter((i) => i >= 0);
  const cols = g[0].map((_, c) => (g.some((r) => r[c]) ? c : -1)).filter((c) => c >= 0);
  return g
    .slice(rows[0], rows[rows.length - 1] + 1)
    .map((r) => r.slice(cols[0], cols[cols.length - 1] + 1));
}

function rotations(g: Grid): Grid[] {
  const out = [g];
  for (let i = 0; i < 3; i++) out.push(rotate(out[out.length - 1]));
  return out;
}

function randomPolyomino(rng: Rng, size: number, cells: number): Grid {
  const g: Grid = Array.from({ length: size }, () => Array(size).fill(false));
  const filled: [number, number][] = [[randInt(rng, 0, size - 1), randInt(rng, 0, size - 1)]];
  g[filled[0][0]][filled[0][1]] = true;
  while (filled.length < cells) {
    const [r, c] = filled[Math.floor(rng() * filled.length)];
    const [dr, dc] = [[0, 1], [1, 0], [0, -1], [-1, 0]][randInt(rng, 0, 3)];
    const nr = r + dr;
    const nc = c + dc;
    if (nr >= 0 && nc >= 0 && nr < size && nc < size && !g[nr][nc]) {
      g[nr][nc] = true;
      filled.push([nr, nc]);
    }
  }
  return crop(g);
}

/** A shape with no rotational or mirror symmetry, so every option is visually unique. */
function asymmetricShape(rng: Rng, size: number, cells: number): Grid {
  for (;;) {
    const g = randomPolyomino(rng, size, cells);
    const keys = new Set([...rotations(g), ...rotations(mirror(g))].map(gridKey));
    if (keys.size === 8) return g;
  }
}

export function generateSpatial(rng: Rng, difficulty: Difficulty, id: string): Question {
  const size = difficulty >= 4 ? 5 : 4;
  const shape = asymmetricShape(rng, size, 4 + difficulty);
  const rots = rotations(shape);
  const mirrored = rotations(mirror(shape));

  let prompt: string;
  let correct: Grid;
  let distractors: Grid[];
  let explanation: string;

  if (difficulty <= 2) {
    prompt = "تصویر آینه‌ای شکل زیر (با آینه‌ای در سمت راست یا چپ آن) کدام است؟";
    correct = mirrored[0];
    distractors = rots.slice(1);
    explanation = "در تصویر آینه‌ای، چپ و راست شکل جابه‌جا می‌شوند ولی بالا و پایین ثابت می‌ماند.";
  } else {
    prompt = "کدام گزینه همان شکل است که فقط چرخیده (نه قرینه شده)؟";
    correct = rots[randInt(rng, 1, 3)];
    distractors = shuffle(rng, mirrored).slice(0, 3);
    explanation = "سه گزینه دیگر قرینه آینه‌ای شکل هستند و با چرخاندن نمی‌توان به آن‌ها رسید.";
  }

  const { options, answer } = shuffleOptions(rng, correct, distractors);
  return {
    id,
    section: "spatial",
    difficulty,
    prompt,
    stimulus: { type: "grid", grid: shape },
    options: options.map((grid) => ({ visual: { type: "grid", grid } })),
    answer,
    explanation,
  };
}
