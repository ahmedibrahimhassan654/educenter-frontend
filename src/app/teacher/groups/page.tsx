"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import api from "@/lib/api";
import { Group } from "@/types";
import { toast } from "sonner";
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Edit,
  Eye,
  Loader2,
  Filter,
  X,
  Calendar,
  Wallet,
} from "lucide-react";

const stages = ["الكل", "الابتدائي", "الإعدادي", "الثانوي"];
const subjects = ["رياضيات", "فيزياء", "كيمياء", "علوم", "لغة عربية", "لغة إنجليزية", "أخرى"];
const gradesByStage: Record<string, string[]> = {
  "الابتدائي": ["الصف الأول", "الصف الثاني", "الصف الثالث", "الصف الرابع", "الصف الخامس", "الصف السادس"],
  "الإعدادي": ["الصف الأول الإعدادي", "الصف الثاني الإعدادي", "الصف الثالث الإعدادي"],
  "الثانوي": ["الصف الأول الثانوي", "الصف الثاني الثانوي", "الصف الثالث الثانوي"],
};
const allGrades = Object.values(gradesByStage).flat();
const daysOfWeek = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const timeSlots = ["٩:٠٠ ص", "١٠:٠٠ ص", "١١:٠٠ ص", "١٢:٠٠ م", "١:٠٠ م", "٢:٠٠ م", "٣:٠٠ م", "٤:٠٠ م", "٥:٠٠ م", "٦:٠٠ م"];

interface FormData {
  title: string;
  subject: string;
  grade: string;
  stage: string;
  googleMeetLink: string;
  scheduleDays: string[];
  scheduleTimes: Record<string, string>;
}

const defaultFormData: FormData = {
  title: "",
  subject: "",
  grade: "",
  stage: "",
  googleMeetLink: "",
  scheduleDays: [],
  scheduleTimes: {},
};

