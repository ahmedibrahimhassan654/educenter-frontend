"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard-layout";
import { useAuth } from "@/components/auth-provider";
import api from "@/lib/api";
import {
  Users,
  Wallet,
  Calendar,
  ArrowLeft,
  Clock,
  CheckCircle,
  BookOpen,
  Loader2,
  Shield,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface Group {
  _id: string;
  title: string;
  subject: string;
  grade: string;
  students: any[];
  totalSessionPrice?: number;
}

interface Session {
  _id: string;
  title: string;
  date: string;
  status: string;
  groupId: { title: string; subject: string };
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupsRes, sessionsRes] = await Promise.all([
          api.get("/groups"),
          api.get("/sessions"),
        ]);
        setGroups(groupsRes.data);
        setSessions(sessionsRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const upcomingSessions = sessions
    .filter((s) => s.status === "SCHEDULED" && new Date(s.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const totalStudents = groups.reduce((acc, g) => acc + (g.students?.length || 0), 0);
  const totalEarnings = groups.reduce((acc, g) => acc + (g.totalSessionPrice || 0) * (g.students?.length || 0), 0);

  if (loading) {
    return (
      <DashboardLayout role="teacher">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-8">
        {/* Verification Status Banner */}
        {user?.verificationStatus === "SUBMITTED" && (
          <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-800 dark:text-blue-300">طلبك قيد المراجعة</h3>
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                  تم إرسال طلب التحقق الخاص بك. يمكنك الوصول للوحة التحكم بميزات محدودة حتى يتم الموافقة على طلبك.
                </p>
              </div>
            </div>
          </div>
        )}

        {user?.verificationStatus === "REJECTED" && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-800 dark:text-red-300">تم رفض طلب التحقق</h3>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                  {user?.verificationNotes || "تم رفض طلبك. يرجى مراجعة سبب الرفض وإعادة تقديم الطلب."}
                </p>
                <Link
                  href="/teacher/verification"
                  className="text-sm text-red-800 dark:text-red-300 font-medium hover:underline mt-2 inline-block"
                >
                  إعادة تقديم الطلب ←
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            مرحباً، أ. {user?.name || "المعلم"} 👋
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            إليك ملخص أداءك. لديك {upcomingSessions.length} حصص قادمة.
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
          <div className="bg-card border rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">إجمالي المجموعات</p>
            <p className="text-3xl font-bold text-foreground mb-2">{groups.length}</p>
          </div>
          <div className="bg-card border rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">إجمالي الطلاب</p>
            <p className="text-3xl font-bold text-foreground mb-2">{totalStudents}</p>
          </div>
          <div className="bg-card border rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">صافي الأرباح</p>
            <p className="text-3xl font-bold text-foreground mb-2">{totalEarnings.toLocaleString()} ج.م</p>
          </div>
          <div className="bg-card border rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-500" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">الحصص القادمة</p>
            <p className="text-3xl font-bold text-foreground mb-2">{upcomingSessions.length}</p>
          </div>
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
            {upcomingSessions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">لا توجد حصص قادمة</p>
            ) : (
              upcomingSessions.map((session) => (
                <div
                  key={session._id}
                  className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium text-foreground truncate">
                      {session.groupId?.title || session.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(session.date).toLocaleDateString("ar-EG", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
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
          {groups.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">لا توجد مجموعات بعد</p>
              <p className="text-muted-foreground mt-1">أنشئ مجموعتك الأولى</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group) => (
                <div key={group._id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <h4 className="font-semibold mb-2">{group.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{group.subject} • {group.grade}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{group.students?.length || 0} طالب</span>
                    <Link
                      href={`/teacher/groups/${group._id}/attendance`}
                      className="text-sm text-primary hover:underline"
                    >
                      التفاصيل
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
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
            href="/teacher/profile"
            className="bg-card border rounded-xl p-6 hover:shadow-md transition-all hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-purple-500" />
            </div>
            <h4 className="text-lg font-semibold mb-2">الملف الشخصي</h4>
            <p className="text-sm text-muted-foreground">تعديل بياناتك الشخصية</p>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
