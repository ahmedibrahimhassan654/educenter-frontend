import { Metadata } from "next";
import PublicHeader from "@/components/public-header";
import PublicFooter from "@/components/public-footer";
import GroupsPageClient from "./groups-page-client";

export const metadata: Metadata = {
  title: "المجموعات الدراسية - اكتشف مجموعاتك",
  description:
    "استكشف المجموعات الدراسية المتاحة في إديو سنتر واختر المجموعة المناسبة لك حسب المرحلة والصف والمادة. انضم لأفضل المعلمين المعتمدين.",
  keywords: ["مجموعات دراسية", "دروس خصوصية", "تعليم أونلاين", "معلمين معتمدين", "مرحلة ابتدائي", "إعدادي", "ثانوي"],
  alternates: {
    canonical: "/groups",
  },
  openGraph: {
    title: "المجموعات الدراسية | إديو سنتر",
    description: "استكشف المجموعات الدراسية واختر الأنسب لك حسب المرحلة والصف والمادة.",
  },
};

export default function GroupsPage() {
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <PublicHeader active="groups" />
      <main className="flex-1">
        <GroupsPageClient />
      </main>
      <PublicFooter />
    </div>
  );
}