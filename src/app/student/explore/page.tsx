"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import api from "@/lib/api";
import TeacherAvatar from "@/components/teacher-avatar";
import { PublicGroup } from "@/types";
import {
  getSubjectColor,
  getStageFromGrade,
  STAGE_COLORS,
} from "@/lib/subject-colors";
import {
  GraduationCap,
  Loader2,
  BookOpen,
  Users,
  Calendar,
  Wallet,
  ArrowLeft,
  Layers,
  Compass,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

interface CurriculumSubject {
  name: string;
}
interface CurriculumGrade {
  name: string;
  subjects?: CurriculumSubject[];
}
interface CurriculumStage {
  name: string;
  grades?: CurriculumGrade[];
}

function matchSubject(a: string, b: string): boolean {
  const x = a.replace(/\s+/g, "").toLowerCase();
  const y = b.replace(/\s+/g, "").toLowerCase();
  return x === y || x.includes(y) || y.includes(x);
}

export default function StudentExplorePage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<PublicGroup[]>([]);
  const [curriculum, setCurriculum] = useState<CurriculumStage[]>([]);
  const [loading, setLoading] = useState(true);

  const stageFull = (user as any)?.stage || "";
  const grade = (user as any)?.grade || "";

  const stageShort = useMemo(() => {
    if (stageFull.includes("ابتدائي")) return "ابتدائي";
    if (stageFull.includes("إعدادي")) return "إعدادي";
    if (stageFull.includes("ثانوي")) return "ثانوي";
    return getStageFromGrade(grade);
  }, [stageFull, grade]);

  useEffect(() => {
    let active = true;

    api
      .get("/curriculum")
      .then((res) => active && setCurriculum(Array.isArray(res.data) ? res.data : []))
      .catch(() => active && setCurriculum([]));

    api
      .get("/groups/public", {
        params: { stage: stageShort, grade, limit: "50" },
      })
      .then((res) => active && setGroups(res.data?.data || []))
      .catch(() => active && setGroups([]))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [stageShort, grade]);

  const subjectNames = useMemo(() => {
    const stage = curriculum.find((s) => s.name.includes(stageShort));
    const gradeEntry = stage?.grades?.find(
      (g) =>
        g.name === grade ||
        (grade && (grade.includes(g.name) || g.name.includes(grade)))
    );
    const names = gradeEntry?.subjects?.map((s) => s.name) || [];
    return Array.from(new Set(names));
  }, [curriculum, stageShort, grade]);

  const sections = useMemo(() => {
    const present = Array.from(new Set(groups.map((g) => g.subject)));
    const names = Array.from(new Set([...subjectNames, ...present]));
    return names.map((name) => ({
      name,
      count: groups.filter((g) => matchSubject(g.subject, name)).length,
    }));
  }, [groups, subjectNames]);

  const totalCount = groups.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-sm font-medium w-fit">
          <Compass className="w-4 h-4" />
          <span>استكشاف المجموعات</span>
        </div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">
              كل المجموعات لمرحلتك وصفك
            </h2>
            <p className="text-base text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
              <span>{stageFull || "المرحلة"}</span>
              {grade && (
                <>
                  <span className="text-muted-foreground/60">•</span>
                  <span>{grade}</span>
                </>
              )}
              <span className="text-muted-foreground/60">•</span>
              <span>{totalCount} مجموعة متاحة</span>
            </p>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="space-y-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-6 w-48 bg-muted rounded-full animate-pulse" />
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div
                    key={j}
                    className="rounded-3xl border bg-card p-5 space-y-4 animate-pulse"
                  >
                    <div className="h-3 w-1/3 bg-muted rounded-full" />
                    <div className="h-6 w-2/3 bg-muted rounded-full" />
                    <div className="h-4 w-1/2 bg-muted rounded-full" />
                    <div className="h-2.5 w-full bg-muted rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : sections.length === 0 ? (
        /* No groups at all */
        <div className="text-center py-16 rounded-3xl border bg-card">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold mb-2">لا توجد مجموعات بعد</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            لم يتم نشر مجموعات لمرحلتك وصفك الدراسي بعد. تصفح كل المجموعات
            المتاحة على المنصة.
          </p>
          <Link
            href="/groups"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl text-base font-medium hover:bg-primary/90 transition-colors"
          >
            <Compass className="w-5 h-5" />
            تصفح كل المجموعات
          </Link>
        </div>
      ) : (
        /* Subject sections */
        <div className="space-y-10">
          {sections.map((section) => {
            const items = groups.filter((g) =>
              matchSubject(g.subject, section.name)
            );
            const color = getSubjectColor(section.name);
            const stageColor =
              STAGE_COLORS[stageShort] || STAGE_COLORS["ثانوي"];
            return (
              <section key={section.name}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl ${color.chip} flex items-center justify-center`}>
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{section.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {items.length > 0
                        ? `${items.length} مجموعة متاحة`
                        : "لا توجد مجموعات لهذه المادة بعد"}
                    </p>
                  </div>
                </div>

                {items.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {items.map((group) => (
                      <ExploreCard
                        key={group.id}
                        group={group}
                        stageColor={stageColor}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                    لا توجد مجموعات منشورة لهذه المادة في صفك حالياً. تابع
                    المنصة للاطلاع على المجموعات الجديدة.
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ExploreCard({
  group,
  stageColor,
}: {
  group: PublicGroup;
  stageColor: string;
}) {
  const color = getSubjectColor(group.subject);
  const maxStudents = group.maxStudentsPerGroup || 20;
  const isFull = (group.studentsCount || 0) >= maxStudents;
  const enrollmentPercent = Math.min(
    Math.round(((group.studentsCount || 0) / maxStudents) * 100),
    100
  );

  return (
    <div className="group bg-card border rounded-3xl overflow-hidden flex flex-col hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-1 transition-all duration-300">
      <div className={`h-1.5 bg-gradient-to-l ${color.gradient}`} />

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${color.chip}`}>
            <BookOpen className="w-3.5 h-3.5" />
            {group.subject}
          </span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${stageColor}`}>
            <Layers className="w-3.5 h-3.5" />
            {group.stage || group.grade}
          </span>
        </div>

        <h3 className="font-cairo text-lg font-bold mb-4 leading-snug">
          {group.title}
        </h3>

        {group.teacher && (
          <Link
            href={`/teachers/${group.teacher.id}`}
            className="inline-flex items-center gap-3 mb-4 hover:bg-muted/60 rounded-2xl p-2.5 -m-2.5 transition-colors"
          >
            <TeacherAvatar
              name={group.teacher.name}
              avatarUrl={group.teacher.avatarUrl}
              className="w-11 h-11"
              textClassName="text-base"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold truncate">
                  {group.teacher.name}
                </span>
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              </div>
              <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                معلم معتمد
              </span>
            </div>
          </Link>
        )}

        {(group.scheduleDays || []).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {group.scheduleDays.slice(0, 3).map((slot, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted text-sm text-muted-foreground"
              >
                <Calendar className="w-3.5 h-3.5" />
                {slot}
              </span>
            ))}
          </div>
        )}

        {(group.learningPoints || []).length > 0 && (
          <div className="flex items-start gap-1.5 mb-4 text-sm text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <span className="line-clamp-1">{group.learningPoints![0]}</span>
          </div>
        )}

        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              الطلاب المسجلين
            </span>
            <span className="text-sm font-bold">
              {group.studentsCount || 0}/{maxStudents}
            </span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isFull
                  ? "bg-emerald-500"
                  : enrollmentPercent >= 75
                  ? "bg-amber-500"
                  : "bg-indigo-500"
              }`}
              style={{ width: `${enrollmentPercent}%` }}
            />
          </div>
        </div>

        <div className="mt-auto pt-4 border-t">
          <div className="flex items-center justify-between gap-3 mb-4">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-500" />
              سعر الحصة
            </span>
            <span className="font-cairo text-xl font-extrabold">
              {group.totalSessionPrice}
              <span className="text-sm font-medium text-muted-foreground mr-1">
                ج.م
              </span>
            </span>
          </div>
          <Link
            href={`/groups/${group.id}`}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-l ${color.gradient} text-white rounded-xl text-base font-semibold hover:opacity-90 shadow-md transition-all`}
          >
            عرض المجموعة
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
