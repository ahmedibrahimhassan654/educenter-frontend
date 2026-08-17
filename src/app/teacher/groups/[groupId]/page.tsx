"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import api from "@/lib/api";
import { Group } from "@/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Users,
  Calendar,
  Wallet,
  Loader2,
  Settings,
  Trash2,
  UserPlus,
  Search,
  X,
  Mail,
  Phone,
  GraduationCap,
  Send,
  CheckCircle,
  Check,
  Hourglass,
  PlayCircle,
} from "lucide-react";

interface SuggestedStudent {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  stage?: string;
  grade?: string;
}

interface PurchaseRecord {
  _id: string;
  studentId: { _id: string; name: string } | string;
  type: "LECTURES" | "MONTHLY";
  lectures: number;
  remainingLectures: number;
  monthlyExpiresAt?: string | null;
  amountPaid: number;
  createdAt: string;
}

interface JoinRequestRecord {
  id: string;
  student:
    | { _id: string; name: string; email?: string; phone?: string; avatarUrl?: string; stage?: string; grade?: string }
    | string;
  createdAt: string;
}

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);
  const [curriculumTree, setCurriculumTree] = useState<Array<{ name: string; grades?: Array<{ name: string; subjects?: Array<{ code: string; name: string }> }> }>>([]);
  const [platformSettings, setPlatformSettings] = useState({
    defaultPricePerLecture: 60,
    maxStudentsPerGroup: 25,
    platformFeePercentage: 15,
  });
  const [groupPurchases, setGroupPurchases] = useState<PurchaseRecord[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequestRecord[]>([]);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);

  const groupId = params.groupId as string;

  const fetchGroup = useCallback(async () => {
    if (!groupId) return;
    try {
      const response = await api.get(`/groups/${groupId}`);
      setGroup(response.data);
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const message = axiosError.response?.data?.message || "فشل في تحميل المجموعة";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    if (groupId) {
      fetchGroup();
      api
        .get(`/groups/${groupId}/purchases`)
        .then((res) => setGroupPurchases(res.data?.data || []))
        .catch(() => {});
      api
        .get(`/groups/${groupId}/join-requests`)
        .then((res) => setJoinRequests(res.data?.data || []))
        .catch(() => {});
    }
    const fetchCurriculum = async () => {
      try {
        const res = await api.get("/curriculum");
        setCurriculumTree(res.data || []);
      } catch {
        // ignore
      }
    };
    fetchCurriculum();
    const fetchSettings = async () => {
      try {
        const res = await api.get("/settings/public");
        if (res.data) {
          setPlatformSettings(res.data);
        }
      } catch {
        // ignore
      }
    };
    fetchSettings();
  }, [groupId, fetchGroup]);

  const curriculumMap = new Map<string, { stage: string; grade: string; subject: string }>();
  for (const stage of curriculumTree) {
    for (const grade of stage.grades || []) {
      for (const subject of grade.subjects || []) {
        curriculumMap.set(subject.code, {
          stage: stage.name,
          grade: grade.name,
          subject: subject.name,
        });
      }
    }
  }

  const teacherIdObj = typeof group?.teacherId === 'object' ? group.teacherId : null;
  const teacherCurriculum = (teacherIdObj?.verificationData?.curriculum || []) as string[];
  const parsedCurriculum = teacherCurriculum
    .map((entry: string) => {
      const separatorIndex = entry.indexOf(":");
      const key = separatorIndex !== -1 ? entry.slice(0, separatorIndex) : entry;
      const parts = key.split("-").filter(Boolean);
      const codeIndex = parts.findIndex((p: string) => /^[A-Z]{2,}(_[A-Z0-9]+)+$/.test(p));
      if (codeIndex === -1) return null;
      const code = parts[codeIndex];
      const info = curriculumMap.get(code);
      return info ? { code, ...info } : null;
    })
    .filter(Boolean) as Array<{ code: string; stage: string; grade: string; subject: string }>;

  const groupRelevantCurriculum = parsedCurriculum.filter(
    (item) => group && item.subject === group.subject && item.grade === group.grade
  );

  const curriculumByStage = groupRelevantCurriculum.reduce((acc, item) => {
    if (!acc[item.stage]) acc[item.stage] = {};
    if (!acc[item.stage][item.grade]) acc[item.stage][item.grade] = [];
    acc[item.stage][item.grade].push(item.subject);
    return acc;
  }, {} as Record<string, Record<string, string[]>>);

  const handleRemoveStudent = async (studentId: string) => {
    if (!confirm("هل أنت متأكد من إزالة هذا الطالب من المجموعة؟")) return;

    setDeletingStudentId(studentId);
    try {
      await api.delete(`/groups/${groupId}/students/${studentId}`);
      toast.success("تم إزالة الطالب بنجاح");
      fetchGroup();
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const message = axiosError.response?.data?.message || "فشل في إزالة الطالب";
      toast.error(message);
    } finally {
      setDeletingStudentId(null);
    }
  };

  const handleJoinRequest = async (requestId: string, action: "accept" | "reject") => {
    setProcessingRequestId(requestId);
    try {
      await api.post(`/groups/join-requests/${requestId}/${action}`);
      toast.success(
        action === "accept"
          ? "تم قبول الطلب وانضم الطالب للمجموعة"
          : "تم رفض الطلب"
      );
      setJoinRequests((prev) => prev.filter((r) => r.id !== requestId));
      fetchGroup();
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(
        axiosError.response?.data?.message || "حدث خطأ أثناء معالجة الطلب"
      );
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleDeleteGroup = async () => {
    if (!groupId) return;
    setIsDeletingGroup(true);
    try {
      await api.delete(`/groups/${groupId}`);
      toast.success("تم حذف المجموعة بنجاح");
      router.push("/teacher/groups");
    } catch (error: any) {
      const message = error.response?.data?.message || "فشل في حذف المجموعة";
      toast.error(message);
      setShowDeleteConfirm(false);
    } finally {
      setIsDeletingGroup(false);
    }
  };

  const purchasesByStudent = useMemo(() => {
    const map: Record<string, PurchaseRecord[]> = {};
    for (const p of groupPurchases) {
      const sid = typeof p.studentId === "string" ? p.studentId : p.studentId?._id;
      if (!sid) continue;
      (map[sid] = map[sid] || []).push(p);
    }
    return map;
  }, [groupPurchases]);

  const entitlementFor = (studentId: string) => {
    const list = purchasesByStudent[studentId] || [];
    let credits = 0;
    let monthlyUntil: string | null = null;
    const now = Date.now();
    for (const p of list) {
      if (p.type === "LECTURES") credits += p.remainingLectures || 0;
      else if (p.type === "MONTHLY" && p.monthlyExpiresAt) {
        const exp = new Date(p.monthlyExpiresAt).getTime();
        if (exp > now) monthlyUntil = p.monthlyExpiresAt;
      }
    }
    return { credits, monthlyUntil, hasAccess: credits > 0 || !!monthlyUntil };
  };

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (!group) {
    return (
      <>
        <div className="text-center py-16">
          <h3 className="text-xl font-bold mb-2">المجموعة غير موجودة</h3>
          <Link
            href="/teacher/groups"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg text-base font-medium hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            العودة للمجموعات
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/teacher/groups"
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">{group.title}</h2>
              <p className="text-base text-muted-foreground mt-1">
                {group.subject} • {group.stage || (group.grade.includes("إعدادي") ? "الإعدادي" : group.grade.includes("الثانوي") ? "الثانوي" : "الابتدائي")} • {group.grade}
              </p>
              {Object.keys(curriculumByStage).length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">المناهج المعتمدة من المنصة:</p>
                  {Object.entries(curriculumByStage).map(([stage, grades]) => (
                    <div key={stage} className="p-2 bg-muted/30 rounded-lg">
                      <p className="text-xs font-semibold text-foreground">{stage}</p>
                      <div className="mt-1 space-y-1">
                        {Object.entries(grades).map(([grade, subjects]) => (
                          <div key={grade} className="flex flex-wrap items-center gap-1">
                            <span className="text-xs text-muted-foreground min-w-[100px]">{grade}</span>
                            <div className="flex flex-wrap gap-1">
                              {subjects.map((subject, si) => (
                                <span key={si} className="px-2 py-0.5 bg-green-500/10 text-green-700 dark:text-green-400 rounded text-xs">
                                  {subject}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <AddStudentModal
              groupId={groupId}
              groupTitle={group.title}
              groupSubject={group.subject}
              groupStage={group.stage}
              groupGrade={group.grade}
              scheduleDays={group.scheduleDays || []}
              onStudentAdded={fetchGroup}
              maxStudents={group.maxStudentsPerGroup || platformSettings.maxStudentsPerGroup}
              currentStudents={group.students.length}
            />
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(true)}
              className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-500/10 border-red-500/30"
            >
              <Trash2 className="w-4 h-4" />
              حذف
            </Button>
          </div>
        </div>

        {/* Group Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الطلاب المسجلين</p>
                <p className="text-2xl font-bold">{group.students.length}/{group.maxStudentsPerGroup || platformSettings.maxStudentsPerGroup}</p>
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden mt-4">
              <div
                className={`h-full rounded-full ${
                  group.students.length >= (group.maxStudentsPerGroup || platformSettings.maxStudentsPerGroup) ? "bg-green-500" : "bg-primary"
                }`}
                style={{ width: `${Math.min((group.students.length / (group.maxStudentsPerGroup || platformSettings.maxStudentsPerGroup)) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-card border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">سعر الحصة</p>
                <p className="text-2xl font-bold text-green-500">{group.totalSessionPrice || platformSettings.defaultPricePerLecture} ج.م</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              حصة المعلم: {group.priceTeacherShare || (platformSettings.defaultPricePerLecture - Math.round(platformSettings.defaultPricePerLecture * platformSettings.platformFeePercentage / 100))} ج.م
            </p>
          </div>

          <div className="bg-card border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الحصص الأسبوعية</p>
                <p className="text-2xl font-bold">{(group.scheduleDays || []).length}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {group.scheduleDays?.join("، ") || "لا توجد مواعيد"}
            </p>
          </div>

          <div className="bg-card border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Settings className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">عمولة المنصة</p>
                <p className="text-2xl font-bold">{platformSettings.platformFeePercentage}%</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              مطبقة على جميع الحصص
            </p>
          </div>
        </div>

        {/* Join requests */}
        {joinRequests.length > 0 && (
          <div className="bg-card border border-amber-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Hourglass className="w-5 h-5 text-amber-500" />
                </span>
                طلبات الانضمام ({joinRequests.length})
              </h3>
            </div>
            <div className="space-y-3">
              {joinRequests.map((req) => {
                const student = typeof req.student === "object" ? req.student : null;
                const name = student?.name || "طالب";
                return (
                  <div
                    key={req.id}
                    className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20"
                  >
                    <div className="w-11 h-11 rounded-full bg-amber-500/15 flex items-center justify-center text-lg font-bold text-amber-600 dark:text-amber-400">
                      {name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold">{name}</p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-0.5">
                        {student?.email && (
                          <span className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5" />
                            {student.email}
                          </span>
                        )}
                        {student?.phone && (
                          <span className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5" />
                            {student.phone}
                          </span>
                        )}
                        {student?.grade && <span>الصف: {student.grade}</span>}
                        <span className="text-xs text-muted-foreground">
                          {new Date(req.createdAt).toLocaleDateString("ar-EG")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleJoinRequest(req.id, "accept")}
                        disabled={processingRequestId === req.id}
                        className="gap-2"
                      >
                        {processingRequestId === req.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        قبول
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleJoinRequest(req.id, "reject")}
                        disabled={processingRequestId === req.id}
                        className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-500/10 border-red-500/30"
                      >
                        <X className="w-4 h-4" />
                        رفض
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Schedule */}
        <div className="bg-card border rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4">مواعيد الحصص الأسبوعية</h3>
          {(group.scheduleDays || []).length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {group.scheduleDays.map((slot, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-lg text-sm"
                >
                  <Calendar className="w-4 h-4" />
                  {slot}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">لم يتم تحديد مواعيد للحصص</p>
          )}
        </div>

        {/* Learning Points */}
        {(group.learningPoints || []).length > 0 && (
          <div className="bg-card border rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4">ماذا ستتعلم في هذه المجموعة؟</h3>
            <ul className="space-y-3">
              {group.learningPoints!.map((point, i) => (
                <li key={i} className="flex items-start gap-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">
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
          <div className="bg-card border rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-primary" />
              فيديو وصف المجموعة
            </h3>
            <video
              src={group.descriptionVideo}
              controls
              className="w-full rounded-lg max-h-96 bg-muted"
            />
          </div>
        )}

        {/* Students List */}
        <div className="bg-card border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">قائمة الطلاب ({group.students.length})</h3>
            {group.students.length < (group.maxStudentsPerGroup || platformSettings.maxStudentsPerGroup) && (
              <AddStudentModal
                groupId={groupId}
                groupTitle={group.title}
                groupSubject={group.subject}
                groupStage={group.stage}
                groupGrade={group.grade}
                scheduleDays={group.scheduleDays || []}
                onStudentAdded={fetchGroup}
                maxStudents={group.maxStudentsPerGroup || platformSettings.maxStudentsPerGroup}
                currentStudents={group.students.length}
              />
            )}
          </div>

          {(group.students || []).length > 0 ? (
            <div className="space-y-3">
              {(group.students as Array<string | { _id?: string; id?: string; name?: string; email?: string; phone?: string }>).map((student) => {
                const studentObj = typeof student === "string" ? null : student;
                const studentId = typeof student === "string" ? student : (student._id || student.id || "");
                const studentName = studentObj?.name || "طالب";
                const studentEmail = studentObj?.email || "لا يوجد بريد";
                return (
                  <div
                    key={studentId}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">
                          {studentName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{studentName}</p>
                        <p className="text-sm text-muted-foreground">
                          {studentEmail}
                        </p>
                        {(() => {
                          const ent = entitlementFor(studentId);
                          if (ent.monthlyUntil) {
                            return (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                                اشتراك شهري حتى{" "}
                                {new Date(ent.monthlyUntil).toLocaleDateString("ar-EG")}
                              </span>
                            );
                          }
                          if (ent.credits > 0) {
                            return (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-medium">
                                {ent.credits} حصة متبقية
                              </span>
                            );
                          }
                          return (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                              لم يشترِ حصصاً
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveStudent(studentId)}
                      disabled={deletingStudentId === studentId}
                      className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg text-muted-foreground transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">لا يوجد طلاب في هذه المجموعة بعد</p>
              <div className="mt-4">
                <AddStudentModal
                  groupId={groupId}
                  groupTitle={group.title}
                  groupSubject={group.subject}
                  groupStage={group.stage}
                  groupGrade={group.grade}
                  scheduleDays={group.scheduleDays || []}
                  onStudentAdded={fetchGroup}
                  maxStudents={group.maxStudentsPerGroup || platformSettings.maxStudentsPerGroup}
                  currentStudents={group.students.length}
                />
              </div>
            </div>
          )}
        </div>

        {/* Google Meet Link */}
        {group.googleMeetLink && (
          <div className="bg-card border rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4">رابط الاجتماع</h3>
            <a
              href={group.googleMeetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              فتح رابط Google Meet
            </a>
          </div>
        )}

        {/* Empty placeholder for future customization */}
        <div className="bg-card border rounded-xl p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <Settings className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold mb-2">قيد التطوير</h3>
          <p className="text-muted-foreground mb-6">
            ستتم إضافة المزيد من الميزات لهذه الصفحة لاحقاً مثل:
          </p>
          <ul className="text-right text-muted-foreground space-y-2 max-w-md mx-auto">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              إدارة الحضور والغياب
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              جدولة الحصص والتقويم
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              رفع الملفات والمواد التعليمية
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              التقارير والإحصائيات
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              التواصل مع الطلاب
            </li>
          </ul>
        </div>
      </div>

      {/* Delete Group Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              if (!isDeletingGroup) setShowDeleteConfirm(false);
            }}
          />
          <div className="relative bg-background rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-bold mb-1">حذف المجموعة</h3>
              <p className="text-sm text-muted-foreground">
                هل أنت متأكد من حذف مجموعة{" "}
                <span className="font-semibold text-foreground">"{group?.title}"</span>؟
              </p>
              {(group?.students?.length || 0) > 0 && (
                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-sm text-amber-700 dark:text-amber-400">
                  ⚠ هذه المجموعة بها {group!.students.length} طالب مسجل. حذفها سيزيل
                  وصولهم إلى المجموعة والمشتريات المرتبطة بها، ولا يمكن التراجع عن هذا الإجراء.
                </div>
              )}
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeletingGroup}
              >
                إلغاء
              </Button>
              <Button
                onClick={handleDeleteGroup}
                disabled={isDeletingGroup}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeletingGroup ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin ml-2" />
                    جاري الحذف...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 ml-2" />
                    حذف نهائياً
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function AddStudentModal({
  groupId,
  groupTitle,
  groupSubject,
  groupStage,
  groupGrade,
  scheduleDays,
  onStudentAdded,
  maxStudents,
  currentStudents,
}: {
  groupId: string;
  groupTitle: string;
  groupSubject: string;
  groupStage?: string;
  groupGrade: string;
  scheduleDays: string[];
  onStudentAdded: () => void;
  maxStudents: number;
  currentStudents: number;
}) {
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState<"new" | "existing" | "stage">("new");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SuggestedStudent[]>([]);
  const [searching, setSearching] = useState(false);
  const [stageStudents, setStageStudents] = useState<SuggestedStudent[]>([]);
  const [loadingStage, setLoadingStage] = useState(false);
  const [adding, setAdding] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    stage: groupStage || "",
    grade: groupGrade,
    parentName: "",
    parentEmail: "",
    parentPhone: "",
  });

  const searchStudents = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const response = await api.get(`/groups/${groupId}/suggested-students`, {
        params: { search: searchQuery },
      });
      setSearchResults(response.data.data || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, [searchQuery, groupId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchStudents();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchStudents]);

  const fetchStageStudents = useCallback(async () => {
    setLoadingStage(true);
    try {
      const response = await api.get(`/groups/${groupId}/suggested-students`);
      setStageStudents(response.data.data || []);
    } catch {
      setStageStudents([]);
    } finally {
      setLoadingStage(false);
    }
  }, [groupId]);

  useEffect(() => {
    if (showModal && mode === "stage") {
      fetchStageStudents();
    }
  }, [showModal, mode, fetchStageStudents]);

  const handleAddExisting = async (studentId: string) => {
    setAdding(true);
    try {
      await api.post(`/groups/${groupId}/students`, { studentId });
      toast.success("تمت إضافة الطالب للمجموعة");
      const removeAdded = (list: SuggestedStudent[]) =>
        list.filter((s) => s.id !== studentId);
      setSearchResults(removeAdded);
      setStageStudents(removeAdded);
      onStudentAdded();
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const message = axiosError.response?.data?.message || "فشل في إضافة الطالب";
      toast.error(message);
    } finally {
      setAdding(false);
    }
  };

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const response = await api.post(`/groups/${groupId}/students/create`, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        stage: formData.stage || groupStage,
        grade: formData.grade || groupGrade,
        parentName: formData.parentName,
        parentEmail: formData.parentEmail,
        parentPhone: formData.parentPhone,
      });

      const password = response.data.generatedPassword;
      const parentPassword = response.data.parentGeneratedPassword;
      const parentLinked = response.data.parentLinked;

      toast.success("تم إنشاء الحساب وإضافة الطالب بنجاح", {
        description: parentLinked
          ? `كلمة مرور الطالب: ${password}${parentPassword ? ` — كلمة مرور ولي الأمر: ${parentPassword}` : " — تم ربط ولي الأمر بحساب قائم"}`
          : `كلمة المرور المؤقتة: ${password}`,
        duration: 7000,
      });

      setShowModal(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        stage: groupStage || "",
        grade: groupGrade,
        parentName: "",
        parentEmail: "",
        parentPhone: "",
      });
      onStudentAdded();
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const message = axiosError.response?.data?.message || "فشل في إنشاء الطالب";
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  const getStageLabel = (stage?: string) => {
    if (!stage) return "غير محدد";
    const map: Record<string, string> = {
      "ابتدائي": "الابتدائية",
      "إعدادي": "الإعدادية",
      "ثانوي": "الثانوية",
    };
    return map[stage] || stage;
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={currentStudents >= maxStudents}
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        <UserPlus className="w-4 h-4" />
        إضافة طالب
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-background rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-background p-6 border-b z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">إضافة طالب</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm space-y-1">
                <p><span className="font-medium">المجموعة:</span> {groupTitle}</p>
                <p><span className="font-medium">المادة:</span> {groupSubject}</p>
                <p><span className="font-medium">المرحلة:</span> {getStageLabel(groupStage)}</p>
                <p><span className="font-medium">الصف:</span> {groupGrade}</p>
                <p><span className="font-medium">المواعيد:</span> {scheduleDays.length > 0 ? scheduleDays.join("، ") : "غير محدد"}</p>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setMode("new")}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    mode === "new"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  طالب جديد
                </button>
                <button
                  onClick={() => setMode("existing")}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    mode === "existing"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  طالب موجود
                </button>
                <button
                  onClick={() => setMode("stage")}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    mode === "stage"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  طلاب المرحلة
                </button>
              </div>
            </div>

            <div className="p-6">
              {mode === "existing" ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">البحث عن طالب</label>
                    <div className="relative">
                      <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="ابحث بالاسم أو البريد الإلكتروني..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pr-12 pl-4 py-3 bg-background border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  {searching && (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  )}

                  {!searching && searchResults.length > 0 && (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {searchResults.map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-bold text-primary">
                                {student.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{student.name}</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {student.email}
                              </p>
                              {student.phone && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {student.phone}
                                </p>
                              )}
                              {student.grade && (
                                <p className="text-sm text-muted-foreground">
                                  {student.stage || ""} {student.stage && student.grade ? "•" : ""} {student.grade}
                                </p>
                              )}
                            </div>
                          </div>
                          <button
                              onClick={() => handleAddExisting(student.id)}
                              disabled={adding}
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                              <Send className="w-4 h-4" />
                              {adding ? "جاري الإضافة..." : "إضافة للمجموعة"}
                            </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {!searching && searchQuery && searchResults.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>لم يتم العثور على طلاب</p>
                    </div>
                  )}
                </div>
              ) : mode === "stage" ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/50 rounded-lg text-sm">
                    <GraduationCap className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">الطلاب في نفس المرحلة والصف:</span>
                    <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">
                      {getStageLabel(groupStage) || "غير محدد"}
                    </span>
                    <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">
                      {groupGrade || "غير محدد"}
                    </span>
                  </div>

                  {loadingStage ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : stageStudents.length > 0 ? (
                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {stageStudents.map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-bold text-primary">
                                {student.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{student.name}</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {student.email}
                              </p>
                              {student.phone && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {student.phone}
                                </p>
                              )}
                            </div>
                          </div>
                          <button
                              onClick={() => handleAddExisting(student.id)}
                              disabled={adding}
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                              <Send className="w-4 h-4" />
                              {adding ? "جاري الإضافة..." : "إضافة للمجموعة"}
                            </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>لا يوجد طلاب في نفس المرحلة والصف بعد</p>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleCreateNew} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">اسم الطالب</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="الاسم الكامل"
                      required
                      className="w-full px-4 py-3 bg-background border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="example@email.com"
                      required
                      dir="ltr"
                      className="w-full px-4 py-3 bg-background border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">رقم الهاتف</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+20 1XX XXX XXXX"
                      required
                      dir="ltr"
                      className="w-full px-4 py-3 bg-background border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">المرحلة الدراسية</label>
                    <div className="w-full px-4 py-3 bg-muted/50 border border-dashed border-border rounded-lg text-base text-muted-foreground">
                      {getStageLabel(groupStage) || "غير محدد"}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">تُحدد تلقائياً حسب المجموعة</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">الصف الدراسي</label>
                    <div className="w-full px-4 py-3 bg-muted/50 border border-dashed border-border rounded-lg text-base text-muted-foreground">
                      {groupGrade || "غير محدد"}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">تُحدد تلقائياً حسب المجموعة</p>
                  </div>

                  {/* Parent info (optional) */}
                  <div className="pt-2">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="flex-1 h-px bg-border" />
                      <span className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                        بيانات ولي الأمر
                        <span className="px-2 py-0.5 bg-muted rounded text-xs font-medium">اختياري</span>
                      </span>
                      <span className="flex-1 h-px bg-border" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      إن أضفت بريد ولي الأمر سيتم إنشاء حساب له تلقائياً وربطه بالطالب، وإرسال بيانات الدخول ومعلومات المجموعة إلى بريده.
                    </p>

                    <div>
                      <label className="block text-sm font-medium mb-2">اسم ولي الأمر</label>
                      <input
                        type="text"
                        value={formData.parentName}
                        onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                        placeholder="الاسم الكامل (اختياري)"
                        className="w-full px-4 py-3 bg-background border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium mb-2">بريد ولي الأمر</label>
                      <input
                        type="email"
                        value={formData.parentEmail}
                        onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                        placeholder="parent@email.com"
                        dir="ltr"
                        className="w-full px-4 py-3 bg-background border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium mb-2">هاتف ولي الأمر</label>
                      <input
                        type="tel"
                        value={formData.parentPhone}
                        onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                        placeholder="+20 1XX XXX XXXX"
                        dir="ltr"
                        className="w-full px-4 py-3 bg-background border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                    <p>سيتم إنشاء حساب للطالب بكلمة مرور عشوائية وإرسال بيانات الدخول إلى بريده الإلكتروني، وستطابق المرحلة والصف تلقائياً مع المجموعة.</p>
                  </div>

                  <button
                    type="submit"
                    disabled={creating}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {creating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin ml-2 inline" />
                        جاري الإنشاء...
                      </>
                    ) : (
                      "إنشاء حساب وإضافة للمجموعة"
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
