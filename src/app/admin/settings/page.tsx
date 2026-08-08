"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import api from "@/lib/api";
import { iconChip, iconColor } from "@/lib/icon-styles";
import {
  DollarSign,
  Users,
  Percent,
  Loader2,
  Save,
  Info,
  Share2,
  CheckCircle,
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
          <h2 className="text-2xl md:text-3xl font-bold">إعدادات المنصة</h2>
          <p className="text-base text-muted-foreground mt-1">
            تحديد الأسعار الافتراضية وسعة المجموعات للمعلمين
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          حفظ الإعدادات
        </Button>
      </div>

      {/* Settings Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Price per Lecture */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${iconChip.money} flex items-center justify-center`}>
                <DollarSign className={`w-5 h-5 ${iconColor.money}`} />
              </div>
              <div>
                <CardTitle className="text-base">سعر الحصة الافتراضي</CardTitle>
                <CardDescription>لكل طالب في المجموعة</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="price">السعر (ج.م)</Label>
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
                className="text-lg font-bold"
              />
            </div>
          </CardContent>
        </Card>

        {/* Max Students */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${iconChip.people} flex items-center justify-center`}>
                <Users className={`w-5 h-5 ${iconColor.people}`} />
              </div>
              <div>
                <CardTitle className="text-base">سعة المجموعة</CardTitle>
                <CardDescription>أقصى عدد طلاب لكل مجموعة</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="maxStudents">عدد الطلاب</Label>
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
                className="text-lg font-bold"
              />
            </div>
          </CardContent>
        </Card>

        {/* Platform Fee */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${iconChip.alert} flex items-center justify-center`}>
                <Percent className={`w-5 h-5 ${iconColor.alert}`} />
              </div>
              <div>
                <CardTitle className="text-base">عمولة المنصة</CardTitle>
                <CardDescription>نسبة من سعر الحصة</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="fee">النسبة المئوية (%)</Label>
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
                className="text-lg font-bold"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${iconChip.primary} flex items-center justify-center`}>
              <Info className={`w-5 h-5 ${iconColor.primary}`} />
            </div>
            <div>
              <CardTitle className="text-base">معاينة الحسابات</CardTitle>
              <CardDescription>كيف يتم توزيع الأرباح بناءً على الإعدادات الحالية</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-background rounded-lg p-4 border">
              <p className="text-sm text-muted-foreground mb-1">سعر الحصة للطالب</p>
              <p className="text-2xl font-bold text-primary">{settings.defaultPricePerLecture} ج.م</p>
            </div>
            <div className="bg-background rounded-lg p-4 border">
              <p className="text-sm text-muted-foreground mb-1">حصة المعلم من الحصة</p>
              <p className="text-2xl font-bold text-green-600">{teacherShare} ج.م</p>
            </div>
            <div className="bg-background rounded-lg p-4 border">
              <p className="text-sm text-muted-foreground mb-1">عمولة المنصة من الحصة</p>
              <p className="text-2xl font-bold text-orange-500">{platformFeeAmount} ج.م</p>
            </div>
            <div className="bg-background rounded-lg p-4 border">
              <p className="text-sm text-muted-foreground mb-1">إيراد المجموعة الكاملة</p>
              <p className="text-2xl font-bold text-indigo-600">{fullGroupRevenue.toLocaleString("ar-EG")} ج.م</p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-background rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">صافي أرباح المعلم للمجموعة الكاملة ({settings.maxStudentsPerGroup} طالب)</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{teacherGroupEarnings.toLocaleString("ar-EG")} ج.م</p>
              </div>
              <div className="text-left">
                <p className="text-sm text-muted-foreground">إجمالي عمولة المنصة</p>
                <p className="text-3xl font-bold text-orange-500 mt-1">{(platformFeeAmount * settings.maxStudentsPerGroup).toLocaleString("ar-EG")} ج.م</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Media Links */}
      <Card className="border-2 border-primary/10 shadow-lg shadow-primary/5">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl ${iconChip.people} flex items-center justify-center shadow-md`}>
                <Share2 className={`w-7 h-7 ${iconColor.people}`} />
              </div>
              <div>
                <CardTitle className="text-xl">روابط السوشيال ميديا</CardTitle>
                <CardDescription className="text-base mt-1">أضف روابط المنصات التي ستستخدمها في التسويق والترويج</CardDescription>
              </div>
            </div>
            <Button onClick={handleSaveSocial} disabled={savingSocial} className="gap-2 bg-green-600 hover:bg-green-700">
              {savingSocial ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : socialSaved ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {socialSaved ? "تم الحفظ" : "حفظ الروابط"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            {/* Facebook */}
            <div className="group flex items-center gap-4 p-4 rounded-xl border-2 border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/40 transition-all duration-200">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <Label htmlFor="facebook" className="text-base font-semibold mb-1 block">فيسبوك</Label>
                <Input
                  id="facebook"
                  type="url"
                  dir="ltr"
                  placeholder="https://facebook.com/yourpage"
                  value={settings.socialLinks.facebook}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, facebook: e.target.value },
                    }))
                  }
                  className="h-11 bg-background"
                />
              </div>
            </div>
            {/* Twitter / X */}
            <div className="group flex items-center gap-4 p-4 rounded-xl border-2 border-slate-500/20 bg-slate-500/5 hover:bg-slate-500/10 hover:border-slate-500/40 transition-all duration-200">
              <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center shadow-lg shadow-black/30 shrink-0">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <Label htmlFor="twitter" className="text-base font-semibold mb-1 block">تويتر / X</Label>
                <Input
                  id="twitter"
                  type="url"
                  dir="ltr"
                  placeholder="https://x.com/yourhandle"
                  value={settings.socialLinks.twitter}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, twitter: e.target.value },
                    }))
                  }
                  className="h-11 bg-background"
                />
              </div>
            </div>
            {/* Instagram */}
            <div className="group flex items-center gap-4 p-4 rounded-xl border-2 border-pink-500/20 bg-pink-500/5 hover:bg-pink-500/10 hover:border-pink-500/40 transition-all duration-200">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white flex items-center justify-center shadow-lg shadow-pink-500/30 shrink-0">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <Label htmlFor="instagram" className="text-base font-semibold mb-1 block">إنستغرام</Label>
                <Input
                  id="instagram"
                  type="url"
                  dir="ltr"
                  placeholder="https://instagram.com/yourhandle"
                  value={settings.socialLinks.instagram}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, instagram: e.target.value },
                    }))
                  }
                  className="h-11 bg-background"
                />
              </div>
            </div>
            {/* YouTube */}
            <div className="group flex items-center gap-4 p-4 rounded-xl border-2 border-red-500/20 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/40 transition-all duration-200">
              <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/30 shrink-0">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <Label htmlFor="youtube" className="text-base font-semibold mb-1 block">يوتيوب</Label>
                <Input
                  id="youtube"
                  type="url"
                  dir="ltr"
                  placeholder="https://youtube.com/@yourchannel"
                  value={settings.socialLinks.youtube}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, youtube: e.target.value },
                    }))
                  }
                  className="h-11 bg-background"
                />
              </div>
            </div>
            {/* TikTok */}
            <div className="group flex items-center gap-4 p-4 rounded-xl border-2 border-slate-500/20 bg-slate-500/5 hover:bg-slate-500/10 hover:border-slate-500/40 transition-all duration-200">
              <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center shadow-lg shadow-black/30 shrink-0">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <Label htmlFor="tiktok" className="text-base font-semibold mb-1 block">تيك توك</Label>
                <Input
                  id="tiktok"
                  type="url"
                  dir="ltr"
                  placeholder="https://tiktok.com/@yourhandle"
                  value={settings.socialLinks.tiktok}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, tiktok: e.target.value },
                    }))
                  }
                  className="h-11 bg-background"
                />
              </div>
            </div>
            {/* LinkedIn */}
            <div className="group flex items-center gap-4 p-4 rounded-xl border-2 border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/40 transition-all duration-200">
              <div className="w-12 h-12 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <Label htmlFor="linkedin" className="text-base font-semibold mb-1 block">لينكد إن</Label>
                <Input
                  id="linkedin"
                  type="url"
                  dir="ltr"
                  placeholder="https://linkedin.com/company/yourpage"
                  value={settings.socialLinks.linkedin}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, linkedin: e.target.value },
                    }))
                  }
                  className="h-11 bg-background"
                />
              </div>
            </div>
            {/* WhatsApp */}
            <div className="group flex items-center gap-4 p-4 rounded-xl border-2 border-green-500/20 bg-green-500/5 hover:bg-green-500/10 hover:border-green-500/40 transition-all duration-200">
              <div className="w-12 h-12 rounded-xl bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-500/30 shrink-0">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <Label htmlFor="whatsapp" className="text-base font-semibold mb-1 block">واتساب</Label>
                <Input
                  id="whatsapp"
                  type="url"
                  dir="ltr"
                  placeholder="https://wa.me/201000000000"
                  value={settings.socialLinks.whatsapp}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, whatsapp: e.target.value },
                    }))
                  }
                  className="h-11 bg-background"
                />
              </div>
            </div>
            {/* Snapchat */}
            <div className="group flex items-center gap-4 p-4 rounded-xl border-2 border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/10 hover:border-yellow-500/40 transition-all duration-200">
              <div className="w-12 h-12 rounded-xl bg-yellow-400 text-black flex items-center justify-center shadow-lg shadow-yellow-500/30 shrink-0">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12.959-.289.175-.098.35-.158.535-.158.218 0 .42.089.6.256.323.3.29.705.22.958-.09.31-.27.585-.45.72-.12.09-.27.18-.42.24-.21.09-.45.15-.66.18-.09.016-.18.03-.27.03-.15.015-.27.03-.36.06-.12.03-.21.09-.27.15-.12.12-.21.3-.27.51-.09.3-.12.66-.15 1.02-.06.66-.12 1.41-.3 2.07-.21.78-.57 1.47-1.05 2.07-.66.84-1.59 1.47-2.7 1.83-.48.15-.99.27-1.5.36-.51.09-1.05.15-1.56.18-.06 0-.12.015-.18.015-.12.015-.24.015-.33.03-.09.015-.15.03-.21.045-.06.015-.09.045-.12.075-.03.03-.06.06-.06.12 0 .06.03.12.06.15.03.03.09.06.15.075.06.015.12.015.18.015h.06c.12 0 .24 0 .36.015.12.015.24.03.33.06.09.03.15.06.21.12.06.06.09.12.09.21 0 .09-.03.15-.09.21-.06.06-.12.09-.21.12-.09.03-.21.045-.33.06-.12.015-.24.015-.36.015h-.06c-.06 0-.12 0-.18.015-.06.015-.12.03-.15.075-.03.045-.06.09-.06.15s.03.12.06.15c.03.03.09.06.15.075 1.56.3 3.18.18 4.65-.36 1.2-.45 2.25-1.17 3.06-2.13.6-.72 1.05-1.56 1.32-2.46.21-.72.3-1.47.33-2.22.03-.66.03-1.32.06-1.95.03-.6.09-1.17.21-1.71.06-.27.15-.51.27-.72.12-.21.27-.39.45-.51.18-.12.39-.18.6-.18.09 0 .18.015.27.03.09.015.18.045.27.075.18.06.36.15.51.24.15.09.27.21.36.36.09.15.12.33.09.51-.03.18-.12.33-.24.45-.12.12-.27.21-.42.27-.15.06-.33.09-.51.09-.12 0-.24-.015-.36-.045-.12-.03-.24-.075-.33-.15-.09-.075-.15-.18-.15-.3 0-.06.015-.12.045-.18.03-.06.06-.12.09-.15.03-.03.06-.06.09-.09.03-.03.06-.045.09-.06.03-.015.06-.03.09-.045h-.03z"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <Label htmlFor="snapchat" className="text-base font-semibold mb-1 block">سناب شات</Label>
                <Input
                  id="snapchat"
                  type="url"
                  dir="ltr"
                  placeholder="https://snapchat.com/add/yourhandle"
                  value={settings.socialLinks.snapchat}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, snapchat: e.target.value },
                    }))
                  }
                  className="h-11 bg-background"
                />
              </div>
            </div>
          </div>
        </CardContent>
        <div className="px-6 pb-5">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Share2 className="w-4 h-4" />
              <span>
                تم إضافة <span className="font-bold text-foreground">{Object.values(settings.socialLinks).filter(Boolean).length}</span> من أصل <span className="font-bold text-foreground">8</span> روابط
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {settings.socialLinks.facebook && (
                <span className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center text-xs font-bold">f</span>
              )}
              {settings.socialLinks.twitter && (
                <span className="w-6 h-6 rounded-md bg-black text-white flex items-center justify-center text-xs font-bold">X</span>
              )}
              {settings.socialLinks.instagram && (
                <span className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-600 to-pink-500 text-white flex items-center justify-center text-[10px] font-bold">IG</span>
              )}
              {settings.socialLinks.youtube && (
                <span className="w-6 h-6 rounded-md bg-red-600 text-white flex items-center justify-center text-[10px] font-bold">YT</span>
              )}
              {settings.socialLinks.tiktok && (
                <span className="w-6 h-6 rounded-md bg-black text-white flex items-center justify-center text-[10px] font-bold">TT</span>
              )}
              {settings.socialLinks.linkedin && (
                <span className="w-6 h-6 rounded-md bg-blue-700 text-white flex items-center justify-center text-[10px] font-bold">in</span>
              )}
              {settings.socialLinks.whatsapp && (
                <span className="w-6 h-6 rounded-md bg-green-500 text-white flex items-center justify-center text-xs font-bold">W</span>
              )}
              {settings.socialLinks.snapchat && (
                <span className="w-6 h-6 rounded-md bg-yellow-400 text-black flex items-center justify-center text-xs font-bold">S</span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Info Note */}
      <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
        <Info className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">ملاحظة هامة</p>
          <p>
            هذه القيم هي الإعدادات الافتراضية التي ستظهر تلقائياً عند إنشاء المعلم لمجموعة جديدة.
            يمكن للمعلم تعديل هذه القيم لكل مجموعة على حدة أثناء الإنشاء.
          </p>
        </div>
      </div>
    </div>
  );
}
