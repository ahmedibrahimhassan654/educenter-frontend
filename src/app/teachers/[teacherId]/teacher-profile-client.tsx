"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import TeacherAvatar from "@/components/teacher-avatar";
import { PublicTeacherProfile } from "@/types";
import {
  ArrowLeft,
  Users,
  Calendar,
  Wallet,
  Loader2,
  ShieldCheck,
  GraduationCap,
  Award,
  Sparkles,
  BookOpen,
  UserPlus,
  Clock,
  MapPin,
  Star,
  Quote,
  Layers,
  ChevronLeft,
} from "lucide-react";
import {
  getSubjectColor,
  getStageFromGrade,
  STAGE_COLORS,
} from "@/lib/subject-colors";

export default function TeacherProfileClient() {
  const params = useParams();
  const teacherId = params.teacherId as string;

  const [teacher, setTeacher] = useState<PublicTeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchTeacher = useCallback(async () => {
    if (!teacherId) return;
    try {
      const res = await api.get(`/teachers/public/${teacherId}`);
      setTeacher(res.data);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    fetchTeacher();
  }, [fetchTeacher]);

  if (loading) {
    return (
      <div className="container py-16">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (notFound || !teacher) {
    return (
      <div className="container py-16">
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold mb-2">المعلم غير موجود</h3>
          <p className="text-muted-foreground mb-6">عذراً، لم نتمكن من العثور على هذا المعلم.</p>
          <Link
            href="/groups"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl text-base font-medium hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            تصفح المجموعات
          </Link>
        </div>
      </div>
    );
  }

  const totalStudents = teacher.groups.reduce((sum, g) => sum + (g.studentsCount || 0), 0);
  const subjects =
    teacher.groups.length > 0
      ? Array.from(new Set(teacher.groups.map((g) => g.subject)))
      : parseSubjects(teacher.curriculum || []);
  const stages =
    teacher.groups.length > 0
      ? Array.from(new Set(teacher.groups.map((g) => g.stage || getStageFromGrade(g.grade))))
      : [];
  const grades =
    teacher.groups.length > 0
      ? Array.from(new Set(teacher.groups.map((g) => g.grade).filter(Boolean)))
      : [];
  const memberSince = teacher.createdAt
    ? new Date(teacher.createdAt).toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
      })
    : "";
  const isVerified = teacher.verificationStatus === "VERIFIED";

  return (
    <div>
      {/* ======================= HERO ======================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-600">
        {/* Geometric pattern */}
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        {/* Ambient glows */}
        <div className="absolute -top-40 -right-40 w-[34rem] h-[34rem] rounded-full bg-white/10 blur-[120px]" />
        <div className="absolute -bottom-48 -left-32 w-[30rem] h-[30rem] rounded-full bg-cyan-300/20 blur-[120px]" />
        <div className="absolute top-1/2 left-1/3 w-72 h-72 rounded-full bg-white/10 blur-[100px]" />

        <div className="container relative pt-8 pb-16 md:pb-24">
          {/* Back link */}
          <Link
            href="/groups"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors group mb-10"
          >
            <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            جميع المجموعات
          </Link>

          <div className="grid lg:grid-cols-[1fr_auto] gap-12 items-end">
            {/* Teacher identity */}
            <div className="animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center gap-8">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-blue-400/50 via-transparent to-cyan-300/40 blur-lg" />
                  <div className="relative rounded-[1.75rem] bg-white/10 backdrop-blur-md border border-white/15 p-2">
                    <TeacherAvatar
                      name={teacher.name}
                      avatarUrl={teacher.avatarUrl}
                      className="w-32 h-32 md:w-36 md:h-36 rounded-[1.35rem]"
                      textClassName="text-6xl"
                    />
                  </div>
                  {isVerified && (
                    <div className="absolute -bottom-3 -left-3 w-12 h-12 rounded-2xl bg-emerald-500 border-4 border-blue-600 flex items-center justify-center shadow-lg shadow-emerald-500/40">
                      <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>

                {/* Name / meta */}
                <div className="text-white">
                  <div className="flex items-center gap-3 flex-wrap mb-4">
                    <h1 className="font-cairo text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
                      {teacher.name}
                    </h1>
                    {isVerified && (
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-400/15 border border-emerald-300/40 text-emerald-200 text-sm font-semibold">
                        <ShieldCheck className="w-4 h-4" />
                        معلم معتمد
                      </span>
                    )}
                  </div>

                  <p className="text-xl md:text-2xl text-white/80 flex items-center gap-2.5 mb-4 font-cairo">
                    <GraduationCap className="w-6 h-6 text-cyan-300" />
                    مدرّس: {subjects.slice(0, 5).join("، ")}
                    {subjects.length > 5 ? "..." : ""}
                  </p>

                  {/* Stage & grade chips */}
                  {(stages.length > 0 || grades.length > 0) && (
                    <div className="flex flex-wrap items-center gap-2">
                      {stages.map((stage) => (
                        <span
                          key={stage}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-400/15 border border-blue-300/30 text-blue-100 text-sm font-medium"
                        >
                          <Layers className="w-4 h-4 text-blue-300" />
                          المرحلة {stage}
                        </span>
                      ))}
                      {grades.map((grade) => (
                        <span
                          key={grade}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/85 text-sm font-medium"
                        >
                          <BookOpen className="w-4 h-4 text-cyan-300" />
                          {grade}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-6 mt-6 text-white/60 text-sm">
                    {memberSince && (
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        عضو منذ {memberSince}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      حصص أونلاين
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hero stat panel */}
            <div className="hidden lg:grid grid-cols-3 gap-3 min-w-[22rem]">
              <HeroStat value={teacher.groups.length} label="مجموعة" icon={<BookOpen className="w-5 h-5" />} color="from-blue-500/20 to-blue-600/10 border-blue-400/25" />
              <HeroStat value={totalStudents} label="طالب" icon={<Users className="w-5 h-5" />} color="from-cyan-400/20 to-cyan-500/10 border-cyan-300/25" />
              <HeroStat value={subjects.length} label="مادة" icon={<Sparkles className="w-5 h-5" />} color="from-indigo-400/20 to-indigo-500/10 border-indigo-300/25" />
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ======================= BODY ======================= */}
      <div className="container py-12 md:py-16">
        <div className="grid lg:grid-cols-[1fr_20rem] gap-10">
          {/* Main column */}
          <div className="min-w-0">
            {/* Stats strip (mobile) */}
            <div className="grid grid-cols-3 gap-3 lg:hidden mb-10">
              <MobileStat value={teacher.groups.length} label="مجموعة" />
              <MobileStat value={totalStudents} label="طالب" />
              <MobileStat value={subjects.length} label="مادة" />
            </div>

            {/* About */}
            {(teacher.bio || teacher.experience) && (
              <section className="mb-12">
                <SectionTitle
                  icon={<Quote className="w-5 h-5" />}
                  title="عن المعلم"
                  subtitle="نبذة وخبرة مهنية"
                />
                <div className="bg-card border rounded-3xl p-7 md:p-9 space-y-6 shadow-sm">
                  {teacher.bio && (
                    <div>
                      <h3 className="flex items-center gap-2 font-cairo text-lg font-bold text-foreground mb-3">
                        <Sparkles className="w-5 h-5 text-violet-500" />
                        نبذة عن المعلم
                      </h3>
                      <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                        {teacher.bio}
                      </p>
                    </div>
                  )}
                  {teacher.experience && (
                    <div className="border-t pt-6">
                      <h3 className="flex items-center gap-2 font-cairo text-lg font-bold text-foreground mb-3">
                        <Award className="w-5 h-5 text-amber-500" />
                        الخبرة المهنية
                      </h3>
                      <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                        {teacher.experience}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Groups */}
            <section>
              <SectionTitle
                icon={<BookOpen className="w-5 h-5" />}
                title="المجموعات المتاحة"
                subtitle="اختر المجموعة التي تناسب مستواك الدراسي"
                count={teacher.groups.length}
              />

              {teacher.groups.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {teacher.groups.map((group, i) => (
                    <TeacherGroupCard key={group.id} group={group} index={i} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-card border rounded-3xl">
                  <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">لا توجد مجموعات متاحة حالياً لهذا المعلم</p>
                </div>
              )}

              {/* CTA */}
              <div className="mt-12 relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-600 p-10 md:p-14 text-center">
                <div
                  className="absolute inset-0 opacity-[0.12]"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                  }}
                />
                <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/10 blur-[100px]" />
                <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-cyan-300/20 blur-[100px]" />
                <div className="relative">
                  <h2 className="font-cairo text-3xl md:text-4xl font-extrabold text-white mb-4">
                    ابدأ رحلتك مع {teacher.name}
                  </h2>
                  <p className="text-lg text-white/70 mb-8 max-w-xl mx-auto">
                    سجّل في إحدى المجموعات المتاحة وتعلّم من أفضل المعلمين المعتمدين
                  </p>
                  <Link
                    href="/register/student"
                    className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-white text-blue-700 rounded-xl text-lg font-bold hover:bg-blue-50 transition-colors shadow-lg shadow-blue-500/20"
                  >
                    <UserPlus className="w-5 h-5" />
                    اشترك الآن
                  </Link>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 h-fit space-y-5">
            <div className="bg-card border rounded-3xl p-6">
              <h3 className="font-cairo text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" />
                لمحة سريعة
              </h3>
              <ul className="space-y-3 text-sm">
                <SidebarItem icon={<BookOpen className="w-4 h-4" />} label="المواد" value={subjects.slice(0, 3).join("، ") || "—"} />
                <SidebarItem icon={<Layers className="w-4 h-4" />} label="المراحل" value={stages.join("، ") || "—"} />
                <SidebarItem icon={<Users className="w-4 h-4" />} label="المجموعات" value={`${teacher.groups.length} مجموعة`} />
                <SidebarItem icon={<ShieldCheck className="w-4 h-4" />} label="الحالة" value={isVerified ? "معتمد" : "قيد المراجعة"} positive={isVerified} />
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-6 text-white">
              <GraduationCap className="w-10 h-10 text-white/90 mb-4" />
              <h3 className="font-cairo text-lg font-bold mb-2">محتوى تفاعلي</h3>
              <p className="text-sm text-white/75 leading-relaxed mb-5">
                شرح مبسّط، تمارين تفاعلية، ومتابعة مستمرة لأدائك.
              </p>
              <Link
                href="/for-students"
                className="inline-flex items-center gap-2 text-sm font-bold text-white bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl px-4 py-2.5 transition-colors"
              >
                اكتشف المزيد
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* ---------- Sub-components ---------- */

function parseSubjects(curriculum: string[]): string[] {
  return Array.from(
    new Set(
      (curriculum || []).map((entry) => {
        const idx = entry.indexOf(":");
        return idx !== -1 ? entry.slice(idx + 1).trim() : entry.trim();
      })
    )
  );
}

function SectionTitle({
  icon,
  title,
  subtitle,
  count,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  count?: number;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-7">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          <h2 className="font-cairo text-2xl md:text-3xl font-extrabold text-foreground">
            {title}
          </h2>
          <p className="text-base text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {typeof count === "number" && count > 0 && (
        <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold whitespace-nowrap">
          {count} مجموعة
        </span>
      )}
    </div>
  );
}

function HeroStat({
  value,
  label,
  icon,
  color,
}: {
  value: number;
  label: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div
      className={`rounded-2xl bg-gradient-to-br ${color} border backdrop-blur-md p-4 flex flex-col items-center justify-center text-center`}
    >
      <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white mb-2">
        {icon}
      </div>
      <div className="font-cairo text-2xl font-extrabold text-white">{value}</div>
      <div className="text-xs text-white/70 mt-0.5">{label}</div>
    </div>
  );
}

function MobileStat({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-card border rounded-2xl p-4 text-center">
      <div className="font-cairo text-2xl font-extrabold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function SidebarItem({
  icon,
  label,
  value,
  positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="inline-flex items-center gap-2 text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </span>
      <span
        className={`text-left font-semibold ${
          positive ? "text-emerald-500" : "text-foreground"
        }`}
      >
        {value}
      </span>
    </li>
  );
}

function TeacherGroupCard({
  group,
  index,
}: {
  group: PublicTeacherProfile["groups"][number];
  index: number;
}) {
  const color = getSubjectColor(group.subject);
  const stage = group.stage || getStageFromGrade(group.grade);
  const stageColor = STAGE_COLORS[stage] || STAGE_COLORS["ثانوي"];
  const maxStudents = group.maxStudentsPerGroup || 20;
  const enrollmentPercent = Math.min(
    Math.round(((group.studentsCount || 0) / maxStudents) * 100),
    100
  );
  const isFull = (group.studentsCount || 0) >= maxStudents;

  return (
    <div
      className="group bg-card border rounded-3xl overflow-hidden flex flex-col hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className={`h-1.5 bg-gradient-to-l ${color.gradient}`} />
      <div className="p-6 md:p-7 flex-1 flex flex-col">
        {/* Chips */}
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${color.chip}`}>
            {group.subject}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${stageColor}`}>
            {stage}
          </span>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-muted text-muted-foreground">
            {group.grade}
          </span>
        </div>

        <h3 className="font-cairo text-lg font-bold mb-4 leading-snug">{group.title}</h3>

        {(group.scheduleDays || []).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
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

        {/* Enrollment */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              الطلاب
            </span>
            <span className={`text-sm font-bold ${isFull ? "text-emerald-500" : "text-foreground"}`}>
              {group.studentsCount || 0}/{maxStudents}
            </span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isFull ? "bg-emerald-500" : enrollmentPercent >= 75 ? "bg-amber-500" : "bg-indigo-500"
              }`}
              style={{ width: `${enrollmentPercent}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-5 border-t flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-500" />
            <span className="text-base font-bold font-cairo">
              {group.totalSessionPrice}
              <span className="text-sm font-medium text-muted-foreground mr-1">ج.م</span>
            </span>
          </div>
          <Link
            href={`/groups/${group.id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary/10 text-primary rounded-xl text-sm font-semibold hover:bg-primary hover:text-white transition-colors"
          >
            عرض المجموعة
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}