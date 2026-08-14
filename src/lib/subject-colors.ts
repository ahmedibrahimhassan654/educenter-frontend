/**
 * Vibrant, readable color coding for subjects used across the public pages.
 * Each entry provides Tailwind classes for gradients, text and chips.
 */

interface SubjectColor {
  gradient: string;
  text: string;
  chip: string;
  ring: string;
  bar: string;
}

export const subjectColors: Record<string, SubjectColor> = {
  رياضيات: {
    gradient: "from-indigo-500 to-blue-600",
    text: "text-indigo-600 dark:text-indigo-400",
    chip: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
    ring: "hover:ring-indigo-500/30",
    bar: "bg-indigo-500",
  },
  فيزياء: {
    gradient: "from-violet-500 to-purple-600",
    text: "text-violet-600 dark:text-violet-400",
    chip: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30",
    ring: "hover:ring-violet-500/30",
    bar: "bg-violet-500",
  },
  كيمياء: {
    gradient: "from-cyan-500 to-sky-600",
    text: "text-cyan-600 dark:text-cyan-400",
    chip: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
    ring: "hover:ring-cyan-500/30",
    bar: "bg-cyan-500",
  },
  علوم: {
    gradient: "from-emerald-500 to-teal-600",
    text: "text-emerald-600 dark:text-emerald-400",
    chip: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    ring: "hover:ring-emerald-500/30",
    bar: "bg-emerald-500",
  },
  "لغة عربية": {
    gradient: "from-rose-500 to-pink-600",
    text: "text-rose-600 dark:text-rose-400",
    chip: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
    ring: "hover:ring-rose-500/30",
    bar: "bg-rose-500",
  },
  "لغة إنجليزية": {
    gradient: "from-amber-500 to-orange-600",
    text: "text-amber-600 dark:text-amber-400",
    chip: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    ring: "hover:ring-amber-500/30",
    bar: "bg-amber-500",
  },
  تاريخ: {
    gradient: "from-sky-500 to-blue-600",
    text: "text-sky-600 dark:text-sky-400",
    chip: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30",
    ring: "hover:ring-sky-500/30",
    bar: "bg-sky-500",
  },
  جغرافيا: {
    gradient: "from-teal-500 to-emerald-600",
    text: "text-teal-600 dark:text-teal-400",
    chip: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30",
    ring: "hover:ring-teal-500/30",
    bar: "bg-teal-500",
  },
};

const defaultColor: SubjectColor = {
  gradient: "from-indigo-500 to-violet-600",
  text: "text-indigo-600 dark:text-indigo-400",
  chip: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
  ring: "hover:ring-indigo-500/30",
  bar: "bg-indigo-500",
};

export function getSubjectColor(subject: string): SubjectColor {
  const key = Object.keys(subjectColors).find((s) => subject.includes(s));
  return (key && subjectColors[key]) || defaultColor;
}

export const STAGE_COLORS: Record<string, string> = {
  ابتدائي: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  إعدادي: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  ثانوي: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
};

export const GRADES_BY_STAGE: Record<string, string[]> = {
  ابتدائي: [
    "الأول الابتدائي",
    "الثاني الابتدائي",
    "الثالث الابتدائي",
    "الرابع الابتدائي",
    "الخامس الابتدائي",
    "السادس الابتدائي",
  ],
  إعدادي: ["الأول الإعدادي", "الثاني الإعدادي", "الثالث الإعدادي"],
  ثانوي: ["الأول الثانوي", "الثاني الثانوي", "الثالث الثانوي"],
};

export function getStageFromGrade(grade: string): string {
  if (grade.includes("ابتدائي")) return "ابتدائي";
  if (grade.includes("إعدادي")) return "إعدادي";
  if (grade.includes("ثانوي")) return "ثانوي";
  return "ثانوي";
}