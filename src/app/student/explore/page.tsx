"use client";

import { useState } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import {
  Search,
  Filter,
  Star,
  Clock,
  Calendar,
  ArrowLeft,
  BookOpen,
  GraduationCap,
} from "lucide-react";

const allGroups = [
  {
    id: 1,
    subject: "فيزياء",
    stage: "الثانوي",
    grade: "الصف الثاني",
    teacher: "أ. محمد الأحمد",
    rating: 4.9,
    students: 18,
    maxStudents: 20,
    price: "٥٠ ج.م/حصة",
    monthlyPrice: "٤٠٠ ج.م/شهر",
    schedule: "الأحد والثلاثاء ٩:٠٠ ص",
    status: "available",
  },
  {
    id: 2,
    subject: "رياضيات",
    stage: "الثانوي",
    grade: "الصف الأول",
    teacher: "أ. فاطمة العلي",
    rating: 4.8,
    students: 20,
    maxStudents: 20,
    price: "٥٠ ج.م/حصة",
    monthlyPrice: "٤٠٠ ج.م/شهر",
    schedule: "الأحد والثلاثاء ١١:٠٠ ص",
    status: "full",
  },
  {
    id: 3,
    subject: "كيمياء",
    stage: "الثانوي",
    grade: "الصف الثالث",
    teacher: "أ. خالد السعود",
    rating: 4.9,
    students: 15,
    maxStudents: 20,
    price: "٥٠ ج.م/حصة",
    monthlyPrice: "٤٠٠ ج.م/شهر",
    schedule: "الأربعاء والجمعة ٢:٠٠ م",
    status: "available",
  },
  {
    id: 4,
    subject: "علوم",
    stage: "الإعدادي",
    grade: "الصف الثالث",
    teacher: "أ. نورة الحربي",
    rating: 4.7,
    students: 19,
    maxStudents: 20,
    price: "٥٠ ج.م/حصة",
    monthlyPrice: "٤٠٠ ج.م/شهر",
    schedule: "السبت والاثنين ٤:٠٠ م",
    status: "available",
  },
  {
    id: 5,
    subject: "لغة إنجليزية",
    stage: "الثانوي",
    grade: "الصف الثاني",
    teacher: "أ. سارة محمد",
    rating: 4.6,
    students: 12,
    maxStudents: 20,
    price: "٥٠ ج.م/حصة",
    monthlyPrice: "٤٠٠ ج.م/شهر",
    schedule: "الثلاثاء والخميس ٣:٠٠ م",
    status: "available",
  },
  {
    id: 6,
    subject: "لغة عربية",
    stage: "الإعدادي",
    grade: "الصف الثاني",
    teacher: "أ. أحمد علي",
    rating: 4.8,
    students: 17,
    maxStudents: 20,
    price: "٥٠ ج.م/حصة",
    monthlyPrice: "٤٠٠ ج.م/شهر",
    schedule: "الأحد والأربعاء ٥:٠٠ م",
    status: "available",
  },
];

const stages = ["الكل", "الابتدائي", "الإعدادي", "الثانوي"];
const subjects = ["الكل", "رياضيات", "فيزياء", "كيمياء", "علوم", "لغة عربية", "لغة إنجليزية"];

