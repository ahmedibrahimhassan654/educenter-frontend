"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard-layout";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Save,
  BookOpen,
} from "lucide-react";

const groupInfo = {
  name: "الفيزياء - الصف الثاني الثانوي",
  session: "الحصة ٧ من ٨",
  date: "الأحد ١٥ يناير ٢٠٢٥",
  time: "٩:٠٠ صباحاً",
};

const students = [
  { id: 1, name: "أحمد محمد علي", status: "present", homework: true },
  { id: 2, name: "محمد عبدالله حسن", status: "present", homework: true },
  { id: 3, name: "فاطمة أحمد إبراهيم", status: "absent", homework: false },
  { id: 4, name: "نورهان سعيد محمود", status: "present", homework: true },
  { id: 5, name: "عمر خالد عبدالله", status: "excused", homework: false },
  { id: 6, name: "سارة محمد حسين", status: "present", homework: true },
  { id: 7, name: "يوسف أحمد عبدالرحمن", status: "present", homework: false },
  { id: 8, name: "مريم علي محمد", status: "present", homework: true },
  { id: 9, name: "خالد محمد إبراهيم", status: "absent", homework: false },
  { id: 10, name: "هدى عبدالعزيز", status: "present", homework: true },
  { id: 11, name: "أمير سامي", status: "present", homework: true },
  { id: 12, name: "ليلى حسن", status: "present", homework: false },
  { id: 13, name: "طارق ناصر", status: "present", homework: true },
  { id: 14, name: "رنا أحمد", status: "excused", homework: false },
  { id: 15, name: "كريم محمود", status: "present", homework: true },
  { id: 16, name: "دينا سعيد", status: "present", homework: true },
  { id: 17, name: "حسن علي", status: "present", homework: true },
  { id: 18, name: "ياسمين محمد", status: "present", homework: false },
];

type Status = "present" | "absent" | "excused";

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<Record<number, Status>>(
    Object.fromEntries(students.map((s) => [s.id, s.status as Status]))
  );
  const [homework, setHomework] = useState<Record<number, boolean>>(
    Object.fromEntries(students.map((s) => [s.id, s.homework]))
  );
  const [feedback, setFeedback] = useState("");
  const [saved, setSaved] = useState(false);

  const handleStatusChange = (studentId: number, status: Status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
    setSaved(false);
  };

  const handleHomeworkToggle = (studentId: number) => {
    setHomework((prev) => ({ ...prev, [studentId]: !prev[studentId] }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const presentCount = Object.values(attendance).filter((s) => s === "present").length;
  const absentCount = Object.values(attendance).filter((s) => s === "absent").length;
  const excusedCount = Object.values(attendance).filter((s) => s === "excused").length;

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-8">
        {/* Back Button */}
        <Link
          href="/teacher/groups"
          className="inline-flex items-center gap-2 text-base text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
          العود إلى المجموعات
        </Link>

        {/* Group Info */}
        <div className="bg-card border rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">{groupInfo.name}</h2>
              <div className="flex flex-wrap items-center gap-4 text-base text-muted-foreground">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {groupInfo.session}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {groupInfo.date}
                </span>
                <span>{groupInfo.time}</span>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-center px-4 py-2 bg-green-500/10 rounded-lg">
                <p className="text-2xl font-bold text-green-500">{presentCount}</p>
                <p className="text-xs text-muted-foreground">حاضر</p>
              </div>
              <div className="text-center px-4 py-2 bg-red-500/10 rounded-lg">
                <p className="text-2xl font-bold text-red-500">{absentCount}</p>
                <p className="text-xs text-muted-foreground">غائب</p>
              </div>
              <div className="text-center px-4 py-2 bg-yellow-500/10 rounded-lg">
                <p className="text-2xl font-bold text-yellow-500">{excusedCount}</p>
                <p className="text-xs text-muted-foreground">معذور</p>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="text-xl font-bold">تسجيل الحضور</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-right py-4 px-6 text-base font-medium text-muted-foreground">
                    #
                  </th>
                  <th className="text-right py-4 px-6 text-base font-medium text-muted-foreground">
                    اسم الطالب
                  </th>
                  <th className="text-center py-4 px-6 text-base font-medium text-muted-foreground">
                    الحالة
                  </th>
                  <th className="text-center py-4 px-6 text-base font-medium text-muted-foreground">
                    الواجب
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr
                    key={student.id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-4 px-6 text-base text-muted-foreground">
                      {index + 1}
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-base font-medium">{student.name}</p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleStatusChange(student.id, "present")}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            attendance[student.id] === "present"
                              ? "bg-green-500 text-white"
                              : "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                          }`}
                        >
                          حاضر
                        </button>
                        <button
                          onClick={() => handleStatusChange(student.id, "absent")}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            attendance[student.id] === "absent"
                              ? "bg-red-500 text-white"
                              : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                          }`}
                        >
                          غائب
                        </button>
                        <button
                          onClick={() => handleStatusChange(student.id, "excused")}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            attendance[student.id] === "excused"
                              ? "bg-yellow-500 text-white"
                              : "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
                          }`}
                        >
                          معذور
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => handleHomeworkToggle(student.id)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                            homework[student.id]
                              ? "bg-green-500 text-white"
                              : "bg-muted hover:bg-muted/80"
                          }`}
                        >
                          {homework[student.id] && <CheckCircle className="w-5 h-5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Session Feedback */}
        <div className="bg-card border rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">ملاحظات الحصة</h3>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="أضف ملاحظاتك عن الحصة..."
            rows={4}
            className="w-full px-4 py-3 border rounded-lg text-base resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between">
          {saved && (
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircle className="w-5 h-5" />
              <span className="text-base font-medium">تم الحفظ بنجاح</span>
            </div>
          )}
          <div className="flex gap-3 mr-auto">
            <Link
              href="/teacher/groups"
              className="px-6 py-3 border rounded-lg text-base font-medium hover:bg-muted transition-colors"
            >
              إلغاء
            </Link>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-lg text-base font-medium hover:bg-primary/90 transition-colors"
            >
              <Save className="w-5 h-5" />
              حفظ الحضور
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
