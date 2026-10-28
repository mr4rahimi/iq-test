"use client";

import { useEffect, useState } from "react";
import type { TestResult } from "@/lib/types";
import { clearHistory, loadHistory } from "@/lib/history";
import { MODES, SECTIONS } from "@/lib/sections";
import { fa } from "@/lib/format";

export function History() {
  const [items, setItems] = useState<TestResult[]>([]);
  useEffect(() => setItems(loadHistory()), []);
  if (items.length === 0) return null;

  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">نتایج قبلی شما</h2>
        <button
          type="button"
          className="text-sm text-muted hover:text-danger"
          onClick={() => {
            clearHistory();
            setItems([]);
          }}
        >
          پاک کردن
        </button>
      </div>
      <ul className="divide-y divide-border">
        {items.map((r) => (
          <li key={r.id} className="flex items-center justify-between py-3 text-sm">
            <span>
              {MODES[r.mode].title}
              {r.section && ` — ${SECTIONS[r.section].title}`}
              <span className="mx-2 text-muted">{new Date(r.date).toLocaleDateString("fa-IR")}</span>
            </span>
            <span className="flex items-center gap-3">
              <span className="text-muted">{fa(r.correct)}/{fa(r.total)}</span>
              <span className="rounded-lg bg-primary-soft px-2.5 py-1 font-bold text-primary">{fa(r.iq)}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