export default function TeacherGroupsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState("الكل");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchGroups = async () => {
    try {
      const response = await api.get("/groups");
      setGroups(response.data);
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast.error("فشل في تحميل المجموعات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchGroups();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const getStageFromGrade = (grade: string): string => {
    if (grade.includes("ابتدائي") || Object.values(gradesByStage["الابتدائي"]).some(g => grade === g)) {
      return "الابتدائي";
    }
    if (grade.includes("إعدادي") || Object.values(gradesByStage["الإعدادي"]).some(g => grade === g)) {
      return "الإعدادي";
    }
    if (grade.includes("الثانوي") || Object.values(gradesByStage["الثانوي"]).some(g => grade === g)) {
      return "الثانوي";
    }
    return "الثانوي";
  };

  const filteredGroups = groups.filter((group) => {
    const matchesSearch = group.title.toLowerCase().includes(searchQuery.toLowerCase());
    const groupStage = getStageFromGrade(group.grade);
    const matchesStage = selectedStage === "الكل" || groupStage === selectedStage;
    return matchesSearch && matchesStage;
  });

  const resetForm = () => {
    setFormData(defaultFormData);
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (group: Group) => {
    const parsedDays: string[] = [];
    const parsedTimes: Record<string, string> = {};

    (group.scheduleDays || []).forEach((slot) => {
      const matchedDay = daysOfWeek.find((d) => slot.startsWith(d));
      if (matchedDay) {
        const timePart = slot.slice(matchedDay.length).trim();
        parsedDays.push(matchedDay);
        parsedTimes[matchedDay] = timePart;
      }
    });

    setEditingGroup(group);
    setFormData({
      title: group.title,
      subject: group.subject,
      grade: group.grade,
      stage: getStageFromGrade(group.grade),
      googleMeetLink: group.googleMeetLink || "",
      scheduleDays: parsedDays,
      scheduleTimes: parsedTimes,
    });
    setShowEditModal(true);
  };

  const handleScheduleChange = (day: string, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        scheduleDays: [...prev.scheduleDays, day],
        scheduleTimes: { ...prev.scheduleTimes, [day]: "٩:٠٠ ص" },
      }));
    } else {
      setFormData((prev) => {
        const newScheduleDays = prev.scheduleDays.filter((d) => d !== day);
        const newScheduleTimes = { ...prev.scheduleTimes };
        delete newScheduleTimes[day];
        return { ...prev, scheduleDays: newScheduleDays, scheduleTimes: newScheduleTimes };
      });
    }
  };

  const handleTimeChange = (day: string, time: string) => {
    setFormData((prev) => ({
      ...prev,
      scheduleTimes: { ...prev.scheduleTimes, [day]: time },
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      toast.error("يرجى إدخال اسم المجموعة");
      return false;
    }
    if (!formData.subject) {
      toast.error("يرجى اختيار المادة");
      return false;
    }
    if (!formData.grade) {
      toast.error("يرجى اختيار الصف الدراسي");
      return false;
    }
    if (!formData.stage) {
      toast.error("يرجى اختيار المرحلة الدراسية");
      return false;
    }
    if (formData.scheduleDays.length === 0) {
      toast.error("يرجى اختيار يوم واحد على الأقل للحصص");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const scheduleDays = formData.scheduleDays.map((day) => `${day} ${formData.scheduleTimes[day] || "٩:٠٠ ص"}`);
      
      if (editingGroup) {
        await api.put(`/groups/${editingGroup.id}`, {
          title: formData.title,
          subject: formData.subject,
          grade: formData.grade,
          stage: formData.stage,
          googleMeetLink: formData.googleMeetLink,
          scheduleDays,
        });
        toast.success("تم تحديث المجموعة بنجاح");
      } else {
        await api.post("/groups", {
          title: formData.title,
          subject: formData.subject,
          grade: formData.grade,
          stage: formData.stage,
          googleMeetLink: formData.googleMeetLink,
          scheduleDays,
        });
        toast.success("تم إنشاء المجموعة بنجاح");
      }
      
      setShowCreateModal(false);
      setShowEditModal(false);
      setEditingGroup(null);
      resetForm();
      fetchGroups();
    } catch (error: any) {
      const message = error.response?.data?.message || (editingGroup ? "فشل في تحديث المجموعة" : "فشل في إنشاء المجموعة");
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return;

    if (group.students.length > 0) {
      toast.error("لا يمكن حذف المجموعة لأن بها طلاب مسجلين");
      return;
    }

    if (!confirm(`هل أنت متأكد من حذف مجموعة "${group.title}"؟`)) return;

    setDeletingId(groupId);
    try {
      await api.delete(`/groups/${groupId}`);
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
      toast.success("تم حذف المجموعة بنجاح");
    } catch (error: any) {
      const message = error.response?.data?.message || "فشل في حذف المجموعة";
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  const canModify = (group: Group): boolean => {
    return group.students.length === 0;
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

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">المجموعات</h2>
            <p className="text-base text-muted-foreground mt-1">
              إدارة مجموعاتك التعليمية والطلاب
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg text-base font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            إنشاء مجموعة جديدة
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="البحث عن مجموعة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-12 pl-4 py-3 bg-background border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {stages.map((stage) => (
              <button
                key={stage}
                onClick={() => setSelectedStage(stage)}
                className={`px-5 py-3 rounded-lg text-base font-medium transition-colors ${
                  selectedStage === stage
                    ? "bg-primary text-primary-foreground"
                    : "bg-background border hover:bg-muted"
                }`}
              >
                {stage}
              </button>
            ))}
          </div>
        </div>

        {/* Groups Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              className="bg-card border rounded-xl p-6 hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-foreground mb-1 truncate">{group.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{group.subject}</span>
                    <span>•</span>
                    <span>{group.stage || getStageFromGrade(group.grade)}</span>
                    <span>•</span>
                    <span>{group.grade}</span>
                  </div>
                  {(group.teacherId as any)?.verificationData?.curriculum && (group.teacherId as any).verificationData.curriculum.length > 0 && (
                    <div className="mt-1">
                      <p className="text-xs text-muted-foreground">متخصص في:</p>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {(group.teacherId as any).verificationData.curriculum.map((entry: string, i: number) => {
                          const [key, subjectName] = entry.split(":");
                          const parts = key ? key.split("-") : [];
                          const stage = parts[0] || "";
                          const grade = parts.slice(1).join("-");
                          return (
                            <span key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-500/10 text-green-700 dark:text-green-400 rounded text-xs">
                              {subjectName} <span className="text-muted-foreground">({stage} - {grade})</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(group)}
                    disabled={!canModify(group)}
                    className="p-2 hover:bg-muted rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    title={canModify(group) ? "تعديل" : "لا يمكن التعديل - يوجد طلاب"}
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(group.id)}
                    disabled={!canModify(group) || deletingId === group.id}
                    className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-muted-foreground transition-colors"
                    title={canModify(group) ? "حذف" : "لا يمكن الحذف - يوجد طلاب"}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Enrollment */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">الطلاب المسجلين</span>
                  <span className="text-sm font-bold">
                    {group.students.length}/20
                  </span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      group.students.length >= 20 ? "bg-green-500" : "bg-primary"
                    }`}
                    style={{ width: `${(group.students.length / 20) * 100}%` }}
                  />
                </div>
                {group.students.length >= 20 && (
                  <p className="text-xs text-green-500 mt-1">مكتملة العدد</p>
                )}
                {group.students.length > 0 && (
                  <p className="text-xs text-amber-500 mt-1">⚠ لا يمكن تعديل أو حذف هذه المجموعة</p>
                )}
              </div>

              {/* Sessions & Earnings */}
              <div className="flex items-center gap-4 mb-4 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>سعر الحصة: {group.totalSessionPrice} ج.م</span>
                </div>
              </div>

              {/* Schedule */}
              <div className="flex flex-wrap gap-2 mb-5">
                {(group.scheduleDays || []).slice(0, 3).map((slot, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-muted rounded-lg text-xs"
                  >
                    <Calendar className="w-3 h-3" />
                    {slot}
                  </span>
                ))}
                {(group.scheduleDays || []).length > 3 && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-muted rounded-lg text-xs text-muted-foreground">
                    +{(group.scheduleDays || []).length - 3} مواعيد أخرى
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t mt-auto">
                <Link
                  href={`/teacher/groups/${group.id}`}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  عرض المجموعة
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredGroups.length === 0 && (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">لا توجد مجموعات</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || selectedStage !== "الكل" ? "لم يتم العثور على مجموعات تطابق البحث" : "ابدأ بإنشاء مجموعتك الأولى"}
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg text-base font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              إنشاء مجموعة جديدة
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Group Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setShowCreateModal(false);
              setShowEditModal(false);
              setEditingGroup(null);
              resetForm();
            }}
          />
          <div className="relative bg-background rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">
                  {editingGroup ? "تعديل المجموعة" : "إنشاء مجموعة جديدة"}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setEditingGroup(null);
                    resetForm();
                  }}
                  className="p-2 hover:bg-muted rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Stage Selection */}
              <div>
                <label className="block text-base font-medium mb-3">المرحلة الدراسية</label>
                <div className="flex gap-3">
                  {["الابتدائي", "الإعدادي", "الثانوي"].map((stage) => (
                    <button
                      key={stage}
                      type="button"
                       onClick={() => setFormData((prev) => ({ ...prev, stage, grade: "" }))}
                      className={`flex-1 px-4 py-3 border rounded-lg text-base font-medium transition-colors ${
                        formData.stage === stage
                          ? "bg-primary text-primary-foreground border-primary"
                          : "hover:bg-primary/10 hover:border-primary hover:text-primary"
                      }`}
                    >
                      {stage}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grade Selection */}
              <div>
                <label className="block text-base font-medium mb-3">الصف الدراسي</label>
                <select
                  value={formData.grade}
                  onChange={(e) => setFormData((prev) => ({ ...prev, grade: e.target.value }))}
                  className="w-full px-4 py-3 border rounded-lg text-base bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={!formData.stage}
                >
                  <option value="">اختر الصف</option>
                  {(gradesByStage[formData.stage] || allGrades).map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Selection */}
              <div>
                <label className="block text-base font-medium mb-3">المادة</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-4 py-3 border rounded-lg text-base bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">اختر المادة</option>
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              {/* Group Name */}
              <div>
                <label className="block text-base font-medium mb-3">اسم المجموعة</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="مثال: فيزياء الصف الثاني الثانوي"
                  className="w-full px-4 py-3 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Google Meet Link */}
              <div>
                <label className="block text-base font-medium mb-3">رابط Google Meet (اختياري)</label>
                <input
                  type="url"
                  value={formData.googleMeetLink}
                  onChange={(e) => setFormData((prev) => ({ ...prev, googleMeetLink: e.target.value }))}
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  className="w-full px-4 py-3 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Schedule */}
              <div>
                <label className="block text-base font-medium mb-3">مواعيد الحصص الأسبوعية</label>
                <div className="space-y-3">
                  {daysOfWeek.map((day) => (
                    <div key={day} className="flex items-center gap-3 p-3 border rounded-lg">
                      <input
                        type="checkbox"
                        id={`day-${day}`}
                        checked={formData.scheduleDays.includes(day)}
                        onChange={(e) => handleScheduleChange(day, e.target.checked)}
                        className="w-5 h-5 text-primary rounded border-muted-foreground/30 focus:ring-primary"
                      />
                      <label htmlFor={`day-${day}`} className="font-medium w-24">
                        {day}
                      </label>
                      {formData.scheduleDays.includes(day) && (
                        <select
                          value={formData.scheduleTimes[day] || "٩:٠٠ ص"}
                          onChange={(e) => handleTimeChange(day, e.target.value)}
                          className="flex-1 px-3 py-2 border rounded-lg text-base bg-background"
                        >
                          {timeSlots.map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">اختر الأيام والأوقات للحصص الأسبوعية</p>
              </div>

              {/* Price & Capacity Info */}
              <div className="bg-muted/50 rounded-xl p-5">
                <h4 className="text-base font-bold mb-3">معلومات السعر والسعة</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>سعر الحصة الواحدة (ثابت)</span>
                    <span className="font-bold">٥٠ ج.م</span>
                  </div>
                  <div className="flex justify-between">
                    <span>السعة القصوى</span>
                    <span className="font-bold">٢٠ طالب</span>
                  </div>
                  <div className="flex justify-between">
                    <span>إيراد الحصة الكاملة (٢٠ طالب)</span>
                    <span className="font-bold">١٬٠٠٠ ج.م</span>
                  </div>
                  <div className="flex justify-between text-red-500">
                    <span>عمولة المنصة (١٥٪)</span>
                    <span className="font-bold">-١٥٠ ج.م</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t text-green-500">
                    <span className="font-bold">صافي أرباحك للحصة</span>
                    <span className="font-bold text-lg">٨٥٠ ج.م</span>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setEditingGroup(null);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 border rounded-lg text-base font-medium hover:bg-muted transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg text-base font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : editingGroup ? (
                    "حفظ التعديلات"
                  ) : (
                    "إنشاء المجموعة"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}