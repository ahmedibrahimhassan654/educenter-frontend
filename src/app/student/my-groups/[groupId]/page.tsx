"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import api, { clearCache } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import VideoPlayer from "@/components/video-player";
import { OfflineVideoSection } from "@/components/offline-download";
import { Group, Entitlement } from "@/types";
import { getSubjectColor } from "@/lib/subject-colors";
import { canJoinLive } from "@/lib/lesson-time";
import { toast } from "sonner";
import {
  ArrowLeft,
  Users,
  Calendar,
  Wallet,
  Loader2,
  GraduationCap,
  Clock,
  Layers,
  BookOpen,
  Lock,
  Unlock,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Video,
  LogOut,
  Radio,
  FileText,
  Link2,
  PlayCircle,
  CalendarClock,
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
} from "lucide-react";

interface PurchasePayload {
  type: "LECTURES" | "MONTHLY";
  lectures?: number;
}

interface StudentLesson {
  _id: string;
  title: string;
  description?: string;
  type: "LIVE" | "RECORDED" | "DOCUMENT" | "LINK";
  meetingLink?: string;
  videoUrl?: string;
  documentUrl?: string;
  referenceUrl?: string;
  recordedLiveVideoUrl?: string;
  recordedVideoUrl?: string;
  documents?: string[];
  referenceLinks?: string[];
  scheduleDay?: string;
  scheduleTime?: string;
  scheduledAt?: string;
  createdAt: string;
  opened?: boolean;
  hasRecordedVideo?: boolean;
  hasDocuments?: boolean;
  hasLinks?: boolean;
  _contentLoaded?: boolean;
}

const STUDENT_LESSON_META: Record<
  StudentLesson["type"],
  { label: string; Icon: typeof Video; badge: string }
