"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth-provider";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  Save,
  Camera,
  Lock,
  Bell,
  Key,
  BookOpen,
  Activity,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  ChevronLeft,
  LogOut,
  Calendar,
  TrendingUp,
  GraduationCap,
  Star,
  Users,
  Award,
  Loader2,
  Bookmark,
  Target,
} from "lucide-react";

export default function StudentProfilePage() {
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"personal" | "security" | "notifications">("personal");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    grade: "",
    school: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        grade: (user as any).grade || "",
        school: (user as any).school || "",
      });
      setAvatarUrl((user as any).avatarUrl || null);
    }
  }, [user]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("يرجى اختيار ملف صورة صالح");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("حجم الصورة يجب أن يكون أقل من 2 ميجابايت");
      return;
    }

    setIsUploading(true);
    try {
      const userId = (user as any)._id || user?.id;
      if (!userId) {
        toast.error("لم يتم العثور على معرف المستخدم");
        return;
      }

      const formData = new FormData();
      formData.append("avatar", file);

      const response = await api.post("/users/upload-avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newAvatarUrl = response.data?.avatarUrl;
      if (newAvatarUrl) {
        setAvatarUrl(newAvatarUrl);
        await refreshUser();
        toast.success("تم تحديث الصورة الشخصية بنجاح");
      }
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error(error.response?.data?.message || "حدث خطأ أثناء رفع الصورة");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    const userId = (user as any)._id || user.id;
    if (!userId) {
      toast.error("لم يتم العثور على معرف المستخدم");
      return;
    }

    setIsSaving(true);
    try {
      await api.put(`/users/${userId}`, {
        name: formData.name,
        phone: formData.phone,
        grade: formData.grade,
        school: formData.school,
      });
      await refreshUser();
      toast.success("تم تحديث الملف الشخصي بنجاح");
      setIsEditing(false);
    } catch (error: any) {
      const message = error.response?.data?.message || "حدث خطأ أثناء تحديث الملف الشخصي";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("كلمات المرور غير متطابقة");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("كلمة المرور يجب أن تكون ٦ أحرف على الأقل");
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.post("/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success("تم تحديث كلمة المرور بنجاح");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "تعذر تحديث كلمة المرور");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  };

  const isNewUser = user?.createdAt
    ? (Date.now() - new Date(user.createdAt).getTime()) < 30 * 24 * 60 * 60 * 1000
    : true;

  const stats = [
    { title: "المجموعات المسجلة", value: isNewUser ? "٠" : "٣", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "الحصص المحضورة", value: isNewUser ? "٠" : "١٨", icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
    { title: "نسبة الحضور", value: isNewUser ? "—" : "٨٨٪", icon: Target, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "المتوسط", value: isNewUser ? "—" : "٨٥٪", icon: Star, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  ];

  const recentActivity = [
    { id: 1, action: "حضور حصة الفيزياء", detail: "المجموعة أ - الصف الثاني الثانوي", time: "منذ يومين", icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
    { id: 2, action: "تسليم واجب الرياضيات", detail: "واجب رقم ٥", time: "منذ ٣ أيام", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
    { id: 3, action: "اختبار الكيمياء", detail: "النتيجة: ٩٢٪", time: "منذ أسبوع", icon: Award, color: "text-purple-500", bg: "bg-purple-500/10" },
    { id: 4, action: "تسجيل في مجموعة جديدة", detail: "الرياضيات - المجموعة ب", time: "منذ أسبوعين", icon: Bookmark, color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  const notificationOptions = [
    { key: "sessionReminder", title: "تذكيرات الحصص", description: "تذكيرات قبل موعد الحصص", icon: Calendar },
    { key: "sessionCancelled", title: "إلغاء الحصص", description: "عند إلغاء حصة مجدولة", icon: Calendar },
    { key: "newMaterial", title: "المواد التعليمية", description: "عند إضافة محتوى جديد", icon: BookOpen },
    { key: "gradeUpdate", title: "النتائج", description: "عند تحديث النتائج والتقييمات", icon: TrendingUp },
    { key: "weeklyReport", title: "التقارير الأسبوعية", description: "ملخص أسبوعي لتقدمك", icon: Activity },
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">الملف الشخصي</h2>
          <p className="text-base text-muted-foreground mt-1">إدارة حسابك الشخصي ومعلوماتك</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.title} className="bg-card border rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-card border rounded-xl overflow-hidden">
              {/* Cover */}
              <div className="h-24 bg-gradient-to-br from-cyan-500/20 to-violet-500/20 relative">
                <div className="absolute -bottom-10 right-6">
                  <div className="relative">
                    <Avatar className="w-20 h-20 ring-4 ring-background">
                      <AvatarImage src={avatarUrl || ""} alt={user?.name || "Student"} />
                      <AvatarFallback className="text-xl bg-cyan-500/20 text-cyan-600 font-bold">
                        {user?.name ? getInitials(user.name) : "S"}
                      </AvatarFallback>
                    </Avatar>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="absolute bottom-0 right-0 w-7 h-7 bg-cyan-500 text-white rounded-full flex items-center justify-center hover:bg-cyan-600 transition-colors shadow-sm disabled:opacity-50"
                    >
                      {isUploading ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Camera className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Profile Info */}
              <div className="pt-14 px-6 pb-6">
                <h3 className="text-xl font-bold">{user?.name || "الطالب"}</h3>
                <p className="text-sm text-muted-foreground mt-1">طالب</p>

                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {isNewUser ? (
                    <Badge variant="default" className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">
                      <GraduationCap className="w-3 h-3 ml-1" />
                      طالب جديد
                    </Badge>
                  ) : (
                    <Badge variant="default" className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                      <CheckCircle className="w-3 h-3 ml-1" />
                      طالب نشط
                    </Badge>
                  )}
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{user?.email || "student@educenter.com"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground" dir="ltr">{user?.phone || "+20 1XX XXX XXXX"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      عضو منذ {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("ar-EG") : "يناير ٢٠٢٤"}
                    </span>
                  </div>
                  {(user as any)?.stage || (user as any)?.grade ? (
                    <div className="flex items-center gap-3 text-sm">
                      <GraduationCap className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {(user as any)?.stage || ""}{" - "}
                        {(user as any)?.grade || ""}
                      </span>
                    </div>
                  ) : null}
                </div>

                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">آخر نشاط</span>
                    <span className="font-medium">منذ يومين</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-muted-foreground">الحالة</span>
                    <span className="inline-flex items-center gap-1.5 text-green-500">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      متصل الآن
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Academic History */}
            <div className="bg-card border rounded-xl overflow-hidden">
              <div className="p-5 border-b flex items-center gap-2">
                <Award className="w-4 h-4 text-cyan-600" />
                <h4 className="font-semibold">السجل الأكاديمي</h4>
              </div>
              {Array.isArray((user as any)?.academicHistory) && (user as any).academicHistory.length > 0 ? (
                <div className="divide-y">
                  {(user as any).academicHistory.map((entry: any, index: number) => (
                    <div key={index} className="p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{entry.grade || "غير محدد"}</p>
                        {entry.year && (
                          <Badge variant="outline" className="text-xs">{entry.year}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{entry.stage || ""}</p>
                      {entry.startDate && entry.endDate && (
                        <p className="text-xs text-muted-foreground mt-1" dir="ltr">
                          {new Date(entry.startDate).toLocaleDateString("ar-EG")} →{" "}
                          {new Date(entry.endDate).toLocaleDateString("ar-EG")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    لا يوجد سجل أكاديمي بعد. سيتم تسجيل تاريخك الدراسي عند الترقية إلى مرحلة أعلى.
                  </p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-card border rounded-xl p-5">
              <h4 className="font-semibold mb-4">إجراءات سريعة</h4>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-sm">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-blue-500" />
                  </div>
                  <span className="flex-1 text-right">مجموعاتي</span>
                  <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                </button>
                <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-sm">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                  <span className="flex-1 text-right">تقدمي</span>
                  <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                </button>
                <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-sm">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Bookmark className="w-4 h-4 text-purple-500" />
                  </div>
                  <span className="flex-1 text-right">استكشف المجموعات</span>
                  <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                </button>
                <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-destructive/10 transition-colors text-sm text-destructive">
                  <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <span className="flex-1 text-right">تسجيل الخروج</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tab Navigation */}
            <div className="bg-card border rounded-xl overflow-hidden">
              <div className="flex border-b overflow-x-auto">
                <button
                  onClick={() => setActiveTab("personal")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors relative whitespace-nowrap ${
                    activeTab === "personal" ? "text-cyan-600 bg-cyan-50 dark:bg-cyan-500/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <User className="w-4 h-4" />
                  المعلومات الشخصية
                  {activeTab === "personal" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500" />}
                </button>
                <button
                  onClick={() => setActiveTab("security")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors relative whitespace-nowrap ${
                    activeTab === "security" ? "text-cyan-600 bg-cyan-50 dark:bg-cyan-500/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  الأمان
                  {activeTab === "security" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500" />}
                </button>
                <button
                  onClick={() => setActiveTab("notifications")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors relative whitespace-nowrap ${
                    activeTab === "notifications" ? "text-cyan-600 bg-cyan-50 dark:bg-cyan-500/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  الإشعارات
                  {activeTab === "notifications" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500" />}
                </button>
              </div>

              {/* Personal Tab */}
              {activeTab === "personal" && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold">المعلومات الشخصية</h3>
                      <p className="text-sm text-muted-foreground mt-1">تحديث بياناتك الشخصية ومعلومات الاتصال</p>
                    </div>
                    {!isEditing ? (
                      <Button onClick={() => setIsEditing(true)} className="gap-2 bg-cyan-600 hover:bg-cyan-700">
                        <User className="w-4 h-4" />
                        تعديل
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>إلغاء</Button>
                        <Button onClick={handleSaveProfile} disabled={isSaving} className="gap-2 bg-cyan-600 hover:bg-cyan-700">
                          <Save className="w-4 h-4" />
                          {isSaving ? "جاري الحفظ..." : "حفظ التغييرات"}
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="name">الاسم الكامل</Label>
                      <div className="relative">
                        <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          disabled={!isEditing}
                          className="pr-10 h-10"
                          placeholder="أدخل الاسم"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">البريد الإلكتروني</Label>
                      <div className="relative">
                        <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          value={formData.email}
                          disabled
                          className="pr-10 h-10 bg-muted/50"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">لا يمكن تغيير البريد الإلكتروني</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">رقم الهاتف</Label>
                      <div className="relative">
                        <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          disabled={!isEditing}
                          className="pr-10 h-10"
                          placeholder="أدخل رقم الهاتف"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">الدور</Label>
                      <div className="relative">
                        <GraduationCap className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="role"
                          value="طالب"
                          disabled
                          className="pr-10 h-10 bg-muted/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="grade">الصف الدراسي</Label>
                      <div className="relative">
                        <BookOpen className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="grade"
                          value={formData.grade}
                          onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                          disabled={!isEditing}
                          className="pr-10 h-10"
                          placeholder="مثال: الصف الثاني الثانوي"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="school">المدرسة</Label>
                      <div className="relative">
                        <GraduationCap className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="school"
                          value={formData.school}
                          onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                          disabled={!isEditing}
                          className="pr-10 h-10"
                          placeholder="اسم المدرسة"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div className="p-6 space-y-6">
                  <div>
                    <div className="mb-5">
                      <h3 className="text-lg font-bold">تغيير كلمة المرور</h3>
                      <p className="text-sm text-muted-foreground mt-1">تأكد من استخدام كلمة مرور قوية وفريدة</p>
                    </div>

                    <div className="max-w-md space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">كلمة المرور الحالية</Label>
                        <div className="relative">
                          <Key className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="current-password"
                            type={showCurrentPassword ? "text" : "password"}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            className="pr-10 h-10"
                            placeholder="أدخل كلمة المرور الحالية"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
                        <div className="relative">
                          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="new-password"
                            type={showNewPassword ? "text" : "password"}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className="pr-10 h-10"
                            placeholder="أدخل كلمة المرور الجديدة"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">تأكيد كلمة المرور</Label>
                        <div className="relative">
                          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            className="pr-10 h-10"
                            placeholder="أعد إدخال كلمة المرور"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <Button
                        onClick={handleChangePassword}
                        disabled={isChangingPassword}
                        className="w-full h-10 gap-2 bg-cyan-600 hover:bg-cyan-700"
                      >
                        {isChangingPassword ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Lock className="w-4 h-4" />
                        )}
                        {isChangingPassword ? "جاري التحديث..." : "تحديث كلمة المرور"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-bold">إعدادات الإشعارات</h3>
                    <p className="text-sm text-muted-foreground mt-1">تحكم في الإشعارات التي تتلقاها</p>
                  </div>

                  <div className="space-y-3">
                    {notificationOptions.map((option) => (
                      <div
                        key={option.key}
                        className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                            <option.icon className="w-5 h-5 text-cyan-600" />
                          </div>
                          <div>
                            <p className="font-medium">{option.title}</p>
                            <p className="text-sm text-muted-foreground">{option.description}</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-muted after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-card border rounded-xl overflow-hidden">
              <div className="p-5 border-b flex items-center justify-between">
                <h3 className="font-bold">آخر النشاطات</h3>
                <button className="text-sm text-cyan-600 hover:underline">عرض الكل</button>
              </div>
              <div className="divide-y">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                    <div className={`w-10 h-10 rounded-lg ${activity.bg} flex items-center justify-center flex-shrink-0`}>
                      <activity.icon className={`w-5 h-5 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.action}</p>
                      <p className="text-xs text-muted-foreground truncate">{activity.detail}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                      <Clock className="w-3 h-3" />
                      {activity.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
