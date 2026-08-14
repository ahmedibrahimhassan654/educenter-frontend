"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import {
  BookOpen,
  Calendar,
  Clock,
  Users,
  ArrowLeft,
  Loader2,
  Mail,
  Video,
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
  stage: string;
  grade: string;
  subject: string;
  status?: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
}

export default function StudentInvitations() {
  const [invitations, setInvitations] = useState<GroupInvitation[]>([]);
  const [loading, setLoading] = useState(true);

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

  const acceptedInvitations = invitations.filter(
    (inv) => inv.status === "ACCEPTED" || !inv.status
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
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-cyan-500/10 to-violet-500/10 rounded-2xl p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          المجموعات المضافة إليها 📚
        </h2>
        <p className="text-lg text-muted-foreground">
          المجموعات التي أضافك إليها معلمك لمتابعة الأنشطة، ويمكنك شراء الحصص للانضمام للحصص المباشرة
        </p>
      </div>

      {acceptedInvitations.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {acceptedInvitations.map((invitation) => {
            const groupIdValue = invitation.groupId._id || "";
            return (
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
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-sm font-medium">
                    أُضيف إليها
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

                <Link
                  href={groupIdValue ? `/student/my-groups/${groupIdValue}` : "/student/my-groups"}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <Video className="w-4 h-4" />
                  عرض المجموعة
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/50 rounded-xl">
          <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium">لم تتم إضافتك لأي مجموعة بعد</p>
          <p className="text-muted-foreground mt-1">ستظهر المجموعات هنا عند إضافتك إليها من قبل معلمك</p>
          <Link
            href="/student/explore"
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