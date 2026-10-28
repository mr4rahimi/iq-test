import type { BankItem, Difficulty, Question, SectionId } from "./types";
import { type Rng, shuffleOptions } from "./random";
import { numericalBank } from "./banks/numerical";
import { verbalBank } from "./banks/verbal";
import { logicalBank } from "./banks/logical";
import { generateMatrix } from "./generators/matrix";
import { generateSpatial } from "./generators/spatial";
import { generateMemory } from "./generators/memory";
import { fa } from "./format";

const BANKS: Partial<Record<SectionId, BankItem[]>> = {
  numerical: numericalBank,
  verbal: verbalBank,
  logical: logicalBank,
};

const GENERATORS: Partial<Record<SectionId, (rng: Rng, d: Difficulty, id: string) => Question>> = {
  matrix: generateMatrix,
  spatial: generateSpatial,
  memory: generateMemory,
};

function fromBank(rng: Rng, section: SectionId, item: BankItem): Question {
  const [correct, ...rest] = item.options;
  const { options, answer } = shuffleOptions(rng, correct, rest);
  return {
    id: item.id,
    section,
    difficulty: item.difficulty,
    prompt: fa(item.prompt),
    options: options.map((text) => ({ text: fa(text) })),
    answer,
    explanation: item.explanation && fa(item.explanation),
  };
}

/**
 * Returns a question of the given section as close as possible to the target
 * difficulty, never repeating an id already in `used`.
 */
export function makeQuestion(
  rng: Rng,
  section: SectionId,
  difficulty: Difficulty,
  used: Set<string>,
): Question {
  const generator = GENERATORS[section];
  if (generator) {
    const id = `${section}-${used.size}-${Math.floor(rng() * 1e9)}`;
    used.add(id);
    return generator(rng, difficulty, id);
  }

  const bank = BANKS[section]!;
  let available = bank.filter((q) => !used.has(q.id));
  if (available.length === 0) available = bank;
  const best = Math.min(...available.map((q) => Math.abs(q.difficulty - difficulty)));
  const candidates = available.filter((q) => Math.abs(q.difficulty - difficulty) === best);
  const item = candidates[Math.floor(rng() * candidates.length)];
  used.add(item.id);
  return fromBank(rng, section, item);
}
