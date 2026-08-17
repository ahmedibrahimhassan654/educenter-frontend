"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Plus,
  Search,
  Loader2,
  Calendar,
  Wallet,
  GraduationCap,
  Eye,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  PlayCircle,
} from "lucide-react";
import { iconChip, iconColor } from "@/lib/icon-styles";

interface GroupData {
  _id: string;
  id: string;
  title: string;
  subject: string;
  grade: string;
  stage: string;
  totalSessionPrice: number;
  priceTeacherShare: number;
  platformFee: number;
  maxStudentsPerGroup: number;
  studentsCount: number;
  scheduleDays: string[];
  learningPoints?: string[];
  descriptionVideo?: string;
  teacherId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    verificationStatus: string;
  };
  createdAt: string;
}

export default function AdminGroupsPage() {
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/groups/admin/all");
      setGroups(res.data?.data || []);
    } catch {
      toast.error("فشل في تحميل المجموعات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const filteredGroups = groups.filter((group) => {
    const matchesSearch =
      group.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.teacherId?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = stageFilter === "all" || group.stage?.includes(stageFilter);
    return matchesSearch && matchesStage;
  });

  const totalGroups = groups.length;
  const totalStudents = groups.reduce((sum, g) => sum + (g.studentsCount || 0), 0);
  const totalCapacity = groups.reduce((sum, g) => sum + (g.maxStudentsPerGroup || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">المجموعات</h2>
          <p className="text-base text-muted-foreground mt-1">
            عرض وإدارة جميع المجموعات على المنصة
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${iconChip.primary} flex items-center justify-center`}>
              <Users className={`w-5 h-5 ${iconColor.primary}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalGroups}</p>
              <p className="text-sm text-muted-foreground">إجمالي المجموعات</p>
            </div>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${iconChip.people} flex items-center justify-center`}>
              <Users className={`w-5 h-5 ${iconColor.people}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalStudents}/{totalCapacity}</p>
              <p className="text-sm text-muted-foreground">طلاب / سعة</p>
            </div>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${iconChip.money} flex items-center justify-center`}>
              <Wallet className={`w-5 h-5 ${iconColor.money}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {groups.length > 0 ? Math.round((totalStudents / totalCapacity) * 100) : 0}%
              </p>
              <p className="text-sm text-muted-foreground">نسبة الإمتلاء</p>
            </div>
          </div>
        </div>
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
          {["all", "ابتدائي", "إعدادي", "ثانوي"].map((stage) => (
            <button
              key={stage}
              onClick={() => setStageFilter(stage)}
              className={`px-5 py-3 rounded-lg text-sm font-medium transition-colors ${
                stageFilter === stage
                  ? "bg-primary text-primary-foreground"
                  : "bg-background border hover:bg-muted"
              }`}
            >
              {stage === "all" ? "الكل" : stage}
            </button>
          ))}
        </div>
      </div>

      {/* Groups List */}
      <div className="space-y-3">
        {filteredGroups.map((group) => {
          const isExpanded = expandedGroup === (group._id || group.id);
          const enrollmentPercent = Math.round(
            ((group.studentsCount || 0) / (group.maxStudentsPerGroup || 25)) * 100
          );

          return (
            <div
              key={group._id || group.id}
              className="bg-card border rounded-xl overflow-hidden"
            >
              {/* Group Header */}
              <button
                onClick={() => setExpandedGroup(isExpanded ? null : (group._id || group.id))}
                className="w-full p-5 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${iconChip.primary} flex items-center justify-center`}>
                    <GraduationCap className={`w-6 h-6 ${iconColor.primary}`} />
                  </div>
                  <div className="text-right">
                    <h3 className="text-lg font-bold">{group.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{group.subject}</span>
                      <span>&bull;</span>
                      <span>{group.stage}</span>
                      <span>&bull;</span>
                      <span>{group.grade}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        المعلم: {group.teacherId?.name || "غير محدد"}
                      </span>
                      <Badge
                        variant={group.teacherId?.verificationStatus === "VERIFIED" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {group.teacherId?.verificationStatus === "VERIFIED" ? "معتمد" : "غير معتمد"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-left">
                    <p className="text-sm font-bold">{group.studentsCount || 0}/{group.maxStudentsPerGroup || 25}</p>
                    <p className="text-xs text-muted-foreground">طلاب</p>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t p-5 bg-muted/20">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="p-3 bg-background rounded-lg border">
                      <p className="text-xs text-muted-foreground mb-1">سعر الحصة</p>
                      <p className="text-lg font-bold text-green-600">{group.totalSessionPrice} ج.م</p>
                    </div>
                    <div className="p-3 bg-background rounded-lg border">
                      <p className="text-xs text-muted-foreground mb-1">حصة المعلم</p>
                      <p className="text-lg font-bold">{group.priceTeacherShare} ج.م</p>
                    </div>
                    <div className="p-3 bg-background rounded-lg border">
                      <p className="text-xs text-muted-foreground mb-1">عمولة المنصة</p>
                      <p className="text-lg font-bold text-orange-500">{group.platformFee} ج.م</p>
                    </div>
                    <div className="p-3 bg-background rounded-lg border">
                      <p className="text-xs text-muted-foreground mb-1">السعة القصوى</p>
                      <p className="text-lg font-bold">{group.maxStudentsPerGroup} طالب</p>
                    </div>
                  </div>

                  {/* Enrollment Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">نسبة الإمتلاء</span>
                      <span className="text-sm font-bold">{enrollmentPercent}%</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          enrollmentPercent >= 100 ? "bg-green-500" : enrollmentPercent >= 75 ? "bg-amber-500" : "bg-primary"
                        }`}
                        style={{ width: `${Math.min(enrollmentPercent, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">مواعيد الحصص</p>
                    <div className="flex flex-wrap gap-2">
                      {(group.scheduleDays || []).map((slot, i) => (
                        <Badge key={i} variant="outline" className="font-normal">
                          <Calendar className="w-3 h-3 ml-1" />
                          {slot}
                        </Badge>
                      ))}
                      {(!group.scheduleDays || group.scheduleDays.length === 0) && (
                        <span className="text-sm text-muted-foreground">لا توجد مواعيد</span>
                      )}
                    </div>
                  </div>

                  {/* Learning Points */}
                  {(group.learningPoints || []).length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        ماذا ستتعلم في هذه المجموعة؟
                      </p>
                      <ul className="space-y-1.5">
                        {group.learningPoints?.map((point, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <span className="text-muted-foreground">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Description Video */}
                  {group.descriptionVideo && (
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1.5">
                        <PlayCircle className="w-4 h-4 text-primary" />
                        فيديو وصف المجموعة
                      </p>
                      <video
                        src={group.descriptionVideo}
                        controls
                        className="w-full rounded-lg max-h-72 bg-muted"
                      />
                    </div>
                  )}

                  {/* Teacher Info */}
                  <div className="p-4 bg-background rounded-lg border">
                    <p className="text-sm font-medium mb-2">معلومات المعلم</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">الاسم: </span>
                        <span className="font-medium">{group.teacherId?.name}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">البريد: </span>
                        <span className="font-medium">{group.teacherId?.email}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">الهاتف: </span>
                        <span className="font-medium">{group.teacherId?.phone || "غير محدد"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredGroups.length === 0 && (
        <div className="text-center py-16">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">لا توجد مجموعات</h3>
          <p className="text-muted-foreground">
            {searchQuery || stageFilter !== "all"
              ? "لم يتم العثور على مجموعات تطابق البحث"
              : "لا توجد مجموعات على المنصة بعد"}
          </p>
        </div>
      )}
    </div>
  );
}
