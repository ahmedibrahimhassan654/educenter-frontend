"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import api from "@/lib/api";
import { Group } from "@/types";
import { toast } from "sonner";
import {
  ArrowLeft,
  Users,
  Calendar,
  Wallet,
  Loader2,
  Settings,
  Plus,
  Trash2,
  UserPlus,
  MoreVertical,
  Edit,
} from "lucide-react";

export default function GroupDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);

  const groupId = params.groupId as string;

  const fetchGroup = async () => {
    try {
      const response = await api.get(`/groups/${groupId}`);
      setGroup(response.data);
    } catch (error: any) {
      const message = error.response?.data?.message || "فشل في تحميل المجموعة";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroup();
  }, [groupId]);

  const handleRemoveStudent = async (studentId: string) => {
    if (!confirm("هل أنت متأكد من إزالة هذا الطالب من المجموعة؟")) return;

    setDeletingStudentId(studentId);
    try {
      await api.delete(`/groups/${groupId}/students/${studentId}`);
      toast.success("تم إزالة الطالب بنجاح");
      fetchGroup();
    } catch (error: any) {
      const message = error.response?.data?.message || "فشل في إزالة الطالب";
      toast.error(message);
    } finally {
      setDeletingStudentId(null);
    }
  };

  const canModify = group?.students.length === 0;

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
              {(group.teacherId as any)?.verificationData?.curriculum && (group.teacherId as any).verificationData.curriculum.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {(group.teacherId as any).verificationData.curriculum.map((entry: string, i: number) => {
                    const [key, subjectName] = entry.split(":");
                    const parts = key ? key.split("-") : [];
                    const stage = parts[0] || "";
                    const grade = parts.slice(1).join("-");
                    return (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-700 dark:text-green-400 rounded text-xs">
                        {subjectName} <span className="text-muted-foreground">({stage} - {grade})</span>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/teacher/groups/${group.id}/attendance`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              الحضور
            </Link>
            {canModify && (
              <button
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                إضافة طالب
              </button>
            )}
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
                <p className="text-2xl font-bold">{group.students.length}/20</p>
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden mt-4">
              <div
                className={`h-full rounded-full ${
                  group.students.length >= 20 ? "bg-green-500" : "bg-primary"
                }`}
                style={{ width: `${(group.students.length / 20) * 100}%` }}
              />
            </div>
            {group.students.length > 0 && (
              <p className="text-xs text-amber-500 mt-2">⚠ لا يمكن تعديل أو حذف المجموعة</p>
            )}
          </div>

          <div className="bg-card border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">سعر الحصة</p>
                <p className="text-2xl font-bold text-green-500">{group.totalSessionPrice} ج.م</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              حصة الطالب: {group.priceTeacherShare} ج.م • عمولة: {group.platformFee}%
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
                <p className="text-sm text-muted-foreground">حالة التعديل</p>
                <p className="text-2xl font-bold">
                  {canModify ? (
                    <span className="text-green-500">مفتوح</span>
                  ) : (
                    <span className="text-amber-500">مقفل</span>
                  )}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {canModify ? "يمكن التعديل والحذف" : "يوجد طلاب - لا يمكن التعديل"}
            </p>
          </div>
        </div>

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

        {/* Students List */}
        <div className="bg-card border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">قائمة الطلاب ({group.students.length})</h3>
            {canModify && group.students.length < 20 && (
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                <UserPlus className="w-4 h-4" />
                إضافة طالب
              </button>
            )}
          </div>

          {(group.students || []).length > 0 ? (
            <div className="space-y-3">
              {group.students.map((student: any) => (
                <div
                  key={student._id || student.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">
                        {(student.name || "طالب").charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{student.name || "طالب"}</p>
                      <p className="text-sm text-muted-foreground">
                        {student.email || "لا يوجد بريد"}
                      </p>
                    </div>
                  </div>
                  {canModify && (
                    <button
                      onClick={() => handleRemoveStudent(student._id || student.id)}
                      disabled={deletingStudentId === (student._id || student.id)}
                      className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg text-muted-foreground transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">لا يوجد طلاب في هذه المجموعة بعد</p>
              {canModify && (
                <button
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  إضافة أول طالب
                </button>
              )}
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
    </>
  );
}