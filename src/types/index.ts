export interface VerificationData {
  experience?: string;
  curriculum?: string[];
  bio?: string;
  documents?: string[];
}

export type VerificationStatus = "PENDING" | "SUBMITTED" | "VERIFIED" | "REJECTED";

export interface User {
  id: string;
  _id?: string;
  supabaseId: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  role: "TEACHER" | "STUDENT" | "PARENT" | "ADMIN";
  parentId?: string;
  students?: string[];
  // Verification fields (for teachers)
  verificationStatus?: VerificationStatus;
  verificationData?: VerificationData;
  verificationNotes?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  id?: string;
  _id?: string;
  teacherId: string | {
    _id: string;
    id: string;
    name: string;
    email: string;
    phone?: string;
    verificationStatus?: string;
    verificationData?: {
      experience?: string;
      curriculum?: string[];
      bio?: string;
      documents?: string[];
    };
  };
  title: string;
  subject: string;
  grade: string;
  stage?: string;
  priceTeacherShare: number;
  platformFee: number;
  totalSessionPrice: number;
  maxStudentsPerGroup: number;
  studentsCount?: number;
  googleMeetLink: string;
  scheduleDays: string[];
  students: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id?: string;
  _id?: string;
  groupId: string | { _id: string; title: string; subject: string; };
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
