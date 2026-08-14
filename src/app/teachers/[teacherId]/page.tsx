import { Metadata } from "next";
import PublicHeader from "@/components/public-header";
import PublicFooter from "@/components/public-footer";
import TeacherProfileClient from "./teacher-profile-client";

export const metadata: Metadata = {
  title: "ملف المعلم",
  description:
    "تعرّف على معلمينا المعتمدين: خبراتهم، مؤهلاتهم، والمجموعات الدراسية المتاحة لديهم.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function TeacherProfilePage() {
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <PublicHeader active="groups" />
      <main className="flex-1">
        <TeacherProfileClient />
      </main>
      <PublicFooter />
    </div>
  );
}