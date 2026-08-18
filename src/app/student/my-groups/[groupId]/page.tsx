"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import api, { clearCache } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import VideoPlayer from "@/components/video-player";
import { OfflineVideoSection } from "@/components/offline-download";
import { Group, Entitlement } from "@/types";
import { getSubjectColor } from "@/lib/subject-colors";
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

export default function StudentGroupPage() {
  const params = useParams();
  useAuth();
  const router = useRouter();
  const groupId = params.groupId as string;

  const [group, setGroup] = useState<Group | null>(null);
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [lessons, setLessons] = useState<StudentLesson[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [lessonHasAccess, setLessonHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [selectedPack, setSelectedPack] = useState(4);
  const [leaving, setLeaving] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const fetchGroup = useCallback(async () => {
    if (!groupId) return;
    try {
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
      setLessonHasAccess(res.data?.hasAccess ?? false);
    } catch {
      // ignore
    } finally {
      setLessonsLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

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
          "تم تسجيل الدفعة. المحفظة والدفع الإلكتروني متاحان قريباً.",
        duration: 5000,
      });
      await fetchGroup();
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || "فشل في إتمام العملية");
    } finally {
      setBuying(false);
    }
  };

  const scrollToBuy = () => {
    document.getElementById("buy-section")?.scrollIntoView({ behavior: "smooth", block: "center" });
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
  const hasAccess = entitlement?.hasAccess ?? false;
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

          {/* Meet link */}
          <div className="bg-card border rounded-2xl p-6">
            <h3 className="font-cairo text-lg font-extrabold mb-4 flex items-center gap-2">
              <span className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
                <Video className="w-5 h-5 text-red-500" />
              </span>
              الحصة المباشرة
            </h3>
            {hasAccess && group.googleMeetLink ? (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <Unlock className="w-6 h-6 text-emerald-500 shrink-0" />
                <div className="flex-1">
                  <p className="font-bold">الرابط متاح لك</p>
                  <p className="text-sm text-muted-foreground">
                    يمكنك الانضمام للحصة المباشرة الآن
                  </p>
                </div>
                <a
                  href={group.googleMeetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors"
                >
                  <Video className="w-4 h-4" />
                  فتح رابط الحصة
                </a>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                <Lock className="w-6 h-6 text-muted-foreground shrink-0" />
                <div>
                  <p className="font-bold">الرابط مقفل</p>
                  <p className="text-sm text-muted-foreground">
                    اشترِ الحصص أو فعّل الاشتراك الشهري لفتح رابط الحصة المباشرة
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Lessons */}
          <div className="bg-card border rounded-2xl p-6">
          <h3 className="font-cairo text-lg font-extrabold mb-4 flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-violet-500" />
            </span>
            دروس المجموعة
          </h3>

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
            <div className="space-y-3">
              {lessons.map((lesson) => {
                const meta = STUDENT_LESSON_META[lesson.type];
                return (
                  <div
                    key={lesson._id}
                    className={`rounded-xl border p-4 ${
                      lessonHasAccess ? "bg-background" : "bg-muted/40 border-dashed"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <meta.Icon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold">{lesson.title}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${meta.badge}`}>
                            {meta.label}
                          </span>
                        </div>

                        {lessonHasAccess ? (
                          <>
                            {lesson.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {lesson.description}
                              </p>
                            )}
                            <div className="mt-2 space-y-2">
                              {lesson.type === "LIVE" && lesson.meetingLink && (
                                <div className="flex flex-wrap items-center gap-3">
                                  <span className="text-xs font-medium text-muted-foreground">
                                    {lesson.scheduledAt
                                      ? new Date(lesson.scheduledAt).toLocaleDateString("ar-EG", {
                                          weekday: "long",
                                          day: "numeric",
                                          month: "long",
                                        })
                                      : lesson.scheduleDay}
                                    {lesson.scheduleTime ? ` • ${lesson.scheduleTime}` : ""}
                                  </span>
                                  <a
                                    href={lesson.meetingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition-colors"
                                  >
                                    <Video className="w-3.5 h-3.5" />
                                    انضمام للبث المباشر
                                  </a>
                                </div>
                              )}
                              {lesson.type === "LIVE" && lesson.recordedLiveVideoUrl && (
                                <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-3 space-y-2">
                                  <p className="text-xs font-bold text-muted-foreground">
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
                              {lesson.type === "LIVE" && lesson.recordedVideoUrl && (
                                <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-3 space-y-2">
                                  <p className="text-xs font-bold text-muted-foreground">
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
                                    <p className="text-xs font-bold text-muted-foreground">
                                      المستندات ({lesson.documents.length})
                                    </p>
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
                                )}
                              {lesson.type === "LIVE" &&
                                Array.isArray(lesson.referenceLinks) &&
                                lesson.referenceLinks.length > 0 && (
                                  <div className="space-y-1.5">
                                    <p className="text-xs font-bold text-muted-foreground">
                                      الروابط المرجعية ({lesson.referenceLinks.length})
                                    </p>
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
                                )}
                              {lesson.type === "RECORDED" && lesson.videoUrl && (
                                <a
                                  href={lesson.videoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors"
                                >
                                  <PlayCircle className="w-3.5 h-3.5" />
                                  مشاهدة الفيديو
                                </a>
                              )}
                              {lesson.type === "DOCUMENT" && lesson.documentUrl && (
                                <a
                                  href={lesson.documentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  فتح المستند
                                </a>
                              )}
                              {lesson.type === "LINK" && lesson.referenceUrl && (
                                <a
                                  href={lesson.referenceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors"
                                >
                                  <Link2 className="w-3.5 h-3.5" />
                                  فتح الرابط المرجعي
                                </a>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Lock className="w-4 h-4 shrink-0" />
                            المحتوى مقفل — اشترِ الحصص أو فعّل الاشتراك الشهري لفتحه
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!lessonHasAccess && lessons.length > 0 && (
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