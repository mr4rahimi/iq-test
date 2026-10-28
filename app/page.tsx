import Link from "next/link";
import { History } from "@/components/History";
import { MODE_IDS, MODES, SECTION_IDS, SECTIONS } from "@/lib/sections";

export default function Home() {
  return (
    <div className="space-y-14">
      <section className="text-center">
        <h1 className="text-3xl font-black leading-tight sm:text-5xl">ضریب هوشی خود را بسنجید</h1>
        <p className="mx-auto mt-4 max-w-2xl leading-8 text-muted">
          آزمونی چندبخشی که توانایی‌های عددی، کلامی، استدلال منطقی، الگویابی تصویری، تجسم فضایی و حافظه کاری را
          می‌سنجد و با مدل آماری راش (IRT) نمره‌ای در مقیاس استاندارد IQ (میانگین ۱۰۰، انحراف معیار ۱۵) برآورد می‌کند.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/test/full" className="btn-primary">شروع آزمون جامع</Link>
          <Link href="/test/quick" className="btn-secondary">آزمون سریع ۱۰ دقیقه‌ای</Link>
        </div>
      </section>

      <section id="methods" className="scroll-mt-24">
        <h2 className="mb-5 text-xl font-bold">روش‌های آزمون</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {MODE_IDS.filter((m) => m !== "practice").map((id) => (
            <Link
              key={id}
              href={`/test/${id}`}
              className="group rounded-2xl border border-border bg-surface p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/60"
            >
              <div className="text-3xl">{MODES[id].icon}</div>
              <h3 className="mt-3 text-lg font-bold group-hover:text-primary">{MODES[id].title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted">{MODES[id].description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section id="sections" className="scroll-mt-24">
        <h2 className="mb-1 text-xl font-bold">تمرین بخشی</h2>
        <p className="mb-5 text-sm text-muted">{MODES.practice.description}</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SECTION_IDS.map((id) => (
            <Link
              key={id}
              href={`/test/practice?section=${id}`}
              className="group flex items-start gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm transition hover:border-primary/60"
            >
              <span className="text-3xl">{SECTIONS[id].icon}</span>
              <span>
                <span className="block font-bold group-hover:text-primary">{SECTIONS[id].title}</span>
                <span className="mt-1 block text-sm leading-6 text-muted">{SECTIONS[id].description}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <History />

      <section className="rounded-2xl bg-surface-2 p-6 text-sm leading-7 text-muted">
        <h2 className="mb-2 font-bold text-fg">نکات مهم</h2>
        <ul className="list-inside list-disc space-y-1">
          <li>در محیطی آرام و بدون حواس‌پرتی آزمون دهید و از ماشین‌حساب یا کاغذ کمک نگیرید.</li>
          <li>سؤال‌های تصویری، فضایی و حافظه در هر بار اجرا به‌صورت تصادفی ساخته می‌شوند؛ پس تکرار آزمون هم معتبر است.</li>
          <li>سؤال‌های بی‌پاسخ در پایان زمان، نادرست حساب می‌شوند.</li>
          <li>این آزمون جنبه آموزشی و سرگرمی دارد و جایگزین ارزیابی بالینی استاندارد نیست.</li>
        </ul>
      </section>
    </div>
  );
}
