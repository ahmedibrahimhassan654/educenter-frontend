"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import api from "@/lib/api";
import {
  BookOpen,
  Calendar,
  Clock,
  Users,
  ArrowLeft,
  TrendingUp,
  CheckCircle,
  Video,
  Loader2,
} from "lucide-react";

interface Group {
  _id: string;
  title: string;
  subject: string;
  grade: string;
  teacherId: {
    name: string;
    email: string;
    verificationData?: {
      curriculum?: string[];
    };
  };
  students: any[];
  scheduleDays?: string;
}

interface Session {
  _id: string;
  title: string;
  date: string;
  status: string;
  groupId: { title: string; subject: string };
}

export default function StudentDashboard() {
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
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const nextSession = upcomingSessions[0];

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-cyan-500/10 to-violet-500/10 rounded-2xl p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            مرحباً، {user?.name || "الطالب"} 👋
          </h2>
          <p className="text-lg text-muted-foreground mb-2">
            {nextSession
              ? `لديك حصة ${nextSession.groupId.title} قريباً!`
              : "لا توجد حصص قادمة حالياً."}
          </p>
        </div>

        {/* Next Session Card */}
        {nextSession && (
          <div className="bg-card border rounded-xl p-6 border-l-4 border-l-primary">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">الحصة القادمة</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(nextSession.date).toLocaleDateString("ar-EG", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm font-medium">
                قريباً
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-2xl font-bold text-primary mb-1">{nextSession.groupId.subject}</p>
                  <p className="text-base text-muted-foreground">{nextSession.groupId.title}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-base">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <span>
                      {new Date(nextSession.date).toLocaleDateString("ar-EG", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
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
        )}

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
            {groups.length === 0 ? (
              <div className="col-span-3 text-center py-12 bg-muted/50 rounded-xl">
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">لم تنضم إلى أي مجموعة بعد</p>
                <p className="text-muted-foreground mt-1">استكشف المجموعات وانضم إليها</p>
              </div>
            ) : (
              groups.map((group) => (
                <div
                  key={group._id}
                  className="bg-card border rounded-xl p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold">{group.title}</h4>
                      <p className="text-sm text-muted-foreground">{group.subject}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{group.teacherId?.name || "غير محدد"}</span>
                    </div>
                    {(group.teacherId as any)?.verificationData?.curriculum && (group.teacherId as any).verificationData.curriculum.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {(group.teacherId as any).verificationData.curriculum.map((entry: string, i: number) => {
                          const [key, subjectName] = entry.split(":");
                          const parts = key ? key.split("-") : [];
                          const stage = parts[0] || "";
                          const grade = parts.slice(1).join("-");
                          return (
                            <span key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-500/10 text-green-700 dark:text-green-400 rounded text-xs">
                              {subjectName} <span className="text-muted-foreground">({stage} - {grade})</span>
                            </span>
                          );
                        })}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{group.scheduleDays || "غير محدد"}</span>
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
              ))
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-card border rounded-xl p-5 text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-blue-500/10 flex items-center justify-center mb-3">
              <BookOpen className="w-6 h-6 text-blue-500" />
            </div>
            <p className="text-3xl font-bold mb-1">{groups.length}</p>
            <p className="text-sm text-muted-foreground">مجموعات مسجلة</p>
          </div>
          <div className="bg-card border rounded-xl p-5 text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-green-500/10 flex items-center justify-center mb-3">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <p className="text-3xl font-bold mb-1">
              {sessions.filter((s) => s.status === "COMPLETED").length}
            </p>
            <p className="text-sm text-muted-foreground">حصص حضرتها</p>
          </div>
          <div className="bg-card border rounded-xl p-5 text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-purple-500/10 flex items-center justify-center mb-3">
              <TrendingUp className="w-6 h-6 text-purple-500" />
            </div>
            <p className="text-3xl font-bold mb-1">
              {sessions.length > 0
                ? Math.round(
                    (sessions.filter((s) => s.status === "COMPLETED").length /
                      sessions.length) *
                      100
                  )
                : 0}
              ٪
            </p>
            <p className="text-sm text-muted-foreground">نسبة الحضور</p>
          </div>
          <div className="bg-card border rounded-xl p-5 text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-orange-500/10 flex items-center justify-center mb-3">
              <Calendar className="w-6 h-6 text-orange-500" />
            </div>
            <p className="text-3xl font-bold mb-1">{upcomingSessions.length}</p>
            <p className="text-sm text-muted-foreground">حصص متبقية</p>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="bg-card border rounded-xl p-6">
          <h3 className="text-xl font-bold mb-6">آخر الحصص</h3>
          <div className="space-y-4">
            {sessions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">لا توجد حصص بعد</p>
            ) : (
              sessions.slice(0, 5).map((session) => (
                <div
                  key={session._id}
                  className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg"
                >
                  <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
                    {session.status === "COMPLETED" ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-base">{session.title || session.groupId.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(session.date).toLocaleDateString("ar-EG")}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      session.status === "COMPLETED"
                        ? "bg-green-500/10 text-green-500"
                        : "bg-blue-500/10 text-blue-500"
                    }`}
                  >
                    {session.status === "COMPLETED" ? "مكتملة" : "مجدولة"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
