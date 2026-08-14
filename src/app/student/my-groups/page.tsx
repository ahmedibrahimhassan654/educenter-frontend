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
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold">مجموعاتي</h2>
        <p className="text-base text-muted-foreground mt-1">
          تابع المجموعات التي انضممت إليها والمجموعات المتاحة لمرحلتك وصفك
        </p>
      </div>

      {/* Joined groups */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold">المجموعات المنضمة إليها</h3>
        </div>
        {joinedGroups.length === 0 ? (
          <div className="bg-card border rounded-xl p-10 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium">لم تنضم إلى أي مجموعة بعد</p>
            <p className="text-sm text-muted-foreground mt-1">
              استكشف المجموعات المتاحة لمرحلتك وانضم إليها
            </p>
            <Link
              href="/groups"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
            >
              استكشف المجموعات
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {joinedGroups.map((g) => renderGroupCard(g, "member"))}
          </div>
        )}
      </section>

      {/* Stage/grade groups */}
      {stage && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold">مجموعات صفي ومرحلتي</h3>
          </div>

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
        </section>
      )}
    </div>
  );
}