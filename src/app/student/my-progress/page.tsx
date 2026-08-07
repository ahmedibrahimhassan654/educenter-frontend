"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import api from "@/lib/api";
import {
  BookOpen,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Star,
  Download,
  Loader2,
} from "lucide-react";

interface Group {
  _id: string;
  title: string;
  subject: string;
  grade: string;
  teacherId: { name: string; email: string };
  students: any[];
}

interface Session {
  _id: string;
  title: string;
  date: string;
  status: string;
  groupId: { _id: string; title: string; subject: string };
}

interface Attendance {
  _id: string;
  status: string;
  studentId: string;
  sessionId: string;
}

const statusColors: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  PRESENT: { bg: "bg-green-500/10", text: "text-green-500", icon: CheckCircle },
  ABSENT: { bg: "bg-red-500/10", text: "text-red-500", icon: XCircle },
  LATE: { bg: "bg-yellow-500/10", text: "text-yellow-500", icon: Clock },
  SCHEDULED: { bg: "bg-gray-500/10", text: "text-gray-500", icon: Clock },
};

export default function StudentProgressPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupsRes, sessionsRes] = await Promise.all([
          api.get("/groups"),
          api.get("/sessions"),
        ]);
        setGroups(groupsRes.data);
        setSessions(sessionsRes.data);

        // Fetch attendance summary if user exists
        if (user?._id) {
          try {
            const summaryRes = await api.get(`/attendance/student/${user._id}/summary`);
            setAttendanceSummary(summaryRes.data);
          } catch {
            // Attendance summary might not exist yet
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const completedSessions = sessions.filter((s) => s.status === "COMPLETED");
  const totalSessions = sessions.length;
  const attendanceRate = totalSessions > 0
    ? Math.round((completedSessions.length / totalSessions) * 100)
    : 0;

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">تقدمي</h2>
            <p className="text-base text-muted-foreground mt-1">
              متابعة حضورك وأدائك في جميع المجموعات
            </p>
          </div>
          <button className="inline-flex items-center gap-2 px-5 py-2.5 border rounded-lg text-base font-medium hover:bg-muted transition-colors">
            <Download className="w-5 h-5" />
            تصدير التقرير
          </button>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-card border rounded-xl p-5 text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-green-500/10 flex items-center justify-center mb-3">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <p className="text-3xl font-bold mb-1">{attendanceRate}٪</p>
            <p className="text-sm text-muted-foreground">نسبة الحضور</p>
          </div>
          <div className="bg-card border rounded-xl p-5 text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-blue-500/10 flex items-center justify-center mb-3">
              <BookOpen className="w-6 h-6 text-blue-500" />
            </div>
            <p className="text-3xl font-bold mb-1">{completedSessions.length}</p>
            <p className="text-sm text-muted-foreground">حصص حضرتها</p>
          </div>
          <div className="bg-card border rounded-xl p-5 text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-purple-500/10 flex items-center justify-center mb-3">
              <TrendingUp className="w-6 h-6 text-purple-500" />
            </div>
            <p className="text-3xl font-bold mb-1">
              {attendanceSummary?.present || 0}
            </p>
            <p className="text-sm text-muted-foreground">حضور</p>
          </div>
          <div className="bg-card border rounded-xl p-5 text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-yellow-500/10 flex items-center justify-center mb-3">
              <Star className="w-6 h-6 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold mb-1">{groups.length}</p>
            <p className="text-sm text-muted-foreground">مجموعات مسجلة</p>
          </div>
        </div>

        {/* Groups Progress */}
        {groups.length === 0 ? (
          <div className="text-center py-16 bg-card border rounded-xl">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">لم تنضم إلى أي مجموعة بعد</h3>
            <p className="text-muted-foreground">انضم إلى مجموعة لبدء متابعة تقدمك</p>
          </div>
        ) : (
          groups.map((group) => {
            const groupSessions = sessions.filter(
              (s) => s.groupId._id === group._id
            );
            const completedGroupSessions = groupSessions.filter(
              (s) => s.status === "COMPLETED"
            );

            return (
              <div key={group._id} className="bg-card border rounded-xl overflow-hidden">
                {/* Group Header */}
                <div className="p-6 border-b bg-muted/30">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold mb-1">{group.title}</h3>
                      <p className="text-base text-muted-foreground">
                        {group.teacherId?.name || "غير محدد"} • {group.grade}
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <div className="text-center px-3 py-1 bg-green-500/10 rounded-lg">
                        <p className="text-lg font-bold text-green-500">
                          {completedGroupSessions.length}
                        </p>
                        <p className="text-xs text-muted-foreground">مكتملة</p>
                      </div>
                      <div className="text-center px-3 py-1 bg-blue-500/10 rounded-lg">
                        <p className="text-lg font-bold text-blue-500">
                          {groupSessions.length - completedGroupSessions.length}
                        </p>
                        <p className="text-xs text-muted-foreground">متبقية</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sessions List */}
                <div className="p-6">
                  <h4 className="text-lg font-semibold mb-4">الحصص</h4>
                  {groupSessions.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">لا توجد حصص بعد</p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {groupSessions.map((session, index) => {
                        const status = statusColors[session.status] || statusColors.SCHEDULED;
                        const StatusIcon = status.icon;
                        return (
                          <div
                            key={session._id}
                            className={`${status.bg} rounded-lg p-3 text-center`}
                          >
                            <StatusIcon className={`w-5 h-5 mx-auto mb-1 ${status.text}`} />
                            <p className="text-xs font-medium">الحصة {index + 1}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(session.date).toLocaleDateString("ar-EG", {
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
