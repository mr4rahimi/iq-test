import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "آزمون هوش آنلاین",
  description: "آزمون هوش (IQ) چندبخشی: عددی، کلامی، منطقی، ماتریس‌های تصویری، تجسم فضایی و حافظه",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen font-sans antialiased">
        <header className="border-b border-border bg-surface/80 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold">
              <span className="text-2xl">🧠</span> آزمون هوش
            </Link>
            <nav className="text-sm text-muted">
              <Link href="/#methods" className="hover:text-fg">روش‌ها</Link>
              <span className="mx-2">·</span>
              <Link href="/#sections" className="hover:text-fg">بخش‌ها</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12">{children}</main>
      </body>
    </html>
  );
}
