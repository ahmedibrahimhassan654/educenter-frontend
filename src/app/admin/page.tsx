"use client";

import Link from "next/link";
import DashboardLayout from "@/components/dashboard-layout";
import { useAuth } from "@/components/auth-provider";
import {
  Users,
  GraduationCap,
  BookOpen,
  Wallet,
  TrendingUp,
  Calendar,
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
} from "lucide-react";

const stats = [
  {
    title: "إجمالي المستخدمين",
    value: "٢٬٨٥٠",
    change: "+١٢٠ هذا الشهر",
    icon: Users,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    title: "المعلمين النشطين",
    value: "١٥٠",
    change: "+١٢ معلم جديد",
    icon: GraduationCap,
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    title: "الطلاب المسجلين",
    value: "٢٬٥٠٠",
    change: "+٨٥ طالب جديد",
    icon: BookOpen,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    title: "إجمالي الإيرادات",
    value: "١٢٥٬٠٠٠ ج.م",
    change: "+١٨٪ عن الشهر الماضي",
    icon: Wallet,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
];

const recentUsers = [
  { id: 1, name: "أحمد محمد", email: "ahmed@test.com", role: "طالب", date: "منذ ساعتين", status: "active" },
  { id: 2, name: "فاطمة علي", email: "fatma@test.com", role: "معلم", date: "منذ ٣ ساعات", status: "active" },
  { id: 3, name: "محمد حسن", email: "mohamed@test.com", role: "ولي أمر", date: "منذ ٥ ساعات", status: "active" },
  { id: 4, name: "نورهان سعيد", email: "nourhan@test.com", role: "طالب", date: "أمس", status: "pending" },
  { id: 5, name: "خالد عبدالله", email: "khaled@test.com", role: "معلم", date: "أمس", status: "active" },
];

const recentGroups = [
  { id: 1, name: "فيزياء - الصف الثاني الثانوي", teacher: "أ. محمد الأحمد", students: "١٨/٢٠", status: "active" },
  { id: 2, name: "رياضيات - الصف الأول الثانوي", teacher: "أ. فاطمة العلي", students: "٢٠/٢٠", status: "full" },
  { id: 3, name: "كيمياء - الصف الثالث الثانوي", teacher: "أ. خالد السعود", students: "١٥/٢٠", status: "active" },
  { id: 4, name: "علوم - الصف الثالث الإعدادي", teacher: "أ. نورة الحربي", students: "١٩/٢٠", status: "active" },
];

const pendingActions = [
  { id: 1, text: "٥ طلبات انضمام معلمين جدد", icon: Users, color: "text-blue-500" },
  { id: 2, text: "٣ شكاوى من الطلاب", icon: AlertCircle, color: "text-red-500" },
  { id: 3, text: "٨ طلبات سحب من المعلمين", icon: Wallet, color: "text-orange-500" },
  { id: 4, text: "١٢ تقرير شهري معلق", icon: BarChart3, color: "text-purple-500" },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const displayName = user?.name?.split(" ")[0] || "المدير";

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            مرحباً، {displayName} 👋
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            إليك ملخص المنصة اليوم. لديك {pendingActions.length} إجراءات معلقة.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg text-base font-medium hover:bg-primary/90 transition-colors"
            >
              إدارة المستخدمين
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link
              href="/admin/reports"
              className="inline-flex items-center gap-2 px-6 py-3 border rounded-lg text-base font-medium hover:bg-muted transition-colors"
            >
              التقارير المالية
            </Link>
          </div>
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
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
              <p className="text-3xl font-bold mb-2">{stat.value}</p>
              <p className="text-sm text-green-500">{stat.change}</p>
            </div>
          ))}
        </div>

        {/* Pending Actions */}
        <div className="bg-card border rounded-xl p-6">
          <h3 className="text-xl font-bold mb-6">إجراءات معلقة</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {pendingActions.map((action) => (
              <div
                key={action.id}
                className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center">
                  <action.icon className={`w-5 h-5 ${action.color}`} />
                </div>
                <span className="text-base flex-1">{action.text}</span>
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold">أحدث المستخدمين</h3>
              <Link href="/admin/users" className="text-base text-primary hover:underline">
                عرض الكل
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">الاسم</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">الدور</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">التاريخ</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((user) => (
                    <tr key={user.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">{user.role}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground">{user.date}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                          user.status === "active"
                            ? "bg-green-500/10 text-green-500"
                            : "bg-yellow-500/10 text-yellow-500"
                        }`}>
                          {user.status === "active" ? (
                            <><CheckCircle className="w-3 h-3" /> نشط</>
                          ) : (
                            <><Clock className="w-3 h-3" /> معلق</>
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Groups */}
          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold">أحدث المجموعات</h3>
              <Link href="/admin/groups" className="text-base text-primary hover:underline">
                عرض الكل
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">المجموعة</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">المعلم</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">الطلاب</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {recentGroups.map((group) => (
                    <tr key={group.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="py-3 px-4">
                        <p className="text-sm font-medium">{group.name}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">{group.teacher}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">{group.students}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                          group.status === "full"
                            ? "bg-orange-500/10 text-orange-500"
                            : "bg-green-500/10 text-green-500"
                        }`}>
                          {group.status === "full" ? "مكتملة" : "نشطة"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-6">
          <Link href="/admin/users" className="bg-card border rounded-xl p-6 hover:shadow-md transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <h4 className="text-lg font-semibold mb-2">إدارة المستخدمين</h4>
            <p className="text-sm text-muted-foreground">عرض وإدارة جميع المستخدمين</p>
          </Link>
          <Link href="/admin/groups" className="bg-card border rounded-xl p-6 hover:shadow-md transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-green-500" />
            </div>
            <h4 className="text-lg font-semibold mb-2">إدارة المجموعات</h4>
            <p className="text-sm text-muted-foreground">مراقبة جميع المجموعات النشطة</p>
          </Link>
          <Link href="/admin/payments" className="bg-card border rounded-xl p-6 hover:shadow-md transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
              <Wallet className="w-6 h-6 text-purple-500" />
            </div>
            <h4 className="text-lg font-semibold mb-2">المدفوعات</h4>
            <p className="text-sm text-muted-foreground">متابعة المدفوعات والسحوبات</p>
          </Link>
          <Link href="/admin/settings" className="bg-card border rounded-xl p-6 hover:shadow-md transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-orange-500" />
            </div>
            <h4 className="text-lg font-semibold mb-2">الإعدادات</h4>
            <p className="text-sm text-muted-foreground">إعدادات المنصة والنظام</p>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
