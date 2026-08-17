"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import api from "@/lib/api";
import {
  User,
  Users,
  ArrowLeft,
  Loader2,
  CalendarDays,
  BookOpen,
  Clock,
  GraduationCap,
} from "lucide-react";

interface GroupItem {
  _id?: string;
  id?: string;
  title: string;
  subject: string;
  grade: string;
  scheduleDays?: string[];
  teacherId?: { name?: string };
  teacher?: { name?: string };
}

interface Session {
  day: string;
  time: string;
  groupId: string;
  title: string;
  subject: string;
  grade: string;
  teacherName: string;
}

// Week starts on Saturday (السبت) in Arabic calendars
const WEEK_DAYS = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

const DAY_TO_INDEX: Record<string, number> = {
  السبت: 0,
  الأحد: 1,
  الاثنين: 2,
  الثلاثاء: 3,
  الأربعاء: 4,
  الخميس: 5,
  الجمعة: 6,
};

const formatTime = (t: string) => {
  const [hRaw, mRaw] = t.split(":");
  const h = parseInt(hRaw, 10);
  const m = mRaw || "00";
  if (isNaN(h)) return t;
  const suffix = h >= 12 ? "م" : "ص";
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${suffix}`;
};

const groupId = (g: GroupItem) => g._id || g.id || "";
const groupTeacher = (g: GroupItem) => g.teacher?.name || g.teacherId?.name || "غير محدد";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [joinedGroups, setJoinedGroups] = useState<GroupItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api
          .get("/groups")
          .catch(() => ({ data: { data: [] } }));
        setJoinedGroups(res.data?.data || res.data || []);
      } catch {
        // ignore - empty calendar renders
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const sessions = useMemo<Session[]>(() => {
    const list: Session[] = [];
    for (const g of joinedGroups) {
      for (const slot of g.scheduleDays || []) {
        const day = WEEK_DAYS.find((d) => slot.startsWith(d));
        if (!day) continue;
        const time = slot.slice(day.length).trim() || "—";
        list.push({
          day,
          time,
          groupId: groupId(g),
          title: g.title,
          subject: g.subject,
          grade: g.grade,
          teacherName: groupTeacher(g),
        });
      }
    }
    return list.sort((a, b) => {
      const dayDiff = DAY_TO_INDEX[a.day] - DAY_TO_INDEX[b.day];
      if (dayDiff !== 0) return dayDiff;
      return a.time.localeCompare(b.time);
    });
  }, [joinedGroups]);

  const todayIndex = (new Date().getDay() + 6) % 7;
  const todayLabel = WEEK_DAYS[todayIndex];
  const todaySessions = sessions.filter((s) => s.day === todayLabel);

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
    {
      href: "/student/my-groups",
      title: "مجموعاتي",
      description: "استعرض المجموعات التي انضممت إليها ومواعيد حصصها.",
      icon: BookOpen,
      bg: "bg-emerald-500/10",
      color: "text-emerald-500",
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
          من هنا يمكنك إدارة ملفك الشخصي ومتابعة دعوات المجموعات وجدول حصصك.
        </p>
      </div>

      {/* Schedule Calendar */}
      <div className="bg-card border rounded-2xl overflow-hidden">
        <div className="p-6 pb-0">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <CalendarDays className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold">جدول حصصي الأسبوعي</h3>
                <p className="text-sm text-muted-foreground">
                  أيام ومواعيد الحصص في مجموعاتك
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary font-bold text-sm">
              <Clock className="w-4 h-4" />
              حصة اليوم ({todayLabel}): {todaySessions.length}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-10 text-center">
            <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium">لا توجد حصص مجدولة بعد</p>
            <p className="text-sm text-muted-foreground mt-1">
              انضم إلى مجموعة ليظهر جدول حصصك هنا
            </p>
            <Link
              href="/student/my-groups"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
            >
              تصفح مجموعاتي
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            {/* Today's sessions */}
            {todaySessions.length > 0 && (
              <div className="mx-6 mt-6 grid sm:grid-cols-2 gap-3">
                {todaySessions.map((s, i) => (
                  <Link
                    key={`${s.groupId}-${s.time}`}
                    href={`/student/my-groups/${s.groupId}`}
                    className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-l from-primary/10 to-violet-500/10 border border-primary/20 hover:shadow-md transition-shadow group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm truncate">{s.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.subject} • {s.grade}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-primary shrink-0">
                      {formatTime(s.time)}
                    </span>
                  </Link>
                ))}
              </div>
            )}

            {/* Weekly grid */}
            <div className="p-6 overflow-x-auto">
              <div
                className="grid gap-3"
                style={{ gridTemplateColumns: `repeat(${WEEK_DAYS.length}, minmax(130px, 1fr))`, minWidth: `${WEEK_DAYS.length * 140}px` }}
              >
                {WEEK_DAYS.map((day, idx) => {
                  const daySessions = sessions.filter((s) => s.day === day);
                  const isToday = idx === todayIndex;
                  return (
                    <div
                      key={day}
                      className={`rounded-xl border p-3 ${isToday ? "border-primary bg-primary/5" : "border-border bg-background/50"}`}
                    >
                      <div className={`text-center text-sm font-bold mb-3 ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                        {day}
                        {isToday && (
                          <span className="block text-[10px] font-medium text-primary/70 mt-0.5">اليوم</span>
                        )}
                      </div>
                      {daySessions.length === 0 ? (
                        <div className="text-center text-xs text-muted-foreground/60 py-4">لا حصص</div>
                      ) : (
                        <div className="space-y-2">
                          {daySessions.map((s, i) => (
                            <Link
                              key={`${s.groupId}-${s.time}`}
                              href={`/student/my-groups/${s.groupId}`}
                              className="block p-2.5 rounded-lg bg-card border hover:border-primary/40 hover:shadow-sm transition-all group"
                            >
                              <p className="text-sm font-bold truncate">{s.title}</p>
                              <p className="text-[11px] text-muted-foreground truncate">{s.subject}</p>
                              <div className="flex items-center justify-between mt-1.5">
                                <span className="text-xs font-bold text-primary">{formatTime(s.time)}</span>
                                <GraduationCap className="w-3.5 h-3.5 text-muted-foreground/70" />
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
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