export default function StudentExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState("الكل");
  const [selectedSubject, setSelectedSubject] = useState("الكل");

  const filteredGroups = allGroups.filter((group) => {
    const matchesSearch =
      group.subject.includes(searchQuery) ||
      group.teacher.includes(searchQuery) ||
      group.grade.includes(searchQuery);
    const matchesStage = selectedStage === "الكل" || group.stage === selectedStage;
    const matchesSubject = selectedSubject === "الكل" || group.subject === selectedSubject;
    return matchesSearch && matchesStage && matchesSubject;
  });

  return (
    <DashboardLayout role="student">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">استكشف المجموعات</h2>
          <p className="text-base text-muted-foreground mt-1">
            ابحث عن المجموعات المناسبة وانضم إليها
          </p>
        </div>

        {/* Search & Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="ابحث عن مادة، معلم، أو صف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-12 pl-4 py-4 bg-background border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <span className="text-base text-muted-foreground">المرحلة:</span>
            </div>
            {stages.map((stage) => (
              <button
                key={stage}
                onClick={() => setSelectedStage(stage)}
                className={`px-4 py-2 rounded-lg text-base font-medium transition-colors ${
                  selectedStage === stage
                    ? "bg-primary text-primary-foreground"
                    : "bg-background border hover:bg-muted"
                }`}
              >
                {stage}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-muted-foreground" />
              <span className="text-base text-muted-foreground">المادة:</span>
            </div>
            {subjects.map((subject) => (
              <button
                key={subject}
                onClick={() => setSelectedSubject(subject)}
                className={`px-4 py-2 rounded-lg text-base font-medium transition-colors ${
                  selectedSubject === subject
                    ? "bg-primary text-primary-foreground"
                    : "bg-background border hover:bg-muted"
                }`}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <p className="text-base text-muted-foreground">
          تم العثور على {filteredGroups.length} مجموعة
        </p>

        {/* Groups Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              className="bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{group.subject}</h3>
                    <p className="text-base text-muted-foreground">
                      {group.stage} - {group.grade}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1 bg-background rounded-full">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-bold">{group.rating}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-base font-medium">{group.teacher}</p>
                    <p className="text-sm text-muted-foreground">معلم</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{group.schedule}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>٨ حصص/شهر (حصتين/أسبوع)</span>
                  </div>
                </div>

                {/* Seats */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">المقاعد</span>
                    <span className="text-sm font-bold">
                      {group.students}/{group.maxStudents}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        group.students >= group.maxStudents
                          ? "bg-red-500"
                          : group.students >= group.maxStudents - 3
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${(group.students / group.maxStudents) * 100}%` }}
                    />
                  </div>
                  {group.students >= group.maxStudents ? (
                    <p className="text-xs text-red-500 mt-1">مكتملة العدد</p>
                  ) : group.students >= group.maxStudents - 3 ? (
                    <p className="text-xs text-yellow-500 mt-1">
                      {group.maxStudents - group.students} مقاعد متبقية
                    </p>
                  ) : (
                    <p className="text-xs text-green-500 mt-1">متاحة</p>
                  )}
                </div>

                {/* Price */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-lg font-bold text-primary">{group.price}</p>
                    <p className="text-xs text-muted-foreground">{group.monthlyPrice}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground">الحد الأقصى ٢٠ طالب</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 pt-0">
                {group.status === "full" ? (
                  <button
                    disabled
                    className="w-full px-6 py-3 bg-muted text-muted-foreground rounded-lg text-base font-medium cursor-not-allowed"
                  >
                    مكتملة العدد
                  </button>
                ) : (
                  <button className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg text-base font-medium hover:bg-primary/90 transition-colors">
                    انضم للمجموعة
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredGroups.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">لا توجد نتائج</h3>
            <p className="text-muted-foreground">جرب تغيير معايير البحث</p>
          </div>
        )}

        {/* Pricing Info */}
        <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border rounded-xl p-8">
          <h3 className="text-xl font-bold mb-4">معلومات الأسعار</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-background rounded-xl">
              <p className="text-3xl font-bold text-primary mb-2">٥٠ ج.م</p>
              <p className="text-base text-muted-foreground">سعر الحصة الواحدة</p>
              <p className="text-sm text-muted-foreground mt-1">(٦٠ دقيقة)</p>
            </div>
            <div className="text-center p-4 bg-background rounded-xl">
              <p className="text-3xl font-bold text-primary mb-2">٤٠٠ ج.م</p>
              <p className="text-base text-muted-foreground">سعر الشهر</p>
              <p className="text-sm text-muted-foreground mt-1">(٨ حصص)</p>
            </div>
            <div className="text-center p-4 bg-background rounded-xl">
              <p className="text-3xl font-bold text-primary mb-2">٢٠</p>
              <p className="text-base text-muted-foreground">الحد الأقصى للطلاب</p>
              <p className="text-sm text-muted-foreground mt-1">لكل مجموعة</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
