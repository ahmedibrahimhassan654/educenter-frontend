"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth-provider";
import { createClient } from "@/lib/supabase/client";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";
import { iconColor } from "@/lib/icon-styles";
import notificationApi, { NotificationSettings } from "@/lib/notification-api";
import { toast } from "sonner";
import { streamChat } from "@/lib/ai-api";
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
  Wallet,
  Activity,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  ChevronLeft,
  LogOut,
  Calendar,
  GraduationCap,
  Star,
  Users,
  Award,
  FileText,
  Image as ImageIcon,
  Sparkles,
  Loader2,
  Shield,
} from "lucide-react";

// Labels for the documents, in the same order they are uploaded on the
// verification form.
const documentTypeLabels = [
  "البطاقة الشخصية / الرقم القومي",
  "شهادة التخرج",
  "شهادات أخرى",
];

// Internal subject codes look like AR_SEC_3 / MATH_PREP_1
const SUBJECT_CODE = /^[A-Z]{2,}(_[A-Z0-9]+)+$/;

interface ParsedCurriculum {
  stage: string;
  grade: string;
  subject: string;
}

/**
 * Curriculum entries are stored as "stage-grade-CODE:subject".
 * Older records are a bare subject name with no stage or grade.
 */
function parseCurriculumEntry(entry: string): ParsedCurriculum {
  const separatorIndex = entry.indexOf(":");

  // Legacy format: just a subject name
  if (separatorIndex === -1) {
    return { stage: "", grade: "", subject: entry.trim() };
  }

  const key = entry.slice(0, separatorIndex);
  const subject = entry.slice(separatorIndex + 1).trim();
  const parts = key.split("-").filter(Boolean);

  // Drop the trailing subject code so it never reaches the UI
  if (parts.length && SUBJECT_CODE.test(parts[parts.length - 1])) {
    parts.pop();
  }

  const stage = parts.shift() || "";
  const grade = parts.join("-");

  return { stage, grade, subject: subject || entry.trim() };
}

/** Group entries as stage -> grade -> subjects for display. */
function groupCurriculum(entries: string[]) {
  const stages = new Map<string, Map<string, string[]>>();

  for (const entry of entries) {
    const { stage, grade, subject } = parseCurriculumEntry(entry);
    const stageKey = stage || "لم تحدد المرحلة";
    const gradeKey = grade || "";

    if (!stages.has(stageKey)) stages.set(stageKey, new Map());
    const grades = stages.get(stageKey)!;

    if (!grades.has(gradeKey)) grades.set(gradeKey, []);
    grades.get(gradeKey)!.push(subject);
  }

  return Array.from(stages.entries()).map(([stage, grades]) => ({
    stage,
    grades: Array.from(grades.entries()).map(([grade, subjects]) => ({
      grade,
      subjects,
    })),
  }));
}

