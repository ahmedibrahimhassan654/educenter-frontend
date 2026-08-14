"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import api from "@/lib/api";
import { iconColor } from "@/lib/icon-styles";
import {
  BookOpen,
  Calendar,
  Clock,
  Users,
  ArrowLeft,
  TrendingUp,
  CheckCircle,
  Loader2,
  Mail,
  Check,
  X,
  Bell,
} from "lucide-react";

interface GroupInvitation {
  _id: string;
  groupId: {
    _id: string;
    title: string;
    subject: string;
    grade: string;
    stage?: string;
    scheduleDays?: string;
  };
  teacherId: {
    name: string;
    email: string;
  };
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  stage: string;
  grade: string;
  subject: string;
  createdAt: string;
}

export default function StudentInvitations() {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<GroupInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchInvitations = async () => {
    try {
      const response = await api.get("/groups/invitations");
      setInvitations(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching invitations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleAccept = async (invitationId: string) => {
    setProcessing(invitationId);
    try {
      await api.post(`/groups/invitations/${invitationId}/accept`);
      await fetchInvitations();
    } catch (error: any) {
      console.error("Error accepting invitation:", error);
      alert(error.response?.data?.message || "فشل في قبول الدعوة");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (invitationId: string) => {
    setProcessing(invitationId);
    try {
      await api.post(`/groups/invitations/${invitationId}/reject`);
      await fetchInvitations();
    } catch (error: any) {
      console.error("Error rejecting invitation:", error);
      alert(error.response?.data?.message || "فشل في رفض الدعوة");
    } finally {
      setProcessing(null);
    }
  };

  const pendingInvitations = invitations.filter((inv) => inv.status === "PENDING");
  const processedInvitations = invitations.filter((inv) => inv.status !== "PENDING");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-cyan-500/10 to-violet-500/10 rounded-2xl p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          الدعوات الواردة 📩
        </h2>
        <p className="text-lg text-muted-foreground">
          لديك {pendingInvitations.length} دعوة في انتظار ردك
        </p>
      </div>

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            الدعوات المنتظرة
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {pendingInvitations.map((invitation) => (
              <div
                key={invitation._id}
                className="bg-card border rounded-xl p-6 hover:shadow-md transition-shadow border-l-4 border-l-primary"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold">{invitation.groupId.title}</h4>
                      <p className="text-sm text-muted-foreground">{invitation.subject}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 rounded-full text-sm font-medium">
                    قيد الانتظار
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>المعلم: {invitation.teacherId.name}</span>
                  </div>
                  {invitation.stage && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="w-4 h-4" />
                      <span>المرحلة: {invitation.stage}</span>
                    </div>
                  )}
                  {invitation.grade && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>الصف: {invitation.grade}</span>
                    </div>
                  )}
                  {invitation.groupId.scheduleDays && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>المواعيد: {invitation.groupId.scheduleDays}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleAccept(invitation._id)}
                    disabled={processing === invitation._id}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    {processing === invitation._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        قبول
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleReject(invitation._id)}
                    disabled={processing === invitation._id}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {processing === invitation._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <X className="w-4 h-4" />
                        رفض
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Processed Invitations */}
      {processedInvitations.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-6">الدعوات السابقة</h3>
          <div className="space-y-4">
            {processedInvitations.map((invitation) => (
              <div
                key={invitation._id}
                className="bg-card border rounded-xl p-6 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                    <Mail className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold">{invitation.groupId.title}</h4>
                    <p className="text-sm text-muted-foreground">{invitation.subject}</p>
                    <p className="text-sm text-muted-foreground">
                      المعلم: {invitation.teacherId.name}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    invitation.status === "ACCEPTED"
                      ? "bg-green-500/10 text-green-500"
                      : "bg-red-500/10 text-red-500"
                  }`}
                >
                  {invitation.status === "ACCEPTED" ? "تم القبول" : "تم الرفض"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {invitations.length === 0 && (
        <div className="text-center py-12 bg-muted/50 rounded-xl">
          <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium">لا توجد دعوات حالياً</p>
          <p className="text-muted-foreground mt-1">ستظهر الدعوات هنا عند إضافتك لمجموعات جديدة</p>
          <Link
            href="/groups"
            className="inline-flex items-center gap-2 mt-4 text-primary hover:underline"
          >
            استكشف المجموعات
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
