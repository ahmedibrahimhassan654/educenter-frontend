"use client";

import Link from "next/link";
import DashboardLayout from "@/components/dashboard-layout";
import {
  Users,
  Wallet,
  Calendar,
  ArrowLeft,
  Clock,
  CheckCircle,
  BookOpen,
} from "lucide-react";

const stats = [
  {
    title: "إجمالي المجموعات",
    value: "٤",
    change: "+١ هذا الشهر",
    icon: Users,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    title: "إجمالي الطلاب",
    value: "٧٢",
    change: "+٨ طلاب جدد",
    icon: BookOpen,
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    title: "صافي الأرباح",
    value: "٢٧٬٢٠٠ ج.م",
    change: "+١٥٪ عن الشهر الماضي",
    icon: Wallet,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    title: "الحصص هذا الشهر",
    value: "١٦",
    change: "٤ حصص متبقية",
    icon: Calendar,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
];

const upcomingSessions = [
  {
    id: 1,
    group: "الفيزياء - الصف الثاني الثانوي",
    time: "٩:٠٠ صباحاً",
    date: "غداً الأحد",
    students: 18,
    maxStudents: 20,
  },
  {
    id: 2,
    group: "الرياضيات - الصف الأول الثانوي",
    time: "١١:٠٠ صباحاً",
    date: "غداً الأحد",
    students: 20,
    maxStudents: 20,
  },
  {
    id: 3,
    group: "الكيمياء - الصف الثالث الثانوي",
    time: "٢:٠٠ مساءً",
    date: "الأربعاء",
    students: 15,
    maxStudents: 20,
  },
];

const recentGroups = [
  {
    id: 1,
    name: "الفيزياء - الصف الثاني الثانوي",
    students: 18,
    maxStudents: 20,
    sessions: 6,
    totalSessions: 8,
    earnings: "٦٬٨٠٠ ج.م",
  },
  {
    id: 2,
    name: "الرياضيات - الصف الأول الثانوي",
    students: 20,
    maxStudents: 20,
    sessions: 8,
    totalSessions: 8,
    earnings: "٦٬٨٠٠ ج.م",
  },
  {
    id: 3,
    name: "الكيمياء - الصف الثالث الثانوي",
    students: 15,
    maxStudents: 20,
    sessions: 5,
    totalSessions: 8,
    earnings: "٥٬١٠٠ ج.م",
  },
  {
    id: 4,
    name: "العلوم - الصف الثالث الإعدادي",
    students: 19,
    maxStudents: 20,
    sessions: 7,
    totalSessions: 8,
    earnings: "٦٬٤٦٠ ج.م",
  },
];

export default function TeacherDashboard() {
  return (
    <DashboardLayout role="teacher">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            مرحباً، أ. محمد 👋
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            إليك ملخص أداءك لهذا الشهر. لديك ٣ حصص قادمة هذا الأسبوع.
          </p>
          <Link
            href="/teacher/groups"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg text-base font-medium hover:bg-primary/90 transition-colors"
          >
            إدارة المجموعات
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="bg-card border rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
              <p className="text-3xl font-bold text-foreground mb-2">{stat.value}</p>
              <p className="text-sm text-green-500">{stat.change}</p>
            </div>
          ))}
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-card border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">الحصص القادمة</h3>
            <Link
              href="/teacher/groups"
              className="text-base text-primary hover:underline flex items-center gap-1"
            >
              عرض الكل
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {upcomingSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-medium text-foreground truncate">
                    {session.group}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {session.date} • {session.time}
                  </p>
                </div>
                <div className="text-left flex-shrink-0">
                  <p className="text-sm font-medium">
                    {session.students}/{session.maxStudents} طالب
                  </p>
                  <div className="w-24 h-2 bg-muted rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(session.students / session.maxStudents) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Groups Overview */}
        <div className="bg-card border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">نظرة عامة على المجموعات</h3>
            <Link
              href="/teacher/groups"
              className="text-base text-primary hover:underline flex items-center gap-1"
            >
              إدارة المجموعات
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right py-4 px-4 text-base font-medium text-muted-foreground">المجموعة</th>
                  <th className="text-right py-4 px-4 text-base font-medium text-muted-foreground">الطلاب</th>
                  <th className="text-right py-4 px-4 text-base font-medium text-muted-foreground">الحصص</th>
                  <th className="text-right py-4 px-4 text-base font-medium text-muted-foreground">الأرباح</th>
                  <th className="text-right py-4 px-4 text-base font-medium text-muted-foreground">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {recentGroups.map((group) => (
                  <tr key={group.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-4 px-4">
                      <p className="text-base font-medium">{group.name}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{group.students}/{group.maxStudents}</span>
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${(group.students / group.maxStudents) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-base">{group.sessions}/{group.totalSessions}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-base font-medium text-green-500">{group.earnings}</span>
                    </td>
                    <td className="py-4 px-4">
                      {group.sessions === group.totalSessions ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          مكتملة
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-sm">
                          <Clock className="w-4 h-4" />
                          نشطة
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link
            href="/teacher/groups"
            className="bg-card border rounded-xl p-6 hover:shadow-md transition-all hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <h4 className="text-lg font-semibold mb-2">إدارة المجموعات</h4>
            <p className="text-sm text-muted-foreground">إنشاء ومجموعاتك وإدارة الطلاب</p>
          </Link>
          <Link
            href="/teacher/earnings"
            className="bg-card border rounded-xl p-6 hover:shadow-md transition-all hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
              <Wallet className="w-6 h-6 text-green-500" />
            </div>
            <h4 className="text-lg font-semibold mb-2">الأرباح والمدفوعات</h4>
            <p className="text-sm text-muted-foreground">متابعة أرباحك وطلب السحب</p>
          </Link>
          <Link
            href="/teacher/groups"
            className="bg-card border rounded-xl p-6 hover:shadow-md transition-all hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-purple-500" />
            </div>
            <h4 className="text-lg font-semibold mb-2">جدول الحصص</h4>
            <p className="text-sm text-muted-foreground">عرض وإدارة جدولك الأسبوعي</p>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
