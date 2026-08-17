"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import api from "@/lib/api";
import {
  Users,
  BookOpen,
  Calendar,
  GraduationCap,
  Loader2,
  Clock,
  ArrowLeft,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { getSubjectColor } from "@/lib/subject-colors";

interface GroupItem {
  _id?: string;
  id?: string;
  title: string;
  subject: string;
  grade: string;
  stage?: string;
  totalSessionPrice?: number;
  maxStudentsPerGroup?: number;
  scheduleDays?: string[];
  learningPoints?: string[];
  studentsCount?: number;
  students?: any[];
  teacherId?: { name?: string };
  teacher?: { name?: string };
}

const DAY_NAMES: Record<string, string> = {
  Sunday: "الأحد",
  Monday: "الاثنين",
  Tuesday: "الثلاثاء",
  Wednesday: "الأربعاء",
  Thursday: "الخميس",
  Friday: "الجمعة",
  Saturday: "السبت",
};

const getScheduleText = (days?: string[]) => {
  if (!days || days.length === 0) return "غير محدد";
  return days.map((d) => DAY_NAMES[d] || d).join(" و ");
};

const groupId = (g: GroupItem) => g._id || g.id || "";
const groupTeacher = (g: GroupItem) => g.teacher?.name || g.teacherId?.name || "غير محدد";

export default function StudentMyGroupsPage() {
  const { user } = useAuth();
  const [joinedGroups, setJoinedGroups] = useState<GroupItem[]>([]);
  const [stageGroups, setStageGroups] = useState<GroupItem[]>([]);
  const [gradeOptions, setGradeOptions] = useState<string[]>([]);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"mine" | "stage">("mine");

  const stage = (user as any)?.stage || "";
  const grade = (user as any)?.grade || "";

  useEffect(() => {
    const load = async () => {
      try {
        const [joinedRes, stageRes] = await Promise.all([
          api.get("/groups").catch(() => ({ data: { data: [] } })),
          api.get(`/groups/public?stage=${encodeURIComponent(stage)}&grade=${encodeURIComponent(grade)}&limit=50`).catch(() => ({ data: { data: [] } })),
        ]);
        setJoinedGroups(joinedRes.data?.data || joinedRes.data || []);
        setStageGroups(stageRes.data?.data || stageRes.data || []);
        setSelectedGrade(grade);
      } catch {
        // ignore - empty states render
      } finally {
        setLoading(false);
      }
    };

    if (stage) load();
    else setLoading(false);
  }, [stage, grade]);

  useEffect(() => {
    if (!stage) return;
    api
      .get("/curriculum")
      .then((res) => {
        const stages = Array.isArray(res.data) ? res.data : [];
        const found = stages.find((s: any) => s.name === stage);
        const grades = (found?.grades || []).map((g: any) => g.name);
        if (grades.length > 0) setGradeOptions(grades);
      })
      .catch(() => {});
  }, [stage]);

  const filteredStageGroups = useMemo(() => {
    if (!selectedGrade) return stageGroups;
    return stageGroups.filter((g) => g.grade === selectedGrade);
  }, [stageGroups, selectedGrade]);

  const tabList: Array<{
    id: "mine" | "stage";
    label: string;
    Icon: typeof Users;
    count: number;
    gradient: string;
    badgeActive: string;
    glow: string;
  }> = [
    {
      id: "mine",
      label: "مجموعاتي",
      Icon: Users,
      count: joinedGroups.length,
      gradient: "from-blue-500 via-indigo-500 to-indigo-600",
      badgeActive: "text-blue-700",
      glow: "shadow-blue-500/40",
    },
  ];
  if (stage) {
    tabList.push({
      id: "stage",
      label: "مجموعات صفي ومرحلتي",
      Icon: Layers,
      count: filteredStageGroups.length,
      gradient: "from-violet-500 via-purple-500 to-fuchsia-600",
      badgeActive: "text-purple-700",
      glow: "shadow-purple-500/40",
    });
  }
  const activeIndex = Math.max(0, tabList.findIndex((t) => t.id === activeTab));
  const activeTabConfig = tabList[activeIndex];

  const renderGroupCard = (group: GroupItem, target: "member" | "public" = "public") => {
    const id = groupId(group);
    const href = target === "member" ? `/student/my-groups/${id}` : `/groups/${id}`;
    const subjectColor = getSubjectColor(group.subject);
    return (
      <Link
        key={id}
        href={href}
        className="bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-shadow block"
      >
        <div className={`p-5 bg-gradient-to-br ${subjectColor.gradient}`}>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-bold text-white truncate">{group.title}</h3>
              <p className="text-sm text-white/80 mt-0.5">{group.grade}</p>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium shrink-0 bg-white/20 text-white">
              <BookOpen className="w-3 h-3" />
              {group.subject}
            </span>
          </div>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-medium truncate">{groupTeacher(group)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {getScheduleText(group.scheduleDays)}
          </div>
          {(group.learningPoints || []).length > 0 && (
            <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span className="line-clamp-1">{group.learningPoints![0]}</span>
            </div>
          )}
          <div className="flex items-center justify-between pt-3 border-t">
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              {group.studentsCount ?? group.students?.length ?? 0} طالب
            </span>
            {group.totalSessionPrice ? (
              <span className="text-base font-bold text-primary">
                {group.totalSessionPrice} ج.م
                <span className="text-xs font-normal text-muted-foreground mr-1">/ حصة</span>
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold">مجموعاتي</h2>
        <p className="text-base text-muted-foreground mt-1">
          تابع المجموعات التي انضممت إليها والمجموعات المتاحة لمرحلتك وصفك
        </p>
      </div>

      {/* Animated tab bar */}
      <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
        <div className="relative grid rounded-2xl border bg-background/70 backdrop-blur p-1.5 shadow-sm">
          {/* Sliding indicator */}
          <div
            className="absolute top-1.5 bottom-1.5 rounded-xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              insetInlineStart: `calc(${activeIndex * (100 / tabList.length)}% + 0.375rem)`,
              insetInlineEnd: `calc(${(tabList.length - 1 - activeIndex) * (100 / tabList.length)}% + 0.375rem)`,
            }}
          >
            <div
              className={`absolute inset-0 rounded-xl bg-gradient-to-l shadow-lg ${activeTabConfig.gradient} ${activeTabConfig.glow}`}
            />
          </div>

          {/* Tabs */}
          <div
            className="relative grid"
            style={{ gridTemplateColumns: `repeat(${tabList.length}, 1fr)` }}
            role="tablist"
          >
            {tabList.map(({ id, label, Icon, count, badgeActive }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTab(id)}
                  className={`relative z-10 flex items-center justify-center gap-2.5 py-3 px-3 md:px-5 rounded-xl transition-all duration-300 group ${
                    active ? "text-white scale-[1.02]" : "text-muted-foreground hover:text-foreground"
                  } ${active ? "cursor-default" : "hover:bg-muted/60 active:scale-[0.98]"}`}
                >
                  {/* Icon chip */}
                  <span
                    className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-all duration-300 ${
                      active ? "bg-white/20 scale-110" : "bg-muted group-hover:bg-muted-foreground/10"
                    }`}
                  >
                    <Icon className={`w-4 h-4 transition-all duration-300 ${active ? "text-white drop-shadow" : "text-muted-foreground group-hover:text-foreground"}`} />
                  </span>

                  {/* Title */}
                  <span className="font-bold text-sm md:text-base whitespace-nowrap">{label}</span>

                  {/* Count badge */}
                  <span
                    className={`relative inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                      active
                        ? `bg-white ${badgeActive} scale-110`
                        : "bg-muted-foreground/10 text-muted-foreground group-hover:bg-muted-foreground/20"
                    }`}
                  >
                    <span key={count} className="animate-in zoom-in duration-300">
                      {count}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active tab content */}
      <div key={activeTab} className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
        {activeTab === "mine" && (
          <>
            {joinedGroups.length === 0 ? (
              <div className="bg-card border rounded-xl p-10 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium">لم تنضم إلى أي مجموعة بعد</p>
                <p className="text-sm text-muted-foreground mt-1">
                  استكشف المجموعات المتاحة لمرحلتك وانضم إليها
                </p>
                {stage ? (
                  <button
                    onClick={() => setActiveTab("stage")}
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
                  >
                    تصفح مجموعات صفي ومرحلتي
                    <Layers className="w-4 h-4" />
                  </button>
                ) : (
                  <Link
                    href="/groups"
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
                  >
                    استكشف المجموعات
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {joinedGroups.map((g) => renderGroupCard(g, "member"))}
              </div>
            )}
          </>
        )}

        {activeTab === "stage" && stage && (
          <>
            {gradeOptions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {gradeOptions.map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedGrade(g)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedGrade === g
                        ? "bg-primary text-primary-foreground"
                        : "bg-background border hover:bg-muted"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            )}

            {filteredStageGroups.length === 0 ? (
              <div className="bg-card border rounded-xl p-10 text-center">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium">لا توجد مجموعات متاحة لهذا الصف حالياً</p>
                <p className="text-sm text-muted-foreground mt-1">ترقّب إضافة مجموعات جديدة</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredStageGroups.map((g) => renderGroupCard(g))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}