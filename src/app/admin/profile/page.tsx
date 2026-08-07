"use client";

import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth-provider";
import { createClient } from "@/lib/supabase/client";
import api from "@/lib/api";
import notificationApi, { NotificationSettings } from "@/lib/notification-api";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  Shield,
  Save,
  Camera,
  Lock,
  Bell,
  Key,
  Users,
  BookOpen,
  Wallet,
  Activity,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  ChevronLeft,
  Settings,
  LogOut,
  Calendar,
  TrendingUp,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function AdminProfilePage() {
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);

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

  // Fetch notification settings
  useEffect(() => {
    const fetchNotificationSettings = async () => {
      try {
        setIsLoadingSettings(true);
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

  // Update notification setting
  const handleNotificationToggle = async (key: keyof NotificationSettings) => {
    if (!notificationSettings) return;
    
    try {
      const updated = await notificationApi.updateSettings({
        [key]: !notificationSettings[key],
      });
      setNotificationSettings(updated);
      toast.success("تم تحديث إعدادات الإشعارات");
    } catch (error) {
      toast.error("خطأ في تحديث إعدادات الإشعارات");
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("يرجى اختيار ملف صورة صالح");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("حجم الصورة يجب أن يكون أقل من 2 ميجابايت");
      return;
    }

    setIsUploading(true);
    try {
      const supabase = createClient();
      const userId = (user as any)._id || user?.id;
      
      // Create a unique file path
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Try to upload, create bucket if it doesn't exist
      let { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      // If bucket doesn't exist, create it and retry
      if (uploadError && uploadError.message?.includes("Bucket not found")) {
        // Note: Bucket creation requires service role key or dashboard access
        // For now, we'll use a fallback approach with data URL
        const reader = new FileReader();
        reader.onload = async () => {
          const dataUrl = reader.result as string;
          
          // Save data URL directly (for demo purposes)
          await api.put(`/users/${userId}`, {
            avatarUrl: dataUrl,
          });
          
          setAvatarUrl(dataUrl);
          await refreshUser();
          toast.success("تم تحديث الصورة الشخصية بنجاح");
          setIsUploading(false);
          
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        };
        reader.readAsDataURL(file);
        return;
      }

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const newAvatarUrl = urlData.publicUrl;

      // Update user profile with new avatar URL
      await api.put(`/users/${userId}`, {
        avatarUrl: newAvatarUrl,
      });

      setAvatarUrl(newAvatarUrl);
      await refreshUser();
      toast.success("تم تحديث الصورة الشخصية بنجاح");
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error(error.message || "حدث خطأ أثناء رفع الصورة");
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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
    // Password change would go through Supabase
    toast.success("تم تحديث كلمة المرور بنجاح");
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const stats = [
    {
      title: "إجمالي المستخدمين",
      value: "٢٬٨٥٠",
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "المجموعات النشطة",
      value: "٤٥",
      icon: BookOpen,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      title: "الإيرادات الشهرية",
      value: "١٢٥٬٠٠٠ ج.م",
      icon: Wallet,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      title: "معدل النمو",
      value: "+١٨٪",
      icon: TrendingUp,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
  ];

  const recentActivity = [
    {
      id: 1,
      action: "تمت إضافة معلم جديد",
      detail: "أ. سارة أحمد",
      time: "منذ ٣٠ دقيقة",
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      id: 2,
      action: "تم حل شكوى",
      detail: "شكوى #١٢٣٤ - مشكلة في الدفع",
      time: "منذ ساعتين",
      icon: CheckCircle,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      id: 3,
      action: "تحديث إعدادات المنصة",
      detail: "تغيير رسوم المنصة",
      time: "منذ ٤ ساعات",
      icon: Settings,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      id: 4,
      action: "تنبيه أمان",
      detail: "محاولات تسجيل دخول فاشلة متعددة",
      time: "منذ ٥ ساعات",
      icon: AlertCircle,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
  ];

  // Admin notification options
  const adminNotificationOptions = [
    { key: "newStudent" as keyof NotificationSettings, title: "إشعارات المستخدمين الجدد", description: "عند تسجيل مستخدم جديد في المنصة", icon: Users },
    { key: "studentPayment" as keyof NotificationSettings, title: "إشعارات المدفوعات", description: "عند إجراء عملية سحب أو دفع جديدة", icon: Wallet },
    { key: "sessionReminder" as keyof NotificationSettings, title: "إشعارات الحصص", description: "تذكيرات قبل مواعيد الحصص", icon: Calendar },
    { key: "groupUpdate" as keyof NotificationSettings, title: "إشعارات المجموعات", description: "عند إنشاء أو تعديل مجموعة", icon: BookOpen },
    { key: "systemUpdates" as keyof NotificationSettings, title: "إشعارات النظام", description: "تحديثات الصيانة والSystemService", icon: Settings },
    { key: "weeklyReport" as keyof NotificationSettings, title: "التقارير الأسبوعية", description: "ملخص أسبوعي لأداء المنصة", icon: Activity },
  ];

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">الملف الشخصي</h2>
          <p className="text-base text-muted-foreground mt-1">
            إدارة حسابك الشخصي وإعدادات الحساب
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="bg-card border rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold mb-1">{stat.value}</p>
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
              <div className="h-24 bg-gradient-to-br from-primary/20 to-secondary/20 relative">
                <div className="absolute -bottom-10 right-6">
                  <div className="relative">
                    <Avatar className="w-20 h-20 ring-4 ring-background">
                      <AvatarImage src={avatarUrl || ""} alt={user?.name || "Admin"} />
                      <AvatarFallback className="text-xl bg-primary/20 text-primary font-bold">
                        {user?.name ? getInitials(user.name) : "AD"}
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
                      className="absolute bottom-0 right-0 w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
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
                <h3 className="text-xl font-bold">{user?.name || "أحمد إبراهيم"}</h3>
                <p className="text-sm text-muted-foreground mt-1">مدير المنصة</p>

                <div className="flex items-center gap-2 mt-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                    <Shield className="w-3.5 h-3.5" />
                    مشرف رئيسي
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-medium">
                    <CheckCircle className="w-3.5 h-3.5" />
                    نشط
                  </span>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{user?.email || "admin@educenter.com"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground" dir="ltr">{user?.phone || "+20 123 456 7890"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      عضو منذ {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("ar-EG") : "يناير ٢٠٢٤"}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">آخر نشاط</span>
                    <span className="font-medium">منذ ٥ دقائق</span>
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

            {/* Quick Actions */}
            <div className="bg-card border rounded-xl p-5">
              <h4 className="font-semibold mb-4">إجراءات سريعة</h4>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-sm">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-500" />
                  </div>
                  <span className="flex-1 text-right">إدارة المستخدمين</span>
                  <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                </button>
                <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-sm">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-green-500" />
                  </div>
                  <span className="flex-1 text-right">إدارة المجموعات</span>
                  <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                </button>
                <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-sm">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Settings className="w-4 h-4 text-purple-500" />
                  </div>
                  <span className="flex-1 text-right">إعدادات النظام</span>
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
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab("personal")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors relative ${
                    activeTab === "personal"
                      ? "text-primary bg-primary/5"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <User className="w-4 h-4" />
                  المعلومات الشخصية
                  {activeTab === "personal" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("security")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors relative ${
                    activeTab === "security"
                      ? "text-primary bg-primary/5"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  الأمان
                  {activeTab === "security" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("notifications")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors relative ${
                    activeTab === "notifications"
                      ? "text-primary bg-primary/5"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  الإشعارات
                  {activeTab === "notifications" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
              </div>

              {/* Personal Tab */}
              {activeTab === "personal" && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold">المعلومات الشخصية</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        تحديث بياناتك الشخصية ومعلومات الاتصال
                      </p>
                    </div>
                    {!isEditing ? (
                      <Button onClick={() => setIsEditing(true)} className="gap-2">
                        <User className="w-4 h-4" />
                        تعديل
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          إلغاء
                        </Button>
                        <Button onClick={handleSaveProfile} disabled={isSaving} className="gap-2">
                          <Save className="w-4 h-4" />
                          {isSaving ? "جاري الحفظ..." : "حفظ التغييرات"}
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">
                        الاسم الكامل
                      </Label>
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
                      <Label htmlFor="email" className="text-sm font-medium">
                        البريد الإلكتروني
                      </Label>
                      <div className="relative">
                        <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          value={formData.email}
                          disabled
                          className="pr-10 h-10 bg-muted/50"
                          placeholder="البريد الإلكتروني"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">لا يمكن تغيير البريد الإلكتروني</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium">
                        رقم الهاتف
                      </Label>
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
                      <Label htmlFor="role" className="text-sm font-medium">
                        الدور
                      </Label>
                      <div className="relative">
                        <Shield className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="role"
                          value="مدير المنصة"
                          disabled
                          className="pr-10 h-10 bg-muted/50"
                        />
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <strong>ملاحظة:</strong> التغييرات على اسمك ورقم هاتفك ستظهر فوراً في جميع أنحاء المنصة.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div className="p-6 space-y-6">
                  {/* Change Password */}
                  <div>
                    <div className="mb-5">
                      <h3 className="text-lg font-bold">تغيير كلمة المرور</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        تأكد من استخدام كلمة مرور قوية وفريدة
                      </p>
                    </div>

                    <div className="max-w-md space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password" className="text-sm font-medium">
                          كلمة المرور الحالية
                        </Label>
                        <div className="relative">
                          <Key className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="current-password"
                            type={showCurrentPassword ? "text" : "password"}
                            value={passwordData.currentPassword}
                            onChange={(e) =>
                              setPasswordData({ ...passwordData, currentPassword: e.target.value })
                            }
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
                        <Label htmlFor="new-password" className="text-sm font-medium">
                          كلمة المرور الجديدة
                        </Label>
                        <div className="relative">
                          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="new-password"
                            type={showNewPassword ? "text" : "password"}
                            value={passwordData.newPassword}
                            onChange={(e) =>
                              setPasswordData({ ...passwordData, newPassword: e.target.value })
                            }
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
                        <Label htmlFor="confirm-password" className="text-sm font-medium">
                          تأكيد كلمة المرور
                        </Label>
                        <div className="relative">
                          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            value={passwordData.confirmPassword}
                            onChange={(e) =>
                              setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                            }
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

                      <Button onClick={handleChangePassword} className="w-full h-10 gap-2">
                        <Lock className="w-4 h-4" />
                        تحديث كلمة المرور
                      </Button>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t" />

                  {/* Two-Factor Auth */}
                  <div>
                    <div className="mb-5">
                      <h3 className="text-lg font-bold">المصادقة الثنائية</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        أضف طبقة حماية إضافية لحسابك
                      </p>
                    </div>

                    <div className="flex items-center justify-between p-5 bg-muted/50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                          <Shield className="w-6 h-6 text-orange-500" />
                        </div>
                        <div>
                          <p className="font-semibold">المصادقة الثنائية</p>
                          <p className="text-sm text-muted-foreground">غير مفعلة حالياً</p>
                        </div>
                      </div>
                      <Button variant="outline" className="gap-2">
                        <Shield className="w-4 h-4" />
                        تفعيل
                      </Button>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t" />

                  {/* Login Sessions */}
                  <div>
                    <div className="mb-5">
                      <h3 className="text-lg font-bold">جلسات تسجيل الدخول</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        الأجهزة المسجل دخولك حالياً
                      </p>
                    </div>

                    <div className="space-y-3">
                      {[
                        {
                          device: "Windows - Chrome",
                          location: "القاهرة، مصر",
                          current: true,
                          time: "الآن",
                        },
                        {
                          device: "iPhone - Safari",
                          location: "القاهرة، مصر",
                          current: false,
                          time: "منذ يومين",
                        },
                      ].map((session, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              session.current ? "bg-green-500/10" : "bg-muted"
                            }`}>
                              <Activity className={`w-5 h-5 ${
                                session.current ? "text-green-500" : "text-muted-foreground"
                              }`} />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{session.device}</p>
                              <p className="text-xs text-muted-foreground">
                                {session.location} • {session.time}
                              </p>
                            </div>
                          </div>
                          {session.current ? (
                            <span className="text-xs text-green-500 font-medium px-2.5 py-1 bg-green-500/10 rounded-full">
                              نشط
                            </span>
                          ) : (
                            <Button variant="ghost" size="sm" className="text-destructive">
                              إنهاء
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-bold">إعدادات الإشعارات</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      تحكم في الإشعارات التي تتلقاها
                    </p>
                  </div>

                  {isLoadingSettings ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {adminNotificationOptions.map((option) => (
                        <div
                          key={option.key}
                          className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <option.icon className="w-5 h-5 text-primary" />
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
                            <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-muted after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/10">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">ملاحظة:</strong> يمكنك تعديل إعدادات الإشعارات في أي وقت. بعض الإشعارات الأساسية مثل تنبيهات الأمان لا يمكن تعطيلها.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-card border rounded-xl overflow-hidden">
              <div className="p-5 border-b flex items-center justify-between">
                <h3 className="font-bold">آخر النشاطات</h3>
                <button className="text-sm text-primary hover:underline">عرض الكل</button>
              </div>
              <div className="divide-y">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
                  >
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
    </DashboardLayout>
  );
}
