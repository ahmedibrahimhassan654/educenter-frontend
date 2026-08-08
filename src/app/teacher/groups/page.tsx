"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import api from "@/lib/api";
import { Group } from "@/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Plus,
  Search,
  Trash2,
  Edit,
  Eye,
  Loader2,
  X,
  Calendar,
  Wallet,
  Layers,
  GraduationCap,
  CheckCircle,
} from "lucide-react";
import { iconChip, iconColor } from "@/lib/icon-styles";

interface PlatformSettings {
  defaultPricePerLecture: number;
  maxStudentsPerGroup: number;
  platformFeePercentage: number;
}

const daysOfWeek = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const allStages = ["ابتدائي", "إعدادي", "ثانوي"];

// Curriculum entry format: "stageName-gradeName-SUBJECT_CODE:subjectName"
const SUBJECT_CODE = /^[A-Z]{2,}(_[A-Z0-9]+)+$/;

function parseCurriculumEntry(entry: string) {
  const separatorIndex = entry.indexOf(":");
  if (separatorIndex === -1) {
    return { stage: "", grade: "", subject: entry.trim() };
  }
  const key = entry.slice(0, separatorIndex);
  const subject = entry.slice(separatorIndex + 1).trim();
  const parts = key.split("-").filter(Boolean);
  if (parts.length && SUBJECT_CODE.test(parts[parts.length - 1])) {
    parts.pop();
  }
  const stage = parts.shift() || "";
  const grade = parts.join("-");
  return { stage, grade, subject: subject || entry.trim() };
}

function getStageFromGrade(grade: string): string {
  if (grade.includes("ابتدائي")) return "ابتدائي";
  if (grade.includes("إعدادي")) return "إعدادي";
  if (grade.includes("الثانوي")) return "ثانوي";
  return "ثانوي";
}

interface ScheduleSlot {
  day: string;
  time: string;
}

interface FormData {
  title: string;
  subject: string;
  grade: string;
  stage: string;
  googleMeetLink: string;
  scheduleSlots: ScheduleSlot[];
}

