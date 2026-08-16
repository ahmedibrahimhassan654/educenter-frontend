"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth-provider";
import api from "@/lib/api";
import familyApi from "@/lib/family-api";
import notificationApi, { NotificationSettings } from "@/lib/notification-api";
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
  CheckCircle,
  Eye,
  EyeOff,
  ChevronLeft,
  LogOut,
  Calendar,
  Loader2,
  Users,
  Clock,
  Wallet,
  UserPlus,
  HeartHandshake,
  GraduationCap,
} from "lucide-react";
import type { FamilyUserRef } from "@/types";

const parentNotificationOptions: {
  key: keyof NotificationSettings;
  title: string;
  description: string;
  icon: React.ElementType;
}[] = [
  { key: "childAttendance", title: "حضور الأبناء", description: "تنبيه عند تسجيل غياب أو حضور أحد أبنائك", icon: CheckCircle },
  { key: "childProgress", title: "تقدم الأبناء", description: "إشعارات دورية بمستوى تقدم أبنائك الدراسي", icon: GraduationCap },
  { key: "paymentReminder", title: "تذكيرات الدفع", description: "تذكير عند اقتراب مواعيد سداد الرسوم", icon: Wallet },
  { key: "weeklyReport", title: "التقارير الأسبوعية", description: "ملخص أسبوعي لأداء الأبناء", icon: Clock },
  { key: "sessionReminder", title: "تذكيرات الحصص", description: "تذكيرات قبل مواعيد حصص الأبناء", icon: Calendar },
  { key: "sessionCancelled", title: "إلغاء الحصص", description: "إشعار عند إلغاء حصة مجدولة", icon: Calendar },
  { key: "systemUpdates", title: "تحديثات النظام", description: "إشعارات حول تحديثات المنصة", icon: Bell },
  { key: "promotions", title: "العروض والتخفيضات", description: "عروض خاصة وتخفيضات على الباقات", icon: HeartHandshake },
];

