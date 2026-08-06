"use client";

import DashboardLayout from "@/components/dashboard-layout";
import {
  BookOpen,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Star,
  Download,
} from "lucide-react";

const groups = [
  {
    id: 1,
    subject: "الفيزياء",
    teacher: "أ. محمد الأحمد",
    group: "الصف الثاني الثانوي",
    attendance: [
      { session: 1, date: "٠١ يناير", status: "present" },
      { session: 2, date: "٠٣ يناير", status: "present" },
      { session: 3, date: "٠٨ يناير", status: "absent" },
      { session: 4, date: "١٠ يناير", status: "present" },
      { session: 5, date: "١٥ يناير", status: "present" },
      { session: 6, date: "١٧ يناير", status: "present" },
      { session: 7, date: "٢٢ يناير", status: "upcoming" },
      { session: 8, date: "٢٤ يناير", status: "upcoming" },
    ],
    homework: [
      { name: "واجب ١", grade: "٩٥٪", status: "submitted" },
      { name: "واجب ٢", grade: "٨٨٪", status: "submitted" },
      { name: "واجب ٣", grade: "٩٢٪", status: "submitted" },
      { name: "واجب ٤", grade: "--", status: "pending" },
    ],
    quizzes: [
      { name: "اختبار ١", grade: "٩٠٪", status: "completed" },
      { name: "اختبار ٢", grade: "٩٥٪", status: "completed" },
    ],
  },
  {
    id: 2,
    subject: "الرياضيات",
    teacher: "أ. فاطمة العلي",
    group: "الصف الثاني الثانوي",
    attendance: [
      { session: 1, date: "٠٢ يناير", status: "present" },
      { session: 2, date: "٠٤ يناير", status: "present" },
      { session: 3, date: "٠٩ يناير", status: "present" },
      { session: 4, date: "١١ يناير", status: "excused" },
      { session: 5, date: "١٦ يناير", status: "present" },
      { session: 6, date: "١٨ يناير", status: "upcoming" },
      { session: 7, date: "٢٣ يناير", status: "upcoming" },
      { session: 8, date: "٢٥ يناير", status: "upcoming" },
    ],
    homework: [
      { name: "واجب ١", grade: "٨٥٪", status: "submitted" },
      { name: "واجب ٢", grade: "٩٠٪", status: "submitted" },
      { name: "واجب ٣", grade: "--", status: "pending" },
    ],
    quizzes: [
      { name: "اختبار ١", grade: "٨٨٪", status: "completed" },
    ],
  },
  {
    id: 3,
    subject: "الكيمياء",
    teacher: "أ. خالد السعود",
    group: "الصف الثاني الثانوي",
    attendance: [
      { session: 1, date: "٠٢ يناير", status: "present" },
      { session: 2, date: "٠٥ يناير", status: "present" },
      { session: 3, date: "٠٩ يناير", status: "present" },
      { session: 4, date: "١٢ يناير", status: "present" },
      { session: 5, date: "١٦ يناير", status: "absent" },
      { session: 6, date: "١٩ يناير", status: "present" },
      { session: 7, date: "٢٣ يناير", status: "upcoming" },
      { session: 8, date: "٢٦ يناير", status: "upcoming" },
    ],
    homework: [
      { name: "واجب ١", grade: "٩٢٪", status: "submitted" },
      { name: "واجب ٢", grade: "٨٨٪", status: "submitted" },
      { name: "واجب ٣", grade: "٩٥٪", status: "submitted" },
      { name: "واجب ٤", grade: "٩٠٪", status: "submitted" },
    ],
    quizzes: [
      { name: "اختبار ١", grade: "٩٢٪", status: "completed" },
      { name: "اختبار ٢", grade: "٨٨٪", status: "completed" },
    ],
  },
];

const statusColors: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  present: { bg: "bg-green-500/10", text: "text-green-500", icon: CheckCircle },
  absent: { bg: "bg-red-500/10", text: "text-red-500", icon: XCircle },
  excused: { bg: "bg-yellow-500/10", text: "text-yellow-500", icon: Clock },
  upcoming: { bg: "bg-gray-500/10", text: "text-gray-500", icon: Clock },
};

