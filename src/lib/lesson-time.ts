export const LIVE_JOIN_WINDOW_MS = 15 * 60 * 1000;

interface LiveLessonLike {
  scheduledAt?: string;
}

function scheduledTimestamp(lesson: LiveLessonLike): number | null {
  if (!lesson.scheduledAt) return null;
  const time = new Date(lesson.scheduledAt).getTime();
  return Number.isNaN(time) ? null : time;
}

/**
 * The live meeting link is only usable close to the start time, so students
 * see it (and can join) once we are within 15 minutes of the scheduled start.
 * Lessons without a scheduled time are always open.
 */
export function canJoinLive(lesson: LiveLessonLike): boolean {
  const time = scheduledTimestamp(lesson);
  return time === null || Date.now() >= time - LIVE_JOIN_WINDOW_MS;
}

/**
 * Teachers can upload/link the recorded session once the lesson has started
 * (there is no stored duration, so the scheduled start is the boundary).
 * Lessons without a scheduled time are always open.
 */
export function lessonStarted(lesson: LiveLessonLike): boolean {
  const time = scheduledTimestamp(lesson);
  return time === null || Date.now() >= time;
}