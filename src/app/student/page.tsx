"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import {
  User,
  Users,
  ArrowLeft,
  Loader2,
} from "lucide-react";

export default function StudentDashboard() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const pages = [
    {
      href: "/student/profile",
      title: "الملف الشخصي",
      description: "إدارة بياناتك الشخصية وصورة الحساب وكلمة المرور.",
      icon: User,
      bg: "bg-blue-500/10",
      color: "text-blue-500",
    },
    {
      href: "/student/invitations",
      title: "تحقق المجموعات",
      description: "استعرض دعوات المجموعات وقبول أو رفض الانضمام إليها.",
      icon: Users,
      bg: "bg-violet-500/10",
      color: "text-violet-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-cyan-500/10 to-violet-500/10 rounded-2xl p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          مرحباً، {user.name || "الطالب"} 👋
        </h2>
        <p className="text-lg text-muted-foreground">
          من هنا يمكنك إدارة ملفك الشخصي ومتابعة دعوات المجموعات.
        </p>
      </div>

      {/* Pages */}
      <div className="grid md:grid-cols-2 gap-6">
        {pages.map((page) => (
          <Link
            key={page.href}
            href={page.href}
            className="group bg-card border rounded-2xl p-6 hover:shadow-md hover:border-primary/40 transition-all flex flex-col"
          >
            <div className={`w-14 h-14 rounded-xl ${page.bg} flex items-center justify-center mb-4`}>
              <page.icon className={`w-7 h-7 ${page.color}`} />
            </div>
            <h3 className="text-xl font-bold mb-2">{page.title}</h3>
            <p className="text-sm text-muted-foreground flex-1">{page.description}</p>
            <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
              الذهاب للصفحة
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
