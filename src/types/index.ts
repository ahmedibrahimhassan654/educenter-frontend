export interface User {
  id: string;
  supabaseId: string;
  name: string;
  email: string;
  phone: string;
  role: "TEACHER" | "STUDENT" | "PARENT" | "ADMIN";
  parentId?: string;
  students?: string[];
  subscriptionStatus: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  id: string;
  teacherId: string;
  title: string;
  subject: string;
  grade: string;
  priceTeacherShare: number;
  platformFee: number;
  totalSessionPrice: number;
  googleMeetLink: string;
  scheduleDays: string[];
  students: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  groupId: string;
  teacherId: string;
  title: string;
  date: string;
  supabaseVideoPath?: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  id: string;
  sessionId: string;
  studentId: string;
  status: "PRESENT" | "ABSENT" | "LATE";
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  message: string;
  status: number;
}