> = {
  LIVE: { label: "درس مباشر", Icon: Video, badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  RECORDED: { label: "فيديو مسجل", Icon: Radio, badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  DOCUMENT: { label: "مستند", Icon: FileText, badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  LINK: { label: "رابط مرجعي", Icon: Link2, badge: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
};

type LessonFilter = "ALL" | StudentLesson["type"];

const LESSON_FILTERS: { value: LessonFilter; label: string; Icon: typeof Video }[] = [
  { value: "ALL", label: "الكل", Icon: Layers },
  { value: "LIVE", label: "مباشر", Icon: Video },
  { value: "RECORDED", label: "فيديو", Icon: PlayCircle },
  { value: "DOCUMENT", label: "مستندات", Icon: FileText },
  { value: "LINK", label: "روابط", Icon: Link2 },
];

const LESSON_ACCENT: Record<
  StudentLesson["type"],
  { tile: string; text: string }
> = {
  LIVE: { tile: "bg-rose-500/10", text: "text-rose-500" },
  RECORDED: { tile: "bg-blue-500/10", text: "text-blue-500" },
  DOCUMENT: { tile: "bg-amber-500/10", text: "text-amber-500" },
  LINK: { tile: "bg-violet-500/10", text: "text-violet-500" },
};

function liveStatus(
  lesson: StudentLesson
): { label: string; className: string } {
  if (!lesson.scheduledAt) {
    return { label: "مباشر", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" };
  }
  const time = new Date(lesson.scheduledAt).getTime();
  if (canJoinLive(lesson)) {
    return { label: "الحصة الآن", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" };
  }
  if (time < Date.now()) {
    return { label: "انتهت", className: "bg-muted text-muted-foreground" };
  }
  return { label: "قادمة", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" };
}

function formatLessonTime(lesson: StudentLesson): string {
  if (!lesson.scheduledAt) return lesson.scheduleDay || "";
  const date = new Date(lesson.scheduledAt).toLocaleDateString("ar-EG", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return lesson.scheduleTime ? `${date} • ${lesson.scheduleTime}` : date;
}

// Whether a lesson belongs under a filter tab. Content filters match lessons
// that actually contain that kind of content (a LIVE lesson with a recorded
// video or documents counts towards those tabs too, not just standalone
// RECORDED/DOCUMENT/LINK lessons).
function lessonMatchesFilter(lesson: StudentLesson, filter: LessonFilter): boolean {
  switch (filter) {
    case "ALL":
      return true;
    case "LIVE":
      return lesson.type === "LIVE";
    case "RECORDED":
      return lesson.type === "RECORDED" || Boolean(lesson.hasRecordedVideo);
    case "DOCUMENT":
      return lesson.type === "DOCUMENT" || Boolean(lesson.hasDocuments);
    case "LINK":
      return lesson.type === "LINK" || Boolean(lesson.hasLinks);
    default:
      return true;
  }
}

export default function StudentGroupPage() {
  const params = useParams();
  useAuth();
  const router = useRouter();
  const groupId = params.groupId as string;

  const [group, setGroup] = useState<Group | null>(null);
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [lessons, setLessons] = useState<StudentLesson[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [lessonFilter, setLessonFilter] = useState<LessonFilter>("ALL");
  const [openLessons, setOpenLessons] = useState<Set<string>>(new Set());
  const [openingLesson, setOpeningLesson] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [selectedPack, setSelectedPack] = useState(4);
  const [leaving, setLeaving] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const fetchGroup = useCallback(async () => {
    if (!groupId) return;
    try {
      clearCache(`/groups/${groupId}`);
      const res = await api.get(`/groups/${groupId}`);
      const data = res.data as Group & { entitlement?: Entitlement };
      setGroup(data);
      setEntitlement(data.entitlement || null);
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || "فشل في تحميل المجموعة");
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

  const fetchLessons = useCallback(async () => {
    if (!groupId) return;
    setLessonsLoading(true);
    try {
      clearCache(`/groups/${groupId}/lessons`);
      const res = await api.get(`/groups/${groupId}/lessons`);
      setLessons(res.data?.data || []);
    } catch {
      // ignore
    } finally {
      setLessonsLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  // Lessons are always shown in the order of their live-session date (soonest
  // first). Lessons without a scheduled date trail at the end in creation order.
  const sortedLessons = useMemo(() => {
    return [...lessons].sort((a, b) => {
      const ta = a.scheduledAt ? new Date(a.scheduledAt).getTime() : null;
      const tb = b.scheduledAt ? new Date(b.scheduledAt).getTime() : null;
      if (ta !== null && tb !== null) return ta - tb;
      if (ta === null && tb === null)
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return ta === null ? 1 : -1;
    });
  }, [lessons]);

  // A lesson is unlocked once the student paid for it (opened it once) or a
  // monthly subscription is active. Content is fetched per lesson via the open
  // endpoint and merged into the lesson object (_contentLoaded marks it).
  const scrollToBuy = useCallback(() => {
    document
      .getElementById("buy-section")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const isLessonUnlocked = useCallback(
    (lesson: StudentLesson) =>
      entitlement?.monthlyActive ||
      Boolean(lesson.opened) ||
      Boolean(lesson._contentLoaded),
    [entitlement?.monthlyActive]
  );

  const canAffordLesson = Boolean(
    entitlement?.monthlyActive || (entitlement?.remainingCredits ?? 0) > 0
  );

  const toggleLesson = useCallback((lessonId: string) => {
    setOpenLessons((prev) => {
      const next = new Set(prev);
      if (next.has(lessonId)) next.delete(lessonId);
      else next.add(lessonId);
      return next;
    });
  }, []);

  // Open a lesson: the first time it consumes one credit (unless the student is
  // on a monthly subscription) and fetches the full content. Already-unlocked
  // lessons with loaded content just expand/collapse; unlocked lessons whose
  // content is not in the list (e.g. after a page reload) refetch it for free.
  // Students without credits see the lock prompt instead.
  const openLesson = useCallback(
    async (lesson: StudentLesson) => {
      if (openingLesson) return;
      const unlocked = isLessonUnlocked(lesson);
      if (unlocked && lesson._contentLoaded) {
        toggleLesson(lesson._id);
        return;
      }
      if (!unlocked && !canAffordLesson) {
        toggleLesson(lesson._id);
        return;
      }
      setOpeningLesson(lesson._id);
      try {
        const res = await api.post(`/groups/${groupId}/lessons/${lesson._id}/open`);
        const content = res.data?.data;
        const consumedCredit = Boolean(res.data?.consumedCredit);
        setLessons((prev) =>
          prev.map((l) =>
            l._id === lesson._id
              ? { ...l, ...content, opened: true, _contentLoaded: true }
              : l
          )
        );
        const remaining = res.data?.remainingCredits;
        if (typeof remaining === "number") {
          setEntitlement((prev) =>
            prev
              ? {
                  ...prev,
                  remainingCredits: remaining,
                  monthlyActive: Boolean(res.data?.monthlyActive),
                  hasAccess: Boolean(
                    prev.monthlyActive || remaining > 0
                  ),
                }
              : prev
          );
        }
        setOpenLessons((prev) => new Set(prev).add(lesson._id));
        if (consumedCredit) {
          toast.success("تم فتح الدرس", {
            description: "تم خصم حصة واحدة من رصيدك",
          });
        }
      } catch (error) {
        const axiosError = error as {
          response?: { status?: number; data?: { message?: string } };
        };
        if (axiosError.response?.status === 402) {
          toast.error(
            axiosError.response?.data?.message ||
              "لا توجد حصص متبقية — اشترِ حصصاً لفتح الدرس",
            { description: "يمكنك شراء حصص أو تفعيل اشتراك شهري" }
          );
          scrollToBuy();
        } else {
          toast.error(
            axiosError.response?.data?.message || "فشل في فتح الدرس"
          );
        }
      } finally {
        setOpeningLesson(null);
      }
    },
    [groupId, openingLesson, isLessonUnlocked, canAffordLesson, toggleLesson, scrollToBuy]
  );

  // Re-render periodically so the live join button appears automatically once
  // a lesson's 15-minute join window opens (canJoinLive depends on the clock).
  const [, setNowTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setNowTick((n) => n + 1), 30_000);
    return () => clearInterval(timer);
  }, []);

  const handleLeave = async () => {
    setLeaving(true);
    try {
      await api.delete(`/groups/${groupId}/membership`);
      toast.success("تم إلغاء اشتراكك في المجموعة");
      router.push("/student/my-groups");
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(
        axiosError.response?.data?.message || "حدث خطأ أثناء إلغاء الاشتراك"
      );
    } finally {
      setLeaving(false);
    }
  };

  const handleBuy = async (payload: PurchasePayload) => {
    setBuying(true);
    try {
      const res = await api.post(`/groups/${groupId}/purchases`, payload);
      const purchase = res.data?.data;
      const label =
        payload.type === "MONTHLY"
          ? "تم تفعيل اشتراكك الشهري بنجاح"
          : `تم شراء ${purchase?.lectures || payload.lectures} حصة بنجاح`;
      toast.success(label, {
        description:
          payload.type === "MONTHLY"
            ? "جميع دروس المجموعة مفتوحة لك أثناء اشتراكك"
            : "أُضيفت الحصص إلى محفظتك ويمكنك فتح الدروس منها",
        duration: 5000,
      });
      await fetchGroup();
      await fetchLessons();
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || "فشل في إتمام العملية");
    } finally {
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-bold mb-2">المجموعة غير موجودة</h3>
        <Link
          href="/student/my-groups"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl text-base font-medium hover:bg-primary/90 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          العودة لمجموعاتي
        </Link>
      </div>
    );
  }

  const color = getSubjectColor(group.subject);
  const teacher =
    typeof group.teacherId === "object" ? group.teacherId : null;
  const teacherName =
    teacher?.name || (group.teacherId as string) || "غير محدد";
  const weekly = (group.scheduleDays || []).length;
  const unitPrice = group.totalSessionPrice || 0;
  const monthlyPrice = weekly > 0 ? weekly * unitPrice * 4 : unitPrice;
  const packOptions = [1, 2, 4, 6, 8, 10];
  const packPrice = selectedPack * unitPrice;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-600 rounded-3xl p-8 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div className="relative">
          <Link
            href="/student/my-groups"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            مجموعة
          </Link>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold border ${color.chip}`}>
              <BookOpen className="w-4 h-4" />
              {group.subject}
            </span>
            {group.stage && (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold bg-white/10 border border-white/20 text-white/85">
                <Layers className="w-4 h-4" />
                {group.stage}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold bg-white/10 border border-white/20 text-white/85">
              <GraduationCap className="w-4 h-4 text-cyan-300" />
              {group.grade}
            </span>
          </div>
          <h1 className="font-cairo text-3xl md:text-4xl font-extrabold text-white">
            {group.title}
          </h1>
          <p className="text-white/70 mt-2">
            متابعة الأنشطة مجاناً، وشراء الحصص لفتح الحصص المباشرة
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_22rem] gap-8">
        {/* Main column */}
        <div className="min-w-0 space-y-6">
          {/* Entitlement card */}
          <div className="bg-card border rounded-2xl p-6">
            <h3 className="font-cairo text-lg font-extrabold mb-4 flex items-center gap-2">
              <span className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-emerald-500" />
              </span>
              اشتراكاتي
            </h3>
            {entitlement?.monthlyActive && entitlement.monthlyExpiresAt ? (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
                <div>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">
                    اشتراك شهري نشط
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ساري حتى{" "}
                    {new Date(entitlement.monthlyExpiresAt).toLocaleDateString("ar-EG")} - جميع الحصص مفتوحة
                  </p>
                </div>
              </div>
            ) : entitlement && entitlement.remainingCredits > 0 ? (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <CheckCircle2 className="w-6 h-6 text-blue-500 shrink-0" />
                <div>
                  <p className="font-bold text-blue-600 dark:text-blue-400">
                    {entitlement.remainingCredits} حصة متبقية
                  </p>
                  <p className="text-sm text-muted-foreground">
                    استخدم حصصك لفتح الحصص المباشرة
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                <Lock className="w-6 h-6 text-muted-foreground shrink-0" />
                <div>
                  <p className="font-bold">لا يوجد اشتراك نشط</p>
                  <p className="text-sm text-muted-foreground">
                    يمكنك مشاهدة تفاصيل المجموعة مجاناً، واشترِ الحصص لفتح الحصص المباشرة
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Teacher */}
          {teacher && (
            <div className="bg-card border rounded-2xl p-6">
              <h3 className="font-cairo text-lg font-extrabold mb-4 flex items-center gap-2">
                <span className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </span>
                المعلم المسؤول
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                  {teacherName.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-lg">{teacherName}</p>
                  <p className="text-sm text-muted-foreground">
                    مدرّس {group.subject} - {group.grade}
                  </p>
                </div>
              </div>
              {teacher.verificationData?.experience && (
                <p className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
                  <Sparkles className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                  {teacher.verificationData.experience}
                </p>
              )}
            </div>
          )}

          {/* Schedule */}
          <div className="bg-card border rounded-2xl p-6">
            <h3 className="font-cairo text-lg font-extrabold mb-4 flex items-center gap-2">
              <span className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-amber-500" />
              </span>
              مواعيد الحصص الأسبوعية
            </h3>
            {weekly > 0 ? (
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
          </div>

          {/* Learning Points */}
          {(group.learningPoints || []).length > 0 && (
            <div className="bg-card border rounded-2xl p-6">
              <h3 className="font-cairo text-lg font-extrabold mb-4 flex items-center gap-2">
                <span className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-violet-500" />
                </span>
                ماذا ستتعلم في هذه المجموعة؟
              </h3>
              <ul className="space-y-3">
                {group.learningPoints!.map((point, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-violet-500/10 text-violet-500 text-xs font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <span className="text-sm text-muted-foreground">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Description Video */}
          {group.descriptionVideo && (
            <div className="bg-card border rounded-2xl p-6">
              <h3 className="font-cairo text-lg font-extrabold mb-4 flex items-center gap-2">
                <span className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <Video className="w-5 h-5 text-cyan-500" />
                </span>
                فيديو وصف المجموعة
              </h3>
              <VideoPlayer
                src={group.descriptionVideo}
                className="w-full max-h-96"
              />
            </div>
          )}

          {/* Lessons */}
          <div className="bg-card border rounded-2xl p-6">
            <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
              <h3 className="font-cairo text-lg font-extrabold flex items-center gap-2">
                <span className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-violet-500" />
                </span>
                دروس المجموعة
              </h3>
              {lessons.length > 0 && (
                <span className="px-3 py-1 rounded-full bg-muted text-xs font-bold text-muted-foreground">
                  {lessons.length} درس
                </span>
              )}
            </div>

            {lessons.length > 0 && (
              <div className="mb-4 flex items-center gap-2 flex-wrap">
                {canAffordLesson ? (
                  <>
                    {entitlement?.monthlyActive ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        اشتراك شهري مفعل — كل الدروس مفتوحة
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                        <CircleDollarSign className="w-3.5 h-3.5" />
                        رصيدك: {entitlement?.remainingCredits ?? 0} حصة
                      </span>
                    )}
                    {!entitlement?.monthlyActive && (
                      <span className="text-[11px] text-muted-foreground">
                        فتح الدرس يخصم حصة واحدة من رصيدك — الدرس يبقى مفتوحاً بعدها
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-[11px] text-muted-foreground">
                    اشترِ الحصص أو فعّل اشتراكاً شهرياً لفتح الدروس
                  </span>
                )}
              </div>
            )}

            {lessonsLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : lessons.length === 0 ? (
              <div className="text-center py-10">
                <p className="font-bold mb-1">لا توجد دروس بعد</p>
                <p className="text-sm text-muted-foreground">
                  سيقوم المعلم بإضافة الدروس هنا قريباً
                </p>
              </div>
            ) : (
              <>
                {/* Type filter */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {LESSON_FILTERS.map(({ value, label, Icon }) => {
                    const active = lessonFilter === value;
                    const count = sortedLessons.filter((l) =>
                      lessonMatchesFilter(l, value)
                    ).length;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setLessonFilter(value)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                          active
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-muted/60 text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                        <span
                          className={`${
                            active ? "bg-white/20" : "bg-background"
                          } px-1.5 rounded-full text-[10px]`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Lessons list */}
                <div className="space-y-2.5">
                  {sortedLessons
                    .filter((l) => lessonMatchesFilter(l, lessonFilter))
                    .map((lesson, index) => {
                      const meta = STUDENT_LESSON_META[lesson.type];
                      const accent = LESSON_ACCENT[lesson.type];
                      const status =
                        lesson.type === "LIVE" ? liveStatus(lesson) : null;
                      const unlocked = isLessonUnlocked(lesson);
                      const isOpen = openLessons.has(lesson._id);
                      const isBusy = openingLesson === lesson._id;
                      return (
                        <div
                          key={lesson._id}
                          className={`rounded-2xl border overflow-hidden transition-all ${
                            unlocked ? "bg-card" : "bg-muted/40 border-dashed"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => openLesson(lesson)}
                            className="w-full flex items-center gap-3 p-4 text-right hover:bg-muted/40 transition-colors"
                          >
                            <span className="shrink-0 w-8 h-8 rounded-lg bg-muted text-muted-foreground text-xs font-bold flex items-center justify-center">
                              {index + 1}
                            </span>
                            <span
                              className={`shrink-0 w-11 h-11 rounded-xl ${accent.tile} flex items-center justify-center`}
                            >
                              <meta.Icon className={`w-5 h-5 ${accent.text}`} />
                            </span>
                            <span className="flex-1 min-w-0">
                              <span className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold">{lesson.title}</span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${meta.badge}`}
                                >
                                  {meta.label}
                                </span>
                                {status && (
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${status.className}`}
                                  >
                                    {status.label}
                                  </span>
                                )}
                              </span>
                              <span className="flex items-center gap-2 flex-wrap mt-1">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/60 text-[11px] text-muted-foreground">
                                  <CalendarClock className="w-3 h-3" />
                                  {formatLessonTime(lesson)}
                                </span>
                                <span
                                  className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                                    unlocked
                                      ? "text-emerald-600 dark:text-emerald-400"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {unlocked ? (
                                    <Unlock className="w-3 h-3" />
                                  ) : (
                                    <Lock className="w-3 h-3" />
                                  )}
                                  {unlocked ? "مدفوعة من رصيدك" : "غير مدفوعة بعد"}
                                </span>
                              </span>
                            </span>
                            {isBusy ? (
                              <Loader2 className="w-5 h-5 animate-spin text-primary shrink-0" />
                            ) : isOpen ? (
                              <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
                            )}
                          </button>

                          {isOpen && (
                            <div className="border-t px-4 py-4 bg-muted/30 space-y-3">
                              {unlocked ? (
                              <>
                                {lesson.description && (
                                  <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">
                                    {lesson.description}
                                  </p>
                                )}

                                <div className="mt-3 space-y-3">
                                  {lesson.type === "LIVE" && (
                                    <div className="flex flex-wrap items-center gap-2.5">
                                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/60 text-xs font-medium text-muted-foreground">
                                        <CalendarClock className="w-3.5 h-3.5" />
                                        {formatLessonTime(lesson)}
                                      </span>
                                      {canJoinLive(lesson) && lesson.meetingLink ? (
                                        <a
                                          href={lesson.meetingLink}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition-colors"
                                        >
                                          <Video className="w-3.5 h-3.5" />
                                          انضمام للبث المباشر
                                        </a>
                                      ) : (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted text-muted-foreground rounded-lg text-xs font-medium">
                                          <Clock className="w-3.5 h-3.5" />
                                          يُفتح رابط الحصة قبل بدايتها بـ 15 دقيقة
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  {lesson.type === "LIVE" &&
                                    lesson.recordedLiveVideoUrl && (
                                      <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-3 space-y-2">
                                        <p className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                                          <Radio className="w-3.5 h-3.5" />
                                          تسجيل الحصة
                                        </p>
                                        <OfflineVideoSection
                                          groupId={groupId}
                                          lessonId={lesson._id}
                                          field="recordedLiveVideoUrl"
                                          url={lesson.recordedLiveVideoUrl}
                                          title="تسجيل الحصة"
                                          className="w-full max-h-56"
                                        />
                                      </div>
                                    )}

                                  {lesson.type === "LIVE" &&
                                    lesson.recordedVideoUrl && (
                                      <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-3 space-y-2">
                                        <p className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                                          <PlayCircle className="w-3.5 h-3.5" />
                                          فيديو إضافي
                                        </p>
                                        <OfflineVideoSection
                                          groupId={groupId}
                                          lessonId={lesson._id}
                                          field="recordedVideoUrl"
                                          url={lesson.recordedVideoUrl}
                                          title="فيديو إضافي"
                                          className="w-full max-h-56"
                                        />
                                      </div>
                                    )}

                                  {lesson.type === "LIVE" &&
                                    Array.isArray(lesson.documents) &&
                                    lesson.documents.length > 0 && (
                                      <div className="space-y-1.5">
                                        <p className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                                          <FileText className="w-3.5 h-3.5" />
                                          المستندات ({lesson.documents.length})
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                          {lesson.documents.map((doc, i) => (
                                            <a
                                              key={i}
                                              href={doc}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors"
                                            >
                                              <FileText className="w-3.5 h-3.5" />
                                              فتح المستند {i + 1}
                                            </a>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                  {lesson.type === "LIVE" &&
                                    Array.isArray(lesson.referenceLinks) &&
                                    lesson.referenceLinks.length > 0 && (
                                      <div className="space-y-1.5">
                                        <p className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                                          <Link2 className="w-3.5 h-3.5" />
                                          الروابط المرجعية ({lesson.referenceLinks.length})
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                          {lesson.referenceLinks.map((link, i) => (
                                            <a
                                              key={i}
                                              href={link}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors"
                                            >
                                              <Link2 className="w-3.5 h-3.5" />
                                              فتح الرابط المرجعي {i + 1}
                                            </a>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                  {lesson.type === "RECORDED" && lesson.videoUrl && (
                                    <div className="flex flex-wrap gap-2">
                                      <a
                                        href={lesson.videoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors"
                                      >
                                        <PlayCircle className="w-3.5 h-3.5" />
                                        مشاهدة الفيديو
                                      </a>
                                    </div>
                                  )}

                                  {lesson.type === "DOCUMENT" &&
                                    lesson.documentUrl && (
                                      <div className="flex flex-wrap gap-2">
                                        <a
                                          href={lesson.documentUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors"
                                        >
                                          <FileText className="w-3.5 h-3.5" />
                                          فتح المستند
                                        </a>
                                      </div>
                                    )}

                                  {lesson.type === "LINK" &&
                                    lesson.referenceUrl && (
                                      <div className="flex flex-wrap gap-2">
                                        <a
                                          href={lesson.referenceUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors"
                                        >
                                          <Link2 className="w-3.5 h-3.5" />
                                          فتح الرابط المرجعي
                                        </a>
                                      </div>
                                    )}
                                </div>
                              </>
                            ) : (
                              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-5 text-center">
                                <Lock className="w-5 h-5 mx-auto text-muted-foreground mb-2" />
                                <p className="text-sm font-bold mb-1">
                                  هذا الدرس لم يُدفع بعد
                                </p>
                                <p className="text-xs text-muted-foreground mb-3">
                                  {canAffordLesson
                                    ? "افتح الدرس لخصم حصة واحدة من رصيدك ومشاهدة البث المباشر والفيديوهات والمستندات"
                                    : "لا توجد حصص متبقية في رصيدك — اشترِ الحصص أو فعّل اشتراكاً شهرياً"}
                                </p>
                                {canAffordLesson ? (
                                  <button
                                    type="button"
                                    onClick={() => openLesson(lesson)}
                                    disabled={isBusy}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-60"
                                  >
                                    {isBusy ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Unlock className="w-4 h-4" />
                                    )}
                                    فتح الدرس (حصة واحدة)
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={scrollToBuy}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
                                  >
                                    <Wallet className="w-4 h-4" />
                                    اشترِ الحصص
                                  </button>
                                )}
                              </div>
                            )}
                            </div>
                          )}
                        </div>
                      );
                    })}

                  {lessons.length > 0 &&
                    sortedLessons.filter((l) => lessonMatchesFilter(l, lessonFilter))
                      .length === 0 && (
                      <div className="rounded-2xl border border-dashed p-8 text-center">
                        <p className="text-sm font-bold text-foreground">
                          لا توجد عناصر في هذا التصنيف
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          اختر تصنيفاً آخر أو انتقل إلى «الكل» لعرض جميع الدروس
                        </p>
                      </div>
                    )}
                </div>
              </>
            )}

            {!canAffordLesson && lessons.length > 0 && (
              <button
                onClick={scrollToBuy}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
              >
                <Lock className="w-4 h-4" />
                اشترِ الحصص لفتح المحتوى
              </button>
            )}
          </div>
        </div>

        {/* Sidebar: price + buy */}
        <aside className="h-fit lg:sticky lg:top-24 space-y-5">
          <div id="buy-section" className="bg-card border rounded-2xl p-6 shadow-sm">
            <h3 className="font-cairo text-lg font-extrabold mb-4">
              اشترِ الحصص
            </h3>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-5">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-500" />
                <span className="text-base text-muted-foreground">سعر الحصة</span>
              </div>
              <div className="font-cairo text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {unitPrice}
                <span className="text-base font-medium mr-1">ج.م</span>
              </div>
            </div>

            {/* Per lecture */}
            <button
              onClick={() => handleBuy({ type: "LECTURES", lectures: 1 })}
              disabled={buying}
              className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-primary/20 hover:border-primary/50 bg-primary/5 transition-colors mb-3 disabled:opacity-50"
            >
              <div className="text-right">
                <p className="font-bold">حصة واحدة</p>
                <p className="text-sm text-muted-foreground">احجز حصة واحدة</p>
              </div>
              <span className="font-cairo font-extrabold text-primary">{unitPrice} ج.م</span>
            </button>

            {/* Pack */}
            <div className="p-4 rounded-2xl border border-border mb-3">
              <p className="font-bold mb-3">باقة حصص</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {packOptions.map((count) => (
                  <button
                    key={count}
                    onClick={() => setSelectedPack(count)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedPack === count
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {selectedPack} × {unitPrice} ج.م
                </span>
                <button
                  onClick={() => handleBuy({ type: "LECTURES", lectures: selectedPack })}
                  disabled={buying}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {buying ? "جاري..." : `شراء ${packPrice} ج.م`}
                </button>
              </div>
            </div>

            {/* Monthly */}
            <button
              onClick={() => handleBuy({ type: "MONTHLY" })}
              disabled={buying}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-l from-indigo-500 to-purple-600 text-white transition-opacity hover:opacity-90 disabled:opacity-50 mb-5"
            >
              <div className="text-right">
                <p className="font-bold">اشتراك شهري</p>
                <p className="text-sm text-white/80">
                  {weekly > 0
                    ? `${weekly} حصة أسبوعياً × ${unitPrice} × 4 أسابيع`
                    : "جميع الحصص لمدة شهر"}
                </p>
              </div>
              <span className="font-cairo font-extrabold text-xl">{monthlyPrice} ج.م</span>
            </button>

            <p className="text-xs text-muted-foreground text-center">
              يتم تسجيل الدفعات فوراً. المحفظة الرقمية والدفع الإلكتروني متاحان قريباً.
            </p>
          </div>

          {/* Group summary */}
          <div className="bg-card border rounded-2xl p-6">
            <h3 className="font-cairo text-lg font-extrabold mb-4">ملخص المجموعة</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  الطلاب
                </span>
                <span className="font-bold">{group.students?.length || 0} طالب</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  حصص أسبوعياً
                </span>
                <span className="font-bold">{weekly}</span>
              </div>
            </div>
          </div>

          {/* Leave group */}
          <div className="bg-card border border-red-500/20 rounded-2xl p-6">
            <h3 className="font-cairo text-lg font-extrabold mb-2 flex items-center gap-2 text-red-600 dark:text-red-400">
              <LogOut className="w-5 h-5" />
              إلغاء الاشتراك
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              بإلغاء اشتراكك ستغادر المجموعة وتُلغى حصصك المتبقية. يمكنك إرسال
              طلب انضمام جديد لاحقاً.
            </p>
            <button
              onClick={() => {
                if (!confirmLeave) {
                  setConfirmLeave(true);
                  return;
                }
                handleLeave();
              }}
              disabled={leaving}
              className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-base font-bold transition-all disabled:opacity-50 ${
                confirmLeave
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "border-2 border-red-500/40 text-red-600 dark:text-red-400 hover:bg-red-500/10"
              }`}
            >
              {leaving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <LogOut className="w-5 h-5" />
              )}
              {leaving
                ? "جارٍ الإلغاء..."
                : confirmLeave
                ? "هل أنت متأكد؟ اضغط للتأكيد"
                : "إلغاء الاشتراك في المجموعة"}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}