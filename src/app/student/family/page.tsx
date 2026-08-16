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
  Mail,
  Phone,
  MessageSquare,
  Check,
  X,
  Clock,
  UserCircle,
} from "lucide-react";

function personName(person: FamilyUserRef | string | undefined): string {
  if (!person) return "غير معروف";
  if (typeof person === "string") return "ولي أمر";
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

export default function StudentFamilyPage() {
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
      toast.error("يرجى إدخال البريد الإلكتروني أو رقم هاتف ولي الأمر");
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
        description: "سيصلك إشعار عند قبول ولي الأمر للدعوة",
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

  const handleRespond = async (id: string, action: "accept" | "reject") => {
    setActionId(id);
    try {
      if (action === "accept") {
        await familyApi.acceptInvitation(id);
        toast.success("تم قبول الطلب وربط الحسابين");
      } else {
        await familyApi.rejectInvitation(id);
        toast.success("تم رفض الطلب");
      }
      await loadData();
      await refreshUser();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء معالجة الطلب");
    } finally {
      setActionId(null);
    }
  };

  const handleUnlink = async () => {
    if (!confirm("هل أنت متأكد من فك ربط حسابك من حساب ولي الأمر؟")) return;
    setActionId("unlink-parent");
    try {
      await familyApi.unlinkParent();
      toast.success("تم فك الربط");
      await loadData();
      await refreshUser();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء فك الربط");
    } finally {
      setActionId(null);
    }
  };

  const pendingIncoming = invitations.incoming.filter(
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
      <div className="bg-gradient-to-br from-cyan-500/10 to-violet-500/10 rounded-2xl p-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">العائلة 👨‍👩‍👧</h2>
        <p className="text-lg text-muted-foreground">
          اربط حساب ولي أمرك لمتابعة تعلمك، وقبل طلبات الربط الواردة من أولياء الأمور
        </p>
      </div>

      {/* Connected parent */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl ${iconChip.people} flex items-center justify-center`}>
              <UserCircle className={`w-6 h-6 ${iconColor.people}`} />
            </div>
            <div>
              <h3 className="text-xl font-bold">ولي الأمر المرتبط</h3>
              <p className="text-sm text-muted-foreground">
                {connections.length > 0
                  ? "حساب ولي أمر مرتبط بحسابك"
                  : "لا يوجد ولي أمر مرتبط بعد"}
              </p>
            </div>
          </div>
        </div>

        {connections.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">لم يربط أي ولي أمر حسابك بعد</p>
            <p className="text-muted-foreground mt-1">
              يمكنك إرسال دعوة لولي أمرك من النموذج أدناه
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {connections.map((parent) => (
              <div key={parent._id} className="flex items-center justify-between gap-4 p-5">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {parent.name?.charAt(0) || "؟"}
                  </div>
                  <div>
                    <p className="text-base font-semibold">{parent.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {parent.email ? parent.email : ""}
                      {parent.phone ? ` · ${parent.phone}` : ""}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleUnlink}
                  disabled={actionId === "unlink-parent"}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50"
                >
                  {actionId === "unlink-parent" ? (
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

      {/* Incoming invitations */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl ${iconChip.alert} flex items-center justify-center`}>
              <Mail className={`w-6 h-6 ${iconColor.alert}`} />
            </div>
            <div>
              <h3 className="text-xl font-bold">طلبات الربط الواردة</h3>
              <p className="text-sm text-muted-foreground">
                {pendingIncoming.length > 0
                  ? `${pendingIncoming.length} طلب قيد الانتظار`
                  : "لا توجد طلبات معلّقة"}
              </p>
            </div>
          </div>
        </div>

        {invitations.incoming.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">لم يصلك أي طلب ربط</p>
            <p className="text-muted-foreground mt-1">
              ستظهر هنا طلبات أولياء الأمور لربط حسابك
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {invitations.incoming.map((inv) => {
              const badge = statusBadge[inv.status] || statusBadge.PENDING;
              const pending = inv.status === "PENDING";
              return (
                <div key={inv._id} className="flex items-center justify-between gap-4 p-5">
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl ${iconChip.people} flex items-center justify-center`}>
                      <Users className={`w-6 h-6 ${iconColor.people}`} />
                    </div>
                    <div>
                      <p className="text-base font-semibold">
                        {personName(inv.senderId)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {personEmail(inv.senderId) || "ولي أمر"}
                        {inv.message ? ` · "${inv.message}"` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {!pending && (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.classes}`}>
                        {badge.label}
                      </span>
                    )}
                    {pending && (
                      <>
                        <button
                          onClick={() => handleRespond(inv._id, "accept")}
                          disabled={actionId === inv._id}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                        >
                          {actionId === inv._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          قبول
                        </button>
                        <button
                          onClick={() => handleRespond(inv._id, "reject")}
                          disabled={actionId === inv._id}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                          رفض
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Invite parent form */}
      <div className="bg-card border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-12 h-12 rounded-xl ${iconChip.people} flex items-center justify-center`}>
            <UserPlus className={`w-6 h-6 ${iconColor.people}`} />
          </div>
          <div>
            <h3 className="text-xl font-bold">اربط حساب ولي أمرك</h3>
            <p className="text-sm text-muted-foreground">
              أدخل البريد الإلكتروني أو رقم الهاتف الخاص بحساب ولي الأمر المسجّل
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
              {contactType === "email" ? "البريد الإلكتروني لولي الأمر" : "رقم هاتف ولي الأمر"}
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
                placeholder="أكتب رسالة قصيرة لولي الأمر (اختياري)"
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
                {invitations.outgoing.filter((inv) => inv.status === "PENDING").length > 0
                  ? `${invitations.outgoing.filter((inv) => inv.status === "PENDING").length} دعوة قيد الانتظار`
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
                          "ولي أمر"}
                        {inv.message ? ` · "${inv.message}"` : ""}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.classes}`}>
                    {badge.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}