"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  Search,
  Filter,
  Star,
  Clock,
  Calendar,
  BookOpen,
  GraduationCap,
  Loader2,
  Users,
  Sparkles,
  Check,
  X,
} from "lucide-react";

interface Group {
  _id: string;
  title: string;
  subject: string;
  grade: string;
  stage?: string;
  teacherId: {
    name: string;
    email: string;
    verificationData?: {
      curriculum?: string[];
    };
  };
  students: any[];
  scheduleDays?: string[];
  totalSessionPrice?: number;
}

const stages = ["الكل", "الابتدائي", "الإعدادي", "الثانوي"];
const subjects = ["الكل", "رياضيات", "فيزياء", "كيمياء", "علوم", "لغة عربية", "لغة إنجليزية"];

export default function StudentExplorePage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState("الكل");
  const [selectedSubject, setSelectedSubject] = useState("الكل");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
         const response = await api.get("/groups?explore=true");
          setGroups(response.data?.data || response.data);
      } catch (error) {
        console.error("Error fetching groups:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const studentStage = user?.stage || "";
  const studentGrade = user?.grade || "";

  const getStageFromGrade = (grade: string): string => {
    if (grade.includes("ابتدائي")) return "ابتدائي";
    if (grade.includes("إعدادي")) return "إعدادي";
    if (grade.includes("الثانوي")) return "الثانوي";
    return "";
  };

  const filteredGroups = groups.filter((group) => {
    const matchesSearch =
      group.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.teacherId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.grade?.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesStage = true;
    let matchesGrade = true;
    let matchesSubject = true;

    if (studentStage) {
      const groupStage = group.stage || getStageFromGrade(group.grade);
      matchesStage = groupStage === studentStage;
    }

    if (studentGrade) {
      matchesGrade = group.grade === studentGrade;
    }

    if (selectedSubject !== "الكل") {
      matchesSubject = group.subject === selectedSubject;
    }

    if (selectedStage !== "الكل") {
      const groupStage = group.stage || getStageFromGrade(group.grade);
      matchesStage = matchesStage && groupStage === selectedStage;
    }

    return matchesSearch && matchesStage && matchesGrade && matchesSubject;
  });

  const getScheduleText = (days?: string[]) => {
    if (!days || days.length === 0) return "غير محدد";
    const dayNames: Record<string, string> = {
      Sunday: "الأحد",
      Monday: "الاثنين",
      Tuesday: "الثلاثاء",
      Wednesday: "الأربعاء",
      Thursday: "الخميس",
      Friday: "الجمعة",
      Saturday: "السبت",
    };
    return days.map((d) => dayNames[d] || d).join(" و ");
  };

  const handleAccept = async (groupId: string) => {
    setProcessingId(groupId);
    try {
      await api.post(`/groups/${groupId}/students`, { studentId: user?.id });
      toast.success("تم إرسال طلب الانضمام بنجاح");
      setGroups((prev) => prev.filter((g) => g._id !== groupId));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "فشل في إرسال طلب الانضمام");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRefuse = (groupId: string) => {
    setGroups((prev) => prev.filter((g) => g._id !== groupId));
    toast.success("تم تجاهل المجموعة");
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
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">استكشف المجموعات</h2>
          <p className="text-base text-muted-foreground mt-1">
            {studentStage && studentGrade
              ? `المجموعات المناسبة لك (${studentStage} - ${studentGrade})`
              : "ابحث عن المجموعات المناسبة وانضم إليها"}
          </p>
          {studentStage && studentGrade && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              {studentStage} - {studentGrade}
            </div>
          )}
        </div>

        {/* Search & Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="ابحث عن مادة، معلم، أو صف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-12 pl-4 py-4 bg-background border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <span className="text-base text-muted-foreground">المادة:</span>
            </div>
            {subjects.map((subject) => (
              <button
                key={subject}
                onClick={() => setSelectedSubject(subject)}
                className={`px-4 py-2 rounded-lg text-base font-medium transition-colors ${
                  selectedSubject === subject
                    ? "bg-primary text-primary-foreground"
                    : "bg-background border hover:bg-muted"
                }`}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <p className="text-base text-muted-foreground">
          تم العثور على {filteredGroups.length} مجموعة
        </p>

        {/* Groups Grid */}
        {filteredGroups.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">لا توجد نتائج</h3>
            <p className="text-muted-foreground">جرب تغيير معايير البحث</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <div
                key={group._id}
                className="bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Header */}
                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-1">{group.title}</h3>
                      <p className="text-base text-muted-foreground">{group.grade}</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-base font-medium">{group.teacherId?.name || "غير محدد"}</p>
                      <p className="text-sm text-muted-foreground">معلم</p>
                    </div>
                  </div>

                  {(group.teacherId as any)?.verificationData?.curriculum && (group.teacherId as any).verificationData.curriculum.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {(group.teacherId as any).verificationData.curriculum.map((entry: string, i: number) => {
                        const [key, subjectName] = entry.split(":");
                        const parts = key ? key.split("-") : [];
                        const stage = parts[0] || "";
                        const grade = parts.slice(1).join("-");
                        return (
                          <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/10 text-green-700 dark:text-green-400 rounded text-xs">
                            {subjectName} <span className="text-muted-foreground">({stage} - {grade})</span>
                          </span>
                        );
                      })}
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="w-4 h-4" />
                      <span>{group.subject}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{getScheduleText(group.scheduleDays)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{group.students?.length || 0} طالب</span>
                    </div>
                  </div>

                  {/* Price */}
                  {group.totalSessionPrice && (
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-lg font-bold text-primary">{group.totalSessionPrice} ج.م</p>
                        <p className="text-xs text-muted-foreground">سعر الحصة</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-6 pt-0 flex gap-3">
                  <button
                    onClick={() => handleAccept(group._id)}
                    disabled={processingId === group._id}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    {processingId === group._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        قبول
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleRefuse(group._id)}
                    disabled={processingId === group._id}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    رفض
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
