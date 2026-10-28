"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { AnswerRecord, ModeId, Question, SectionId, TestResult } from "@/lib/types";
import { createRng, type Rng } from "@/lib/random";
import { ADAPTIVE_LENGTH, buildFixedTest, nextAdaptive } from "@/lib/plan";
import { MODES, SECTIONS } from "@/lib/sections";
import { abilityToIq, estimateAbility, sectionBreakdown } from "@/lib/scoring";
import { saveResult } from "@/lib/history";
import { fa, formatDuration } from "@/lib/format";
import { VisualView } from "./Visual";
import { ResultView } from "./ResultView";

type Phase = "memorize" | "answer" | "feedback" | "done";

export function TestRunner({ mode, section }: { mode: ModeId; section?: SectionId }) {
  const config = MODES[mode];
  const rngRef = useRef<Rng | null>(null);
  const usedRef = useRef(new Set<string>());
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [phase, setPhase] = useState<Phase>("answer");
  const [selected, setSelected] = useState<number | null>(null);
  const [startedAt, setStartedAt] = useState(0);
  const [questionStart, setQuestionStart] = useState(0);
  const [memorizeLeft, setMemorizeLeft] = useState(0);
  const [now, setNow] = useState(0);
  const [result, setResult] = useState<TestResult | null>(null);

  const total = mode === "adaptive" ? ADAPTIVE_LENGTH : questions.length;
  const question = questions[index];

  // Questions are random, so they are created on the client only.
  useEffect(() => {
    const rng = createRng(Date.now());
    rngRef.current = rng;
    const first =
      mode === "adaptive"
        ? [nextAdaptive(rng, 0, null, usedRef.current)]
        : buildFixedTest(rng, mode, section);
    const t = Date.now();
    setQuestions(first);
    setStartedAt(t);
    setQuestionStart(t);
    setNow(t);
  }, [mode, section]);

  // Memory questions start with a timed study phase.
  useEffect(() => {
    if (!question) return;
    if (question.memorize) {
      setPhase("memorize");
      setMemorizeLeft(question.memorize.seconds);
    } else {
      setPhase("answer");
    }
    setSelected(null);
    setQuestionStart(Date.now());
  }, [question]);

  useEffect(() => {
    if (phase === "done" || !startedAt) return;
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, [phase, startedAt]);

  useEffect(() => {
    if (phase !== "memorize") return;
    if (memorizeLeft <= 0) {
      setPhase("answer");
      setQuestionStart(Date.now());
      return;
    }
    const t = setTimeout(() => setMemorizeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, memorizeLeft]);

  const finish = useCallback(
    (records: AnswerRecord[]) => {
      // In fixed tests, questions not reached before time ran out count as wrong.
      const all = [...records];
      if (mode !== "adaptive") {
        for (const q of questions.slice(records.length)) {
          all.push({ questionId: q.id, section: q.section, difficulty: q.difficulty, chosen: null, correct: false, timeMs: 0 });
        }
      }
      const r: TestResult = {
        id: String(startedAt),
        mode,
        section,
        date: new Date().toISOString(),
        iq: abilityToIq(estimateAbility(all)),
        correct: all.filter((a) => a.correct).length,
        total: all.length,
        durationMs: Date.now() - startedAt,
        sections: sectionBreakdown(all),
      };
      saveResult(r);
      setAnswers(all);
      setResult(r);
      setPhase("done");
    },
    [mode, questions, section, startedAt],
  );

  const elapsed = now - startedAt;
  const timeLeft = config.timeLimit ? config.timeLimit * 1000 - elapsed : null;

  useEffect(() => {
    if (timeLeft !== null && timeLeft <= 0 && phase !== "done" && questions.length > 0) finish(answers);
  }, [timeLeft, phase, questions.length, answers, finish]);

  function advance(records: AnswerRecord[]) {
    if (records.length >= total) return finish(records);
    if (mode === "adaptive") {
      const last = records[records.length - 1];
      const q = nextAdaptive(rngRef.current!, records.length, last, usedRef.current);
      setQuestions((qs) => [...qs, q]);
    }
    setIndex(records.length);
  }

  function submit(choice: number | null) {
    if (!question) return;
    const record: AnswerRecord = {
      questionId: question.id,
      section: question.section,
      difficulty: question.difficulty,
      chosen: choice,
      correct: choice === question.answer,
      timeMs: Date.now() - questionStart,
    };
    const records = [...answers, record];
    setAnswers(records);
    if (config.feedback) setPhase("feedback");
    else advance(records);
  }

  if (result) {
    return <ResultView result={result} questions={questions} answers={answers} />;
  }

  if (!question) {
    return <div className="py-24 text-center text-muted">در حال آماده‌سازی آزمون…</div>;
  }

  const info = SECTIONS[question.section];
  const isVisualOptions = question.options.some((o) => o.visual);
  const lastRecord = phase === "feedback" ? answers[answers.length - 1] : null;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="rounded-full bg-primary-soft px-3 py-1 font-medium text-primary">
            {info.icon} {info.title}
          </span>
          <span className="text-muted">{config.title}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted">
            سؤال {fa(index + 1)} از {fa(total)}
          </span>
          {timeLeft !== null && (
            <span className={`rounded-lg px-2.5 py-1 font-mono tabular-nums ${timeLeft < 60_000 ? "bg-danger-soft text-danger" : "bg-surface-2"}`}>
              ⏱ {formatDuration(timeLeft)}
            </span>
          )}
        </div>
      </div>

      <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(answers.length / total) * 100}%` }} />
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-8">
        {phase === "memorize" && question.memorize ? (
          <div className="py-10 text-center">
            <p className="mb-6 text-muted">این را به خاطر بسپارید…</p>
            <p className="mb-8 text-3xl font-bold leading-relaxed tracking-wide sm:text-4xl">{question.memorize.content}</p>
            <p className="text-sm text-muted">{fa(memorizeLeft)} ثانیه</p>
          </div>
        ) : (
          <>
            <div className="mb-1 text-xs text-muted">
              سطح دشواری: {"●".repeat(question.difficulty)}
              <span className="opacity-30">{"●".repeat(5 - question.difficulty)}</span>
            </div>
            <h2 className="mb-6 text-lg font-semibold leading-8 sm:text-xl">{question.prompt}</h2>
            {question.stimulus && (
              <div className="mb-8">
                <VisualView visual={question.stimulus} large />
              </div>
            )}
            <div className={!isVisualOptions
                  ? "grid gap-3 sm:grid-cols-2"
                  : question.options.length > 4
                    ? "grid grid-cols-3 gap-3 sm:grid-cols-6"
                    : "mx-auto grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4"}>
              {question.options.map((opt, i) => {
                const reveal = lastRecord !== null;
                const state = reveal
                  ? i === question.answer
                    ? "border-success bg-success-soft"
                    : i === lastRecord.chosen
                      ? "border-danger bg-danger-soft"
                      : "border-border opacity-60"
                  : selected === i
                    ? "border-primary bg-primary-soft ring-2 ring-primary/30"
                    : "border-border hover:border-primary/60 hover:bg-surface-2";
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={reveal}
                    onClick={() => setSelected(i)}
                    className={`rounded-xl border-2 text-right transition ${state} ${isVisualOptions ? "p-2" : "px-4 py-3"}`}
                  >
                    {opt.visual ? (
                      <VisualView visual={opt.visual} />
                    ) : (
                      <span className="flex items-center gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-2 text-sm text-muted">
                          {fa(i + 1)}
                        </span>
                        <span>{opt.text}</span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {lastRecord && (
              <div className={`mt-6 rounded-xl p-4 ${lastRecord.correct ? "bg-success-soft" : "bg-danger-soft"}`}>
                <p className="font-semibold">{lastRecord.correct ? "✅ درست بود!" : "❌ نادرست بود."}</p>
                {question.explanation && <p className="mt-1 text-sm leading-7">{question.explanation}</p>}
              </div>
            )}

            <div className="mt-8 flex items-center justify-between gap-3">
              {phase === "feedback" ? (
                <button type="button" onClick={() => advance(answers)} className="btn-primary">
                  {answers.length >= total ? "مشاهده نتیجه" : "سؤال بعدی"}
                </button>
              ) : (
                <>
                  <button type="button" disabled={selected === null} onClick={() => submit(selected)} className="btn-primary">
                    ثبت پاسخ
                  </button>
                  <button type="button" onClick={() => submit(null)} className="text-sm text-muted hover:text-fg">
                    نمی‌دانم، رد شو
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>

      <div className="mt-6 text-center">
        <Link href="/" className="text-sm text-muted hover:text-fg">
          انصراف و بازگشت به صفحه اصلی
        </Link>
      </div>
    </div>
  );
}
