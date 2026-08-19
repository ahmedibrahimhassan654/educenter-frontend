"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import api, { clearCache } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { OfflineVideoSection } from "@/components/offline-download";
import { Group, Entitlement } from "@/types";
import { getSubjectColor } from "@/lib/subject-colors";
import { canJoinLive } from "@/lib/lesson-time";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  BookOpen,
  Lock,
  Unlock,
  Wallet,
  Video,
  Radio,
  FileText,
  Link2,
  PlayCircle,
  CalendarClock,
  Sparkles,
  ShieldCheck,
  CircleDollarSign,
  CheckCircle2,
  GraduationCap,
} from "lucide-react";
import LessonAIPanel from "@/components/ai/LessonAIPanel";

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
}

type LessonTab = "lesson" | "ai" | "homework" | "progress";

const TYPE_META: Record<
  StudentLesson["type"],
  { label: string; Icon: typeof Video; badge: string }
> = {
  LIVE: { label: "درس مباشر", Icon: Video, badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  RECORDED: { label: "فيديو مسجل", Icon: Radio, badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  DOCUMENT: { label: "مستند", Icon: FileText, badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  LINK: { label: "رابط مرجعي", Icon: Link2, badge: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
};

export default function StudentLessonPage() {
  const params = useParams();
  useAuth();
  const groupId = params.groupId as string;
  const lessonId = params.lessonId as string;

  const [group, setGroup] = useState<Group | null>(null);
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [lesson, setLesson] = useState<StudentLesson | null>(null);
  const [content, setContent] = useState<StudentLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(false);
  const [buying, setBuying] = useState(false);
  const [activeTab, setActiveTab] = useState<LessonTab>("lesson");

  const load = useCallback(async () => {
    try {
      clearCache(`/groups/${groupId}`);
      const groupRes = await api.get(`/groups/${groupId}`);
      const groupData = groupRes.data as Group & { entitlement?: Entitlement };
      setGroup(groupData);
      setEntitlement(groupData.entitlement || null);

      clearCache(`/groups/${groupId}/lessons`);
      const lessonsRes = await api.get(`/groups/${groupId}/lessons`);
      const list: StudentLesson[] = lessonsRes.data?.data || [];
      const found = list.find((l) => l._id === lessonId) || null;
      setLesson(found);

      // If already unlocked (opened or monthly), fetch the full content for free.
      const unlocked = Boolean(
        groupData.entitlement?.monthlyActive ||
          found?.opened ||
          found?.type === "LIVE"
      );
      if (unlocked) {
        await openLessonContent(found?._id || lessonId);
      }
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message || "فشل في تحميل الدرس"
      );
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, lessonId]);

  const openLessonContent = useCallback(
    async (id: string) => {
      const res = await api.post(`/groups/${groupId}/lessons/${id}/open`);
      const data = res.data?.data;
      setContent(data);
      const remaining = res.data?.remainingCredits;
      if (typeof remaining === "number") {
        setEntitlement((prev) =>
          prev
            ? {
                ...prev,
                remainingCredits: remaining,
                monthlyActive: Boolean(res.data?.monthlyActive),
                hasAccess: Boolean(prev.monthlyActive || remaining > 0),
              }
            : prev
        );
      }
      return res.data as { consumedCredit?: boolean };
    },
    [groupId]
  );

  useEffect(() => {
    load();
  }, [load]);

  const unlocked = Boolean(
    entitlement?.monthlyActive || content !== null || lesson?.opened
  );

  const canAfford = Boolean(
    entitlement?.monthlyActive || (entitlement?.remainingCredits ?? 0) > 0
  );

  const handleOpen = async () => {
    if (opening) return;
    setOpening(true);
    try {
      const res = await openLessonContent(lessonId);
      if (res.consumedCredit) {
        toast.success("تم فتح الدرس", {
          description: "تم خصم حصة واحدة من رصيدك",
        });
      }
    } catch (error) {
      const err = error as { response?: { status?: number; data?: { message?: string } } };
      toast.error(
        err.response?.data?.message || "فشل في فتح الدرس"
      );
    } finally {
      setOpening(false);
    }
  };

  const handleBuy = async (type: "LECTURES" | "MONTHLY", lectures?: number) => {
    setBuying(true);
    try {
      await api.post(`/groups/${groupId}/purchases`, {
        type,
        lectures,
      });
      const label =
        type === "MONTHLY"
          ? "تم تفعيل اشتراكك الشهري بنجاح"
          : `تم شراء ${lectures} حصة بنجاح`;
      toast.success(label, { duration: 4000 });
      const groupRes = await api.get(`/groups/${groupId}`);
      setEntitlement(
        (groupRes.data as Group & { entitlement?: Entitlement }).entitlement ||
          null
      );
      await openLessonContent(lessonId);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "فشل في إتمام العملية");
    } finally {
      setBuying(false);
    }
  };

  const activeLesson = content || lesson;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!group || !activeLesson) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-bold mb-2">الدرس غير موجود</h3>
        <Link
          href={`/student/my-groups/${groupId}`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl text-base font-medium hover:bg-primary/90 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          العودة للمجموعة
        </Link>
      </div>
    );
  }

  const color = getSubjectColor(group.subject);
  const teacher =
    typeof group.teacherId === "object" ? group.teacherId : null;
  const teacherName =
    teacher?.name || (group.teacherId as string) || "غير محدد";
  const meta = TYPE_META[activeLesson.type];
  const weekly = (group.scheduleDays || []).length;
  const unitPrice = group.totalSessionPrice || 0;
  const monthlyPrice = weekly > 0 ? weekly * unitPrice * 4 : unitPrice;
  const packOptions = [1, 2, 4, 6];

  const TABS: Array<{ key: LessonTab; label: string; Icon: typeof Video }> = [
    { key: "lesson", label: "الدرس", Icon: BookOpen },
    { key: "ai", label: "الذكاء الاصطناعي", Icon: Sparkles },
    { key: "homework", label: "الواجب", Icon: FileText },
    { key: "progress", label: "تقدمك", Icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div
        className={`bg-gradient-to-br ${color.gradient} rounded-3xl p-8 relative overflow-hidden`}
      >
        <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "44px 44px" }} />
        <div className="relative">
          <Link
            href={`/student/my-groups/${groupId}`}
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            {group.title}
          </Link>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold border ${color.chip}`}>
              <BookOpen className="w-4 h-4" />
              {group.subject}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold bg-white/10 border border-white/20 text-white/85 ${meta.badge}`}>
              <meta.Icon className="w-4 h-4" />
              {meta.label}
            </span>
            {activeLesson.scheduledAt && (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold bg-white/10 border border-white/20 text-white/85">
                <CalendarClock className="w-4 h-4" />
                {new Date(activeLesson.scheduledAt).toLocaleDateString("ar-EG", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </span>
            )}
          </div>
          <h1 className="font-cairo text-3xl md:text-4xl font-extrabold text-white">
            {activeLesson.title}
          </h1>
          <p className="text-white/70 mt-2 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4" />
            {teacherName} — مدرّس {group.subject}
          </p>
        </div>
      </div>

      {!unlocked ? (
        /* Locked state: open (consume a credit) or buy */
        <div className="bg-card border rounded-3xl p-8 max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-cairo text-xl font-extrabold mb-2">
            هذا الدرس غير مفتوح بعد
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {canAfford
              ? "افتح الدرس بخصم حصة واحدة من رصيدك — الدرس يبقى مفتوحاً بعدها"
              : "لا توجد حصص متبقية — اشترِ الحصص أو فعّل اشتراكاً شهرياً"}
          </p>

          {canAfford && (
            <button
              type="button"
              onClick={handleOpen}
              disabled={opening}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-60 mb-4"
            >
              {opening ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Unlock className="w-4 h-4" />
              )}
              فتح الدرس (حصة واحدة)
            </button>
          )}

          <div className="rounded-2xl border p-5 mt-6 text-right">
            <h3 className="font-cairo text-base font-extrabold mb-3 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-500" />
              اشترِ الحصص لفتح الدروس
            </h3>
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-3">
              <span className="text-sm text-muted-foreground">سعر الحصة</span>
              <span className="font-cairo text-xl font-extrabold text-emerald-600">
                {unitPrice} <span className="text-sm">ج.م</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {packOptions.map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => handleBuy("LECTURES", count)}
                  disabled={buying}
                  className="flex-1 min-w-[6rem] px-3 py-2 rounded-xl bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 transition-colors disabled:opacity-50"
                >
                  {count} حصة — {count * unitPrice} ج.م
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => handleBuy("MONTHLY")}
              disabled={buying}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-l from-indigo-500 to-purple-600 text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                اشتراك شهري — كل الدروس مفتوحة
              </span>
              <span>{monthlyPrice} ج.م</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {TABS.map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card border text-muted-foreground hover:bg-muted/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {activeTab === "lesson" && (
            <div className="bg-card border rounded-3xl p-6 space-y-5">
              {activeLesson.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {activeLesson.description}
                </p>
              )}

              {/* Live session */}
              {activeLesson.type === "LIVE" && (
                <div className="flex flex-wrap items-center gap-2.5">
                  {activeLesson.scheduledAt && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/60 text-xs font-medium text-muted-foreground">
                      <CalendarClock className="w-3.5 h-3.5" />
                      {new Date(activeLesson.scheduledAt).toLocaleString("ar-EG")}
                    </span>
                  )}
                  {canJoinLive(activeLesson) && activeLesson.meetingLink ? (
                    <a
                      href={activeLesson.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-colors"
                    >
                      <Video className="w-4 h-4" />
                      انضمام للبث المباشر
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted text-muted-foreground rounded-lg text-xs font-medium">
                      <Lock className="w-3.5 h-3.5" />
                      يُفتح رابط الحصة قبل بدايتها بـ 15 دقيقة
                    </span>
                  )}
                </div>
              )}

              {/* Recorded live session */}
              {activeLesson.recordedLiveVideoUrl && (
                <div className="rounded-2xl border border-violet-500/30 bg-violet-500/5 p-4 space-y-2">
                  <p className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                    <Radio className="w-4 h-4" />
                    تسجيل الحصة
                  </p>
                  <OfflineVideoSection
                    groupId={groupId}
                    lessonId={lessonId}
                    field="recordedLiveVideoUrl"
                    url={activeLesson.recordedLiveVideoUrl}
                    title="تسجيل الحصة"
                    className="w-full max-h-96"
                  />
                </div>
              )}

              {/* Extra recorded video */}
              {activeLesson.recordedVideoUrl && (
                <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-4 space-y-2">
                  <p className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                    <PlayCircle className="w-4 h-4" />
                    فيديو إضافي
                  </p>
                  <OfflineVideoSection
                    groupId={groupId}
                    lessonId={lessonId}
                    field="recordedVideoUrl"
                    url={activeLesson.recordedVideoUrl}
                    title="فيديو إضافي"
                    className="w-full max-h-96"
                  />
                </div>
              )}

              {/* Recorded lesson video */}
              {activeLesson.type === "RECORDED" && activeLesson.videoUrl && (
                <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-4 space-y-2">
                  <p className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                    <PlayCircle className="w-4 h-4" />
                    فيديو الدرس
                  </p>
                  <OfflineVideoSection
                    groupId={groupId}
                    lessonId={lessonId}
                    field="videoUrl"
                    url={activeLesson.videoUrl}
                    title={activeLesson.title}
                    className="w-full max-h-96"
                  />
                </div>
              )}

              {/* Documents */}
              {Array.isArray(activeLesson.documents) &&
                activeLesson.documents.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      المستندات ({activeLesson.documents.length})
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeLesson.documents.map((doc, i) => (
                        <a
                          key={i}
                          href={doc}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-3 bg-primary/10 text-primary rounded-xl text-xs font-bold hover:bg-primary/20 transition-colors"
                        >
                          <FileText className="w-4 h-4 shrink-0" />
                          فتح المستند {i + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

              {/* Reference links */}
              {Array.isArray(activeLesson.referenceLinks) &&
                activeLesson.referenceLinks.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                      <Link2 className="w-4 h-4" />
                      الروابط المرجعية ({activeLesson.referenceLinks.length})
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeLesson.referenceLinks.map((link, i) => (
                        <a
                          key={i}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-3 bg-violet-500/10 text-violet-600 rounded-xl text-xs font-bold hover:bg-violet-500/20 transition-colors"
                        >
                          <Link2 className="w-4 h-4 shrink-0" />
                          فتح الرابط المرجعي {i + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

              {/* Standalone document / link lesson */}
              {activeLesson.type === "DOCUMENT" && activeLesson.documentUrl && (
                <a
                  href={activeLesson.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-3 bg-primary/10 text-primary rounded-xl text-xs font-bold hover:bg-primary/20 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  فتح المستند
                </a>
              )}
              {activeLesson.type === "LINK" && activeLesson.referenceUrl && (
                <a
                  href={activeLesson.referenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-3 bg-violet-500/10 text-violet-600 rounded-xl text-xs font-bold hover:bg-violet-500/20 transition-colors"
                >
                  <Link2 className="w-4 h-4" />
                  فتح الرابط المرجعي
                </a>
              )}

              {/* Entitlement reminder */}
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-muted/40 rounded-xl p-3">
                <CircleDollarSign className="w-4 h-4 text-emerald-500 shrink-0" />
                {entitlement?.monthlyActive
                  ? "اشتراك شهري نشط — جميع الدروس مفتوحة"
                  : `رصيدك: ${entitlement?.remainingCredits ?? 0} حصة — هذا الدرس مفتوح لك دائماً`}
              </div>
            </div>
          )}

          {activeTab === "ai" && (
            <LessonAIPanel
              groupId={groupId}
              lessonId={lessonId}
              lessonTitle={activeLesson.title}
            />
          )}

          {activeTab === "homework" && (
            <div className="bg-card border rounded-3xl p-6">
              <h3 className="font-cairo text-lg font-extrabold mb-2 flex items-center gap-2">
                <span className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-rose-500" />
                </span>
                واجب الدرس
              </h3>
              <p className="text-sm text-muted-foreground mb-5">
                أنشئ واجباً منزلياً قابلاً للتصحيح والطباعة من مواد هذا الدرس عبر
                تبويب «الذكاء الاصطناعي».
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("ai")}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                إنشاء الواجب من تبويب الذكاء الاصطناعي
              </button>
            </div>
          )}

          {activeTab === "progress" && (
            <div className="bg-card border rounded-3xl p-6">
              <h3 className="font-cairo text-lg font-extrabold mb-4 flex items-center gap-2">
                <span className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </span>
                تقدمك في الدرس
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <ProgressCard
                  label="حالة الدرس"
                  value={unlocked ? "مفتوح" : "مقفل"}
                  tone={unlocked ? "emerald" : "muted"}
                />
                <ProgressCard
                  label="رصيد الحصص"
                  value={`${entitlement?.remainingCredits ?? 0}`}
                  tone="blue"
                />
                <ProgressCard
                  label="خطوتك التالية"
                  value="أنشئ ملخصاً وواجباً من تبويب الذكاء الاصطناعي"
                  tone="violet"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                تابع مذاكرتك بالخطوات: شاهد الفيديو ← اقرأ المستندات ← أنشئ ملخصاً ←
                تدرب بالامتحان والواجب ← راجع بالبطاقات.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ProgressCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "emerald" | "blue" | "violet" | "muted";
}) {
  const tones: Record<string, string> = {
    emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    blue: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    violet: "bg-violet-500/10 text-violet-600 border-violet-500/20",
    muted: "bg-muted/50 text-muted-foreground border-border",
  };
  return (
    <div className={`rounded-2xl border p-4 ${tones[tone]}`}>
      <p className="text-xs font-bold opacity-80 mb-1">{label}</p>
      <p className="font-cairo font-extrabold text-sm leading-relaxed">{value}</p>
    </div>
  );
}