import type { AnswerRecord, Difficulty, SectionId } from "./types";

/** Item difficulty on the logit scale used by the Rasch model. */
export const itemDifficulty = (d: Difficulty) => (d - 3) * 1.2;

/**
 * Maximum a-posteriori ability estimate under a Rasch (1PL) model with a
 * normal prior. Works for fixed and adaptive tests alike.
 */
export function estimateAbility(answers: Pick<AnswerRecord, "difficulty" | "correct">[]): number {
  const priorVar = 1.6 ** 2;
  let theta = 0;
  for (let iter = 0; iter < 50; iter++) {
    let grad = -theta / priorVar;
    let hess = -1 / priorVar;
    for (const a of answers) {
      const p = 1 / (1 + Math.exp(-(theta - itemDifficulty(a.difficulty))));
      grad += (a.correct ? 1 : 0) - p;
      hess -= p * (1 - p);
    }
    const step = grad / hess;
    theta -= step;
    if (Math.abs(step) < 1e-6) break;
  }
  return theta;
}

export function abilityToIq(theta: number): number {
  return Math.round(Math.min(150, Math.max(55, 100 + 15 * theta)));
}

export function iqLabel(iq: number): string {
  if (iq >= 130) return "بسیار برتر";
  if (iq >= 120) return "برتر";
  if (iq >= 110) return "بالاتر از میانگین";
  if (iq >= 90) return "میانگین";
  if (iq >= 80) return "پایین‌تر از میانگین";
  if (iq >= 70) return "مرزی";
  return "پایین";
}

/** Share of the population scoring below the given IQ (normal, mean 100, sd 15). */
export function percentile(iq: number): number {
  const z = (iq - 100) / 15;
  // Abramowitz–Stegun approximation of the standard normal CDF.
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const tail =
    d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z >= 0 ? 1 - tail : tail;
}

export function sectionBreakdown(answers: AnswerRecord[]) {
  const out: Partial<Record<SectionId, { correct: number; total: number }>> = {};
  for (const a of answers) {
    const s = (out[a.section] ??= { correct: 0, total: 0 });
    s.total++;
    if (a.correct) s.correct++;
  }
  return out;
}
