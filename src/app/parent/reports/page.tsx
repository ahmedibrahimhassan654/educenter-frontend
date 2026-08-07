"use client";

import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  ChevronDown,
  Download,
  Star,
} from "lucide-react";

const children = [
  { id: 1, name: "عبدالله محمد", grade: "الصف الثاني الثانوي" },
  { id: 2, name: "فاطمة محمد", grade: "الصف الأول الإعدادي" },
];

const reportsData: Record<number, {
  groups: Array<{
    id: number;
    subject: string;
    teacher: string;
    attendance: Array<{ session: number; date: string; status: string }>;
    teacherComments: Array<{ date: string; comment: string }>;
  }>;
}> = {
  1: {
    groups: [
      {
        id: 1,
        subject: "الفيزياء",
        teacher: "أ. محمد الأحمد",
        attendance: [
          { session: 1, date: "٠١/٠١", status: "present" },
          { session: 2, date: "٠٣/٠١", status: "present" },
          { session: 3, date: "٠٨/٠١", status: "absent" },
          { session: 4, date: "١٠/٠١", status: "present" },
          { session: 5, date: "١٥/٠١", status: "present" },
          { session: 6, date: "١٧/٠١", status: "present" },
          { session: 7, date: "٢٢/٠١", status: "upcoming" },
          { session: 8, date: "٢٤/٠١", status: "upcoming" },
        ],
        teacherComments: [
          { date: "الأسبوع ١", comment: "أداء ممتاز في الحصة الأولى، مشاركة فعالة" },
          { date: "الأسبوع ٢", comment: "يحتاج لتحسين في حل المسائل الحسابية" },
          { date: "الأسبوع ٣", comment: "تحسن ملحوظ، استمر" },
        ],
      },
      {
        id: 2,
        subject: "الرياضيات",
        teacher: "أ. فاطمة العلي",
        attendance: [
          { session: 1, date: "٠٢/٠١", status: "present" },
          { session: 2, date: "٠٤/٠١", status: "present" },
          { session: 3, date: "٠٩/٠١", status: "present" },
          { session: 4, date: "١١/٠١", status: "excused" },
          { session: 5, date: "١٦/٠١", status: "present" },
          { session: 6, date: "١٨/٠١", status: "upcoming" },
          { session: 7, date: "٢٣/٠١", status: "upcoming" },
          { session: 8, date: "٢٥/٠١", status: "upcoming" },
        ],
        teacherComments: [
          { date: "الأسبوع ١", comment: "طالب متفهم ومجتهد" },
          { date: "الأسبوع ٢", comment: "أداء جيد في الاختبار القصير" },
        ],
      },
      {
        id: 3,
        subject: "الكيمياء",
        teacher: "أ. خالد السعود",
        attendance: [
          { session: 1, date: "٠٢/٠١", status: "present" },
          { session: 2, date: "٠٥/٠١", status: "present" },
          { session: 3, date: "٠٩/٠١", status: "present" },
          { session: 4, date: "١٢/٠١", status: "present" },
          { session: 5, date: "١٦/٠١", status: "absent" },
          { session: 6, date: "١٩/٠١", status: "present" },
          { session: 7, date: "٢٣/٠١", status: "upcoming" },
          { session: 8, date: "٢٦/٠١", status: "upcoming" },
        ],
        teacherComments: [
          { date: "الأسبوع ١", comment: "ممتاز في المختبر العملي" },
          { date: "الأسبوع ٢", comment: "يحتاج لمراجعة الفصل الثالث" },
          { date: "الأسبوع ٣", comment: "أداء رائع في الامتحان، ٩٥٪" },
        ],
      },
    ],
  },
  2: {
    groups: [
      {
        id: 1,
        subject: "العلوم",
        teacher: "أ. نورة الحربي",
        attendance: [
          { session: 1, date: "٠٤/٠١", status: "present" },
          { session: 2, date: "٠٦/٠١", status: "present" },
          { session: 3, date: "١١/٠١", status: "absent" },
          { session: 4, date: "١٣/٠١", status: "present" },
          { session: 5, date: "١٨/٠١", status: "present" },
          { session: 6, date: "٢٠/٠١", status: "upcoming" },
          { session: 7, date: "٢٥/٠١", status: "upcoming" },
          { session: 8, date: "٢٧/٠١", status: "upcoming" },
        ],
        teacherComments: [
          { date: "الأسبوع ١", comment: "مشاركة جيدة وأسئلة ذكية" },
          { date: "الأسبوع ٢", comment: "تحسن في فهم التجارب العملية" },
        ],
      },
      {
        id: 2,
        subject: "اللغة العربية",
        teacher: "أ. أحمد علي",
        attendance: [
          { session: 1, date: "٠٥/٠١", status: "present" },
          { session: 2, date: "٠٧/٠١", status: "present" },
          { session: 3, date: "١٢/٠١", status: "present" },
          { session: 4, date: "١٤/٠١", status: "present" },
          { session: 5, date: "١٩/٠١", status: "present" },
          { session: 6, date: "٢١/٠١", status: "upcoming" },
          { session: 7, date: "٢٦/٠١", status: "upcoming" },
          { session: 8, date: "٢٨/٠١", status: "upcoming" },
        ],
        teacherComments: [
          { date: "الأسبوع ١", comment: "قراءة ممتازة وخط واضح" },
          { date: "الأسبوع ٢", comment: "تحسن كبير في الإملاء" },
        ],
      },
    ],
  },
};

