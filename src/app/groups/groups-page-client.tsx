"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import TeacherAvatar from "@/components/teacher-avatar";
import { PublicGroup, Pagination } from "@/types";
import {
  Search,
  Users,
  Calendar,
  Wallet,
  ArrowLeft,
  Loader2,
  GraduationCap,
  ShieldCheck,
  SlidersHorizontal,
  FilterX,
  BookOpen,
  Layers,
} from "lucide-react";
import {
  getSubjectColor,
  STAGE_COLORS,
  GRADES_BY_STAGE,
  getStageFromGrade,
} from "@/lib/subject-colors";

const STAGES = ["الكل", "ابتدائي", "إعدادي", "ثانوي"];
const SORTS = [
  { value: "newest", label: "الأحدث" },
  { value: "cheapest", label: "الأقل سعراً" },
  { value: "expensive", label: "الأعلى سعراً" },
  { value: "full", label: "الأكثر امتلاءً" },
];

interface CurriculumSubject {
  name: string;
}
interface CurriculumGrade {
  name: string;
  subjects?: CurriculumSubject[];
}
interface CurriculumStage {
  name: string;
  grades?: CurriculumGrade[];
}

export default function GroupsPageClient() {
  const [groups, setGroups] = useState<PublicGroup[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStage, setSelectedStage] = useState("الكل");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [sort, setSort] = useState("newest");

  const [curriculum, setCurriculum] = useState<CurriculumStage[]>([]);
  const requested = useRef<Set<string>>(new Set());

  // Load curriculum once for building filter options
  useEffect(() => {
    api
      .get("/curriculum")
      .then((res) => setCurriculum(Array.isArray(res.data) ? res.data : []))
      .catch(() => setCurriculum([]));
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const buildParams = useCallback(
    (pageNum: number, search?: string) => {
      const params: Record<string, string> = { page: String(pageNum), limit: "12" };
      const s = search !== undefined ? search : debouncedSearch;
      if (s.trim()) params.search = s.trim();
      if (selectedStage !== "الكل") params.stage = selectedStage;
      if (selectedGrade !== "all") params.grade = selectedGrade;
      if (selectedSubject !== "all") params.subject = selectedSubject;
      if (sort) params.sort = sort;
      return params;
    },
    [debouncedSearch, selectedStage, selectedGrade, selectedSubject, sort]
  );

  const fetchGroups = useCallback(
    async (pageNum = 1, append = false) => {
      const key = JSON.stringify(buildParams(pageNum));
      if (append) {
        if (requested.current.has(key)) return;
        requested.current.add(key);
      }

      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);
      try {
        const res = await api.get("/groups/public", {
          params: buildParams(pageNum),
        });
        const data = (res.data?.data || []) as PublicGroup[];
        const pag = res.data?.pagination;
        setGroups((prev) => (append ? [...prev, ...data] : data));
        if (pag) setPagination(pag);
        setPage(pageNum);
      } catch {
        if (pageNum === 1) setGroups([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [buildParams]
  );

  // Refetch when filters change
  useEffect(() => {
    requested.current.clear();
    fetchGroups(1);
  }, [debouncedSearch, selectedStage, selectedGrade, selectedSubject, sort, fetchGroups]);

  // Filter options derived from curriculum
  const gradeOptions = useMemo(() => {
    const stages =
      selectedStage === "الكل"
        ? curriculum
        : curriculum.filter((s) => s.name.includes(selectedStage));
    const grades = stages.flatMap((s) => s.grades || []).map((g) => g.name);
    const fromFallback = GRADES_BY_STAGE[selectedStage] || [];
    const merged = Array.from(new Set([...grades, ...fromFallback]));
    return merged;
  }, [curriculum, selectedStage]);

  const subjectOptions = useMemo(() => {
    const stages =
      selectedStage === "الكل"
        ? curriculum
        : curriculum.filter((s) => s.name.includes(selectedStage));
    const grades = stages
      .flatMap((s) => s.grades || [])
      .filter((g) => selectedGrade === "all" || g.name === selectedGrade);
    const subjects = grades
      .flatMap((g) => g.subjects || [])
      .map((s) => s.name);
    return Array.from(new Set(subjects));
  }, [curriculum, selectedStage, selectedGrade]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedStage("الكل");
    setSelectedGrade("all");
    setSelectedSubject("all");
    setSort("newest");
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedStage !== "الكل" ||
    selectedGrade !== "all" ||
    selectedSubject !== "all" ||
    sort !== "newest";

  return (
    <div className="space-y-10">
      {/* ======================= HERO ======================= */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-600" />
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl" />

        <div className="container relative py-16 md:py-24 text-center text-white">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/15 border border-white/20 text-white text-base font-medium mb-6 backdrop-blur-sm">
            <GraduationCap className="w-5 h-5" />
            <span>مجموعات دراسية بمعلمين معتمدين</span>
          </div>
          <h1 className="font-cairo text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
            اكتشف المجموعة المناسبة لك
          </h1>
          <p className="text-xl md:text-2xl text-white/85 max-w-3xl mx-auto mb-10 leading-relaxed">
            ابحث حسب المرحلة والصف والمادة، واختر المعلم الذي يناسب احتياجك
          </p>

          {/* Search */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن مجموعة أو مادة أو صف..."
              className="w-full pr-14 pl-32 py-4 bg-white text-foreground rounded-2xl text-lg shadow-2xl focus:outline-none focus:ring-4 focus:ring-white/40"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute left-4 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-blue-700 text-white text-base font-medium hover:bg-blue-800 transition-colors flex items-center gap-2"
              >
                <FilterX className="w-4 h-4" />
                مسح
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ======================= FILTERS ======================= */}
      <div className="container">
        <div className="bg-card border rounded-3xl shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-muted-foreground">
              <SlidersHorizontal className="w-5 h-5" />
              <span className="text-base font-medium">تصفية النتائج</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {!loading && pagination && (
                <span className="text-sm text-muted-foreground">
                  {pagination.total} مجموعة متاحة
                </span>
              )}
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <FilterX className="w-4 h-4" />
                  مسح الفلاتر
                </button>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-4">
            {/* Stage chips */}
            <div className="lg:col-span-7 flex flex-wrap items-center gap-2">
              {STAGES.map((stage) => (
                <button
                  key={stage}
                  onClick={() => {
                    setSelectedStage(stage);
                    setSelectedGrade("all");
                    setSelectedSubject("all");
                  }}
                  className={`px-5 py-2.5 rounded-xl text-base font-medium transition-all ${
                    selectedStage === stage
                      ? "bg-gradient-to-l from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30"
                      : "bg-muted hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  {stage}
                </button>
              ))}
            </div>

            {/* Grade + Subject + Sort selects */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={selectedGrade}
                onChange={(e) => {
                  setSelectedGrade(e.target.value);
                  setSelectedSubject("all");
                }}
                className="w-full px-3 py-2.5 rounded-xl border bg-background text-base focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">كل الصفوف</option>
                {gradeOptions.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border bg-background text-base focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">كل المواد</option>
                {subjectOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border bg-background text-base focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Groups Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-3xl border bg-card p-5 space-y-4 animate-pulse">
                <div className="h-3 w-1/3 bg-muted rounded-full" />
                <div className="h-6 w-2/3 bg-muted rounded-full" />
                <div className="h-4 w-1/2 bg-muted rounded-full" />
                <div className="h-2.5 w-full bg-muted rounded-full" />
              </div>
            ))}
          </div>
        ) : groups.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <GraduationCap className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">لا توجد مجموعات</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              لم يتم العثور على مجموعات تطابق معايير البحث. جرّب تعديل الفلاتر أو امسحها للاطلاع على كل المجموعات.
            </p>
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl text-base font-medium hover:bg-primary/90 transition-colors"
            >
              <FilterX className="w-5 h-5" />
              مسح الفلاتر
            </button>
          </div>
        )}

        {/* Load more */}
        {!loading && pagination && page < pagination.pages && groups.length > 0 && (
          <div className="flex justify-center pt-8">
            <button
              onClick={() => fetchGroups(page + 1, true)}
              disabled={loadingMore}
              className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-primary text-primary rounded-xl text-base font-medium hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري التحميل...
                </>
              ) : (
                <>
                  تحميل المزيد
                  <ArrowLeft className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function GroupCard({ group }: { group: PublicGroup }) {
  const color = getSubjectColor(group.subject);
  const stage = group.stage || getStageFromGrade(group.grade);
  const stageColor = STAGE_COLORS[stage] || STAGE_COLORS["ثانوي"];
  const maxStudents = group.maxStudentsPerGroup || 20;
  const enrollmentPercent = Math.min(
    Math.round(((group.studentsCount || 0) / maxStudents) * 100),
    100
  );
  const isFull = (group.studentsCount || 0) >= maxStudents;

  return (
    <div className="group bg-card border rounded-3xl overflow-hidden flex flex-col hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300">
      {/* Accent strip */}
      <div className={`h-1.5 bg-gradient-to-l ${color.gradient}`} />

      <div className="p-6 flex-1 flex flex-col">
        {/* Badges */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${color.chip}`}>
            <BookOpen className="w-3.5 h-3.5" />
            {group.subject}
          </span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${stageColor}`}>
            <Layers className="w-3.5 h-3.5" />
            {stage}
          </span>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-muted text-muted-foreground">
            {group.grade}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-cairo text-lg font-bold text-foreground mb-5 leading-snug">
          {group.title}
        </h3>

        {/* Teacher */}
        {group.teacher && (
          <Link
            href={`/teachers/${group.teacher.id}`}
            className="inline-flex items-center gap-3 mb-5 hover:bg-muted/60 rounded-2xl p-2.5 -m-2.5 transition-colors border border-transparent hover:border-border"
          >
            <TeacherAvatar
              name={group.teacher.name}
              avatarUrl={group.teacher.avatarUrl}
              className="w-12 h-12"
              textClassName="text-base"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-foreground truncate">
                  {group.teacher.name}
                </span>
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              </div>
              <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                معلم معتمد
              </span>
            </div>
            <ArrowLeft className="w-4 h-4 text-muted-foreground shrink-0" />
          </Link>
        )}

        {/* Schedule */}
        {(group.scheduleDays || []).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {group.scheduleDays.slice(0, 3).map((slot, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted text-sm text-muted-foreground"
              >
                <Calendar className="w-3.5 h-3.5" />
                {slot}
              </span>
            ))}
            {group.scheduleDays.length > 3 && (
              <span className="px-2.5 py-1 rounded-lg bg-muted text-sm text-muted-foreground">
                +{group.scheduleDays.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Enrollment */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              الطلاب المسجلين
            </span>
            <span className={`text-sm font-bold ${isFull ? "text-emerald-500" : "text-foreground"}`}>
              {group.studentsCount || 0}/{maxStudents}
            </span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isFull
                  ? "bg-emerald-500"
                  : enrollmentPercent >= 75
                  ? "bg-amber-500"
                  : "bg-indigo-500"
              }`}
              style={{ width: `${enrollmentPercent}%` }}
            />
          </div>
          {isFull && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-2">
              المجموعة مكتملة العدد
            </p>
          )}
        </div>

        {/* Price + CTA */}
        <div className="mt-auto pt-4 border-t">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-500" />
              <span className="text-sm text-muted-foreground">سعر الحصة</span>
            </div>
            <div className="font-cairo text-xl font-extrabold text-foreground">
              {group.totalSessionPrice}
              <span className="text-sm font-medium text-muted-foreground mr-1">ج.م</span>
            </div>
          </div>
          <Link
            href={`/groups/${group.id}`}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-l ${color.gradient} text-white rounded-xl text-base font-semibold hover:opacity-90 shadow-md transition-all`}
          >
            عرض المجموعة
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}