import type { ModeId, SectionId } from "./types";

export const SECTIONS: Record<SectionId, { title: string; icon: string; description: string }> = {
  numerical: { title: "هوش عددی", icon: "🔢", description: "دنباله اعداد و مسائل محاسباتی" },
  verbal: { title: "هوش کلامی", icon: "📖", description: "تشابه واژه‌ها، مترادف، متضاد و ناهمخوان" },
  logical: { title: "استدلال منطقی", icon: "🧩", description: "قیاس، استنتاج و معماهای منطقی" },
  matrix: { title: "ماتریس‌های تصویری", icon: "🔷", description: "الگویابی در ماتریس‌ها به سبک آزمون ریون" },
  spatial: { title: "تجسم فضایی", icon: "🧊", description: "چرخش ذهنی و تصویر آینه‌ای شکل‌ها" },
  memory: { title: "حافظه کاری", icon: "🧠", description: "به‌خاطرسپاری اعداد و واژه‌ها" },
};

export const SECTION_IDS = Object.keys(SECTIONS) as SectionId[];

export interface ModeConfig {
  title: string;
  icon: string;
  description: string;
  /** Total time limit in seconds; null means untimed. */
  timeLimit: number | null;
  /** Shows the correct answer after each question. */
  feedback: boolean;
}

export const MODES: Record<ModeId, ModeConfig> = {
  full: {
    title: "آزمون جامع",
    icon: "🎯",
    description: "۳۰ سؤال از هر ۶ بخش، با سختی رو به افزایش. دقیق‌ترین برآورد.",
    timeLimit: 30 * 60,
    feedback: false,
  },
  quick: {
    title: "آزمون سریع",
    icon: "⚡",
    description: "۱۲ سؤال (۲ سؤال از هر بخش) در ۱۰ دقیقه برای یک برآورد سریع.",
    timeLimit: 10 * 60,
    feedback: false,
  },
  adaptive: {
    title: "آزمون تطبیقی",
    icon: "📈",
    description: "سختی هر سؤال بر اساس پاسخ‌های قبلی شما تنظیم می‌شود (روش CAT).",
    timeLimit: 20 * 60,
    feedback: false,
  },
  practice: {
    title: "تمرین بخشی",
    icon: "🏋️",
    description: "۱۰ سؤال از یک بخش دلخواه، بدون محدودیت زمان و با نمایش پاسخ.",
    timeLimit: null,
    feedback: true,
  },
};

export const MODE_IDS = Object.keys(MODES) as ModeId[];
