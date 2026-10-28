import type { TestResult } from "./types";

const KEY = "iq-test-history";

export function loadHistory(): TestResult[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as TestResult[];
  } catch {
    return [];
  }
}

export function saveResult(result: TestResult) {
  try {
    const all = [result, ...loadHistory().filter((r) => r.id !== result.id)].slice(0, 20);
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // Storage may be unavailable (private mode); history is optional.
  }
}

export function clearHistory() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}