export default function StudentProgressPage() {
  return (
    <DashboardLayout role="student">
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
            <p className="text-3xl font-bold mb-1">٨٨٪</p>
            <p className="text-sm text-muted-foreground">نسبة الحضور</p>
          </div>
          <div className="bg-card border rounded-xl p-5 text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-blue-500/10 flex items-center justify-center mb-3">
              <BookOpen className="w-6 h-6 text-blue-500" />
            </div>
            <p className="text-3xl font-bold mb-1">١٥</p>
            <p className="text-sm text-muted-foreground">حصص حضرتها</p>
          </div>
          <div className="bg-card border rounded-xl p-5 text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-purple-500/10 flex items-center justify-center mb-3">
              <TrendingUp className="w-6 h-6 text-purple-500" />
            </div>
            <p className="text-3xl font-bold mb-1">٩١٪</p>
            <p className="text-sm text-muted-foreground">متوسط الدرجات</p>
          </div>
          <div className="bg-card border rounded-xl p-5 text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-yellow-500/10 flex items-center justify-center mb-3">
              <Star className="w-6 h-6 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold mb-1">١٠</p>
            <p className="text-sm text-muted-foreground">واجبات مسلمة</p>
          </div>
        </div>

        {/* Groups Progress */}
        {groups.map((group) => (
          <div key={group.id} className="bg-card border rounded-xl overflow-hidden">
            {/* Group Header */}
            <div className="p-6 border-b bg-muted/30">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold mb-1">{group.subject}</h3>
                  <p className="text-base text-muted-foreground">
                    {group.teacher} • {group.group}
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="text-center px-3 py-1 bg-green-500/10 rounded-lg">
                    <p className="text-lg font-bold text-green-500">
                      {group.attendance.filter((a) => a.status === "present").length}
                    </p>
                    <p className="text-xs text-muted-foreground">حضور</p>
                  </div>
                  <div className="text-center px-3 py-1 bg-red-500/10 rounded-lg">
                    <p className="text-lg font-bold text-red-500">
                      {group.attendance.filter((a) => a.status === "absent").length}
                    </p>
                    <p className="text-xs text-muted-foreground">غياب</p>
                  </div>
                  <div className="text-center px-3 py-1 bg-yellow-500/10 rounded-lg">
                    <p className="text-lg font-bold text-yellow-500">
                      {group.attendance.filter((a) => a.status === "excused").length}
                    </p>
                    <p className="text-xs text-muted-foreground">معذور</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance Grid */}
            <div className="p-6">
              <h4 className="text-lg font-semibold mb-4">سجل الحضور</h4>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                {group.attendance.map((session) => {
                  const status = statusColors[session.status];
                  const StatusIcon = status.icon;
                  return (
                    <div
                      key={session.session}
                      className={`${status.bg} rounded-lg p-3 text-center`}
                    >
                      <StatusIcon className={`w-5 h-5 mx-auto mb-1 ${status.text}`} />
                      <p className="text-xs font-medium">الحصة {session.session}</p>
                      <p className="text-xs text-muted-foreground">{session.date}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Homework & Quizzes */}
            <div className="grid md:grid-cols-2 gap-6 p-6 border-t">
              {/* Homework */}
              <div>
                <h4 className="text-lg font-semibold mb-4">الواجبات</h4>
                <div className="space-y-3">
                  {group.homework.map((hw, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <span className="text-base">{hw.name}</span>
                      {hw.status === "submitted" ? (
                        <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm font-medium">
                          {hw.grade}
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded-full text-sm font-medium">
                          معلق
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Quizzes */}
              <div>
                <h4 className="text-lg font-semibold mb-4">الاختبارات</h4>
                <div className="space-y-3">
                  {group.quizzes.map((quiz, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <span className="text-base">{quiz.name}</span>
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                        {quiz.grade}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
