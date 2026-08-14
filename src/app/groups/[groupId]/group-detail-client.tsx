"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import TeacherAvatar from "@/components/teacher-avatar";
import { PublicGroupDetail } from "@/types";
import {
  ArrowLeft,
  Users,
  Calendar,
  Wallet,
  Loader2,
  ShieldCheck,
  GraduationCap,
  Award,
  Clock,
  Sparkles,
  BadgeCheck,
  UserPlus,
  LogIn,
  Layers,
  BookOpen,
  ChevronLeft,
} from "lucide-react";
import {
  getSubjectColor,
  STAGE_COLORS,
  getStageFromGrade,
} from "@/lib/subject-colors";

export default function GroupDetailClient() {
  const params = useParams();
  const groupId = params.groupId as string;

  const [group, setGroup] = useState<PublicGroupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchGroup = useCallback(async () => {
    if (!groupId) return;
    try {
      const res = await api.get(`/groups/public/${groupId}`);
      setGroup(res.data);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

  if (loading) {
    return (
      <div className="container py-16">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (notFound || !group) {
    return (
      <div className="container py-16">
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold mb-2">المجموعة غير موجودة</h3>
          <p className="text-muted-foreground mb-6">
            ربما تم إغلاق المجموعة أو إزالتها من المنصة.
          </p>
          <Link
            href="/groups"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl text-base font-medium hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            العودة للمجموعات
          </Link>
        </div>
      </div>
    );
  }

  const color = getSubjectColor(group.subject);
  const stage = group.stage || getStageFromGrade(group.grade);
  const stageColor = STAGE_COLORS[stage] || STAGE_COLORS["ثانوي"];
  const maxStudents = group.maxStudentsPerGroup || 20;
  const enrollmentPercent = Math.min(
    Math.round(((group.studentsCount || 0) / maxStudents) * 100),
    100
  );
  const isFull = (group.studentsCount || 0) >= maxStudents;
  const teacher = group.teacher;
  const weeklySessions = (group.scheduleDays || []).length;

  return (
    <div className="pb-32">
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
        <div className="absolute -top-40 -right-40 w-[34rem] h-[34rem] rounded-full bg-white/10 blur-[130px]" />
        <div className="absolute -bottom-48 -left-32 w-[30rem] h-[30rem] rounded-full bg-cyan-300/20 blur-[120px]" />
        <div className="absolute top-1/2 left-1/3 w-72 h-72 rounded-full bg-white/10 blur-[100px]" />

        <div className="container relative pt-8 pb-14 md:pb-20">
          <Link
            href="/groups"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors group mb-8"
          >
            <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            جميع المجموعات
          </Link>

          <div className="animate-fade-in">
            {/* Chips */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold border ${color.chip}`}>
                <BookOpen className="w-4 h-4" />
                {group.subject}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold ${stageColor}`}>
                <Layers className="w-4 h-4" />
                {stage}
              </span>
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/85 text-sm font-semibold">
                <GraduationCap className="w-4 h-4 text-cyan-300" />
                {group.grade}
              </span>
            </div>

            <h1 className="font-cairo text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-5 leading-tight max-w-3xl">
              {group.title}
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed">
              مجموعة دراسية احترافية يقودها معلم معتمد لمساعدتك على التفوق
            </p>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ======================= BODY ======================= */}
      <div className="container py-10 md:py-14 grid lg:grid-cols-[1fr_20rem] gap-10">
        {/* Main column */}
        <div className="min-w-0 space-y-8">
          {/* Teacher card */}
          {teacher && (
            <section className="bg-card border rounded-3xl p-6 md:p-8 shadow-sm">
              <h2 className="font-cairo text-xl font-extrabold text-foreground mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </span>
                المعلم المسؤول
              </h2>
              <div className="flex items-start gap-5">
                <TeacherAvatar
                  name={teacher.name}
                  avatarUrl={teacher.avatarUrl}
                  className="w-16 h-16 md:w-20 md:h-20"
                  textClassName="text-2xl"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/teachers/${teacher.id}`}
                      className="font-cairo text-xl font-bold text-foreground hover:text-primary transition-colors"
                    >
                      {teacher.name}
                    </Link>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium border border-emerald-500/30">
                      <ShieldCheck className="w-4 h-4" />
                      معتمد
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    مدرّس {group.subject} - {group.grade}
                  </p>

                  <div className="mt-4 space-y-3">
                    {teacher.experience && (
                      <div className="flex items-start gap-3">
                        <Award className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-base text-foreground leading-relaxed">
                          {teacher.experience}
                        </p>
                      </div>
                    )}
                    {teacher.bio && (
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-violet-500 shrink-0 mt-0.5" />
                        <p className="text-base text-muted-foreground leading-relaxed">
                          {teacher.bio}
                        </p>
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/teachers/${teacher.id}`}
                    className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-primary/10 text-primary rounded-xl text-base font-semibold hover:bg-primary hover:text-white transition-colors"
                  >
                    عرض صفحة المعلم
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </section>
          )}

          {/* Schedule */}
          <section className="bg-card border rounded-3xl p-6 md:p-8 shadow-sm">
            <h3 className="font-cairo text-lg font-extrabold text-foreground mb-6 flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-amber-500" />
              </span>
              مواعيد الحصص الأسبوعية
            </h3>
            {weeklySessions > 0 ? (
              <div className="flex flex-wrap gap-3">
                {group.scheduleDays.map((slot, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-muted/60 border rounded-xl text-base"
                  >
                    <Clock className="w-4 h-4 text-primary" />
                    {slot}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">لم يتم تحديد مواعيد بعد</p>
            )}
          </section>

          {/* Why join */}
          <section className="bg-card border rounded-3xl p-6 md:p-8 shadow-sm">
            <h3 className="font-cairo text-lg font-extrabold text-foreground mb-6 flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                <BadgeCheck className="w-5 h-5 text-emerald-500" />
              </span>
              لماذا تنضم لهذه المجموعة؟
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "شرح مبسّط ومنهجي للمادة",
                "متابعة دورية لتقدمك",
                "مواعيد ثابتة أسبوعياً",
                "مجموعة محدودة العدد لتركيز أفضل",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-muted/40 border border-transparent hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-colors"
                >
                  <BadgeCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-base text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar: summary + CTA */}
        <aside className="h-fit lg:sticky lg:top-24 space-y-5">
          <div className="bg-card border rounded-3xl p-6 shadow-sm">
            <h3 className="font-cairo text-lg font-extrabold text-foreground mb-6">
              ملخص المجموعة
            </h3>

            {/* Price */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-500" />
                <span className="text-base text-muted-foreground">سعر الحصة</span>
              </div>
              <div className="font-cairo text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {group.totalSessionPrice}
                <span className="text-base font-medium mr-1">ج.م</span>
              </div>
            </div>

            {/* Enrollment */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-base text-muted-foreground flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  الطاقة الاستيعابية
                </span>
                <span className="font-bold text-foreground">
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
              <p className="text-sm text-muted-foreground mt-2">
                {isFull
                  ? "المجموعة مكتملة العدد"
                  : `${maxStudents - (group.studentsCount || 0)} مقاعد متبقية`}
              </p>
            </div>

            {/* Sessions count */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 mb-6">
              <span className="text-base text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                حصص أسبوعياً
              </span>
              <span className="font-cairo font-bold text-foreground">{weeklySessions}</span>
            </div>

            {/* CTA */}
            <div className="space-y-3">
              <Link
                href="/register/student"
                className={`w-full flex items-center justify-center gap-2 px-5 py-4 bg-gradient-to-l ${color.gradient} text-white rounded-xl text-lg font-bold hover:opacity-90 shadow-lg transition-all`}
              >
                <UserPlus className="w-5 h-5" />
                اشترك في المجموعة الآن
              </Link>
              <Link
                href="/login"
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 border-2 border-border rounded-xl text-base font-medium hover:bg-muted transition-colors"
              >
                <LogIn className="w-5 h-5" />
                لديك حساب؟ سجّل الدخول
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-background/95 backdrop-blur-md border-t p-4">
        <div className="container flex items-center justify-between gap-4">
          <div>
            <div className="font-cairo text-xl font-extrabold">
              {group.totalSessionPrice}
              <span className="text-sm font-medium text-muted-foreground mr-1">ج.م / حصة</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {isFull ? "المجموعة مكتملة" : `${maxStudents - (group.studentsCount || 0)} مقعد متبقي`}
            </p>
          </div>
          <Link
            href="/register/student"
            className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-l ${color.gradient} text-white rounded-xl text-base font-bold hover:opacity-90 shadow-lg`}
          >
            اشترك الآن
            <UserPlus className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}