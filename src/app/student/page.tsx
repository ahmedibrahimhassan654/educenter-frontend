"use client";

import Link from "next/link";
import DashboardLayout from "@/components/dashboard-layout";
import {
  BookOpen,
  Calendar,
  Clock,
  Users,
  ArrowLeft,
  TrendingUp,
  CheckCircle,
  Video,
} from "lucide-react";

const nextSession = {
  subject: "الفيزياء",
  teacher: "أ. محمد الأحمد",
  group: "الصف الثاني الثانوي",
  date: "غداً الأحد",
  time: "٩:٠٠ صباحاً",
  location: "أونلاين - جوجل ميت",
  countdown: "١٨ ساعة و ٤٥ دقيقة",
};

const enrolledGroups = [
  {
    id: 1,
    subject: "الفيزياء",
    teacher: "أ. محمد الأحمد",
    group: "الصف الثاني الثانوي",
    completedSessions: 6,
    totalSessions: 8,
    nextSession: "غداً ٩:٠٠ ص",
    status: "active",
  },
  {
    id: 2,
    subject: "الرياضيات",
    teacher: "أ. فاطمة العلي",
    group: "الصف الثاني الثانوي",
    completedSessions: 5,
    totalSessions: 8,
    nextSession: "الثلاثاء ١١:٠٠ ص",
    status: "active",
  },
  {
    id: 3,
    subject: "الكيمياء",
    teacher: "أ. خالد السعود",
    group: "الصف الثاني الثانوي",
    completedSessions: 7,
    totalSessions: 8,
    nextSession: "الأربعاء ٢:٠٠ م",
    status: "active",
  },
];

const recentActivity = [
  {
    type: "attendance",
    message: "حضرت حصة الفيزياء",
    time: "منذ يومين",
    icon: CheckCircle,
    color: "text-green-500",
  },
  {
    type: "homework",
    message: "تم تسليم واجب الرياضيات",
    time: "منذ ٣ أيام",
    icon: BookOpen,
    color: "text-blue-500",
  },
  {
    type: "grade",
    message: "حصلت على ٩٢٪ في اختبار الكيمياء",
    time: "منذ أسبوع",
    icon: TrendingUp,
    color: "text-purple-500",
  },
];

export default function StudentDashboard() {
  return (
    <DashboardLayout role="student">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-cyan-500/10 to-violet-500/10 rounded-2xl p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            مرحباً، أحمد 👋
          </h2>
          <p className="text-lg text-muted-foreground mb-2">
            لديك حصة غداً! استعد جيداً.
          </p>
        </div>

        {/* Next Session Card */}
        <div className="bg-card border rounded-xl p-6 border-l-4 border-l-primary">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold">الحصة القادمة</h3>
                <p className="text-sm text-muted-foreground">{nextSession.countdown}</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm font-medium">
              قريباً
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-2xl font-bold text-primary mb-1">{nextSession.subject}</p>
                <p className="text-base text-muted-foreground">{nextSession.group}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-base">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <span>{nextSession.teacher}</span>
                </div>
                <div className="flex items-center gap-2 text-base">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <span>{nextSession.date} • {nextSession.time}</span>
                </div>
                <div className="flex items-center gap-2 text-base">
                  <Video className="w-5 h-5 text-muted-foreground" />
                  <span>{nextSession.location}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <Link
                href="#"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl text-lg font-medium hover:bg-primary/90 transition-colors w-full"
              >
                انضم للحصة
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Enrolled Groups */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">مجموعاتي</h3>
            <Link
              href="/student/explore"
              className="text-base text-primary hover:underline flex items-center gap-1"
            >
              استكشف المزيد
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {enrolledGroups.map((group) => (
              <div
                key={group.id}
                className="bg-card border rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold">{group.subject}</h4>
                    <p className="text-sm text-muted-foreground">{group.group}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{group.teacher}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{group.nextSession}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">تقدم الحصص</span>
                    <span className="text-sm font-bold">
                      الحصة {group.completedSessions} من {group.totalSessions}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{
                        width: `${(group.completedSessions / group.totalSessions) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <Link
                  href="/student/my-progress"
                  className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  عرض التفاصيل
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-card border rounded-xl p-5 text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-blue-500/10 flex items-center justify-center mb-3">
              <BookOpen className="w-6 h-6 text-blue-500" />
            </div>
            <p className="text-3xl font-bold mb-1">٣</p>
            <p className="text-sm text-muted-foreground">مجموعات مسجلة</p>
          </div>
          <div className="bg-card border rounded-xl p-5 text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-green-500/10 flex items-center justify-center mb-3">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <p className="text-3xl font-bold mb-1">١٨</p>
            <p className="text-sm text-muted-foreground">حصص حضرتها</p>
          </div>
          <div className="bg-card border rounded-xl p-5 text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-purple-500/10 flex items-center justify-center mb-3">
              <TrendingUp className="w-6 h-6 text-purple-500" />
            </div>
            <p className="text-3xl font-bold mb-1">٨٨٪</p>
            <p className="text-sm text-muted-foreground">نسبة الحضور</p>
          </div>
          <div className="bg-card border rounded-xl p-5 text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-orange-500/10 flex items-center justify-center mb-3">
              <Calendar className="w-6 h-6 text-orange-500" />
            </div>
            <p className="text-3xl font-bold mb-1">٤</p>
            <p className="text-sm text-muted-foreground">حصص متبقية</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card border rounded-xl p-6">
          <h3 className="text-xl font-bold mb-6">آخر النشاطات</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg"
              >
                <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
                  <activity.icon className={`w-5 h-5 ${activity.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-base">{activity.message}</p>
                  <p className="text-sm text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