const defaultFormData: FormData = {
  title: "",
  subject: "",
  grade: "",
  stage: "",
  googleMeetLink: "",
  scheduleSlots: [], // { day: string, time: string }
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
  const [settings, setSettings] = useState<PlatformSettings>({
    defaultPricePerLecture: 50,
    maxStudentsPerGroup: 20,
    platformFeePercentage: 15,
  });
  const [teacherCurriculum, setTeacherCurriculum] = useState<string[]>([]);
  const [curriculumTree, setCurriculumTree] = useState<any[]>([]);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await api.get("/settings/public");
      setSettings(res.data);
    } catch {
      // Use defaults
    }
  }, []);

  const fetchTeacherCurriculum = useCallback(async () => {
    try {
      // Fetch curriculum tree for subject names
      const treeRes = await api.get("/curriculum");
      setCurriculumTree(treeRes.data || []);
      // Fetch teacher's profile curriculum selections
      const userRes = await api.get("/verification/status");
      setTeacherCurriculum(userRes.data?.verificationData?.curriculum || []);
    } catch {
      // If fails, allow all options
    }
  }, []);

  const fetchGroups = useCallback(async () => {
    try {
      const response = await api.get("/groups");
      setGroups(response.data);
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast.error("فشل في تحميل المجموعات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
    fetchSettings();
    fetchTeacherCurriculum();
  }, [fetchGroups, fetchSettings, fetchTeacherCurriculum]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchGroups();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [fetchGroups]);

  // Build a map of subjectCode -> { stage, grade, subjectName } from curriculum tree
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

  // Resolve teacher's curriculum entries using the curriculum tree
  const teacherEntries = teacherCurriculum
    .map((entry) => {
      const separatorIndex = entry.indexOf(":");
      const key = separatorIndex !== -1 ? entry.slice(0, separatorIndex) : entry;
      const parts = key.split("-").filter(Boolean);
      // Find the subject code (matches pattern like AR_PRIMARY_1)
      const codeIndex = parts.findIndex((p) => /^[A-Z]{2,}(_[A-Z0-9]+)+$/.test(p));
      if (codeIndex === -1) return null;
      const code = parts[codeIndex];
      const info = curriculumMap.get(code);
      if (!info) return null;
      return { code, ...info };
    })
    .filter(Boolean) as Array<{ code: string; stage: string; grade: string; subject: string }>;

  // Filter entries by current form selection
  const filteredEntries = teacherEntries.filter((e) => {
    if (formData.stage && !e.stage.includes(formData.stage) && !formData.stage.includes(e.stage)) return false;
    if (formData.grade && e.grade !== formData.grade) return false;
    return true;
  });

  const availableStages = Array.from(new Set(teacherEntries.map((e) => e.stage)));
  const availableGrades = Array.from(new Set(filteredEntries.map((e) => e.grade)));
  const availableSubjects = Array.from(new Set(filteredEntries.map((e) => e.subject)));

  const hasProfileCurriculum = teacherEntries.length > 0;

  const filteredGroups = groups.filter((group) => {
    const matchesSearch = group.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const groupStage = getStageFromGrade(group.grade);
    const matchesStage = selectedStage === "الكل" || groupStage === selectedStage;
    return matchesSearch && matchesStage;
  });

  const resetForm = () => {
    setFormData(defaultFormData);
  };

  const openCreateModal = () => {
    const initialFormData = { ...defaultFormData };
    // Pre-select first available stage from teacher's profile
    if (availableStages.length > 0) {
      initialFormData.stage = availableStages[0];
    }
    setFormData(initialFormData);
    setShowCreateModal(true);
  };

  const openEditModal = (group: Group) => {
    setEditingGroup(group);
    // Parse old format "Day Time" into structured slots
    const slots: ScheduleSlot[] = (group.scheduleDays || []).map((slot) => {
      const days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
      const matchedDay = days.find((d) => slot.startsWith(d));
      if (matchedDay) {
        const timePart = slot.slice(matchedDay.length).trim();
        return { day: matchedDay, time: timePart || "" };
      }
      return { day: "", time: slot };
    });
    setFormData({
      title: group.title,
      subject: group.subject,
      grade: group.grade,
      stage: group.stage || getStageFromGrade(group.grade),
      googleMeetLink: group.googleMeetLink || "",
      scheduleSlots: slots,
    });
    setShowEditModal(true);
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
    if (formData.scheduleSlots.length === 0) {
      toast.error("يرجى إضافة موعد حصة واحد على الأقل");
      return false;
    }
    const missingInfo = formData.scheduleSlots.some((s) => !s.day || !s.time);
    if (missingInfo) {
      toast.error("يرجى إكمال اليوم والتاريخ والوقت لكل حصة");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      // Format slots as "Day Time" for backend
      const scheduleDays = formData.scheduleSlots.map(
        (s) => `${s.day} ${s.time}`
      );
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

  const platformFeeAmount = Math.round(
    (settings.defaultPricePerLecture * settings.platformFeePercentage) / 100
  );
  const teacherShare = settings.defaultPricePerLecture - platformFeeAmount;

  const totalStudents = groups.reduce((sum, g) => sum + g.students.length, 0);
  const totalCapacity = groups.reduce((sum, g) => sum + (g.maxStudentsPerGroup || settings.maxStudentsPerGroup), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero / Onboarding Section */}
      <div className="bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/10 rounded-2xl border p-6 md:p-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold">ما هي المجموعات التعليمية؟</h2>
                <p className="text-sm text-muted-foreground">دليل شامل لإنشاء وإدارة مجموعاتك</p>
              </div>
            </div>
            <p className="text-base text-muted-foreground leading-relaxed">
              المجموعة التعليمية هي فصل افتراضي يربطك بطلاب يدرسون نفس المادة والصف الدراسي. 
              يمكنك إنشاء مجموعات متعددة، تحديد مواعيد الحصص، واستقبال طلاب من جميع أنحاء مصر.
            </p>

            {/* How it works steps */}
            <div className="grid sm:grid-cols-3 gap-3 pt-2">
              <div className="flex items-start gap-3 p-3 bg-background/60 rounded-lg border">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">١</span>
                </div>
                <div>
                  <p className="text-sm font-semibold">أنشئ مجموعتك</p>
                  <p className="text-xs text-muted-foreground">حدد المادة والصف ومواعيد الحصص</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-background/60 rounded-lg border">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">٢</span>
                </div>
                <div>
                  <p className="text-sm font-semibold">استقبل الطلاب</p>
                  <p className="text-xs text-muted-foreground">الطلاب يكتشفون المجموعة ويسجلون فيها</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-background/60 rounded-lg border">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">٣</span>
                </div>
                <div>
                  <p className="text-sm font-semibold">درّس واكسب</p>
                  <p className="text-xs text-muted-foreground">احسب حضورك واحصل على أرباحك</p>
                </div>
              </div>
            </div>
          </div>

          {/* Earnings Card */}
          <div className="bg-background rounded-xl p-5 border space-y-4">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold">كيف تكسب المال؟</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center p-2.5 bg-muted/50 rounded-lg">
                <span className="text-muted-foreground">سعر الحصة / طالب</span>
                <span className="font-bold text-primary">{settings.defaultPricePerLecture} ج.م</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-muted/50 rounded-lg">
                <span className="text-muted-foreground">حصة المعلم</span>
                <span className="font-bold text-green-600">{teacherShare} ج.م</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-muted/50 rounded-lg">
                <span className="text-muted-foreground">عمولة المنصة</span>
                <span className="font-semibold text-orange-500">{platformFeeAmount} ج.م</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-green-500/10 rounded-lg border border-green-500/20">
                <span className="text-muted-foreground">أرباحك / مجموعة مكتملة</span>
                <span className="font-bold text-green-600 text-base">{teacherShare * settings.maxStudentsPerGroup} ج.م</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              تحسب أرباحك بناءً على عدد الحصص المنتهية وعدد الحاضرين فيها
            </p>
          </div>
        </div>
      </div>

      {/* Payment & Attendance Explanation */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Payment Models */}
        <div className="bg-card border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${iconChip.money} flex items-center justify-center`}>
              <Wallet className={`w-5 h-5 ${iconColor.money}`} />
            </div>
            <h3 className="font-bold text-lg">نظام الدفع</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            الطالب يستطيع الدفع بطريقتين:
          </p>
          <div className="space-y-3">
            <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <span className="text-xs">💵</span>
                </div>
                <h4 className="font-semibold text-sm">الدفع لكل محاضرة</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                الطالب يدفع سعر الحصة الواحدة لكل محاضرة يحضرها. مثال: إذا كانت الحصة ٥٠ ج.م وحضر الطالب ٤ حصص في الشهر، يدفع ٢٠٠ ج.م.
              </p>
            </div>
            <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <span className="text-xs">📅</span>
                </div>
                <h4 className="font-semibold text-sm">الدفع الشهري</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                الطالب يدفع مبلغ ثابت يشمل جميع حصص الشهر. مثال: إذا كانت المجموعة تحتوي على ٤ حصص شهرياً بسعر ٥٠ ج.م للحصة، يدفع ٢٠٠ ج.م شهرياً.
              </p>
            </div>
          </div>
        </div>

        {/* Attendance & Calculation */}
        <div className="bg-card border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${iconChip.people} flex items-center justify-center`}>
              <Users className={`w-5 h-5 ${iconColor.people}`} />
            </div>
            <h3 className="font-bold text-lg">الحضور والحساب</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            كيف نحسب حضورك وأرباحك:
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">تسجيل الحضور</p>
                <p className="text-xs text-muted-foreground">بعد كل محاضرة، يتم تسجيل حضور الطلاب. تحسب أرباحك من الطلاب الحاضرين فقط.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">حساب تلقائي</p>
                <p className="text-xs text-muted-foreground">يتم حساب أرباحك تلقائياً: (عدد الحاضرين × حصة المعلم) لكل محاضرة منتهية.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">تحويل الأرباح</p>
                <p className="text-xs text-muted-foreground">تتحول أرباحك إلى محفظتك الشخصية ويمكن سحبها في أي وقت.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">مجموعاتي</h2>
          <p className="text-sm text-muted-foreground mt-1">
            إدارة مجموعاتك التعليمية والطلاب
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-2">
          <Plus className="w-5 h-5" />
          إنشاء مجموعة جديدة
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${iconChip.primary} flex items-center justify-center`}>
              <Layers className={`w-5 h-5 ${iconColor.primary}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{groups.length}</p>
              <p className="text-sm text-muted-foreground">إجمالي المجموعات</p>
            </div>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${iconChip.people} flex items-center justify-center`}>
              <Users className={`w-5 h-5 ${iconColor.people}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalStudents}/{totalCapacity}</p>
              <p className="text-sm text-muted-foreground">طلاب / سعة</p>
            </div>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${iconChip.money} flex items-center justify-center`}>
              <Wallet className={`w-5 h-5 ${iconColor.money}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{teacherShare} ج.م</p>
              <p className="text-sm text-muted-foreground">حصة المعلم / حصة</p>
            </div>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${iconChip.alert} flex items-center justify-center`}>
              <Users className={`w-5 h-5 ${iconColor.alert}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{settings.maxStudentsPerGroup}</p>
              <p className="text-sm text-muted-foreground">السعة القصوى / مجموعة</p>
            </div>
          </div>
        </div>
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
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedStage("الكل")}
            className={`px-5 py-3 rounded-lg text-sm font-medium transition-colors ${
              selectedStage === "الكل"
                ? "bg-primary text-primary-foreground"
                : "bg-background border hover:bg-muted"
            }`}
          >
            الكل
          </button>
          {allStages.map((stage) => (
            <button
              key={stage}
              onClick={() => setSelectedStage(stage)}
              className={`px-5 py-3 rounded-lg text-sm font-medium transition-colors ${
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
        {filteredGroups.map((group) => {
          const maxStudents = group.maxStudentsPerGroup || settings.maxStudentsPerGroup;
          const enrollmentPercent = Math.round((group.students.length / maxStudents) * 100);
          const isFull = group.students.length >= maxStudents;

          return (
            <div
              key={group.id}
              className="bg-card border rounded-2xl hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden"
            >
              <div className="p-5 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-foreground mb-1 truncate">{group.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="secondary" className="text-xs font-normal">
                        {group.subject}
                      </Badge>
                      <span>•</span>
                      <span>{group.grade}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(group)}
                      disabled={!canModify(group)}
                      className="p-2 hover:bg-muted rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      title={canModify(group) ? "تعديل" : "لا يمكن التعديل"}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(group.id)}
                      disabled={!canModify(group) || deletingId === group.id}
                      className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed text-muted-foreground transition-colors"
                      title={canModify(group) ? "حذف" : "لا يمكن الحذف"}
                    >
                      {deletingId === group.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5 flex-1 flex flex-col">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">الطلاب المسجلين</span>
                    <span className={`text-sm font-bold ${isFull ? "text-green-500" : "text-foreground"}`}>
                      {group.students.length}/{maxStudents}
                    </span>
                  </div>
                  <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isFull ? "bg-green-500" : enrollmentPercent >= 75 ? "bg-amber-500" : "bg-primary"
                      }`}
                      style={{ width: `${Math.min(enrollmentPercent, 100)}%` }}
                    />
                  </div>
                  {isFull && (
                    <Badge variant="outline" className="mt-2 text-green-500 border-green-500/30 bg-green-500/5">
                      مكتملة العدد
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-emerald-500" />
                    <span className="text-muted-foreground">سعر الحصة:</span>
                    <span className="font-semibold">{group.totalSessionPrice} ج.م</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {(group.scheduleDays || []).slice(0, 3).map((slot, i) => (
                    <Badge key={i} variant="outline" className="font-normal text-xs">
                      <Calendar className="w-3 h-3 ml-1" />
                      {slot}
                    </Badge>
                  ))}
                  {(group.scheduleDays || []).length > 3 && (
                    <Badge variant="outline" className="font-normal text-xs text-muted-foreground">
                      +{(group.scheduleDays || []).length - 3} أخرى
                    </Badge>
                  )}
                </div>

                <div className="mt-auto pt-4 border-t">
                  <Link
                    href={`/teacher/groups/${group.id}`}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    عرض المجموعة
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredGroups.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold mb-2">لا توجد مجموعات</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {searchQuery || selectedStage !== "الكل"
              ? "لم يتم العثور على مجموعات تطابق البحث"
              : "ابدأ بإنشاء مجموعتك الأولى واستقبل الطلاب"}
          </p>
          <Button onClick={openCreateModal} className="gap-2">
            <Plus className="w-5 h-5" />
            إنشاء مجموعة جديدة
          </Button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowCreateModal(false);
              setShowEditModal(false);
              setEditingGroup(null);
              resetForm();
            }}
          />
          <div className="relative bg-background rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-background p-6 border-b z-10">
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
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {renderModalContent(formData, setFormData, settings, platformFeeAmount, teacherShare, availableStages, availableGrades, availableSubjects, daysOfWeek, submitting, editingGroup, hasProfileCurriculum)}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function renderModalContent(
  formData: FormData,
  setFormData: React.Dispatch<React.SetStateAction<FormData>>,
  settings: PlatformSettings,
  platformFeeAmount: number,
  teacherShare: number,
  availableStages: string[],
  availableGrades: string[],
  availableSubjects: string[],
  daysOfWeek: string[],
  submitting: boolean,
  editingGroup: Group | null,
  hasProfileCurriculum: boolean
) {
  return (
    <>
      {/* Stage */}
      <div>
        <label className="block text-sm font-medium mb-3">المرحلة الدراسية</label>
        {hasProfileCurriculum && availableStages.length > 0 ? (
          <div className="grid gap-3 grid-cols-3">
            {availableStages.map((stage) => (
              <button
                key={stage}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, stage, grade: "" }))}
                className={`px-4 py-3 border rounded-lg text-sm font-medium transition-all ${
                  formData.stage === stage
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "hover:bg-primary/5 hover:border-primary/30"
                }`}
              >
                {stage}
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {["ابتدائي", "إعدادي", "ثانوي"].map((stage) => (
              <button
                key={stage}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, stage, grade: "" }))}
                className={`px-4 py-3 border rounded-lg text-sm font-medium transition-all ${
                  formData.stage === stage
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "hover:bg-primary/5 hover:border-primary/30"
                }`}
              >
                {stage}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grade */}
      <div>
        <label className="block text-sm font-medium mb-2">الصف الدراسي</label>
        {hasProfileCurriculum && availableGrades.length > 0 ? (
          <select
            value={formData.grade}
            onChange={(e) => setFormData((prev) => ({ ...prev, grade: e.target.value }))}
            className="w-full px-4 py-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={!formData.stage}
          >
            <option value="">اختر الصف</option>
            {availableGrades.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
        ) : (
          <select
            value={formData.grade}
            onChange={(e) => setFormData((prev) => ({ ...prev, grade: e.target.value }))}
            className="w-full px-4 py-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={!formData.stage}
          >
            <option value="">اختر الصف</option>
            {["الأول الابتدائي", "الثاني الابتدائي", "الثالث الابتدائي", "الرابع الابتدائي", "الخامس الابتدائي", "السادس الابتدائي",
              "الأول الإعدادي", "الثاني الإعدادي", "الثالث الإعدادي",
              "الأول الثانوي", "الثاني الثانوي", "الثالث الثانوي"].map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Subject */}
      <div>
        <label className="block text-sm font-medium mb-2">المادة</label>
        {hasProfileCurriculum && availableSubjects.length > 0 ? (
          <select
            value={formData.subject}
            onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
            className="w-full px-4 py-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">اختر المادة</option>
            {availableSubjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        ) : (
          <select
            value={formData.subject}
            onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
            className="w-full px-4 py-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">اختر المادة</option>
            {["رياضيات", "فيزياء", "كيمياء", "علوم", "لغة عربية", "لغة إنجليزية", "تاريخ", "جغرافيا", "أخرى"].map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Group Name */}
      <div>
        <label className="block text-sm font-medium mb-2">اسم المجموعة</label>
        <Input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
          placeholder="مثال: فيزياء الصف الثاني الثانوي"
        />
      </div>

      {/* Google Meet Link */}
      <div>
        <label className="block text-sm font-medium mb-2">رابط Google Meet (اختياري)</label>
        <Input
          type="url"
          value={formData.googleMeetLink}
          onChange={(e) => setFormData((prev) => ({ ...prev, googleMeetLink: e.target.value }))}
          placeholder="https://meet.google.com/xxx-xxxx-xxx"
        />
      </div>

      {/* Schedule - Day & Time */}
      <div>
        <label className="block text-sm font-medium mb-3">مواعيد الحصص الأسبوعية</label>
        <p className="text-xs text-muted-foreground mb-3">اختر اليوم والوقت لكل حصة</p>

        {/* Schedule Slots */}
        <div className="space-y-3 mb-4">
          {formData.scheduleSlots.map((slot, index) => (
            <div key={index} className="p-3 border rounded-lg space-y-2 bg-muted/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">حصة {index + 1}</span>
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      scheduleSlots: prev.scheduleSlots.filter((_, i) => i !== index),
                    }));
                  }}
                  className="p-1 hover:bg-red-500/10 hover:text-red-500 rounded text-muted-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {/* Day */}
                <select
                  value={slot.day}
                  onChange={(e) => {
                    const newSlots = [...formData.scheduleSlots];
                    newSlots[index] = { ...newSlots[index], day: e.target.value };
                    setFormData((prev) => ({ ...prev, scheduleSlots: newSlots }));
                  }}
                  className="px-3 py-2 border rounded-lg text-sm bg-background"
                >
                  <option value="">اختر اليوم</option>
                  {["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"].map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                {/* Time */}
                <input
                  type="time"
                  value={slot.time}
                  onChange={(e) => {
                    const newSlots = [...formData.scheduleSlots];
                    newSlots[index] = { ...newSlots[index], time: e.target.value };
                    setFormData((prev) => ({ ...prev, scheduleSlots: newSlots }));
                  }}
                  className="px-3 py-2 border rounded-lg text-sm bg-background"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Add Slot Button */}
        <button
          type="button"
          onClick={() => {
            setFormData((prev) => ({
              ...prev,
              scheduleSlots: [...prev.scheduleSlots, { day: "", time: "" }],
            }));
          }}
          className="w-full p-3 border border-dashed rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          إضافة موعد حصة
        </button>
      </div>

      {/* Price & Capacity Summary */}
      <div className="bg-muted/50 rounded-xl p-5 space-y-3">
        <h4 className="text-sm font-bold flex items-center gap-2">
          <Wallet className="w-4 h-4 text-emerald-500" />
          ملخص الأسعار والسعة
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">سعر الحصة / طالب</span>
            <span className="font-semibold">{settings.defaultPricePerLecture} ج.م</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">السعة القصوى</span>
            <span className="font-semibold">{settings.maxStudentsPerGroup} طالب</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">حصة المعلم</span>
            <span className="font-semibold text-green-600">{teacherShare} ج.م</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">عمولة المنصة ({settings.platformFeePercentage}%)</span>
            <span className="font-semibold text-orange-500">{platformFeeAmount} ج.م</span>
          </div>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => {
            setFormData(defaultFormData);
          }}
        >
          إلغاء
        </Button>
        <Button type="submit" disabled={submitting} className="flex-1">
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin ml-2" />
              جاري الحفظ...
            </>
          ) : editingGroup ? (
            "حفظ التعديلات"
          ) : (
            "إنشاء المجموعة"
          )}
        </Button>
      </div>
    </>
  );
}
