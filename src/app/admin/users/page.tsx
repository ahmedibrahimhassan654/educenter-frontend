"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import api, { clearCache } from "@/lib/api";
import { toast } from "sonner";
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  BookOpen,
  Wallet,
  Shield,
  UserCircle,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  MoreVertical,
  Download,
  Filter,
  RefreshCw,
  Eye,
  Clock,
  Activity,
  Sparkles,
} from "lucide-react";

interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  phone: string;
  role: "TEACHER" | "STUDENT" | "PARENT" | "ADMIN";
  subscriptionStatus: boolean;
  avatarUrl?: string;
  verificationStatus?: "PENDING" | "SUBMITTED" | "VERIFIED" | "REJECTED";
  verificationData?: {
    experience?: string;
    curriculum?: string[];
    bio?: string;
    documents?: string[];
  };
  stage?: string;
  grade?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserStats {
  total: number;
  teachers: number;
  students: number;
  parents: number;
  admins: number;
  activeSubscriptions: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface TeacherGroup {
  _id: string;
  title: string;
  subject: string;
  grade: string;
  stage?: string;
  scheduleDays: string[];
  totalSessionPrice: number;
  priceTeacherShare: number;
  studentsCount: number;
  createdAt: string;
}

interface TeacherGroupsSummary {
  groups: TeacherGroup[];
  stats: {
    totalGroups: number;
    totalStudents: number;
    averageStudentsPerGroup: number;
  };
}

interface ParentChild {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  stage?: string;
  grade?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showViewModal, setShowViewModal] = useState<User | null>(null);
  const [teacherGroups, setTeacherGroups] = useState<TeacherGroupsSummary | null>(null);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [parentChildren, setParentChildren] = useState<ParentChild[]>([]);
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "STUDENT" as string,
    password: "",
    stage: "",
    grade: "",
  });

  // Cache for users data
  const usersCacheRef = useRef<{ key: string; data: User[]; pagination: Pagination; timestamp: number } | null>(null);
  const CACHE_DURATION = 30000; // 30 seconds

  // Fetch users with filters and caching
  const fetchUsers = useCallback(async (forceRefresh = false, silent = false) => {
    const cacheKey = `${pagination.page}-${pagination.limit}-${searchQuery}-${roleFilter}`;

    // Use cache if available and not expired
    if (!forceRefresh && usersCacheRef.current && usersCacheRef.current.key === cacheKey) {
      const isCacheValid = Date.now() - usersCacheRef.current.timestamp < CACHE_DURATION;
      if (isCacheValid) {
        setUsers(usersCacheRef.current.data);
        setPagination(usersCacheRef.current.pagination);
        return;
      }
    }

    try {
      if (!silent) setIsLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (searchQuery) params.append("search", searchQuery);
      if (roleFilter !== "ALL") params.append("role", roleFilter);

      const response = await api.get(`/users?${params.toString()}`);
      if (response.data.success) {
        setUsers(response.data.data);
        setPagination(response.data.pagination);
        usersCacheRef.current = {
          key: cacheKey,
          data: response.data.data,
          pagination: response.data.pagination,
          timestamp: Date.now(),
        };
      }
      return true;
    } catch (error: any) {
      toast.error("خطأ في جلب المستخدمين");
      return false;
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [pagination.page, searchQuery, roleFilter]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get("/users/stats");
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  // Manual refresh: bypasses both the page cache and the axios response cache
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      clearCache("/users");
      usersCacheRef.current = null;
      const ok = await fetchUsers(true, true);
      await fetchStats();
      if (ok) toast.success("تم تحديث البيانات");
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, fetchUsers, fetchStats]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Open add modal
  const openAddModal = () => {
    setModalMode("add");
    setSelectedUser(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "STUDENT",
      password: "",
      stage: "",
      grade: "",
    });
    setShowModal(true);
  };

  // Open the details modal, loading group data for teachers and children for parents
  const openViewModal = async (user: User) => {
    setShowViewModal(user);
    setTeacherGroups(null);
    setParentChildren([]);

    if (user.role === "TEACHER") {
      setIsLoadingGroups(true);
      try {
        const response = await api.get(`/groups/teacher/${user._id}/summary`);
        setTeacherGroups(response.data?.data || null);
      } catch {
        toast.error("تعذر تحميل بيانات المجموعات");
      } finally {
        setIsLoadingGroups(false);
      }
      return;
    }

    if (user.role === "PARENT") {
      setIsLoadingChildren(true);
      try {
        const response = await api.get(`/users/${user._id}`);
        setParentChildren(response.data?.data?.students || []);
      } catch {
        toast.error("تعذر تحميل بيانات الأبناء");
      } finally {
        setIsLoadingChildren(false);
      }
    }
  };

  // Open edit modal
  const openEditModal = (user: User) => {
    setModalMode("edit");
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      password: "",
      stage: (user as any).stage || "",
      grade: (user as any).grade || "",
    });
    setShowModal(true);
  };

   // Save user
  const handleSave = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("جميع الحقول مطلوبة");
      return;
    }

    setIsSaving(true);
    try {
      if (modalMode === "add") {
        const response = await api.post("/users", formData);
        const generatedPassword = response.data?.generatedPassword;
        if (generatedPassword) {
          toast.success("تم إضافة المستخدم بنجاح", {
            description: `كلمة المرور: ${generatedPassword}`,
            duration: 15000,
          });
        } else {
          toast.success("تم إضافة المستخدم بنجاح");
        }
      } else if (selectedUser) {
        await api.put(`/users/${selectedUser._id}`, formData);
        toast.success("تم تحديث المستخدم بنجاح");
      }
      clearCache("/users");
      await fetchUsers(true);
      await fetchStats();
      setFormData({ name: "", email: "", phone: "", role: "STUDENT", password: "", stage: "", grade: "" });
      setShowModal(false);
    } catch (error: any) {
      const message = error.response?.data?.message || "خطأ في حفظ المستخدم";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete user
  const handleDelete = async (userId: string) => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await api.delete(`/users/${userId}`);
      toast.success("تم حذف المستخدم بنجاح");
      clearCache("/users");
      await fetchUsers(true);
      await fetchStats();
      setShowDeleteConfirm(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "خطأ في حذف المستخدم");
    } finally {
      setIsDeleting(false);
    }
  };

  // Role helpers
  const getRoleBadge = (role: string) => {
    const variants: Record<string, { bg: string; text: string; label: string }> = {
      ADMIN: { bg: "bg-purple-500/10", text: "text-purple-600", label: "مدير" },
      TEACHER: { bg: "bg-blue-500/10", text: "text-blue-600", label: "معلم" },
      STUDENT: { bg: "bg-green-500/10", text: "text-green-600", label: "طالب" },
      PARENT: { bg: "bg-orange-500/10", text: "text-orange-600", label: "ولي أمر" },
    };
    return variants[role] || variants.STUDENT;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN": return <Shield className="w-4 h-4" />;
      case "TEACHER": return <GraduationCap className="w-4 h-4" />;
      case "STUDENT": return <BookOpen className="w-4 h-4" />;
      case "PARENT": return <Users className="w-4 h-4" />;
      default: return <UserCircle className="w-4 h-4" />;
    }
  };

  const getVerificationBadge = (status?: string) => {
    const variants: Record<string, { bg: string; text: string; label: string; icon: React.ElementType }> = {
      VERIFIED: { bg: "bg-green-500/10", text: "text-green-600", label: "محقق", icon: CheckCircle },
      SUBMITTED: { bg: "bg-yellow-500/10", text: "text-yellow-600", label: "قيد المراجعة", icon: Clock },
      REJECTED: { bg: "bg-red-500/10", text: "text-red-600", label: "مرفوض", icon: XCircle },
      PENDING: { bg: "bg-gray-500/10", text: "text-gray-600", label: "في الانتظار", icon: Clock },
    };
    return variants[status || "PENDING"] || variants.PENDING;
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Export users (placeholder)
  const handleExport = () => {
    toast.info("جاري تصدير البيانات...");
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">إدارة المستخدمين</h2>
            <p className="text-base text-muted-foreground mt-1">
              عرض وإدارة جميع مستخدمي المنصة
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="تحديث البيانات"
              aria-label="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
            <Button variant="outline" onClick={handleExport} className="gap-2">
              <Download className="w-4 h-4" />
              تصدير
            </Button>
            <Button onClick={openAddModal} className="gap-2">
              <Plus className="w-4 h-4" />
              إضافة مستخدم
            </Button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">الإجمالي</span>
              </div>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-card border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-muted-foreground">معلمين</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{stats.teachers}</p>
            </div>
            <div className="bg-card border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-green-500" />
                <span className="text-sm text-muted-foreground">طلاب</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{stats.students}</p>
            </div>
            <div className="bg-card border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-orange-500" />
                <span className="text-sm text-muted-foreground">أولياء أمور</span>
              </div>
              <p className="text-2xl font-bold text-orange-600">{stats.parents}</p>
            </div>
            <div className="bg-card border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-purple-500" />
                <span className="text-sm text-muted-foreground">مديرين</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">{stats.admins}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-card border rounded-xl p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث بالاسم، البريد، أو الهاتف..."
                className="pr-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Role Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-10 px-3 rounded-lg border bg-background text-sm"
              >
                <option value="ALL">جميع الأدوار</option>
                <option value="ADMIN">مدير</option>
                <option value="TEACHER">معلم</option>
                <option value="STUDENT">طالب</option>
                <option value="PARENT">ولي أمر</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Users className="w-12 h-12 mb-4" />
              <p className="text-lg">لا يوجد مستخدمين</p>
              <p className="text-sm">جرب تغيير الفلاتر أو إضافة مستخدم جديد</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">المستخدم</th>
                      <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground hidden md:table-cell">الهاتف</th>
                      <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">الدور</th>
                      <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground hidden lg:table-cell">التحقق</th>
                      <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground hidden lg:table-cell">تاريخ التسجيل</th>
                      <th className="text-center py-4 px-6 text-sm font-medium text-muted-foreground">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => {
                      const roleBadge = getRoleBadge(user.role);
                      const verificationBadge = getVerificationBadge(user.verificationStatus);
                      const VerificationIcon = verificationBadge.icon;
                      return (
                        <tr key={user._id} className="border-t hover:bg-muted/30 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              {user.avatarUrl ? (
                                <img
                                  src={user.avatarUrl}
                                  alt={user.name}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-sm font-bold text-primary">
                                    {user.name.charAt(0)}
                                  </span>
                                </div>
                              )}
                              <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 hidden md:table-cell">
                            <span className="text-sm" dir="ltr">{user.phone}</span>
                          </td>
                          <td className="py-4 px-6">
                            <Badge variant="outline" className={`${roleBadge.bg} ${roleBadge.text} border-0`}>
                              <span className="flex items-center gap-1">
                                {getRoleIcon(user.role)}
                                {roleBadge.label}
                              </span>
                            </Badge>
                          </td>
                          <td className="py-4 px-6 hidden lg:table-cell">
                            {user.role === "TEACHER" ? (
                              <Badge variant="outline" className={`${verificationBadge.bg} ${verificationBadge.text} border-0`}>
                                <span className="flex items-center gap-1">
                                  <VerificationIcon className="w-3 h-3" />
                                  {verificationBadge.label}
                                </span>
                              </Badge>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="py-4 px-6 hidden lg:table-cell">
                            <span className="text-sm text-muted-foreground">
                              {formatDate(user.createdAt)}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => openViewModal(user)}
                                title="عرض التفاصيل"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => openEditModal(user)}
                                title="تعديل"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="text-destructive"
                                onClick={() => setShowDeleteConfirm(user._id)}
                                title="حذف"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between p-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    عرض {((pagination.page - 1) * pagination.limit) + 1} إلى{" "}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} من{" "}
                    {pagination.total} مستخدم
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page === 1}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <Button
                          key={pageNum}
                          variant={pagination.page === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPagination((prev) => ({ ...prev, page: pageNum }))}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    {pagination.pages > 5 && <span>...</span>}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page === pagination.pages}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-background rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">
                {modalMode === "add" ? "إضافة مستخدم جديد" : "تعديل المستخدم"}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-muted rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">الاسم الكامل</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="أدخل الاسم"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@email.com"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">رقم الهاتف</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+20 1XX XXX XXXX"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">الدور</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border bg-background text-sm"
                >
                  <option value="STUDENT">طالب</option>
                  <option value="TEACHER">معلم</option>
                  <option value="PARENT">ولي أمر</option>
                  <option value="ADMIN">مدير</option>
                </select>
              </div>

              {formData.role === "STUDENT" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">المرحلة الدراسية</label>
                    <select
                      value={formData.stage}
                      onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border bg-background text-sm"
                    >
                      <option value="">اختر المرحلة</option>
                      <option value="ابتدائي">ابتدائي</option>
                      <option value="إعدادي">إعدادي</option>
                      <option value="ثانوي">ثانوي</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">الصف الدراسي</label>
                    <select
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border bg-background text-sm"
                    >
                      <option value="">اختر الصف</option>
                      {formData.stage === "ابتدائي" && [
                        "الأول الابتدائي",
                        "الثاني الابتدائي",
                        "الثالث الابتدائي",
                        "الرابع الابتدائي",
                        "الخامس الابتدائي",
                        "السادس الابتدائي",
                      ].map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                      {formData.stage === "إعدادي" && [
                        "الأول الإعدادي",
                        "الثاني الإعدادي",
                        "الثالث الإعدادي",
                      ].map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                      {formData.stage === "ثانوي" && [
                        "الأول الثانوي",
                        "الثاني الثانوي",
                        "الثالث الثانوي",
                      ].map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {modalMode === "add" && (
                <div>
                  <label className="block text-sm font-medium mb-1">كلمة المرور</label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="اتركها فارغة للتوليد التلقائي"
                    dir="ltr"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    إذا تركتها فارغة سيتم توليد كلمة مرور تلقائياً وإرسالها بالبريد الإلكتروني
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                إلغاء
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="flex-1">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
                {modalMode === "add" ? "إضافة" : "حفظ"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteConfirm(null)} />
          <div className="relative bg-background rounded-xl p-6 w-full max-w-sm mx-4 shadow-xl">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-lg font-bold mb-2">تأكيد الحذف</h3>
              <p className="text-muted-foreground mb-6">
                هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1"
                >
                  إلغاء
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(showDeleteConfirm)}
                  disabled={isDeleting}
                  className="flex-1"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
                  حذف
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {showViewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowViewModal(null)} />
          <div className="relative bg-background rounded-xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-background p-4 border-b flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                {showViewModal.avatarUrl ? (
                  <img src={showViewModal.avatarUrl} alt={showViewModal.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">{showViewModal.name.charAt(0)}</span>
                  </div>
                )}
                <div>
                  <h4 className="font-bold">{showViewModal.name}</h4>
                  <Badge variant="outline" className={`${getRoleBadge(showViewModal.role).bg} ${getRoleBadge(showViewModal.role).text} border-0 text-xs`}>
                    {getRoleBadge(showViewModal.role).label}
                  </Badge>
                </div>
              </div>
              <button onClick={() => setShowViewModal(null)} className="p-1 hover:bg-muted rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" /> البريد</p>
                  <p className="font-medium text-sm truncate" dir="ltr">{showViewModal.email}</p>
                </div>
                <div className="p-2.5 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" /> الهاتف</p>
                  <p className="font-medium text-sm" dir="ltr">{showViewModal.phone}</p>
                </div>
                <div className="p-2.5 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" /> التسجيل</p>
                  <p className="font-medium text-sm">{formatDate(showViewModal.createdAt)}</p>
                </div>
                <div className="p-2.5 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> آخر تحديث</p>
                  <p className="font-medium text-sm">{formatDate(showViewModal.updatedAt)}</p>
                </div>
              </div>

              {/* Student-specific info */}
              {showViewModal.role === "STUDENT" && (
                <div className="p-2.5 bg-green-500/5 border border-green-500/20 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-green-500" /> المعلومات الدراسية
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-background rounded-lg border">
                      <p className="text-[11px] text-muted-foreground">المرحلة</p>
                      <p className="text-sm font-medium">{showViewModal.stage || "—"}</p>
                    </div>
                    <div className="p-2 bg-background rounded-lg border">
                      <p className="text-[11px] text-muted-foreground">الصف</p>
                      <p className="text-sm font-medium">{showViewModal.grade || "—"}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Parent-specific info */}
              {showViewModal.role === "PARENT" && (
                <div className="p-2.5 bg-orange-500/5 border border-orange-500/20 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    <Users className="w-3 h-3 text-orange-500" /> الأبناء ({parentChildren.length})
                  </p>

                  {isLoadingChildren ? (
                    <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جاري تحميل الأبناء...
                    </div>
                  ) : parentChildren.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-1">
                      لم يربط هذا الحساب أي طالب بعد
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {parentChildren.map((child) => (
                        <div
                          key={child._id}
                          className="p-2.5 bg-background rounded-lg border flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">
                              {child.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate" dir="ltr">
                              {child.email || child.phone || ""}
                            </p>
                          </div>
                          {(child.stage || child.grade) && (
                            <span className="shrink-0">
                              <Badge
                                variant="outline"
                                className="bg-green-500/10 text-green-600 border-0 text-xs"
                              >
                                {child.grade || child.stage}
                              </Badge>
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Teacher-specific info */}
              {showViewModal.role === "TEACHER" && (
                <>
                  {/* Verification Status */}
                  <div className="p-2.5 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">حالة التحقق</p>
                    <Badge variant="outline" className={`${getVerificationBadge(showViewModal.verificationStatus).bg} ${getVerificationBadge(showViewModal.verificationStatus).text} border-0`}>
                      <span className="flex items-center gap-1">
                        {(() => { const b = getVerificationBadge(showViewModal.verificationStatus); const I = b.icon; return <I className="w-3 h-3" />; })()}
                        {getVerificationBadge(showViewModal.verificationStatus).label}
                      </span>
                    </Badge>
                  </div>

                  {/* Groups */}
                  <div className="p-2.5 bg-indigo-500/5 border border-indigo-500/20 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-indigo-500" /> المجموعات
                    </p>

                    {isLoadingGroups ? (
                      <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        جاري تحميل المجموعات...
                      </div>
                    ) : !teacherGroups || teacherGroups.stats.totalGroups === 0 ? (
                      <p className="text-sm text-muted-foreground py-1">
                        لم يقم هذا المعلم بإنشاء أي مجموعة بعد
                      </p>
                    ) : (
                      <>
                        {/* Summary counters */}
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <div className="text-center p-2 bg-background rounded-lg border">
                            <p className="text-lg font-bold text-indigo-600">
                              {teacherGroups.stats.totalGroups}
                            </p>
                            <p className="text-[11px] text-muted-foreground">مجموعة</p>
                          </div>
                          <div className="text-center p-2 bg-background rounded-lg border">
                            <p className="text-lg font-bold text-green-600">
                              {teacherGroups.stats.totalStudents}
                            </p>
                            <p className="text-[11px] text-muted-foreground">طالب</p>
                          </div>
                          <div className="text-center p-2 bg-background rounded-lg border">
                            <p className="text-lg font-bold text-orange-600">
                              {teacherGroups.stats.averageStudentsPerGroup}
                            </p>
                            <p className="text-[11px] text-muted-foreground">متوسط/مجموعة</p>
                          </div>
                        </div>

                        {/* Per-group breakdown */}
                        <div className="space-y-2">
                          {teacherGroups.groups.map((group) => (
                            <div
                              key={group._id}
                              className="p-2.5 bg-background rounded-lg border"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-sm truncate">
                                    {group.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {group.subject}
                                    {group.grade ? ` • ${group.grade}` : ""}
                                  </p>
                                </div>
                                <Badge
                                  variant="outline"
                                  className="bg-green-500/10 text-green-600 border-0 text-xs shrink-0"
                                >
                                  <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {group.studentsCount} طالب
                                  </span>
                                </Badge>
                              </div>

                              {group.scheduleDays?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {group.scheduleDays.map((day, i) => (
                                    <span
                                      key={i}
                                      className="px-1.5 py-0.5 bg-muted rounded text-[11px] text-muted-foreground"
                                    >
                                      {day}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Subjects */}
                  {showViewModal.verificationData?.curriculum && showViewModal.verificationData.curriculum.length > 0 && (
                    <div className="p-2.5 bg-green-500/5 border border-green-500/20 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><GraduationCap className="w-3 h-3 text-green-500" /> المواد التي يدرسها</p>
                      <div className="flex flex-wrap gap-1">
                        {showViewModal.verificationData.curriculum.map((entry: string, i: number) => {
                          const [key, subjectName] = entry.split(":");
                          const parts = key ? key.split("-") : [];
                          const stage = parts[0] || "";
                          const grade = parts.slice(1).join("-");
                          return (
                            <Badge key={i} variant="outline" className="bg-green-500/10 text-green-600 border-0 text-xs">
                              {subjectName} <span className="text-muted-foreground">({stage} - {grade})</span>
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Experience */}
                  {showViewModal.verificationData?.experience && (
                    <div className="p-2.5 bg-orange-500/5 border border-orange-500/20 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Activity className="w-3 h-3 text-orange-500" /> الخبرة</p>
                      <p className="font-medium text-sm">{showViewModal.verificationData.experience}</p>
                    </div>
                  )}

                  {/* Bio */}
                  {showViewModal.verificationData?.bio && (
                    <div className="p-2.5 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><BookOpen className="w-3 h-3 text-blue-500" /> السيرة الذاتية</p>
                      <p className="text-sm">{showViewModal.verificationData.bio}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-background p-4 border-t flex gap-2">
              <Button
                variant="outline"
                onClick={() => { setShowViewModal(null); openEditModal(showViewModal); }}
                className="flex-1 gap-2"
              >
                <Edit2 className="w-4 h-4" />
                تعديل
              </Button>
              <Button variant="outline" onClick={() => setShowViewModal(null)} className="flex-1">
                إغلاق
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
