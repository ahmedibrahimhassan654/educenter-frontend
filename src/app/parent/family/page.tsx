"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/auth-provider";
import familyApi from "@/lib/family-api";
import type { ParentChildInvitation, FamilyUserRef } from "@/types";
import { toast } from "sonner";
import { iconColor, iconChip } from "@/lib/icon-styles";
import {
  Users,
  UserPlus,
  Send,
  Loader2,
  Trash2,
  XCircle,
  Mail,
  Phone,
  MessageSquare,
  Clock,
  CheckCircle,
} from "lucide-react";

function personName(person: FamilyUserRef | string | undefined): string {
  if (!person) return "غير معروف";
  if (typeof person === "string") return "طالب";
  return person.name || "غير معروف";
}

function personEmail(person: FamilyUserRef | string | undefined): string {
  if (!person || typeof person === "string") return "";
  return person.email || "";
}

const statusBadge: Record<string, { label: string; classes: string }> = {
  PENDING: {
    label: "قيد الانتظار",
    classes: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  ACCEPTED: {
    label: "مقبولة",
    classes: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  REJECTED: {
    label: "مرفوضة",
    classes: "bg-red-500/10 text-red-600 dark:text-red-400",
  },
};

export default function ParentFamilyPage() {
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [invitations, setInvitations] = useState<{
    incoming: ParentChildInvitation[];
    outgoing: ParentChildInvitation[];
  }>({ incoming: [], outgoing: [] });
  const [connections, setConnections] = useState<FamilyUserRef[]>([]);

  // Invite form
  const [contact, setContact] = useState("");
  const [contactType, setContactType] = useState<"email" | "phone">("email");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  // Actions
  const [actionId, setActionId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [inv, conn] = await Promise.all([
        familyApi.getInvitations(),
        familyApi.getConnections(),
      ]);
      setInvitations(inv);
      setConnections(conn.connections || []);
    } catch (error: any) {
      console.error("Error loading family data:", error);
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء تحميل البيانات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.trim()) {
      toast.error("يرجى إدخال البريد الإلكتروني أو رقم هاتف الطالب");
      return;
    }

    setSending(true);
    try {
      await familyApi.sendInvitation({
        targetEmail: contactType === "email" ? contact.trim() : undefined,
        targetPhone: contactType === "phone" ? contact.trim() : undefined,
        message: message.trim() || undefined,
      });
      toast.success("تم إرسال الدعوة بنجاح", {
        description: "سيصلك إشعار عند قبول الطالب للدعوة",
      });
      setContact("");
      setMessage("");
      await loadData();
      await refreshUser();
    } catch (error: any) {
      console.error("Error sending invitation:", error);
      toast.error(
        error?.response?.data?.message || "حدث خطأ أثناء إرسال الدعوة"
      );
    } finally {
      setSending(false);
    }
  };

  const handleCancel = async (id: string) => {
    setActionId(id);
    try {
      await familyApi.cancelInvitation(id);
      toast.success("تم إلغاء الدعوة");
      await loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء إلغاء الدعوة");
    } finally {
      setActionId(null);
    }
  };

  const handleUnlink = async (studentId: string) => {
    if (!confirm("هل أنت متأكد من فك ربط هذا الطالب من حسابك؟")) return;
    setActionId(studentId);
    try {
      await familyApi.unlinkChild(studentId);
      toast.success("تم فك ربط الطالب");
      await loadData();
      await refreshUser();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء فك الربط");
    } finally {
      setActionId(null);
    }
  };

  const pendingOutgoing = invitations.outgoing.filter(
    (inv) => inv.status === "PENDING"
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-rose-500/10 to-amber-500/10 rounded-2xl p-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">العائلة 👨‍👩‍👧</h2>
        <p className="text-lg text-muted-foreground">
          اربط حسابات أبنائك بحسابك لمتابعة تعلمهم، أو أرسل دعوة لطفلك بالبريد الإلكتروني أو رقم الهاتف
        </p>
      </div>

      {/* Invite form */}
      <div className="bg-card border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-12 h-12 rounded-xl ${iconChip.people} flex items-center justify-center`}>
            <UserPlus className={`w-6 h-6 ${iconColor.people}`} />
          </div>
          <div>
            <h3 className="text-xl font-bold">ربط طالب جديد</h3>
            <p className="text-sm text-muted-foreground">
              أدخل البريد الإلكتروني أو رقم الهاتف الخاص بحساب الطالب المسجّل
            </p>
          </div>
        </div>

        <form onSubmit={handleSend} className="space-y-5">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setContactType("email")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-base font-medium transition-colors ${
                contactType === "email"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <Mail className="w-5 h-5" />
              البريد الإلكتروني
            </button>
            <button
              type="button"
              onClick={() => setContactType("phone")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-base font-medium transition-colors ${
                contactType === "phone"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <Phone className="w-5 h-5" />
              رقم الهاتف
            </button>
          </div>

          <div className="space-y-2">
            <label className="block text-base font-medium text-foreground">
              {contactType === "email" ? "البريد الإلكتروني للطالب" : "رقم هاتف الطالب"}
            </label>
            <div className="relative">
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                {contactType === "email" ? (
                  <Mail className="w-5 h-5" />
                ) : (
                  <Phone className="w-5 h-5" />
                )}
              </div>
              <input
                type={contactType === "email" ? "email" : "tel"}
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder={contactType === "email" ? "example@email.com" : "01xxxxxxxxx"}
                className="w-full pr-12 pl-4 py-3.5 bg-muted/50 border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-base font-medium text-foreground">
              رسالة اختيارية
            </label>
            <div className="relative">
              <div className="absolute right-4 top-3 text-muted-foreground">
                <MessageSquare className="w-5 h-5" />
              </div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="أكتب رسالة قصيرة للطالب (اختياري)"
                className="w-full pr-12 pl-4 py-3 bg-muted/50 border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={sending}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-primary-foreground rounded-xl text-base font-bold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                جاري الإرسال...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                إرسال الدعوة
              </>
            )}
          </button>
        </form>
      </div>

      {/* Connected children */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl ${iconChip.people} flex items-center justify-center`}>
              <Users className={`w-6 h-6 ${iconColor.people}`} />
            </div>
            <div>
              <h3 className="text-xl font-bold">الأبناء المرتبطون</h3>
              <p className="text-sm text-muted-foreground">{connections.length} طالب مرتبط</p>
            </div>
          </div>
        </div>

        {connections.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">لم تربط أي طالب بعد</p>
            <p className="text-muted-foreground mt-1">
              أرسل دعوة للطالب بالبريد الإلكتروني أو رقم الهاتف وسيتم الربط بعد قبوله
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {connections.map((child) => (
              <div key={child._id} className="flex items-center justify-between gap-4 p-5">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {child.name?.charAt(0) || "؟"}
                  </div>
                  <div>
                    <p className="text-base font-semibold">{child.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {child.grade ? `الصف: ${child.grade}` : ""}
                      {child.email ? ` · ${child.email}` : ""}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleUnlink(child._id)}
                  disabled={actionId === child._id}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50"
                >
                  {actionId === child._id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  فك الربط
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sent invitations */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl ${iconChip.schedule} flex items-center justify-center`}>
              <Clock className={`w-6 h-6 ${iconColor.schedule}`} />
            </div>
            <div>
              <h3 className="text-xl font-bold">الدعوات المرسلة</h3>
              <p className="text-sm text-muted-foreground">
                {pendingOutgoing.length > 0
                  ? `${pendingOutgoing.length} دعوة قيد الانتظار`
                  : "لا توجد دعوات معلّقة"}
              </p>
            </div>
          </div>
        </div>

        {invitations.outgoing.length === 0 ? (
          <div className="text-center py-12">
            <Send className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">لم ترسل أي دعوة بعد</p>
          </div>
        ) : (
          <div className="divide-y">
            {invitations.outgoing.map((inv) => {
              const badge = statusBadge[inv.status] || statusBadge.PENDING;
              return (
                <div key={inv._id} className="flex items-center justify-between gap-4 p-5">
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl ${iconChip.people} flex items-center justify-center`}>
                      <Users className={`w-6 h-6 ${iconColor.people}`} />
                    </div>
                    <div>
                      <p className="text-base font-semibold">
                        {personName(inv.targetUserId)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {personEmail(inv.targetUserId) ||
                          inv.targetEmail ||
                          inv.targetPhone ||
                          "طالب"}
                        {inv.message ? ` · "${inv.message}"` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.classes}`}>
                      {badge.label}
                    </span>
                    {inv.status === "PENDING" && (
                      <button
                        onClick={() => handleCancel(inv._id)}
                        disabled={actionId === inv._id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground border border-border rounded-lg hover:bg-muted/50 transition-colors disabled:opacity-50"
                        title="إلغاء الدعوة"
                      >
                        {actionId === inv._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        إلغاء
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info note */}
      <div className="bg-card border rounded-xl p-6">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl ${iconChip.success} flex items-center justify-center flex-shrink-0`}>
            <CheckCircle className={`w-5 h-5 ${iconColor.success}`} />
          </div>
          <p className="text-muted-foreground leading-relaxed">
            <strong className="text-foreground">طريقة بديلة:</strong> يمكن لابنك ربط حسابه بك أيضاً من خلال إرسال دعوة
            من صفحة العائلة في حسابه، أو باستخدام رمز الربط الخاص بحسابه.
          </p>
        </div>
      </div>
    </div>
  );
}