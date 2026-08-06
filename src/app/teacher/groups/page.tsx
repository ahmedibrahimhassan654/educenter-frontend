"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard-layout";
import {
  Users,
  Plus,
  Search,
  Filter,
  ArrowLeft,
  Clock,
  CheckCircle,
  MoreVertical,
  Calendar,
  BookOpen,
  GraduationCap,
  X,
} from "lucide-react";

const groups = [
  {
    id: 1,
    name: "الفيزياء - الصف الثاني الثانوي",
    stage: "الثانوي",
    grade: "الصف الثاني",
    subject: "فيزياء",
    students: 18,
    maxStudents: 20,
    sessions: 6,
    totalSessions: 8,
    schedule: ["الأحد ٩:٠٠ ص", "الثلاثاء ٩:٠٠ ص"],
    earnings: "٦٬٨٠٠ ج.م",
    status: "active",
  },
  {
    id: 2,
    name: "الرياضيات - الصف الأول الثانوي",
    stage: "الثانوي",
    grade: "الصف الأول",
    subject: "رياضيات",
    students: 20,
    maxStudents: 20,
    sessions: 8,
    totalSessions: 8,
    schedule: ["الأحد ١١:٠٠ ص", "الثلاثاء ١١:٠٠ ص"],
    earnings: "٦٬٨٠٠ ج.م",
    status: "completed",
  },
  {
    id: 3,
    name: "الكيمياء - الصف الثالث الثانوي",
    stage: "الثانوي",
    grade: "الصف الثالث",
    subject: "كيمياء",
    students: 15,
    maxStudents: 20,
    sessions: 5,
    totalSessions: 8,
    schedule: ["الأربعاء ٢:٠٠ م", "الجمعة ٢:٠٠ م"],
    earnings: "٥٬١٠٠ ج.م",
    status: "active",
  },
  {
    id: 4,
    name: "العلوم - الصف الثالث الإعدادي",
    stage: "الإعدادي",
    grade: "الصف الثالث",
    subject: "علوم",
    students: 19,
    maxStudents: 20,
    sessions: 7,
    totalSessions: 8,
    schedule: ["السبت ٤:٠٠ م", "الاثنين ٤:٠٠ م"],
    earnings: "٦٬٤٦٠ ج.م",
    status: "active",
  },
];

const stages = ["الكل", "الابتدائي", "الإعدادي", "الثانوي"];

