import { Metadata } from "next";
import PublicHeader from "@/components/public-header";
import PublicFooter from "@/components/public-footer";
import GroupDetailClient from "./group-detail-client";

export const metadata: Metadata = {
  title: "تفاصيل المجموعة",
  description:
    "اطّلع على تفاصيل المجموعة الدراسية: المعلم، المواعيد، السعر، والطاقة الاستيعابية. انضم الآن وابدأ رحلتك التعليمية.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function GroupDetailPage() {
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <PublicHeader active="groups" />
      <main className="flex-1">
        <GroupDetailClient />
      </main>
      <PublicFooter />
    </div>
  );
}