"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/auth-provider";
import familyApi from "@/lib/family-api";
import type { FamilyUserRef } from "@/types";
import { toast } from "sonner";
import {
  Wallet,
  Users,
  Loader2,
  ChevronDown,
  GraduationCap,
  BookOpen,
  PlusCircle,
  MinusCircle,
  CalendarDays,
} from "lucide-react";

type ChildMonitoring = Awaited<ReturnType<typeof familyApi.getChildMonitoring>>;

export default function ParentChildrenPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<FamilyUserRef[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [monitoring, setMonitoring] = useState<ChildMonitoring | null>(null);
  const [monitoringLoading, setMonitoringLoading] = useState(false);

  const fetchChildren = useCallback(async () => {
    try {
      const data = await familyApi.getConnections();
      setChildren(data.connections);
    } catch {
      toast.error("تعذر تحميل قائمة الأبناء");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "PARENT") {
      fetchChildren();
    }
  }, [user?.role, fetchChildren]);

  const selectChild = useCallback(
    async (childId: string) => {
      if (selectedId === childId) {
        setSelectedId(null);
        setMonitoring(null);
        return;
      }
      setSelectedId(childId);
      setMonitoring(null);
      setMonitoringLoading(true);
      try {
        const data = await familyApi.getChildMonitoring(childId);
        setMonitoring(data);
      } catch {
        toast.error("تعذر تحميل بيانات متابعة الطالب");
      } finally {
        setMonitoringLoading(false);
      }
    },
    [selectedId]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">متابعة الأبناء</h2>
          <p className="text-base text-muted-foreground mt-1">
            تابع رصيد حصص أبنائك والدروس المدفوعة من رصيدهم في كل المجموعات
          </p>
        </div>

        {children.length === 0 ? (
          <div className="bg-card border rounded-xl p-10 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">لا يوجد أبناء مرتبطون بحسابك</p>
            <p className="text-sm text-muted-foreground mt-2">
              اربط حساب ابنك من صفحة «العائلة» ليظهر هنا
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {children.map((child) => {
              const open = selectedId === child._id;
              return (
                <div key={child._id} className="bg-card border rounded-xl overflow-hidden">
                  <button
                    onClick={() => selectChild(child._id)}
                    className="w-full p-5 flex items-center gap-4 hover:bg-muted/30 transition-colors text-right"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      {child.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={child.avatarUrl}
                          alt={child.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <GraduationCap className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate">{child.name}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {[child.stage, child.grade].filter(Boolean).join(" • ") ||
                          "طالب"}
                      </p>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-muted-foreground transition-transform shrink-0 ${
                        open ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {open && (
                    <div className="border-t p-5">
                      {monitoringLoading ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                      ) : monitoring ? (
                        <div className="space-y-6">
                          <div className="grid md:grid-cols-3 gap-4">
                            <div className="bg-gradient-to-br from-primary to-primary/70 rounded-xl p-5 text-primary-foreground">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                                  <Wallet className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="text-xs text-primary-foreground/80">
                                    رصيد الحصص المتاح
                                  </p>
                                  <p className="text-2xl font-bold">
                                    {monitoring.balance.toLocaleString("ar-EG")}{" "}
                                    <span className="text-base">حصة</span>
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="bg-card border rounded-xl p-5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                  <BookOpen className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    الدروس المدفوعة
                                  </p>
                                  <p className="text-2xl font-bold">
                                    {monitoring.paidLessons.length.toLocaleString("ar-EG")}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="bg-card border rounded-xl p-5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                  <Wallet className="w-5 h-5 text-amber-500" />
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    إجمالي الحصص المشتراة
                                  </p>
                                  <p className="text-2xl font-bold">
                                    {monitoring.transactions
                                      .filter((t) => t.type === "PURCHASE")
                                      .reduce((s, t) => s + t.amount, 0)
                                      .toLocaleString("ar-EG")}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-card border rounded-xl overflow-hidden">
                            <div className="p-5 border-b flex items-center gap-2">
                              <BookOpen className="w-5 h-5 text-primary" />
                              <h3 className="font-bold">الدروس المدفوعة من رصيده</h3>
                            </div>
                            {monitoring.paidLessons.length === 0 ? (
                              <p className="p-6 text-center text-muted-foreground">
                                لم يفتح هذا الطالب أي درس من رصيده بعد
                              </p>
                            ) : (
                              <div className="divide-y">
                                {monitoring.paidLessons.map((lesson) => (
                                  <div key={lesson.id} className="p-4 flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                      <GraduationCap className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-sm truncate">
                                        {lesson.lessonTitle || "درس"}
                                      </p>
                                      <p className="text-xs text-muted-foreground mt-0.5">
                                        {lesson.groupName || "مجموعة"}
                                        {lesson.subject
                                          ? ` • ${lesson.subject}`
                                          : ""}
                                        {lesson.stage || lesson.grade
                                          ? ` • ${[lesson.stage, lesson.grade].filter(Boolean).join(" - ")}`
                                          : ""}
                                      </p>
                                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                        <CalendarDays className="w-3 h-3" />
                                        فُتح في{" "}
                                        {new Date(lesson.consumedAt).toLocaleDateString(
                                          "ar-EG"
                                        )}
                                        {lesson.scheduledAt
                                          ? ` — موعد الدرس ${new Date(lesson.scheduledAt).toLocaleDateString("ar-EG")}`
                                          : ""}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="bg-card border rounded-xl overflow-hidden">
                            <div className="p-5 border-b flex items-center gap-2">
                              <Wallet className="w-5 h-5 text-primary" />
                              <h3 className="font-bold">سجل الحركات</h3>
                            </div>
                            {monitoring.transactions.length === 0 ? (
                              <p className="p-6 text-center text-muted-foreground">
                                لا توجد حركات على المحفظة
                              </p>
                            ) : (
                              <div className="divide-y">
                                {monitoring.transactions.map((t) => {
                                  const isPurchase = t.type === "PURCHASE";
                                  const Icon = isPurchase
                                    ? PlusCircle
                                    : MinusCircle;
                                  return (
                                    <div
                                      key={t.id}
                                      className="p-4 flex items-center gap-3"
                                    >
                                      <div
                                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                                          isPurchase
                                            ? "bg-emerald-500/10 text-emerald-500"
                                            : "bg-red-500/10 text-red-500"
                                        }`}
                                      >
                                        <Icon className="w-4 h-4" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                          {t.notes ||
                                            (isPurchase ? "شراء حصص" : "فتح درس")}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                          {new Date(t.createdAt).toLocaleDateString(
                                            "ar-EG"
                                          )}
                                        </p>
                                      </div>
                                      <span
                                        className={`font-bold text-sm shrink-0 ${
                                          isPurchase
                                            ? "text-emerald-500"
                                            : "text-red-500"
                                        }`}
                                      >
                                        {isPurchase ? "+" : "−"}
                                        {Math.abs(t.amount).toLocaleString("ar-EG")}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}