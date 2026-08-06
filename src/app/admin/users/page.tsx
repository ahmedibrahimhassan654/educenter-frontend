"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
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
  Eye,
  Clock,
  Activity,
  Sparkles,
} from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: "TEACHER" | "STUDENT" | "PARENT" | "ADMIN";
  subscriptionStatus: boolean;
  avatarUrl?: string;
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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
  const [showViewModal, setShowViewModal] = useState<User | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "STUDENT" as string,
  });

  // Fetch users with filters
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
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
      }
    } catch (error: any) {
      toast.error("خطأ في جلب المستخدمين");
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, searchQuery, roleFilter]);

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await api.get("/users/stats");
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

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
    });
    setShowModal(true);
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
        await api.post("/users", formData);
        toast.success("تم إضافة المستخدم بنجاح");
      } else if (selectedUser) {
        await api.put(`/users/${selectedUser._id}`, formData);
        toast.success("تم تحديث المستخدم بنجاح");
      }
      await fetchUsers();
      await fetchStats();
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
    try {
      await api.delete(`/users/${userId}`);
      toast.success("تم حذف المستخدم بنجاح");
      await fetchUsers();
      await fetchStats();
      setShowDeleteConfirm(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "خطأ في حذف المستخدم");
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
    <DashboardLayout role="admin">
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
                      <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground hidden lg:table-cell">تاريخ التسجيل</th>
                      <th className="text-center py-4 px-6 text-sm font-medium text-muted-foreground">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => {
                      const roleBadge = getRoleBadge(user.role);
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
                            <span className="text-sm text-muted-foreground">
                              {formatDate(user.createdAt)}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => setShowViewModal(user)}
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
                  className="flex-1"
                >
                  حذف
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {showViewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowViewModal(null)} />
          <div className="relative bg-background rounded-xl w-full max-w-lg mx-4 shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">معلومات المستخدم</h3>
                <button onClick={() => setShowViewModal(null)} className="p-1 hover:bg-muted rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-4">
                {showViewModal.avatarUrl ? (
                  <img
                    src={showViewModal.avatarUrl}
                    alt={showViewModal.name}
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-background"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center ring-4 ring-background">
                    <span className="text-2xl font-bold text-primary">
                      {showViewModal.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <h4 className="text-xl font-bold">{showViewModal.name}</h4>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="outline" className={`${getRoleBadge(showViewModal.role).bg} ${getRoleBadge(showViewModal.role).text} border-0`}>
                      <span className="flex items-center gap-1">
                        {getRoleIcon(showViewModal.role)}
                        {getRoleBadge(showViewModal.role).label}
                      </span>
                    </Badge>
                    {(showViewModal.role === "TEACHER" || showViewModal.role === "STUDENT") && 
                     (Date.now() - new Date(showViewModal.createdAt).getTime()) < 30 * 24 * 60 * 60 * 1000 && (
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-0">
                        <Sparkles className="w-3 h-3 ml-1" />
                        {showViewModal.role === "TEACHER" ? "معلم جديد" : "طالب جديد"}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <h4 className="font-semibold text-sm text-muted-foreground">المعلومات الشخصية</h4>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">البريد الإلكتروني</p>
                    <p className="font-medium" dir="ltr">{showViewModal.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">رقم الهاتف</p>
                    <p className="font-medium" dir="ltr">{showViewModal.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">الدور</p>
                    <p className="font-medium">{getRoleBadge(showViewModal.role).label}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-cyan-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">تاريخ التسجيل</p>
                    <p className="font-medium">{formatDate(showViewModal.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-pink-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">آخر تحديث</p>
                    <p className="font-medium">{formatDate(showViewModal.updatedAt)}</p>
                  </div>
                </div>

                {(showViewModal.role === "TEACHER" || showViewModal.role === "STUDENT") && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">الحالة</p>
                      <p className="font-medium">
                        {(Date.now() - new Date(showViewModal.createdAt).getTime()) < 30 * 24 * 60 * 60 * 1000
                          ? (showViewModal.role === "TEACHER" ? "معلم جديد" : "طالب جديد")
                          : (showViewModal.role === "TEACHER" ? "معلم نشط" : "طالب نشط")
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t bg-muted/30 flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowViewModal(null);
                  openEditModal(showViewModal);
                }}
                className="flex-1 gap-2"
              >
                <Edit2 className="w-4 h-4" />
                تعديل
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowViewModal(null)}
                className="flex-1"
              >
                إغلاق
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
