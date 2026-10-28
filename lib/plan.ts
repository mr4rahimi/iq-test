import type { Difficulty, ModeId, Question, SectionId } from "./types";
import { type Rng } from "./random";
import { makeQuestion } from "./questions";
import { SECTION_IDS } from "./sections";

export const ADAPTIVE_LENGTH = 18;

/** Builds the full question list for the non-adaptive modes. */
export function buildFixedTest(rng: Rng, mode: Exclude<ModeId, "adaptive">, section?: SectionId): Question[] {
  const used = new Set<string>();
  const plan: [SectionId, Difficulty[]][] =
    mode === "practice"
      ? [[section ?? "numerical", [1, 1, 2, 2, 3, 3, 4, 4, 5, 5]]]
      : SECTION_IDS.map((s) => [s, mode === "full" ? [1, 2, 3, 4, 5] : [2, 4]]);
  return plan.flatMap(([s, difficulties]) => difficulties.map((d) => makeQuestion(rng, s, d, used)));
}

/** Next adaptive question: rotates through sections and steps difficulty up or down. */
export function nextAdaptive(
  rng: Rng,
  index: number,
  previous: { difficulty: Difficulty; correct: boolean } | null,
  used: Set<string>,
): Question {
  let d: number = 3;
  if (previous) d = Math.min(5, Math.max(1, previous.difficulty + (previous.correct ? 1 : -1)));
  return makeQuestion(rng, SECTION_IDS[index % SECTION_IDS.length], d as Difficulty, used);
}
