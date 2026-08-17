"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import TeacherAvatar from "@/components/teacher-avatar";
import Reveal from "@/components/reveal";
import { useAuth } from "@/components/auth-provider";
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
  UserCheck,
  Hourglass,
  LogIn,
  Layers,
  BookOpen,
  ChevronLeft,
  CheckCircle2,
  PlayCircle,
  TrendingUp,
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
  const [mounted, setMounted] = useState(false);
  const [memberStatus, setMemberStatus] = useState<
    "loading" | "member" | "pending" | "notMember"
  >("loading");
  const [submitting, setSubmitting] = useState(false);
  const [joinError, setJoinError] = useState("");
  const { user } = useAuth();

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

  useEffect(() => {
    if (!user || user.role !== "STUDENT") return;
    let active = true;
    api
      .get(`/groups/${groupId}`)
      .then((res) => {
        if (!active) return;
        const d = res.data;
        if (d.isMember) setMemberStatus("member");
        else if (d.joinRequest) setMemberStatus("pending");
        else setMemberStatus("notMember");
      })
      .catch(() => {
        if (active) setMemberStatus("notMember");
      });
    return () => {
      active = false;
    };
  }, [user, groupId]);

  const handleJoin = async () => {
    setSubmitting(true);
    setJoinError("");
    try {
      await api.post(`/groups/${groupId}/join-request`);
      setMemberStatus("pending");
    } catch (e: any) {
      setJoinError(
        e?.response?.data?.message || "حدث خطأ أثناء إرسال الطلب، حاول مرة أخرى"
      );
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

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
  const studentsCount = group.studentsCount || 0;
  const seatsLeft = Math.max(0, maxStudents - studentsCount);
  const enrollmentPercent = Math.min(
    Math.round((studentsCount / maxStudents) * 100),
    100
  );
  const isFull = studentsCount >= maxStudents;
  const teacher = group.teacher;
  const weeklySessions = (group.scheduleDays || []).length;

  const heroStats = [
    {
      Icon: Wallet,
      label: "سعر الحصة",
      value: `${group.totalSessionPrice} ج.م`,
    },
    {
      Icon: Users,
      label: isFull ? "الحالة" : "مقاعد متبقية",
      value: isFull ? "مكتملة" : `${seatsLeft}`,
    },
    {
      Icon: Calendar,
      label: "حصص أسبوعياً",
      value: `${weeklySessions}`,
    },
  ];

  const barColor = isFull
    ? "bg-emerald-500"
    : enrollmentPercent >= 75
    ? "bg-amber-500"
    : "bg-indigo-500";

  return (
    <div className="pb-32">
      {/* ======================= HERO ======================= */}
      <section
        className={`relative overflow-hidden bg-gradient-to-br ${color.gradient}`}
      >
        {/* Geometric pattern */}
        <div
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        {/* Ambient glows */}
        <div className="absolute -top-40 -right-40 w-[34rem] h-[34rem] rounded-full bg-white/15 blur-[130px] animate-float" />
        <div className="absolute -bottom-48 -left-32 w-[30rem] h-[30rem] rounded-full bg-cyan-300/25 blur-[120px] animate-float" style={{ animationDelay: "1.2s" }} />
        <div className="absolute top-1/2 left-1/3 w-72 h-72 rounded-full bg-white/10 blur-[100px]" />

        <div className="container relative pt-8 pb-14 md:pb-20">
          <Link
            href="/groups"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors group mb-8 animate-fade-in"
          >
            <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            جميع المجموعات
          </Link>

          {/* Chips */}
          <div
            className="flex flex-wrap items-center gap-2 mb-5 animate-fade-in"
            style={{ animationDelay: "100ms" }}
          >
            <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold border bg-white/95 ${color.text}`}>
              <BookOpen className="w-4 h-4" />
              {group.subject}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold bg-white/90 ${stageColor.split(" ")[1]}`}>
              <Layers className="w-4 h-4" />
              {stage}
            </span>
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm font-semibold">
              <GraduationCap className="w-4 h-4 text-cyan-200" />
              {group.grade}
            </span>
          </div>

          {/* Title + subtitle */}
          <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
            <h1 className="font-cairo text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-5 leading-tight max-w-3xl">
              {group.title}
            </h1>
            <p className="text-lg md:text-xl text-white/75 max-w-2xl leading-relaxed">
              مجموعة دراسية احترافية يقودها معلم معتمد لمساعدتك على التفوق
            </p>
          </div>

          {/* Key stats */}
          <div
            className="flex flex-wrap gap-3 mt-8 animate-fade-in"
            style={{ animationDelay: "320ms" }}
          >
            {heroStats.map(({ Icon, label, value }, i) => (
              <div
                key={label}
                className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 text-white backdrop-blur-sm"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/15">
                  <Icon className="w-5 h-5" />
                </span>
                <span>
                  <span className="block text-xs text-white/70">{label}</span>
                  <span className="block font-cairo text-lg font-extrabold leading-tight">
                    {value}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ======================= BODY ======================= */}
      <div className="container py-10 md:py-14 grid lg:grid-cols-[1fr_20rem] gap-10">
        {/* Main column */}
        <div className="min-w-0 space-y-8">
          {/* Description Video (featured, right after hero) */}
          {group.descriptionVideo && (
            <Reveal>
              <section className="bg-card border rounded-3xl p-4 md:p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3 mb-4 px-1">
                  <h3 className="font-cairo text-lg font-extrabold text-foreground flex items-center gap-3">
                    <span className="w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                      <PlayCircle className="w-5 h-5 text-cyan-500" />
                    </span>
                    فيديو وصف المجموعة
                  </h3>
                  <span className="hidden sm:inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Sparkles className="w-4 h-4 text-cyan-500" />
                    شاهد قبل الانضمام
                  </span>
                </div>
                <div className="relative rounded-2xl overflow-hidden bg-muted shadow-inner ring-1 ring-black/5">
                  <video
                    src={group.descriptionVideo}
                    controls
                    className="w-full max-h-[28rem]"
                  />
                </div>
              </section>
            </Reveal>
          )}

          {/* Learning Points */}
          {(group.learningPoints || []).length > 0 && (
            <Reveal delay={80}>
              <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-violet-500/[0.08] via-fuchsia-500/[0.04] to-transparent p-6 md:p-8">
                <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />
                <h3 className="relative font-cairo text-lg font-extrabold text-foreground mb-6 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-violet-500" />
                  </span>
                  ماذا ستتعلم في هذه المجموعة؟
                </h3>
                <ul className="relative space-y-3">
                  {group.learningPoints!.map((point, i) => (
                    <li
                      key={i}
                      className="group flex items-start gap-3 p-3 rounded-2xl bg-background/70 border transition-colors hover:border-violet-500/40"
                    >
                      <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white text-sm font-bold shadow-md shadow-violet-500/30 shrink-0 mt-0.5 transition-transform duration-300 group-hover:scale-110">
                        {i + 1}
                      </span>
                      <span className="text-base text-foreground leading-relaxed">
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>
          )}

          {/* Teacher */}
          {teacher && (
            <Reveal delay={100}>
              <section className="bg-card border rounded-3xl p-6 md:p-8 shadow-sm transition-shadow hover:shadow-lg">
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
                    className="w-16 h-16 md:w-20 md:h-20 ring-4 ring-primary/15"
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
                      className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-primary/10 text-primary rounded-xl text-base font-semibold hover:bg-primary hover:text-white transition-all"
                    >
                      عرض صفحة المعلم
                      <ArrowLeft className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </section>
            </Reveal>
          )}

          {/* Schedule */}
          <Reveal delay={100}>
            <section className="bg-card border rounded-3xl p-6 md:p-8 shadow-sm transition-shadow hover:shadow-lg">
              <div className="flex items-center justify-between gap-3 mb-6">
                <h3 className="font-cairo text-lg font-extrabold text-foreground flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-amber-500" />
                  </span>
                  مواعيد الحصص الأسبوعية
                </h3>
                {weeklySessions > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm font-bold border border-amber-500/30">
                    <Clock className="w-4 h-4" />
                    {weeklySessions} حصة أسبوعياً
                  </span>
                )}
              </div>
              {weeklySessions > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {group.scheduleDays.map((slot, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-muted/60 border rounded-xl text-base transition-colors hover:border-amber-500/40 hover:bg-amber-500/5"
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
          </Reveal>

          {/* Why join */}
          <Reveal delay={100}>
            <section className="bg-card border rounded-3xl p-6 md:p-8 shadow-sm">
              <h3 className="font-cairo text-lg font-extrabold text-foreground mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <BadgeCheck className="w-5 h-5 text-emerald-500" />
                </span>
                لماذا تنضم لهذه المجموعة؟
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { Icon: BookOpen, text: "شرح مبسّط ومنهجي للمادة" },
                  { Icon: TrendingUp, text: "متابعة دورية لتقدمك" },
                  { Icon: Calendar, text: "مواعيد ثابتة أسبوعياً" },
                  { Icon: Users, text: "مجموعة محدودة العدد لتركيز أفضل" },
                ].map(({ Icon, text }) => (
                  <div
                    key={text}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-muted/40 border border-transparent hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all hover:-translate-y-0.5"
                  >
                    <Icon className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="text-base text-foreground">{text}</span>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>
        </div>

        {/* Sidebar: summary + CTA */}
        <aside className="h-fit lg:sticky lg:top-24 space-y-5">
          <Reveal delay={120}>
            <div className="relative overflow-hidden bg-card border rounded-3xl p-6 shadow-sm">
              <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-l ${color.gradient}`} />
              <div className="absolute -top-12 -left-12 w-44 h-44 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

              <h3 className="relative font-cairo text-lg font-extrabold text-foreground mb-6">
                ملخص المجموعة
              </h3>

              {/* Price */}
              <div
                className={`relative flex items-center justify-between p-4 rounded-2xl bg-gradient-to-l ${color.gradient} mb-4 shadow-lg`}
              >
                <div className="flex items-center gap-2 text-white">
                  <Wallet className="w-5 h-5" />
                  <span className="text-base font-medium">سعر الحصة</span>
                </div>
                <div className="font-cairo text-2xl font-extrabold text-white">
                  {group.totalSessionPrice}
                  <span className="text-base font-medium mr-1">ج.م</span>
                </div>
              </div>

              {/* Enrollment */}
              <div className="relative mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base text-muted-foreground flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    الطاقة الاستيعابية
                  </span>
                  <span className="font-bold text-foreground">
                    {studentsCount}/{maxStudents}
                  </span>
                </div>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor}`}
                    style={{ width: `${mounted ? enrollmentPercent : 0}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {isFull ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      المجموعة مكتملة العدد
                    </span>
                  ) : enrollmentPercent >= 75 ? (
                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                      باقي {seatsLeft} مقاعد فقط — لا تفوّت الفرصة
                    </span>
                  ) : (
                    `${seatsLeft} مقاعد متبقية`
                  )}
                </p>
              </div>

              {/* Sessions count */}
              <div className="relative flex items-center justify-between p-4 rounded-2xl bg-muted/50 mb-6">
                <span className="text-base text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  حصص أسبوعياً
                </span>
                <span className="font-cairo font-bold text-foreground">
                  {weeklySessions}
                </span>
              </div>

              {/* CTA */}
              <div className="relative space-y-3">
                {!user && (
                  <>
                    <Link
                      href="/register/student"
                      className={`group relative w-full flex items-center justify-center gap-2 px-5 py-4 overflow-hidden bg-gradient-to-l ${color.gradient} text-white rounded-xl text-lg font-bold hover:opacity-95 shadow-lg transition-all duration-300 hover:scale-[1.03] active:scale-95`}
                    >
                      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
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
                  </>
                )}

                {user?.role === "STUDENT" && memberStatus === "loading" && (
                  <div className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-muted text-muted-foreground rounded-xl text-base font-medium">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جارٍ التحقق من عضويتك...
                  </div>
                )}

                {user?.role === "STUDENT" && memberStatus === "member" && (
                  <Link
                    href={`/student/my-groups/${groupId}`}
                    className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-lg font-bold shadow-lg transition-all duration-300 hover:scale-[1.03] active:scale-95"
                  >
                    <UserCheck className="w-5 h-5" />
                    أنت عضو — تابع مجموعتك
                  </Link>
                )}

                {user?.role === "STUDENT" && memberStatus === "pending" && (
                  <div className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-amber-500/15 border border-amber-500/40 text-amber-600 dark:text-amber-400 rounded-xl text-base font-bold">
                    <Hourglass className="w-5 h-5" />
                    طلبك قيد مراجعة المعلم
                  </div>
                )}

                {user?.role === "STUDENT" && memberStatus === "notMember" && (
                  <>
                    <button
                      onClick={handleJoin}
                      disabled={submitting}
                      className={`group relative w-full flex items-center justify-center gap-2 px-5 py-4 overflow-hidden bg-gradient-to-l ${color.gradient} text-white rounded-xl text-lg font-bold hover:opacity-95 shadow-lg transition-all duration-300 hover:scale-[1.03] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100`}
                    >
                      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                      {submitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <UserPlus className="w-5 h-5" />
                      )}
                      {submitting ? "جارٍ الإرسال..." : "أرسل طلب انضمام للمعلم"}
                    </button>
                    {joinError && (
                      <p className="text-sm text-center text-red-500 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2">
                        {joinError}
                      </p>
                    )}
                  </>
                )}

                {user && user.role !== "STUDENT" && (
                  <div className="p-4 rounded-xl bg-muted/50 border text-center text-sm text-muted-foreground">
                    الاشتراك في المجموعات متاح لحسابات الطلاب فقط
                  </div>
                )}
              </div>

              {/* Trust row */}
              <div className="relative grid grid-cols-3 gap-2 mt-5">
                {[
                  { Icon: ShieldCheck, label: "معتمد" },
                  { Icon: Users, label: "مقاعد محدودة" },
                  { Icon: BadgeCheck, label: "دفع عند الحجز" },
                ].map(({ Icon, label }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-muted/40 text-center"
                  >
                    <Icon className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs text-muted-foreground leading-tight">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
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
            <p
              className={`text-xs ${
                isFull ? "text-emerald-600" : enrollmentPercent >= 75 ? "text-amber-600" : "text-muted-foreground"
              }`}
            >
              {isFull
                ? "المجموعة مكتملة"
                : enrollmentPercent >= 75
                ? `${seatsLeft} مقاعد فقط متبقية`
                : `${seatsLeft} مقعد متبقي`}
            </p>
          </div>
          {user?.role === "STUDENT" && memberStatus === "member" && (
            <Link
              href={`/student/my-groups/${groupId}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-base font-bold shadow-lg transition-all duration-300 active:scale-95"
            >
              تابع مجموعتك
              <UserCheck className="w-5 h-5" />
            </Link>
          )}

          {user?.role === "STUDENT" && memberStatus === "pending" && (
            <span className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500/15 border border-amber-500/40 text-amber-600 dark:text-amber-400 rounded-xl text-base font-bold">
              <Hourglass className="w-5 h-5" />
              قيد المراجعة
            </span>
          )}

          {user?.role === "STUDENT" && memberStatus === "notMember" && (
            <button
              onClick={handleJoin}
              disabled={submitting}
              className={`relative inline-flex items-center gap-2 px-6 py-3 overflow-hidden bg-gradient-to-l ${color.gradient} text-white rounded-xl text-base font-bold hover:opacity-95 shadow-lg transition-all duration-300 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <UserPlus className="w-5 h-5" />
              )}
              {submitting ? "جارٍ الإرسال..." : "أرسل طلب انضمام"}
            </button>
          )}

          {user?.role === "STUDENT" && memberStatus === "loading" && (
            <span className="inline-flex items-center gap-2 px-6 py-3 bg-muted text-muted-foreground rounded-xl text-base font-medium">
              <Loader2 className="w-5 h-5 animate-spin" />
              جارٍ التحقق...
            </span>
          )}

          {!user && (
            <Link
              href="/register/student"
              className={`relative inline-flex items-center gap-2 px-6 py-3 overflow-hidden bg-gradient-to-l ${color.gradient} text-white rounded-xl text-base font-bold hover:opacity-95 shadow-lg transition-all duration-300 active:scale-95`}
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              اشترك الآن
              <UserPlus className="w-5 h-5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}