export default function TeacherGroupsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState("الكل");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredGroups = groups.filter((group) => {
    const matchesSearch = group.name.includes(searchQuery);
    const matchesStage = selectedStage === "الكل" || group.stage === selectedStage;
    return matchesSearch && matchesStage;
  });

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">المجموعات</h2>
            <p className="text-base text-muted-foreground mt-1">
              إدارة مجموعاتك التعليمية والطلاب
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg text-base font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            إنشاء مجموعة جديدة
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="البحث عن مجموعة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-12 pl-4 py-3 bg-background border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {stages.map((stage) => (
              <button
                key={stage}
                onClick={() => setSelectedStage(stage)}
                className={`px-5 py-3 rounded-lg text-base font-medium transition-colors ${
                  selectedStage === stage
                    ? "bg-primary text-primary-foreground"
                    : "bg-background border hover:bg-muted"
                }`}
              >
                {stage}
              </button>
            ))}
          </div>
        </div>

        {/* Groups Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              className="bg-card border rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">{group.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{group.stage}</span>
                    <span>•</span>
                    <span>{group.grade}</span>
                  </div>
                </div>
                <button className="p-2 hover:bg-muted rounded-lg">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              {/* Enrollment */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">الطلاب المسجلين</span>
                  <span className="text-sm font-bold">
                    {group.students}/{group.maxStudents}
                  </span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      group.students >= group.maxStudents
                        ? "bg-green-500"
                        : "bg-primary"
                    }`}
                    style={{ width: `${(group.students / group.maxStudents) * 100}%` }}
                  />
                </div>
                {group.students >= group.maxStudents && (
                  <p className="text-xs text-green-500 mt-1">مكتملة العدد</p>
                )}
              </div>

              {/* Sessions */}
              <div className="flex items-center gap-4 mb-4 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{group.sessions}/{group.totalSessions} حصص</span>
                </div>
                <div className="flex items-center gap-1">
                  <Wallet className="w-4 h-4 text-green-500" />
                  <span className="text-green-500 font-medium">{group.earnings}</span>
                </div>
              </div>

              {/* Schedule */}
              <div className="flex flex-wrap gap-2 mb-5">
                {group.schedule.map((slot, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-muted rounded-lg text-xs"
                  >
                    <Clock className="w-3 h-3" />
                    {slot}
                  </span>
                ))}
              </div>

              {/* Status & Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                    group.status === "completed"
                      ? "bg-green-500/10 text-green-500"
                      : "bg-blue-500/10 text-blue-500"
                  }`}
                >
                  {group.status === "completed" ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      مكتملة
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4" />
                      نشطة
                    </>
                  )}
                </span>
                <div className="flex gap-2">
                  <Link
                    href={`/teacher/groups/${group.id}/attendance`}
                    className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    الحضور
                  </Link>
                  <button className="px-4 py-2 bg-muted rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors">
                    التفاصيل
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredGroups.length === 0 && (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">لا توجد مجموعات</h3>
            <p className="text-muted-foreground mb-6">لم يتم العثور على مجموعات تطابق البحث</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg text-base font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              إنشاء مجموعة جديدة
            </button>
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="relative bg-background rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">إنشاء مجموعة جديدة</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-muted rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Stage Selection */}
              <div>
                <label className="block text-base font-medium mb-3">المرحلة الدراسية</label>
                <div className="flex gap-3">
                  {["الابتدائي", "الإعدادي", "الثانوي"].map((stage) => (
                    <button
                      key={stage}
                      className="flex-1 px-4 py-3 border rounded-lg text-base font-medium hover:bg-primary/10 hover:border-primary hover:text-primary transition-colors"
                    >
                      {stage}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grade Selection */}
              <div>
                <label className="block text-base font-medium mb-3">الصف الدراسي</label>
                <select className="w-full px-4 py-3 border rounded-lg text-base bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>اختر الصف</option>
                  <option>الصف الأول</option>
                  <option>الصف الثاني</option>
                  <option>الصف الثالث</option>
                </select>
              </div>

              {/* Subject Selection */}
              <div>
                <label className="block text-base font-medium mb-3">المادة</label>
                <select className="w-full px-4 py-3 border rounded-lg text-base bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>اختر المادة</option>
                  <option>رياضيات</option>
                  <option>فيزياء</option>
                  <option>كيمياء</option>
                  <option>علوم</option>
                  <option>لغة عربية</option>
                  <option>لغة إنجليزية</option>
                </select>
              </div>

              {/* Group Name */}
              <div>
                <label className="block text-base font-medium mb-3">اسم المجموعة</label>
                <input
                  type="text"
                  placeholder="مثال: فيزياء الصف الثاني الثانوي"
                  className="w-full px-4 py-3 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Schedule */}
              <div>
                <label className="block text-base font-medium mb-3">مواعيد الحصص (٢ حصص/أسبوع)</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">الحصة الأولى</label>
                    <div className="flex gap-2">
                      <select className="flex-1 px-3 py-3 border rounded-lg text-base bg-background">
                        <option>الأحد</option>
                        <option>الاثنين</option>
                        <option>الثلاثاء</option>
                        <option>الأربعاء</option>
                        <option>الخميس</option>
                        <option>الجمعة</option>
                        <option>السبت</option>
                      </select>
                      <select className="flex-1 px-3 py-3 border rounded-lg text-base bg-background">
                        <option>٩:٠٠ ص</option>
                        <option>١٠:٠٠ ص</option>
                        <option>١١:٠٠ ص</option>
                        <option>١٢:٠٠ م</option>
                        <option>١:٠٠ م</option>
                        <option>٢:٠٠ م</option>
                        <option>٣:٠٠ م</option>
                        <option>٤:٠٠ م</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">الحصة الثانية</label>
                    <div className="flex gap-2">
                      <select className="flex-1 px-3 py-3 border rounded-lg text-base bg-background">
                        <option>الأحد</option>
                        <option>الاثنين</option>
                        <option>الثلاثاء</option>
                        <option>الأربعاء</option>
                        <option>الخميس</option>
                        <option>الجمعة</option>
                        <option>السبت</option>
                      </select>
                      <select className="flex-1 px-3 py-3 border rounded-lg text-base bg-background">
                        <option>٩:٠٠ ص</option>
                        <option>١٠:٠٠ ص</option>
                        <option>١١:٠٠ ص</option>
                        <option>١٢:٠٠ م</option>
                        <option>١:٠٠ م</option>
                        <option>٢:٠٠ م</option>
                        <option>٣:٠٠ م</option>
                        <option>٤:٠٠ م</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price & Capacity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-medium mb-3">سعر الحصة</label>
                  <div className="relative">
                    <input
                      type="text"
                      value="٥٠"
                      readOnly
                      className="w-full px-4 py-3 border rounded-lg text-base bg-muted"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                      ج.م
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">السعر ثابت للحصة الواحدة</p>
                </div>
                <div>
                  <label className="block text-base font-medium mb-3">السعة القصوى</label>
                  <div className="relative">
                    <input
                      type="text"
                      value="٢٠"
                      readOnly
                      className="w-full px-4 py-3 border rounded-lg text-base bg-muted"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                      طالب
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">الحد الأقصى ٢٠ طالب</p>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-muted/50 rounded-xl p-5">
                <h4 className="text-base font-bold mb-3">ملخص الأرباح المتوقعة</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>إيراد الحصة الواحدة (٢٠ طالب × ٥٠ ج.م)</span>
                    <span className="font-bold">١٬٠٠٠ ج.م</span>
                  </div>
                  <div className="flex justify-between">
                    <span>إيراد الشهر (٨ حصص)</span>
                    <span className="font-bold">٨٬٠٠٠ ج.م</span>
                  </div>
                  <div className="flex justify-between text-red-500">
                    <span>عمولة المنصة (١٥٪)</span>
                    <span className="font-bold">-١٬٢٠٠ ج.م</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t text-green-500">
                    <span className="font-bold">صافي الأرباح</span>
                    <span className="font-bold text-lg">٦٬٨٠٠ ج.م</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-6 py-3 border rounded-lg text-base font-medium hover:bg-muted transition-colors"
              >
                إلغاء
              </button>
              <button className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg text-base font-medium hover:bg-primary/90 transition-colors">
                إنشاء المجموعة
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function Wallet(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  );
}
