import type { Difficulty, Question } from "../types";
import { type Rng, randInt, shuffle, shuffleOptions } from "../random";
import { fa } from "../format";

const WORDS = [
  "کتاب", "دریا", "پنجره", "ستاره", "باران", "کوه", "سیب", "قلم", "ساعت", "چراغ",
  "درخت", "پرنده", "کلید", "آینه", "گل", "ماهی", "نان", "صندلی", "ابر", "رود",
  "اسب", "فانوس", "جنگل", "چتر", "قطار", "شمع", "کفش", "لیوان", "باغ", "موج",
];

function digitVariants(rng: Rng, digits: number[], count: number, extra: string[]): string[] {
  const original = digits.join("");
  const seen = new Set([original]);
  const out: string[] = [];
  for (const e of extra) {
    if (!seen.has(e)) {
      seen.add(e);
      out.push(e);
    }
  }
  while (out.length < count) {
    const d = [...digits];
    if (rng() < 0.5) {
      const i = randInt(rng, 0, d.length - 2);
      [d[i], d[i + 1]] = [d[i + 1], d[i]];
    } else {
      const i = randInt(rng, 0, d.length - 1);
      d[i] = (d[i] + randInt(rng, 1, 8)) % 10;
    }
    const s = d.join("");
    if (!seen.has(s)) {
      seen.add(s);
      out.push(s);
    }
  }
  return out.slice(0, count);
}

const spaced = (s: string) => fa(s.split("").join(" "));

function digitSpan(rng: Rng, difficulty: Difficulty, id: string): Question {
  const reverse = difficulty >= 4;
  const length = reverse ? difficulty + 1 : difficulty + 4;
  const digits = Array.from({ length }, () => randInt(rng, 0, 9));
  const shown = digits.join("");
  const target = reverse ? [...digits].reverse() : digits;
  const distractors = digitVariants(rng, target, 3, reverse && shown !== target.join("") ? [shown] : []);
  const { options, answer } = shuffleOptions(rng, target.join(""), distractors);
  return {
    id,
    section: "memory",
    difficulty,
    prompt: reverse
      ? "رشته اعدادی که دیدید را به ترتیب معکوس (از آخر به اول) انتخاب کنید."
      : "رشته اعدادی که دیدید کدام بود؟",
    memorize: { content: spaced(shown), seconds: Math.ceil(length * 0.7) + 1 },
    options: options.map((o) => ({ text: spaced(o) })),
    answer,
    explanation: `رشته نمایش‌داده‌شده: ${spaced(shown)}`,
  };
}

function wordRecall(rng: Rng, difficulty: Difficulty, id: string): Question {
  const pool = shuffle(rng, WORDS);
  const list = pool.slice(0, difficulty + 4);
  const absent = pool[list.length];
  const present = shuffle(rng, list).slice(0, 3);
  const { options, answer } = shuffleOptions(rng, absent, present);
  return {
    id,
    section: "memory",
    difficulty,
    prompt: "کدام واژه در فهرستی که دیدید نبود؟",
    memorize: { content: list.join("  •  "), seconds: list.length + 2 },
    options: options.map((text) => ({ text })),
    answer,
    explanation: `فهرست: ${list.join("، ")}`,
  };
}

export function generateMemory(rng: Rng, difficulty: Difficulty, id: string): Question {
  return rng() < 0.6 ? digitSpan(rng, difficulty, id) : wordRecall(rng, difficulty, id);
}
