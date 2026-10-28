import Link from "next/link";
import type { AnswerRecord, Question, SectionId, TestResult } from "@/lib/types";
import { MODES, SECTIONS } from "@/lib/sections";
import { iqLabel, percentile } from "@/lib/scoring";
import { fa, formatDuration } from "@/lib/format";
import { BellCurve } from "./BellCurve";
import { VisualView } from "./Visual";

export function ResultView({
  result,
  questions,
  answers,
}: {
  result: TestResult;
  questions: Question[];
  answers: AnswerRecord[];
}) {
  const pct = Math.round(percentile(result.iq) * 100);
  const retake = `/test/${result.mode}${result.section ? `?section=${result.section}` : ""}`;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="rounded-2xl border border-border bg-surface p-6 text-center shadow-sm sm:p-10">
        <p className="text-sm text-muted">{MODES[result.mode].title}{result.section && ` — ${SECTIONS[result.section].title}`}</p>
        <p className="mt-4 text-sm text-muted">نمره تخمینی هوش شما</p>
        <p className="my-2 text-7xl font-black text-primary">{fa(result.iq)}</p>
        <p className="text-xl font-semibold">{iqLabel(result.iq)}</p>
        <p className="mt-2 text-sm text-muted">بالاتر از حدود {fa(pct)}٪ از جمعیت</p>
        <div className="mt-6">
          <BellCurve iq={result.iq} />
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
          <Stat label="پاسخ درست" value={`${fa(result.correct)} از ${fa(result.total)}`} />
          <Stat label="درصد موفقیت" value={`${fa(Math.round((result.correct / result.total) * 100))}٪`} />
          <Stat label="زمان" value={formatDuration(result.durationMs)} />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold">عملکرد در هر بخش</h2>
        <div className="space-y-4">
          {(Object.entries(result.sections) as [SectionId, { correct: number; total: number }][]).map(([id, s]) => {
            const ratio = s.correct / s.total;
            return (
              <div key={id}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{SECTIONS[id].icon} {SECTIONS[id].title}</span>
                  <span className="text-muted">{fa(s.correct)} / {fa(s.total)}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className={`h-full rounded-full ${ratio >= 0.7 ? "bg-success" : ratio >= 0.4 ? "bg-primary" : "bg-danger"}`}
                    style={{ width: `${Math.max(ratio * 100, 2)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold">مرور پاسخ‌ها</h2>
        <div className="space-y-2">
          {questions.map((q, i) => {
            const a = answers.find((r) => r.questionId === q.id);
            return (
              <details key={q.id} className="group rounded-xl border border-border px-4 py-3">
                <summary className="flex cursor-pointer list-none items-center gap-3">
                  <span>{a?.correct ? "✅" : a?.chosen == null ? "⏭️" : "❌"}</span>
                  <span className="flex-1 text-sm">
                    {fa(i + 1)}. {SECTIONS[q.section].title} — {q.prompt}
                  </span>
                  <span className="text-xs text-muted group-open:rotate-180">▾</span>
                </summary>
                <div className="mt-3 space-y-3 text-sm">
                  {q.stimulus && <div className="max-w-56"><VisualView visual={q.stimulus} /></div>}
                  <div className="flex flex-wrap gap-2">
                    {q.options.map((o, j) => (
                      <span
                        key={j}
                        className={`rounded-lg border px-2 py-1 ${j === q.answer ? "border-success bg-success-soft" : j === a?.chosen ? "border-danger bg-danger-soft" : "border-border"} ${o.visual ? "w-16" : ""}`}
                      >
                        {o.visual ? <VisualView visual={o.visual} /> : o.text}
                      </span>
                    ))}
                  </div>
                  {q.explanation && <p className="leading-7 text-muted">{q.explanation}</p>}
                </div>
              </details>
            );
          })}
        </div>
      </section>

      <p className="text-center text-xs leading-6 text-muted">
        این نتیجه صرفاً یک برآورد سرگرمی و آموزشی است و جایگزین آزمون‌های استاندارد بالینی (مانند وکسلر) که زیر نظر متخصص اجرا می‌شوند نیست.
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        <a href={retake} className="btn-primary">تکرار آزمون</a>
        <Link href="/" className="btn-secondary">صفحه اصلی</Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-2 p-3">
      <p className="text-muted">{label}</p>
      <p className="mt-1 font-bold">{value}</p>
    </div>
  );
}