export default function TeacherProfilePage() {
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"personal" | "security" | "notifications" | "qualifications">("personal");
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
  // Lives under verificationData on the user, not as top-level fields
  const [qualifications, setQualifications] = useState({
    experience: "",
    bio: "",
  });
  const [isSavingQualifications, setIsSavingQualifications] = useState(false);
  const [isGeneratingExperience, setIsGeneratingExperience] = useState(false);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  // Documents are excluded from /auth/me and loaded only when the tab opens
  const [documents, setDocuments] = useState<string[] | null>(null);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const hasRequestedDocuments = useRef(false);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
      setAvatarUrl(user.avatarUrl || null);
      setQualifications({
        experience: user.verificationData?.experience || "",
        bio: user.verificationData?.bio || "",
      });
    }
  }, [user]);

  // Load verification documents the first time the qualifications tab is shown.
  // The "already requested" flag is a ref, not state: putting it in the
  // dependency array would re-run this effect and cancel the in-flight request.
  useEffect(() => {
    if (activeTab !== "qualifications" || hasRequestedDocuments.current) {
      return;
    }

    hasRequestedDocuments.current = true;

    const fetchDocuments = async () => {
      setIsLoadingDocuments(true);
      try {
        const response = await api.get("/verification/my-documents");
        setDocuments(response.data?.data?.documents || []);
      } catch {
        setDocuments([]);
        // Allow a retry the next time the tab is opened
        hasRequestedDocuments.current = false;
        toast.error("تعذر تحميل المستندات");
      } finally {
        setIsLoadingDocuments(false);
      }
    };

    fetchDocuments();
  }, [activeTab]);

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
      const supabase = createClient();
      const userId = user?._id || user?.id;
      
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      // Never fall back to storing base64 in the database: it bloats every
      // record and slows down all authenticated requests.
      if (uploadError?.message?.includes("Bucket not found")) {
        console.error('Supabase Storage bucket "avatars" is missing');
        toast.error("تعذر رفع الصورة: مساحة التخزين غير مهيأة. تواصل مع الدعم.");
        return;
      }

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const newAvatarUrl = urlData.publicUrl;

      await api.put(`/users/${userId}`, { avatarUrl: newAvatarUrl });
      setAvatarUrl(newAvatarUrl);
      await refreshUser();
      toast.success("تم تحديث الصورة الشخصية بنجاح");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(getErrorMessage(error, "حدث خطأ أثناء رفع الصورة"));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleGenerateExperience = async () => {
    setIsGeneratingExperience(true);
    try {
      let generated = "";
      await streamChat(
        undefined,
        [{ role: "user", content: "اكتب خبرة مهنية احترافية لمعلم يبحث عن عمل في منصة تعليمية. اكتب من 3 إلى 5 جمل تصف خبرته في التدريس وأسلوبه وقدرته على توصيل المعلومات. بالعربية الفصحى." }],
        (chunk) => {
          generated += chunk;
          setQualifications((prev) => ({ ...prev, experience: generated }));
        },
        (error) => {
          toast.error("حدث خطأ أثناء التوليد");
        }
      );
      toast.success("تم توليد الخبرة بنجاح");
    } catch {
      toast.error("تعذر توليد الخبرة");
    } finally {
      setIsGeneratingExperience(false);
    }
  };

  const handleGenerateBio = async () => {
    setIsGeneratingBio(true);
    try {
      let generated = "";
      await streamChat(
        undefined,
        [{ role: "user", content: "اكتب سيرة ذاتية احترافية وجذابة لمعلم في منصة تعليمية إلكترونية. يجب أن تتضمن: التعريف بنفسه، خبراته التعليمية، أسلوبه في التدريس، وما يميزه عن غيره. اكتب من 4 إلى 6 جمل. بالعربية الفصحى." }],
        (chunk) => {
          generated += chunk;
          setQualifications((prev) => ({ ...prev, bio: generated }));
        },
        (error) => {
          toast.error("حدث خطأ أثناء التوليد");
        }
      );
      toast.success("تم توليد السيرة الذاتية بنجاح");
    } catch {
      toast.error("تعذر توليد السيرة الذاتية");
    } finally {
      setIsGeneratingBio(false);
    }
  };

  const handleSaveQualifications = async () => {
    if (qualifications.experience.length > 500) {
      toast.error("الخبرة يجب ألا تتجاوز ٥٠٠ حرف");
      return;
    }
    if (qualifications.bio.length > 2000) {
      toast.error("السيرة الذاتية يجب ألا تتجاوز ٢٠٠٠ حرف");
      return;
    }

    setIsSavingQualifications(true);
    try {
      await api.put("/verification/my-details", {
        experience: qualifications.experience,
        bio: qualifications.bio,
      });
      await refreshUser();
      toast.success("تم تحديث البيانات بنجاح");
    } catch (error) {
      toast.error(getErrorMessage(error, "تعذر تحديث البيانات"));
    } finally {
      setIsSavingQualifications(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    const userId = user._id || user.id;
    if (!userId) {
      toast.error("لم يتم العثور على معرف المستخدم");
      return;
    }

    setIsSaving(true);
    try {
      // Only these fields are accepted by the API; bio and experience live on
      // verificationData and are saved from the qualifications tab.
      await api.put(`/users/${userId}`, {
        name: formData.name,
        phone: formData.phone,
      });
      await refreshUser();
      toast.success("تم تحديث الملف الشخصي بنجاح");
      setIsEditing(false);
    } catch (error) {
      toast.error(getErrorMessage(error, "حدث خطأ أثناء تحديث الملف الشخصي"));
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
    } catch (error) {
      toast.error(getErrorMessage(error, "تعذر تحديث كلمة المرور"));
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  };

  // Check if user is new (created within last 30 days)
  const isNewUser = user?.createdAt
    ? (Date.now() - new Date(user.createdAt).getTime()) < 30 * 24 * 60 * 60 * 1000
    : true;

  // Mock teacher stats
  const stats = [
    { title: "إجمالي الطلاب", value: isNewUser ? "٠" : "٧٢", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "المجموعات النشطة", value: isNewUser ? "٠" : "٤", icon: BookOpen, color: "text-green-500", bg: "bg-green-500/10" },
    { title: "صافي الأرباح", value: isNewUser ? "٠ ج.م" : "٢٧٬٢٠٠ ج.م", icon: Wallet, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "التقييم", value: isNewUser ? "جديد" : "٤.٩", icon: Star, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  ];

  const recentActivity = [
    { id: 1, action: "إكمال حصة الفيزياء", detail: "المجموعة أ - الصف الثاني الثانوي", time: "منذ ساعتين", icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
    { id: 2, action: "إضافة واجب جديد", detail: "واجب رقم ٥ - الرياضيات", time: "منذ ٤ ساعات", icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" },
    { id: 3, action: "تحديث جدول الحصص", detail: "إضافة حصة إضافية يوم الأحد", time: "أمس", icon: Calendar, color: "text-purple-500", bg: "bg-purple-500/10" },
    { id: 4, action: "تقييم الطلاب", detail: "تم تقييم ١٥ طالب في اختبار الفيزياء", time: "منذ يومين", icon: Award, color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  // Teacher notification options
  const teacherNotificationOptions = [
    { key: "newStudent" as keyof NotificationSettings, title: "إشعارات الطلاب الجدد", description: "عند تسجيل طالب جديد في مجموعتك", icon: Users },
    { key: "studentPayment" as keyof NotificationSettings, title: "إشعارات المدفوعات", description: "عند إضافة رصيد جديد", icon: Wallet },
    { key: "sessionReminder" as keyof NotificationSettings, title: "تذكيرات الحصص", description: "تذكيرات قبل موعد الحصص", icon: Calendar },
    { key: "sessionCancelled" as keyof NotificationSettings, title: "إلغاء الحصص", description: "عند إلغاء حصة مجدولة", icon: Calendar },
    { key: "groupUpdate" as keyof NotificationSettings, title: "إشعارات المجموعات", description: "عند تعديل أو تحديث المجموعة", icon: BookOpen },
    { key: "weeklyReport" as keyof NotificationSettings, title: "التقارير الأسبوعية", description: "ملخص أسبوعي لأداء مجموعاتك", icon: Activity },
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
              <div className="h-24 bg-gradient-to-br from-green-500/20 to-emerald-500/20 relative">
                <div className="absolute -bottom-10 right-6">
                  <div className="relative">
                    <Avatar className="w-20 h-20 ring-4 ring-background">
                      <AvatarImage src={avatarUrl || ""} alt={user?.name || "Teacher"} />
                      <AvatarFallback className="text-xl bg-green-500/20 text-green-600 font-bold">
                        {user?.name ? getInitials(user.name) : "T"}
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
                      className="absolute bottom-0 right-0 w-7 h-7 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors shadow-sm disabled:opacity-50"
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
                <h3 className="text-xl font-bold">{user?.name || "المعلم"}</h3>
                <p className="text-sm text-muted-foreground mt-1">معلم</p>

                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {isNewUser ? (
                    <Badge variant="default" className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">
                      <Sparkles className="w-3 h-3 ml-1" />
                      معلم جديد
                    </Badge>
                  ) : (
                    <Badge variant="default" className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                      <GraduationCap className="w-3 h-3 ml-1" />
                      معلم معتمد
                    </Badge>
                  )}
                  {!isNewUser && (
                    <Badge variant="outline">
                      <Star className="w-3 h-3 ml-1 text-yellow-500" />
                      ٤.٩
                    </Badge>
                  )}
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{user?.email || "teacher@educenter.com"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground" dir="ltr">{user?.phone || "+20 1XX XXX XXXX"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      عضو_منذ {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("ar-EG") : "يناير ٢٠٢٤"}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">آخر نشاط</span>
                    <span className="font-medium">منذ ساعتين</span>
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
                    <BookOpen className="w-4 h-4 text-blue-500" />
                  </div>
                  <span className="flex-1 text-right">إدارة المجموعات</span>
                  <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                </button>
                <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-sm">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-green-500" />
                  </div>
                  <span className="flex-1 text-right">الأرباح والمدفوعات</span>
                  <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                </button>
                <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-sm">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-purple-500" />
                  </div>
                  <span className="flex-1 text-right">جدول الحصص</span>
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
                    activeTab === "personal" ? "text-green-600 bg-green-50 dark:bg-green-500/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <User className="w-4 h-4" />
                  المعلومات الشخصية
                  {activeTab === "personal" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500" />}
                </button>
                <button
                  onClick={() => setActiveTab("qualifications")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors relative whitespace-nowrap ${
                    activeTab === "qualifications" ? "text-green-600 bg-green-50 dark:bg-green-500/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  المؤهلات
                  {activeTab === "qualifications" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500" />}
                </button>
                <button
                  onClick={() => setActiveTab("security")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors relative whitespace-nowrap ${
                    activeTab === "security" ? "text-green-600 bg-green-50 dark:bg-green-500/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  الأمان
                  {activeTab === "security" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500" />}
                </button>
                <button
                  onClick={() => setActiveTab("notifications")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors relative whitespace-nowrap ${
                    activeTab === "notifications" ? "text-green-600 bg-green-50 dark:bg-green-500/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  الإشعارات
                  {activeTab === "notifications" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500" />}
                </button>
              </div>

              {/* Personal Tab */}
              {activeTab === "personal" && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <User className={`w-5 h-5 shrink-0 ${iconColor.people}`} />
                      <div>
                        <h3 className="text-lg font-bold">المعلومات الشخصية</h3>
                        <p className="text-sm text-muted-foreground mt-1">تحديث بياناتك الشخصية ومعلومات الاتصال</p>
                      </div>
                    </div>
                    {!isEditing ? (
                      <Button onClick={() => setIsEditing(true)} className="gap-2 bg-green-600 hover:bg-green-700">
                        <User className="w-4 h-4" />
                        تعديل
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>إلغاء</Button>
                        <Button onClick={handleSaveProfile} disabled={isSaving} className="gap-2 bg-green-600 hover:bg-green-700">
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
                          value="معلم"
                          disabled
                          className="pr-10 h-10 bg-muted/50"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2 p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        النبذة والخبرة تُحرَّران من تبويب{" "}
                        <button
                          type="button"
                          onClick={() => setActiveTab("qualifications")}
                          className="text-green-600 font-medium hover:underline"
                        >
                          المؤهلات والخبرات
                        </button>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Qualifications Tab */}
              {activeTab === "qualifications" && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Award className={`w-5 h-5 shrink-0 ${iconColor.learning}`} />
                      <div>
                        <h3 className="text-lg font-bold">المؤهلات والخبرات</h3>
                        <p className="text-sm text-muted-foreground mt-1">أضف مؤهلاتك التعليمية وخبراتك</p>
                      </div>
                    </div>
                    <Button
                      onClick={handleSaveQualifications}
                      disabled={isSavingQualifications}
                      className="gap-2 bg-green-600 hover:bg-green-700"
                    >
                      {isSavingQualifications ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {isSavingQualifications ? "جاري الحفظ..." : "حفظ"}
                    </Button>
                  </div>

                  {/* Editable details */}
                  <div className="mb-6 space-y-5">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="experience">الخبرة</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleGenerateExperience}
                          disabled={isGeneratingExperience}
                          className="h-7 gap-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                        >
                          {isGeneratingExperience ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5" />
                          )}
                          توليد بالذكاء
                        </Button>
                      </div>
                      <Input
                        id="experience"
                        value={qualifications.experience}
                        onChange={(e) =>
                          setQualifications({ ...qualifications, experience: e.target.value })
                        }
                        maxLength={500}
                        className="h-10"
                        placeholder="مثال: ٨ سنوات في تدريس الرياضيات للمرحلة الإعدادية"
                      />
                      <p className="text-xs text-muted-foreground">
                        {qualifications.experience.length} / ٥٠٠
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="teacher-bio">السيرة الذاتية</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleGenerateBio}
                          disabled={isGeneratingBio}
                          className="h-7 gap-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                        >
                          {isGeneratingBio ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5" />
                          )}
                          توليد بالذكاء
                        </Button>
                      </div>
                      <textarea
                        id="teacher-bio"
                        value={qualifications.bio}
                        onChange={(e) =>
                          setQualifications({ ...qualifications, bio: e.target.value })
                        }
                        maxLength={2000}
                        rows={5}
                        className="w-full px-3 py-2 rounded-lg border bg-transparent text-base md:text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-y"
                        placeholder="عرّف الطلاب وأولياء الأمور بخبراتك وأسلوبك في التدريس"
                      />
                      <p className="text-xs text-muted-foreground">
                        {qualifications.bio.length} / ٢٠٠٠
                      </p>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      المناهج والمستندات جزء من طلب التحقق المعتمد ولا يمكن تعديلها من هنا.
                    </p>
                  </div>

                  {/* Verification Info from Registration */}
                  <div className="mb-6 p-5 bg-green-50 dark:bg-green-500/10 rounded-xl border border-green-200 dark:border-green-500/20">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <h4 className="font-semibold text-green-700 dark:text-green-500">بيانات التحقق المقدمة</h4>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">الحالة: </span>
                        <span className="font-medium">
                          {user?.verificationStatus === "VERIFIED" ? "معتمد ✓" :
                           user?.verificationStatus === "PENDING" ? "قيد المراجعة" :
                           user?.verificationStatus === "REJECTED" ? "مرفوض" : "لم يقدم"}
                        </span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-muted-foreground">المراحل والصفوف التي تدرّسها: </span>
                        <div className="mt-2 space-y-3">
                          {user?.verificationData?.curriculum?.length ? (
                            groupCurriculum(user.verificationData.curriculum).map(
                              (stageGroup) => (
                                <div
                                  key={stageGroup.stage}
                                  className="p-3 bg-background rounded-lg border"
                                >
                                  <p className="font-semibold text-sm flex items-center gap-1.5">
                                    <GraduationCap className="w-4 h-4 text-green-600" />
                                    {stageGroup.stage}
                                  </p>
                                  <div className="mt-2 space-y-1.5">
                                    {stageGroup.grades.map((gradeGroup, gi) => (
                                      <div
                                        key={gi}
                                        className="flex flex-wrap items-center gap-2"
                                      >
                                        {gradeGroup.grade && (
                                          <span className="text-xs text-muted-foreground min-w-[120px]">
                                            {gradeGroup.grade}
                                          </span>
                                        )}
                                        <div className="flex flex-wrap gap-1">
                                          {gradeGroup.subjects.map((subject, si) => (
                                            <span
                                              key={si}
                                              className="px-2 py-1 bg-green-500/10 text-green-700 dark:text-green-400 rounded text-xs font-medium"
                                            >
                                              {subject}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )
                            )
                          ) : (
                            <span className="font-medium">غير محددة</span>
                          )}
                        </div>
                      </div>

                      {/* Uploaded documents */}
                      <div className="md:col-span-2">
                        <span className="text-muted-foreground">المستندات المرفوعة: </span>
                        <div className="mt-2">
                          {isLoadingDocuments ? (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              جاري تحميل المستندات...
                            </div>
                          ) : !documents || documents.length === 0 ? (
                            <span className="font-medium">لا توجد مستندات مرفوعة</span>
                          ) : (
                            <div className="space-y-2">
                              {documents.map((url, index) => {
                                const isImage = /\.(png|jpe?g|webp|gif)(\?|$)/i.test(url);
                                return (
                                  <div
                                    key={index}
                                    className="flex items-center gap-3 p-2.5 bg-background rounded-lg border"
                                  >
                                    <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                                      {isImage ? (
                                        <ImageIcon className="w-4 h-4 text-green-600" />
                                      ) : (
                                        <FileText className="w-4 h-4 text-green-600" />
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-medium truncate">
                                        {documentTypeLabels[index] || `مستند ${index + 1}`}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {isImage ? "صورة" : "PDF"}
                                      </p>
                                    </div>
                                    <a
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-green-600 dark:text-green-400 hover:underline shrink-0 px-2"
                                    >
                                      عرض الملف
                                    </a>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                      {user?.verifiedAt && (
                        <div className="md:col-span-2">
                          <span className="text-muted-foreground">تاريخ الاعتماد: </span>
                          <span className="font-medium">{new Date(user.verifiedAt!).toLocaleDateString("ar-EG")}</span>
                        </div>
                      )}
                    </div>
                  </div>


                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div className="p-6 space-y-6">
                  <div>
                    <div className="mb-5 flex items-center gap-3">
                      <Lock className={`w-5 h-5 shrink-0 ${iconColor.security}`} />
                      <div>
                        <h3 className="text-lg font-bold">تغيير كلمة المرور</h3>
                        <p className="text-sm text-muted-foreground mt-1">تأكد من استخدام كلمة مرور قوية وفريدة</p>
                      </div>
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
                        className="w-full h-10 gap-2 bg-green-600 hover:bg-green-700"
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

                  <div className="border-t" />

                  <div>
                    <div className="mb-5 flex items-center gap-3">
                      <Shield className={`w-5 h-5 shrink-0 ${iconColor.security}`} />
                      <div>
                        <h3 className="text-lg font-bold">المصادقة الثنائية</h3>
                        <p className="text-sm text-muted-foreground mt-1">أضف طبقة حماية إضافية لحسابك</p>
                      </div>
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
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <div className="p-6">
                  <div className="mb-6 flex items-center gap-3">
                    <Bell className={`w-5 h-5 shrink-0 ${iconColor.alert}`} />
                    <div>
                      <h3 className="text-lg font-bold">إعدادات الإشعارات</h3>
                      <p className="text-sm text-muted-foreground mt-1">تحكم في الإشعارات التي تتلقاها</p>
                    </div>
                  </div>

                  {isLoadingSettings ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-green-500" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {teacherNotificationOptions.map((option) => (
                        <div
                          key={option.key}
                          className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                              <option.icon className="w-5 h-5 text-green-600" />
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
                            <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-muted after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-card border rounded-xl overflow-hidden">
              <div className="p-5 border-b flex items-center justify-between">
                <h3 className="font-bold">آخر النشاطات</h3>
                <button className="text-sm text-green-600 hover:underline">عرض الكل</button>
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
