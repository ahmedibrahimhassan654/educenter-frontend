"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import api, { clearCache } from "@/lib/api";
import {
  DollarSign,
  Users,
  Percent,
  Loader2,
  Save,
  Info,
  Share2,
  CheckCircle,
  ArrowRightLeft,
  TrendingUp,
  Wallet,
  Sparkles,
  Zap,
  BarChart3,
  Globe,
} from "lucide-react";

interface SocialLinks {
  facebook: string;
  twitter: string;
  instagram: string;
  youtube: string;
  tiktok: string;
  linkedin: string;
  whatsapp: string;
  snapchat: string;
}

interface SettingsData {
  id?: string;
  defaultPricePerLecture: number;
  maxStudentsPerGroup: number;
  platformFeePercentage: number;
  socialLinks: SocialLinks;
}

const socialPlatforms = [
  {
    key: "facebook" as keyof SocialLinks,
    label: "فيسبوك",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    color: "blue",
    placeholder: "https://facebook.com/yourpage",
  },
  {
    key: "twitter" as keyof SocialLinks,
    label: "تويتر / X",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    color: "slate",
    placeholder: "https://x.com/yourhandle",
  },
  {
    key: "instagram" as keyof SocialLinks,
    label: "إنستغرام",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
    color: "pink",
    placeholder: "https://instagram.com/yourhandle",
  },
  {
    key: "youtube" as keyof SocialLinks,
    label: "يوتيوب",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    color: "red",
    placeholder: "https://youtube.com/@yourchannel",
  },
  {
    key: "tiktok" as keyof SocialLinks,
    label: "تيك توك",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
    color: "slate",
    placeholder: "https://tiktok.com/@yourhandle",
  },
  {
    key: "linkedin" as keyof SocialLinks,
    label: "لينكد إن",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    color: "blue",
    placeholder: "https://linkedin.com/company/yourpage",
  },
  {
    key: "whatsapp" as keyof SocialLinks,
    label: "واتساب",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
    color: "green",
    placeholder: "https://wa.me/201000000000",
  },
  {
    key: "snapchat" as keyof SocialLinks,
    label: "سناب شات",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12.959-.289.175-.098.35-.158.535-.158.218 0 .42.089.6.256.323.3.29.705.22.958-.09.31-.27.585-.45.72-.12.09-.27.18-.42.24-.21.09-.45.15-.66.18-.09.016-.18.03-.27.03-.15.015-.27.03-.36.06-.12.03-.21.09-.27.15-.12.12-.21.3-.27.51-.09.3-.12.66-.15 1.02-.06.66-.12 1.41-.3 2.07-.21.78-.57 1.47-1.05 2.07-.66.84-1.59 1.47-2.7 1.83-.48.15-.99.27-1.5.36-.51.09-1.05.15-1.56.18-.06 0-.12.015-.18.015-.12.015-.24.015-.33.03-.09.015-.15.03-.21.045-.06.015-.09.045-.12.075-.03.03-.06.06-.06.12 0 .06.03.12.06.15.03.03.09.06.15.075.06.015.12.015.18.015h.06c.12 0 .24 0 .36.015.12.015.24.03.33.06.09.03.15.06.21.12.06.06.09.12.09.21 0 .09-.03.15-.09.21-.06.06-.12.09-.21.12-.09.03-.21.045-.33.06-.12.015-.24.015-.36.015h-.06c-.06 0-.12 0-.18.015-.06.015-.12.03-.15.075-.03.045-.06.09-.06.15s.03.12.06.15c.03.03.09.06.15.075 1.56.3 3.18.18 4.65-.36 1.2-.45 2.25-1.17 3.06-2.13.6-.72 1.05-1.56 1.32-2.46.21-.72.3-1.47.33-2.22.03-.66.03-1.32.06-1.95.03-.6.09-1.17.21-1.71.06-.27.15-.51.27-.72.12-.21.27-.39.45-.51.18-.12.39-.18.6-.18.09 0 .18.015.27.03.09.015.18.045.27.075.18.06.36.15.51.24.15.09.27.21.36.36.09.15.12.33.09.51-.03.18-.12.33-.24.45-.12.12-.27.21-.42.27-.15.06-.33.09-.51.09-.12 0-.24-.015-.36-.045-.12-.03-.24-.075-.33-.15-.09-.075-.15-.18-.15-.3 0-.06.015-.12.045-.18.03-.06.06-.12.09-.15.03-.03.06-.06.09-.09.03-.03.06-.045.09-.06.03-.015.06-.03.09-.045h-.03z" />
      </svg>
    ),
    color: "yellow",
    placeholder: "https://snapchat.com/add/yourhandle",
  },
];

