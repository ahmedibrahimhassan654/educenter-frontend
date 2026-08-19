"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { toast } from "sonner";
import {
  Wallet,
  PlusCircle,
  MinusCircle,
  BookOpen,
  GraduationCap,
  Loader2,
  CircleDollarSign,
  CalendarDays,
} from "lucide-react";

interface WalletTransaction {
  id: string;
  type: "PURCHASE" | "OPEN_LESSON";
  amount: number;
  notes: string;
  groupName: string | null;
  lessonTitle: string | null;
  createdAt: string;
}

interface PaidLesson {
  id: string;
  groupId: string;
  groupName: string | null;
  subject: string | null;
  stage: string | null;
  grade: string | null;
  lessonId: string;
  lessonTitle: string | null;
  lessonType: string | null;
  scheduledAt: string | null;
  consumedAt: string;
}

interface WalletData {
  balance: number;
  transactions: WalletTransaction[];
  paidLessons: PaidLesson[];
}

export default function StudentWalletPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<WalletData | null>(null);

  const fetchWallet = useCallback(async () => {
    try {
      const res = await api.get("/wallet");
      setData(res.data?.data || null);
    } catch {
      toast.error("تعذر تحميل بيانات المحفظة");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "STUDENT") {
      fetchWallet();
    }
  }, [user?.role, fetchWallet]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const balance = data?.balance ?? 0;
  const transactions = data?.transactions ?? [];
  const paidLessons = data?.paidLessons ?? [];

  return (
    <>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">محفظة الحصص</h2>
          <p className="text-base text-muted-foreground mt-1">
            رصيدك العام من الحصص يُصرف على فتح الدروس في كل المجموعات
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-gradient-to-br from-primary to-primary/70 rounded-xl p-6 text-primary-foreground">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/15 flex items-center justify-center">
                <Wallet className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm text-primary-foreground/80">رصيد الحصص المتاح</p>
                <p className="text-4xl font-bold mt-1">
                  {balance.toLocaleString("ar-EG")}{" "}
                  <span className="text-xl font-semibold">حصة</span>
                </p>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/80 mt-4">
              كل حصة تفتح درساً واحداً في أي مجموعة أنت عضو بها — الدرس يبقى مفتوحاً
              بعد فتحه دون خصم إضافي
            </p>
          </div>

          <div className="bg-card border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <CircleDollarSign className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-sm text-muted-foreground">الدروس المفتوحة</p>
            </div>
            <p className="text-3xl font-bold">
              {paidLessons.length.toLocaleString("ar-EG")}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              درس مدفوع من رصيدك
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary" />
                سجل الحركات
              </h3>
            </div>
            <div className="divide-y">
              {transactions.length === 0 && (
                <p className="p-6 text-center text-muted-foreground">
                  لا توجد حركات بعد — اشترِ حصصاً من أي مجموعة لتعبئة محفظتك
                </p>
              )}
              {transactions.map((t) => {
                const isPurchase = t.type === "PURCHASE";
                const Icon = isPurchase ? PlusCircle : MinusCircle;
                return (
                  <div
                    key={t.id}
                    className="p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        isPurchase
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {t.notes || (isPurchase ? "شراء حصص" : "فتح درس")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(t.createdAt).toLocaleString("ar-EG")}
                      </p>
                    </div>
                    <span
                      className={`font-bold text-sm shrink-0 ${
                        isPurchase ? "text-emerald-500" : "text-red-500"
                      }`}
                    >
                      {isPurchase ? "+" : "−"}
                      {Math.abs(t.amount).toLocaleString("ar-EG")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                الدروس المدفوعة من رصيدك
              </h3>
            </div>
            <div className="divide-y">
              {paidLessons.length === 0 && (
                <p className="p-6 text-center text-muted-foreground">
                  لم تفتح أي درس من رصيدك بعد
                </p>
              )}
              {paidLessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="p-4 flex items-start gap-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {lesson.lessonTitle || "درس"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {lesson.groupName || "مجموعة"}
                      {lesson.subject ? ` • ${lesson.subject}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <CalendarDays className="w-3 h-3" />
                      فُتح في {new Date(lesson.consumedAt).toLocaleDateString("ar-EG")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}