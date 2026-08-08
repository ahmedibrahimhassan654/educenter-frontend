/**
 * Semantic icon colors.
 *
 * Colour communicates meaning, not decoration: the same concept keeps the same
 * colour everywhere in the app. Prefer these tokens over ad-hoc `text-*` classes
 * so a concept can be recoloured in one place.
 *
 * Every value has a dark-mode variant, because the 500/600 shades used for
 * light backgrounds are too dim on dark ones.
 */
export const iconColor = {
  /** Dashboards, overviews, general navigation */
  primary: "text-indigo-600 dark:text-indigo-400",
  /** People: users, students, groups, attendance */
  people: "text-blue-600 dark:text-blue-400",
  /** Money: earnings, payments, pricing */
  money: "text-emerald-600 dark:text-emerald-400",
  /** Learning: subjects, curriculum, lessons */
  learning: "text-violet-600 dark:text-violet-400",
  /** Progress, reports, analytics */
  progress: "text-cyan-600 dark:text-cyan-400",
  /** Schedule, sessions, time */
  schedule: "text-amber-600 dark:text-amber-400",
  /** Alerts and notifications */
  alert: "text-amber-600 dark:text-amber-400",
  /** Security, verification, trust */
  security: "text-teal-600 dark:text-teal-400",
  /** Documents and files */
  document: "text-slate-600 dark:text-slate-400",
  /** Confirmed / approved */
  success: "text-green-600 dark:text-green-400",
  /** Needs attention, pending */
  warning: "text-orange-600 dark:text-orange-400",
  /** Destructive or rejected */
  danger: "text-red-600 dark:text-red-400",
  /** Settings and neutral utilities */
  neutral: "text-slate-600 dark:text-slate-400",
} as const;

export type IconColorToken = keyof typeof iconColor;

/**
 * Tinted backgrounds for icon "chips" (a coloured square behind an icon).
 * Paired with the matching iconColor token.
 */
export const iconChip = {
  primary: "bg-indigo-500/10",
  people: "bg-blue-500/10",
  money: "bg-emerald-500/10",
  learning: "bg-violet-500/10",
  progress: "bg-cyan-500/10",
  schedule: "bg-amber-500/10",
  alert: "bg-amber-500/10",
  security: "bg-teal-500/10",
  document: "bg-slate-500/10",
  success: "bg-green-500/10",
  warning: "bg-orange-500/10",
  danger: "bg-red-500/10",
  neutral: "bg-slate-500/10",
} as const satisfies Record<IconColorToken, string>;

/**
 * Standard spacing between an icon and its label.
 * `title` is deliberately looser than `inline` so section headings breathe.
 */
export const iconGap = {
  /** Inline pairs inside dense UI: badges, table cells, small buttons */
  inline: "gap-2",
  /** Buttons and nav items */
  action: "gap-3",
  /** Section and page headings */
  title: "gap-3",
} as const;
