export const APP_NAME = "EduCenter";
export const APP_DESCRIPTION = "Smart Learning & Tutoring Platform";

export const ROLES = {
  TEACHER: "TEACHER",
  STUDENT: "STUDENT",
  PARENT: "PARENT",
  ADMIN: "ADMIN",
} as const;

export const SESSION_STATUS = {
  SCHEDULED: "SCHEDULED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export const ATTENDANCE_STATUS = {
  PRESENT: "PRESENT",
  ABSENT: "ABSENT",
  LATE: "LATE",
} as const;

export const SCHEDULE_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;