export default function ParentProfilePage() {
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
  const [children, setChildren] = useState<FamilyUserRef[]>([]);
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
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
      });
      setAvatarUrl((user as any).avatarUrl || null);
    }
  }, [user]);

  useEffect(() => {
    const fetchChildren = async () => {
      setIsLoadingChildren(true);
      try {
        const data = await familyApi.getConnections();
        setChildren(data.connections || []);
      } catch (error) {
        console.error("Error fetching children:", error);
      } finally {
        setIsLoadingChildren(false);
      }
    };
    fetchChildren();
  }, []);

  useEffect(() => {
    const fetchNotificationSettings = async () => {
      setIsLoadingSettings(true);
      try {
        const settings = await notificationApi.getSettings();
        setNotificationSettings(settings);
      } catch (error) {
        console.error("Error fetching notification settings:", error);
      } finally {
        setIsLoadingSettings(false);
      }
    };
    fetchNotificationSettings();
  }, []);

  const handleNotificationToggle = async (key: keyof NotificationSettings) => {
    if (!notificationSettings) return;
    try {
      const updated = await notificationApi.updateSettings({
        [key]: !notificationSettings[key],
      });
      setNotificationSettings(updated);
      toast.success("تم تحديث إعدادات الإشعارات");
    } catch {
      toast.error("خطأ في تحديث إعدادات الإشعارات");
    }
  };

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

      const response = await api.post("/users/upload-avatar", formData);

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

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">الملف الشخصي</h2>
          <p className="text-base text-muted-foreground mt-1">إدارة حسابك الشخصي ومعلوماتك</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-card border rounded-xl overflow-hidden">
              {/* Cover */}
              <div className="h-24 bg-gradient-to-br from-blue-500/20 to-violet-500/20 relative">
                <div className="absolute -bottom-10 right-6">
                  <div className="relative">
                    <Avatar className="w-20 h-20 ring-4 ring-background">
                      <AvatarImage src={avatarUrl || ""} alt={user?.name || "Parent"} />
                      <AvatarFallback className="text-xl bg-blue-500/20 text-blue-600 font-bold">
                        {user?.name ? getInitials(user.name) : "P"}
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
                      className="absolute bottom-0 right-0 w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-50"
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
                <h3 className="text-xl font-bold">{user?.name || "ولي الأمر"}</h3>
                <p className="text-sm text-muted-foreground mt-1">ولي أمر</p>

                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {isNewUser ? (
                    <Badge variant="default" className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">
                      <User className="w-3 h-3 ml-1" />
                      حساب جديد
                    </Badge>
                  ) : (
                    <Badge variant="default" className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                      <CheckCircle className="w-3 h-3 ml-1" />
                      حساب نشط
                    </Badge>
                  )}
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{user?.email || "parent@educenter.com"}</span>
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
                  <div className="flex items-center gap-3 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {isLoadingChildren ? "جاري تحميل الأبناء..." : `عدد الأبناء: ${children.length}`}
                    </span>
                  </div>
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

            {/* Linked Children */}
            <div className="bg-card border rounded-xl overflow-hidden">
              <div className="p-5 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <h4 className="font-semibold">الأبناء</h4>
                </div>
                <Link href="/parent/family" className="text-sm text-blue-600 hover:underline">
                  إدارة
                </Link>
              </div>
              {isLoadingChildren ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                </div>
              ) : children.length > 0 ? (
                <div className="divide-y">
                  {children.map((child) => (
                    <div key={child._id} className="flex items-center gap-3 p-4">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={child.avatarUrl || ""} alt={child.name} />
                        <AvatarFallback className="bg-blue-500/10 text-blue-600 font-bold text-sm">
                          {child.name ? getInitials(child.name) : "ط"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{child.name}</p>
                        <p className="text-xs text-muted-foreground truncate" dir="ltr">
                          {child.email || child.phone || ""}
                        </p>
                      </div>
                      {(child as any)?.grade ? (
                        <Badge variant="outline" className="text-xs">{child.grade}</Badge>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    لم يتم ربط أي أبناء بعد
                  </p>
                  <Link href="/parent/family">
                    <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700">
                      <UserPlus className="w-4 h-4" />
                      ربط ابنك الآن
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-card border rounded-xl p-5">
              <h4 className="font-semibold mb-4">إجراءات سريعة</h4>
              <div className="space-y-2">
                <Link href="/parent/family" className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-sm">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-500" />
                  </div>
                  <span className="flex-1 text-right">العائلة</span>
                  <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                </Link>
                <Link href="/parent/payments" className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-sm">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-green-500" />
                  </div>
                  <span className="flex-1 text-right">المدفوعات</span>
                  <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                </Link>
                <Link href="/parent/reports" className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-sm">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-purple-500" />
                  </div>
                  <span className="flex-1 text-right">التقارير</span>
                  <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                </Link>
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
                    activeTab === "personal" ? "text-blue-600 bg-blue-50 dark:bg-blue-500/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <User className="w-4 h-4" />
                  المعلومات الشخصية
                  {activeTab === "personal" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
                </button>
                <button
                  onClick={() => setActiveTab("security")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors relative whitespace-nowrap ${
                    activeTab === "security" ? "text-blue-600 bg-blue-50 dark:bg-blue-500/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  الأمان
                  {activeTab === "security" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
                </button>
                <button
                  onClick={() => setActiveTab("notifications")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors relative whitespace-nowrap ${
                    activeTab === "notifications" ? "text-blue-600 bg-blue-50 dark:bg-blue-500/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  الإشعارات
                  {activeTab === "notifications" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
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
                      <Button onClick={() => setIsEditing(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
                        <User className="w-4 h-4" />
                        تعديل
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>إلغاء</Button>
                        <Button onClick={handleSaveProfile} disabled={isSaving} className="gap-2 bg-blue-600 hover:bg-blue-700">
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
                        <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="role"
                          value="ولي أمر"
                          disabled
                          className="pr-10 h-10 bg-muted/50"
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
                        className="w-full h-10 gap-2 bg-blue-600 hover:bg-blue-700"
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

                  {isLoadingSettings ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {parentNotificationOptions.map((option) => (
                        <div
                          key={option.key}
                          className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                              <option.icon className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">{option.title}</p>
                              <p className="text-sm text-muted-foreground">{option.description}</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationSettings?.[option.key] ?? false}
                              onChange={() => handleNotificationToggle(option.key)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-muted after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
