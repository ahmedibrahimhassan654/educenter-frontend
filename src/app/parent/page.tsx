"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard-layout";
import {
  Wallet,
  Calendar,
  BookOpen,
  ArrowLeft,
  TrendingUp,
  CheckCircle,
  Clock,
  ChevronDown,
} from "lucide-react";

const children = [
  { id: 1, name: "عبدالله محمد", grade: "الصف الثاني الثانوي", avatar: "ع" },
  { id: 2, name: "فاطمة محمد", grade: "الصف الأول الإعدادي", avatar: "ف" },
];

const childData: Record<number, {
  enrolledClasses: number;
  attendanceRate: string;
  monthlyFees: string;
  groups: Array<{ id: number; subject: string; teacher: string; sessions: string; nextSession: string }>;
}> = {
  1: {
    enrolledClasses: 3,
    attendanceRate: "٩٢٪",
    monthlyFees: "١٬٢٠٠ ج.م",
    groups: [
      { id: 1, subject: "الفيزياء", teacher: "أ. محمد الأحمد", sessions: "٦/٨", nextSession: "غداً ٩:٠٠ ص" },
      { id: 2, subject: "الرياضيات", teacher: "أ. فاطمة العلي", sessions: "٥/٨", nextSession: "الثلاثاء ١١:٠٠ ص" },
      { id: 3, subject: "الكيمياء", teacher: "أ. خالد السعود", sessions: "٧/٨", nextSession: "الأربعاء ٢:٠٠ م" },
    ],
  },
  2: {
    enrolledClasses: 2,
    attendanceRate: "٨٨٪",
    monthlyFees: "٨٠٠ ج.م",
    groups: [
      { id: 1, subject: "العلوم", teacher: "أ. نورة الحربي", sessions: "٥/٨", nextSession: "السبت ٤:٠٠ م" },
      { id: 2, subject: "اللغة العربية", teacher: "أ. أحمد علي", sessions: "٦/٨", nextSession: "الأحد ٥:٠٠ م" },
    ],
  },
};

export default function ParentDashboard() {
  const [selectedChild, setSelectedChild] = useState(1);
  const currentChild = childData[selectedChild];
  const childInfo = children.find((c) => c.id === selectedChild)!;

  return (
    <DashboardLayout role="parent">
      <div className="space-y-8">
        <div className="bg-gradient-to-br from-rose-500/10 to-amber-500/10 rounded-2xl p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">مرحباً، أم عبدالله 👋</h2>
              <p className="text-lg text-muted-foreground">متابعة أداء أبنائك والدفعات المالية</p>
            </div>
            <div className="relative">
              <select
                value={selectedChild}
                onChange={(e) => setSelectedChild(Number(e.target.value))}
                className="appearance-none px-6 py-4 pr-12 bg-background border rounded-xl text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                {children.map((child) => (
                  <option key={child.id} value={child.id}>{child.name} - {child.grade}</option>
                ))}
              </select>
              <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-card border rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الفصول المسجلة</p>
                <p className="text-3xl font-bold">{currentChild.enrolledClasses}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{childInfo.grade}</p>
          </div>
          <div className="bg-card border rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">نسبة الحضور</p>
                <p className="text-3xl font-bold text-green-500">{currentChild.attendanceRate}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-green-500">
              <TrendingUp className="w-4 h-4" />
              <span>ممتاز</span>
            </div>
          </div>
          <div className="bg-card border rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الرسوم الشهرية</p>
                <p className="text-3xl font-bold">{currentChild.monthlyFees}</p>
              </div>
            </div>
            <Link href="/parent/payments" className="text-sm text-primary hover:underline flex items-center gap-1">
              عرض الفواتير
              <ArrowLeft className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="text-xl font-bold">الفصول المسجلة</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-right py-4 px-6 text-base font-medium text-muted-foreground">المادة</th>
                  <th className="text-right py-4 px-6 text-base font-medium text-muted-foreground">المعلم</th>
                  <th className="text-right py-4 px-6 text-base font-medium text-muted-foreground">الحصص</th>
                  <th className="text-right py-4 px-6 text-base font-medium text-muted-foreground">الحصة القادمة</th>
                </tr>
              </thead>
              <tbody>
                {currentChild.groups.map((group) => (
                  <tr key={group.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="py-4 px-6"><p className="text-base font-medium">{group.subject}</p></td>
                    <td className="py-4 px-6"><p className="text-base">{group.teacher}</p></td>
                    <td className="py-4 px-6"><p className="text-base">{group.sessions}</p></td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-base">{group.nextSession}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/parent/payments" className="bg-card border rounded-xl p-6 hover:shadow-md transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
              <Wallet className="w-6 h-6 text-purple-500" />
            </div>
            <h4 className="text-lg font-semibold mb-2">المدفوعات والفواتير</h4>
            <p className="text-sm text-muted-foreground">عرض ودفع الفواتير المستحقة</p>
          </Link>
          <Link href="/parent/reports" className="bg-card border rounded-xl p-6 hover:shadow-md transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-blue-500" />
            </div>
            <h4 className="text-lg font-semibold mb-2">التقارير والتقييمات</h4>
            <p className="text-sm text-muted-foreground">متابعة تقارير الحضور والملاحظات</p>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
