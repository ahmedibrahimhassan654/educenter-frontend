"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import api from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  GraduationCap,
  Loader2,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

const stages = [
  { key: "ابتدائي", label: "الابتدائي" },
  { key: "إعدادي", label: "الإعدادي" },
  { key: "ثانوي", label: "الثانوي" },
];

const gradesByStage: Record<string, string[]> = {
  ابتدائي: [
    "الأول الابتدائي",
    "الثاني الابتدائي",
    "الثالث الابتدائي",
    "الرابع الابتدائي",
    "الخامس الابتدائي",
    "السادس الابتدائي",
  ],
  إعدادي: [
    "الأول الإعدادي",
    "الثاني الإعدادي",
    "الثالث الإعدادي",
  ],
  ثانوي: [
    "الأول الثانوي",
    "الثاني الثانوي",
    "الثالث الثانوي",
  ],
};

export default function StudentOnboardingPage() {
  const router = useRouter();
  const { user, isLoading, refreshUser } = useAuth();
  const [selectedStage, setSelectedStage] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [curriculumTree, setCurriculumTree] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "STUDENT")) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchCurriculum = async () => {
      try {
        const res = await api.get("/curriculum");
        setCurriculumTree(res.data || []);
      } catch {
        // ignore
      }
    };
    fetchCurriculum();
  }, []);

  const availableGrades = selectedStage ? (gradesByStage[selectedStage] || []) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStage || !selectedGrade) {
      toast.error("يرجى اختيار المرحلة الدراسية والصف");
      return;
    }

    setSubmitting(true);
    try {
      await api.put("/users/me", {
        stage: selectedStage,
        grade: selectedGrade,
      });

      await refreshUser();
      toast.success("تم حفظ بياناتك بنجاح!");
      router.push("/student");
    } catch (error: any) {
      const message = error.response?.data?.message || "فشل في حفظ البيانات";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-lg">
        <div className="bg-card border rounded-2xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">أهلاً بك في إديو سنتر!</h1>
            <p className="text-muted-foreground">
              اختر مرحلتك الدراسية وصفك لنتمكن من عرض المجموعات المناسبة لك
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-base font-medium mb-3">المرحلة الدراسية</label>
              <div className="grid grid-cols-3 gap-3">
                {stages.map((stage) => (
                  <button
                    key={stage.key}
                    type="button"
                    onClick={() => {
                      setSelectedStage(stage.key);
                      setSelectedGrade("");
                    }}
                    className={`px-4 py-3 border rounded-lg text-sm font-medium transition-all ${
                      selectedStage === stage.key
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "hover:bg-primary/5 hover:border-primary/30"
                    }`}
                  >
                    {stage.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-base font-medium mb-2">الصف الدراسي</label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={!selectedStage}
              >
                <option value="">اختر الصف الدراسي</option>
                {availableGrades.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>

            <Button
              type="submit"
              disabled={submitting || !selectedStage || !selectedGrade}
              className="w-full"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 ml-2" />
                  حفظ وانتقل للاستكشاف
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