const colorMap: Record<string, { bg: string; text: string; border: string; light: string }> = {
  blue: { bg: "bg-blue-500", text: "text-blue-500", border: "border-blue-500/30", light: "bg-blue-500/10" },
  slate: { bg: "bg-slate-500", text: "text-slate-500", border: "border-slate-500/30", light: "bg-slate-500/10" },
  pink: { bg: "bg-pink-500", text: "text-pink-500", border: "border-pink-500/30", light: "bg-pink-500/10" },
  red: { bg: "bg-red-500", text: "text-red-500", border: "border-red-500/30", light: "bg-red-500/10" },
  green: { bg: "bg-green-500", text: "text-green-500", border: "border-green-500/30", light: "bg-green-500/10" },
  yellow: { bg: "bg-yellow-500", text: "text-yellow-600", border: "border-yellow-500/30", light: "bg-yellow-500/10" },
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsData>({
    defaultPricePerLecture: 50,
    maxStudentsPerGroup: 20,
    platformFeePercentage: 15,
    socialLinks: {
      facebook: "",
      twitter: "",
      instagram: "",
      youtube: "",
      tiktok: "",
      linkedin: "",
      whatsapp: "",
      snapchat: "",
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingSocial, setSavingSocial] = useState(false);
  const [socialSaved, setSocialSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"pricing" | "social" | "preview">("pricing");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get("/admin/settings");
      setSettings({
        ...response.data,
        socialLinks: {
          facebook: "",
          twitter: "",
          instagram: "",
          youtube: "",
          tiktok: "",
          linkedin: "",
          whatsapp: "",
          snapchat: "",
          ...response.data.socialLinks,
        },
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("فشل في تحميل الإعدادات");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/admin/settings", {
        defaultPricePerLecture: settings.defaultPricePerLecture,
        maxStudentsPerGroup: settings.maxStudentsPerGroup,
        platformFeePercentage: settings.platformFeePercentage,
        socialLinks: settings.socialLinks,
      });
      clearCache("/admin/settings");
      await fetchSettings();
      toast.success("تم حفظ الإعدادات بنجاح");
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "فشل في حفظ الإعدادات";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSocial = async () => {
    setSavingSocial(true);
    setSocialSaved(false);
    try {
      await api.put("/admin/settings", {
        socialLinks: settings.socialLinks,
      });
      clearCache("/admin/settings");
      await fetchSettings();
      setSocialSaved(true);
      setTimeout(() => setSocialSaved(false), 3000);
      toast.success("تم حفظ روابط السوشيال ميديا بنجاح");
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "فشل في حفظ روابط السوشيال ميديا";
      toast.error(message);
    } finally {
      setSavingSocial(false);
    }
  };

  const platformFeeAmount = Math.round(
    (settings.defaultPricePerLecture * settings.platformFeePercentage) / 100
  );
  const teacherShare = settings.defaultPricePerLecture - platformFeeAmount;
  const fullGroupRevenue = settings.defaultPricePerLecture * settings.maxStudentsPerGroup;
  const teacherGroupEarnings = teacherShare * settings.maxStudentsPerGroup;
  const activeSocialCount = Object.values(settings.socialLinks).filter(Boolean).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-primary/20 animate-ping" />
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "pricing" as const, label: "الأسعار والإعدادات", icon: DollarSign },
    { id: "social" as const, label: "روابط التواصل", icon: Share2 },
    { id: "preview" as const, label: "معاينة الحسابات", icon: BarChart3 },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-accent p-8 md:p-10 text-white shadow-2xl shadow-primary/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.15),_transparent_50%)]" />
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/20 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">إعدادات المنصة</h1>
            </div>
            <p className="text-white/80 text-lg max-w-xl">
              تحكم كامل في الأسعار الافتراضية، عمولات المنصة، وروابط التواصل الاجتماعي
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="gap-2 bg-white text-primary hover:bg-white/90 shadow-xl shadow-black/20 h-12 px-8 text-base font-semibold"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            حفظ جميع الإعدادات
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-muted/60 rounded-2xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
              activeTab === tab.id
                ? "bg-background text-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }`}
          >
            {activeTab === tab.id && (
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 animate-in fade-in duration-300" />
            )}
            <tab.icon className="w-4 h-4 relative z-10" />
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Pricing Tab */}
      {activeTab === "pricing" && (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Price per Lecture */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur" />
            <div className="relative bg-card border-2 rounded-2xl p-6 h-full transition-all duration-300 group-hover:border-emerald-500/40">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <DollarSign className="w-7 h-7" />
                </div>
                <div>
                  <CardTitle className="text-base">سعر الحصة الافتراضي</CardTitle>
                  <CardDescription>لكل طالب في المجموعة</CardDescription>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-medium text-muted-foreground">السعر (ج.م)</Label>
                <Input
                  id="price"
                  type="number"
                  min={0}
                  value={settings.defaultPricePerLecture}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      defaultPricePerLecture: Number(e.target.value) || 0,
                    }))
                  }
                  className="text-2xl font-bold h-14 text-center bg-gradient-to-b from-background to-muted/30 border-2 focus:border-emerald-500/50 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Max Students */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur" />
            <div className="relative bg-card border-2 rounded-2xl p-6 h-full transition-all duration-300 group-hover:border-blue-500/40">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Users className="w-7 h-7" />
                </div>
                <div>
                  <CardTitle className="text-base">سعة المجموعة</CardTitle>
                  <CardDescription>أقصى عدد طلاب لكل مجموعة</CardDescription>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxStudents" className="text-sm font-medium text-muted-foreground">عدد الطلاب</Label>
                <Input
                  id="maxStudents"
                  type="number"
                  min={1}
                  value={settings.maxStudentsPerGroup}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      maxStudentsPerGroup: Number(e.target.value) || 1,
                    }))
                  }
                  className="text-2xl font-bold h-14 text-center bg-gradient-to-b from-background to-muted/30 border-2 focus:border-blue-500/50 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Platform Fee */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur" />
            <div className="relative bg-card border-2 rounded-2xl p-6 h-full transition-all duration-300 group-hover:border-orange-500/40">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Percent className="w-7 h-7" />
                </div>
                <div>
                  <CardTitle className="text-base">عمولة المنصة</CardTitle>
                  <CardDescription>نسبة من سعر الحصة</CardDescription>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fee" className="text-sm font-medium text-muted-foreground">النسبة المئوية (%)</Label>
                <Input
                  id="fee"
                  type="number"
                  min={0}
                  max={100}
                  value={settings.platformFeePercentage}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      platformFeePercentage: Number(e.target.value) || 0,
                    }))
                  }
                  className="text-2xl font-bold h-14 text-center bg-gradient-to-b from-background to-muted/30 border-2 focus:border-orange-500/50 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Tab */}
      {activeTab === "preview" && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="group relative overflow-hidden rounded-2xl p-6 bg-card border-2 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">سعر الحصة للطالب</p>
              </div>
              <p className="text-3xl font-bold text-primary">{settings.defaultPricePerLecture} <span className="text-lg font-medium text-muted-foreground">ج.م</span></p>
            </div>
            <div className="group relative overflow-hidden rounded-2xl p-6 bg-card border-2 hover:border-green-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/10">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-sm text-muted-foreground">حصة المعلم من الحصة</p>
              </div>
              <p className="text-3xl font-bold text-green-600">{teacherShare} <span className="text-lg font-medium text-muted-foreground">ج.م</span></p>
            </div>
            <div className="group relative overflow-hidden rounded-2xl p-6 bg-card border-2 hover:border-orange-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <ArrowRightLeft className="w-4 h-4 text-orange-500" />
                </div>
                <p className="text-sm text-muted-foreground">عمولة المنصة من الحصة</p>
              </div>
              <p className="text-3xl font-bold text-orange-500">{platformFeeAmount} <span className="text-lg font-medium text-muted-foreground">ج.م</span></p>
            </div>
            <div className="group relative overflow-hidden rounded-2xl p-6 bg-card border-2 hover:border-indigo-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                </div>
                <p className="text-sm text-muted-foreground">إيراد المجموعة الكاملة</p>
              </div>
              <p className="text-3xl font-bold text-indigo-600">{fullGroupRevenue.toLocaleString("ar-EG")} <span className="text-lg font-medium text-muted-foreground">ج.م</span></p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-500/10 via-card to-orange-500/10 border-2 p-6 md:p-8">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-orange-500 to-green-500" />
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="w-4 h-4 text-green-600" />
                  <span>صافي أرباح المعلم للمجموعة الكاملة ({settings.maxStudentsPerGroup} طالب)</span>
                </div>
                <p className="text-4xl font-bold text-green-600">{teacherGroupEarnings.toLocaleString("ar-EG")} <span className="text-xl text-muted-foreground">ج.م</span></p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BarChart3 className="w-4 h-4 text-orange-500" />
                  <span>إجمالي عمولة المنصة</span>
                </div>
                <p className="text-4xl font-bold text-orange-500">{(platformFeeAmount * settings.maxStudentsPerGroup).toLocaleString("ar-EG")} <span className="text-xl text-muted-foreground">ج.م</span></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Social Tab */}
      {activeTab === "social" && (
        <Card className="overflow-hidden border-2">
          <div className="h-1 w-full bg-gradient-to-r from-primary via-accent to-secondary" />
          <CardHeader className="pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg shadow-primary/30">
                  <Globe className="w-7 h-7" />
                </div>
                <div>
                  <CardTitle className="text-xl">روابط السوشيال ميديا</CardTitle>
                  <CardDescription className="text-base mt-1">أضف روابط المنصات التي ستستخدمها في التسويق والترويج</CardDescription>
                </div>
              </div>
              <Button onClick={handleSaveSocial} disabled={savingSocial} className="gap-2 bg-green-600 hover:bg-green-700 h-12 px-6">
                {savingSocial ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : socialSaved ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {socialSaved ? "تم الحفظ" : "حفظ الروابط"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {socialPlatforms.map((platform, idx) => {
                const colors = colorMap[platform.color];
                return (
                  <div
                    key={platform.key}
                    className="group relative flex items-center gap-4 p-5 rounded-2xl border-2 bg-gradient-to-br from-background to-muted/10 hover:shadow-lg transition-all duration-300"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className={`w-12 h-12 rounded-xl ${colors.light} flex items-center justify-center ${colors.text} shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                      {platform.icon}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <Label htmlFor={platform.key} className="text-sm font-semibold block">{platform.label}</Label>
                      <Input
                        id={platform.key}
                        type="url"
                        dir="ltr"
                        placeholder={platform.placeholder}
                        value={settings.socialLinks[platform.key]}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            socialLinks: { ...prev.socialLinks, [platform.key]: e.target.value },
                          }))
                        }
                        className="h-10 bg-background/80 border-2 focus:border-primary/30 transition-colors"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
          <div className="px-6 pb-6">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border-2 border-dashed">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="w-4 h-4" />
                <span>
                  تم إضافة <span className="font-bold text-foreground">{activeSocialCount}</span> من أصل <span className="font-bold text-foreground">8</span> روابط
                </span>
              </div>
              <div className="flex items-center gap-2">
                {settings.socialLinks.facebook && (
                  <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-lg shadow-blue-500/30">f</span>
                )}
                {settings.socialLinks.twitter && (
                  <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-xs font-bold shadow-lg shadow-black/30">X</span>
                )}
                {settings.socialLinks.instagram && (
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-500 text-white flex items-center justify-center text-[10px] font-bold shadow-lg shadow-pink-500/30">IG</span>
                )}
                {settings.socialLinks.youtube && (
                  <span className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center text-[10px] font-bold shadow-lg shadow-red-500/30">YT</span>
                )}
                {settings.socialLinks.tiktok && (
                  <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-[10px] font-bold shadow-lg shadow-black/30">TT</span>
                )}
                {settings.socialLinks.linkedin && (
                  <span className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center text-[10px] font-bold shadow-lg shadow-blue-700/30">in</span>
                )}
                {settings.socialLinks.whatsapp && (
                  <span className="w-8 h-8 rounded-lg bg-green-500 text-white flex items-center justify-center text-xs font-bold shadow-lg shadow-green-500/30">W</span>
                )}
                {settings.socialLinks.snapchat && (
                  <span className="w-8 h-8 rounded-lg bg-yellow-400 text-black flex items-center justify-center text-xs font-bold shadow-lg shadow-yellow-500/30">S</span>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Info Note */}
      <div className="flex items-start gap-4 p-5 bg-muted/50 rounded-2xl border-2 border-dashed hover:border-primary/30 transition-colors duration-300">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Info className="w-5 h-5 text-primary" />
        </div>
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1 text-base">ملاحظة هامة</p>
          <p>
            هذه القيم هي الإعدادات الافتراضية التي ستظهر تلقائياً عند إنشاء المعلم لمجموعة جديدة.
            يمكن للمعلم تعديل هذه القيم لكل مجموعة على حدة أثناء الإنشاء.
          </p>
        </div>
      </div>
    </div>
  );
}