const statusColors: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  present: { bg: "bg-green-500/10", text: "text-green-500", icon: CheckCircle },
  absent: { bg: "bg-red-500/10", text: "text-red-500", icon: XCircle },
  excused: { bg: "bg-yellow-500/10", text: "text-yellow-500", icon: Clock },
  upcoming: { bg: "bg-gray-500/10", text: "text-gray-500", icon: Clock },
};

export default function ParentReportsPage() {
  const [selectedChild, setSelectedChild] = useState(1);
  const currentData = reportsData[selectedChild];
  const childInfo = children.find((c) => c.id === selectedChild)!;

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">التقارير والتقييمات</h2>
            <p className="text-base text-muted-foreground mt-1">
              تقارير الحضور وملاحظات المعلمين
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <select
                value={selectedChild}
                onChange={(e) => setSelectedChild(Number(e.target.value))}
                className="appearance-none px-5 py-3 pr-10 bg-background border rounded-lg text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {children.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-muted-foreground" />
            </div>
            <button className="inline-flex items-center gap-2 px-5 py-3 border rounded-lg text-base font-medium hover:bg-muted transition-colors">
              <Download className="w-5 h-5" />
              تصدير
            </button>
          </div>
        </div>

        <div className="bg-card border rounded-xl p-6">
          <h3 className="text-xl font-bold mb-2">{childInfo.name}</h3>
          <p className="text-base text-muted-foreground">{childInfo.grade}</p>
        </div>

        {currentData.groups.map((group) => (
          <div key={group.id} className="bg-card border rounded-xl overflow-hidden">
            <div className="p-6 border-b bg-muted/30">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold mb-1">{group.subject}</h3>
                  <p className="text-base text-muted-foreground">{group.teacher}</p>
                </div>
                <div className="flex gap-3">
                  <div className="text-center px-3 py-1 bg-green-500/10 rounded-lg">
                    <p className="text-lg font-bold text-green-500">
                      {group.attendance.filter((a) => a.status === "present").length}
                    </p>
                    <p className="text-xs text-muted-foreground">حاضر</p>
                  </div>
                  <div className="text-center px-3 py-1 bg-red-500/10 rounded-lg">
                    <p className="text-lg font-bold text-red-500">
                      {group.attendance.filter((a) => a.status === "absent").length}
                    </p>
                    <p className="text-xs text-muted-foreground">غائب</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h4 className="text-lg font-semibold mb-4">الجدول الزمني للحضور</h4>
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

            <div className="p-6 border-t">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                ملاحظات المعلم
              </h4>
              <div className="space-y-3">
                {group.teacherComments.map((comment, i) => (
                  <div
                    key={i}
                    className="flex gap-4 p-4 bg-muted/50 rounded-lg"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Star className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{comment.date}</p>
                      <p className="text-base">{comment.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
