"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Loader2,
  Hourglass,
  Check,
  X,
  Mail,
  Phone,
  BookOpen,
  GraduationCap,
} from "lucide-react";

interface JoinRequestRecord {
  id: string;
  group?:
    | { _id?: string; id?: string; title?: string; subject?: string; grade?: string; stage?: string }
    | string;
  student?:
    | { _id?: string; name?: string; email?: string; phone?: string; stage?: string; grade?: string }
    | string;
  status: string;
  createdAt: string;
}

export default function TeacherJoinRequestsPage() {
  useAuth();
  const [requests, setRequests] = useState<JoinRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/groups/join-requests")
      .then((res) => setRequests(res.data?.data || []))
      .catch(() => toast.error("فشل في تحميل طلبات الانضمام"))
      .finally(() => setLoading(false));
  }, []);

  const handleRequest = async (id: string, action: "accept" | "reject") => {
    setProcessingId(id);
    try {
      await api.post(`/groups/join-requests/${id}/${action}`);
      toast.success(
        action === "accept"
          ? "تم قبول الطلب وانضم الطالب للمجموعة"
          : "تم رفض الطلب"
      );
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "حدث خطأ أثناء معالجة الطلب"
      );
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/teacher/groups"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          العودة للمجموعات
        </Link>
        <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
          <span className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Hourglass className="w-6 h-6 text-amber-500" />
          </span>
          طلبات الانضمام
        </h2>
        <p className="text-muted-foreground mt-2">
          طلبات انضمام أرسلها الطلاب لمجموعاتك — راجعها وقم بقبولها أو رفضها.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-card border rounded-2xl p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Hourglass className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold mb-2">لا توجد طلبات انضمام</h3>
          <p className="text-muted-foreground">
            عندما يرسل الطلاب طلبات انضمام لمجموعاتك ستظهر هنا.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const group = typeof req.group === "object" ? req.group : null;
            const student = typeof req.student === "object" ? req.student : null;
            const gid = (group?._id || group?.id) as string;
            const name = student?.name || "طالب";
            return (
              <div
                key={req.id}
                className="bg-card border border-amber-500/30 rounded-2xl p-5"
              >
                <div className="flex flex-wrap items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-500/15 flex items-center justify-center text-xl font-bold text-amber-600 dark:text-amber-400">
                    {name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-lg">{name}</p>
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
                      {student?.grade && (
                        <span className="flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5" />
                          الصف: {student.grade}
                        </span>
                      )}
                      <span className="text-xs">
                        {new Date(req.createdAt).toLocaleDateString("ar-EG")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 rounded-xl bg-muted/50 border flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span className="font-semibold">{group?.title || "مجموعة"}</span>
                    {group?.subject && <span>• {group.subject}</span>}
                    {group?.grade && <span>• {group.grade}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    {gid && (
                      <Link
                        href={`/teacher/groups/${gid}`}
                        className="text-sm text-primary hover:underline"
                      >
                        عرض المجموعة
                      </Link>
                    )}
                    <Button
                      onClick={() => handleRequest(req.id, "accept")}
                      disabled={processingId === req.id}
                      className="gap-2"
                    >
                      {processingId === req.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      قبول
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleRequest(req.id, "reject")}
                      disabled={processingId === req.id}
                      className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-500/10 border-red-500/30"
                    >
                      <X className="w-4 h-4" />
                      رفض
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}