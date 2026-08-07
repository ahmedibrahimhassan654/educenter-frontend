"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  BookOpen,
  User,
  Phone,
  Loader2,
  Calendar,
  BarChart3,
  Trophy,
  Shield,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import api from "@/lib/api";

const benefits = [
  { icon: BookOpen, text: "مجموعات صغيرة حتى ٢٠ طالب" },
  { icon: Calendar, text: "جدول حصص واضح ومنظم" },
  { icon: BarChart3, text: "تابع تقدمك خطوة بخطوة" },
  { icon: Shield, text: "بيئة تعليمية آمنة" },
];

const steps = [
  { step: 1, title: "إنشاء الحساب", description: "أدخل بياناتك الأساسية" },
  { step: 2, title: "استكشف المجموعات", description: "اختر المادة والمعلم" },
  { step: 3, title: "ابدأ التعلم", description: "احضر حصصك الأولى" },
];

export default function StudentRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error("الاسم مطلوب");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("البريد الإلكتروني مطلوب");
      return;
    }
    if (!formData.phone.trim()) {
      toast.error("رقم الهاتف مطلوب");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("كلمة المرور يجب أن تكون ٦ أحرف على الأقل");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("كلمات المرور غير متطابقة");
      return;
    }
    if (!agreed) {
      toast.error("يجب الموافقة على الشروط والأحكام");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      // Register with Supabase
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            phone: formData.phone,
            role: "STUDENT",
          },
        },
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          toast.error("البريد الإلكتروني مسجل بالفعل");
        } else {
          toast.error(authError.message || "حدث خطأ أثناء التسجيل");
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        // Create user profile in MongoDB
        try {
          // Email is resolved server-side from Supabase, not sent by the client
          await api.post("/auth/register", {
            supabaseId: data.user.id,
            name: formData.name,
            phone: formData.phone,
            role: "STUDENT",
          });

          toast.success("تم إنشاء الحساب بنجاح!", {
            description: "مرحباً بك في إديو سنتر. يمكنك الآن تسجيل الدخول.",
            duration: 5000,
          });

          setTimeout(() => {
            router.push("/login");
          }, 2000);
        } catch {
          toast.success("تم إنشاء الحساب بنجاح! يرجى تسجيل الدخول.");
          router.push("/login");
        }
      }
    } catch {
      toast.error("حدث خطأ غير متوقع. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-12 lg:p-16">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-3 mb-8">
              <Image src="/logo.png" alt="إديو سنتر" width={48} height={48} />
              <span className="text-2xl font-bold text-primary">إديو سنتر</span>
            </Link>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-sm font-medium mb-4">
              <BookOpen className="w-4 h-4" />
              <span>تسجيل كطالب</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              ابدأ رحلة التعلم
            </h1>
            <p className="text-lg text-muted-foreground">
              انضم إلى آلاف الطلاب وتعلّم مع أفضل المعلمين
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleRegister} className="space-y-5">
            {/* Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-base font-medium text-foreground">
                الاسم الكامل
              </label>
              <div className="relative">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <User className="w-5 h-5" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="مثال: أحمد محمد"
                  required
                  className="w-full pr-12 pl-4 py-3.5 bg-muted/50 border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-base font-medium text-foreground">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  required
                  dir="ltr"
                  className="w-full pr-12 pl-4 py-3.5 bg-muted/50 border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground/50 text-left"
                />
              </div>
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-base font-medium text-foreground">
                رقم الهاتف
              </label>
              <div className="relative">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Phone className="w-5 h-5" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+20 1XX XXX XXXX"
                  required
                  dir="ltr"
                  className="w-full pr-12 pl-4 py-3.5 bg-muted/50 border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground/50 text-left"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-base font-medium text-foreground">
                كلمة المرور
              </label>
              <div className="relative">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="٦ أحرف على الأقل"
                  required
                  className="w-full pr-12 pl-12 py-3.5 bg-muted/50 border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-base font-medium text-foreground">
                تأكيد كلمة المرور
              </label>
              <div className="relative">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="أعد إدخال كلمة المرور"
                  required
                  className="w-full pr-12 pl-12 py-3.5 bg-muted/50 border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground/50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start gap-3">
              <input
                id="terms"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded border-muted-foreground/30 text-primary focus:ring-primary"
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer leading-relaxed">
                أوافق على{" "}
                <Link href="/terms" className="text-primary hover:underline">الشروط والأحكام</Link>
                {" "}و{" "}
                <Link href="/privacy" className="text-primary hover:underline">سياسة الخصوصية</Link>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-primary-foreground rounded-xl text-lg font-bold hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري إنشاء الحساب...
                </>
              ) : (
                <>
                  إنشاء حساب طالب
                  <ArrowLeft className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Other Roles */}
          <div className="mt-6 flex justify-center">
            <Link
              href="/register/teacher"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-primary text-primary rounded-lg text-sm font-medium hover:bg-primary/10 transition-colors"
            >
              تسجيل كمعلم
            </Link>
          </div>

          {/* Login Link */}
          <p className="text-center text-base text-muted-foreground mt-6">
            لديك حساب بالفعل؟{" "}
            <Link href="/login" className="text-primary font-bold hover:underline">
              سجّل دخولك
            </Link>
          </p>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            بتسجيلك، أنت توافق على{" "}
            <Link href="/terms" className="hover:underline">الشروط والأحكام</Link>
            {" "}و{" "}
            <Link href="/privacy" className="hover:underline">سياسة الخصوصية</Link>
          </p>
        </div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-cyan-600 via-cyan-500 to-violet-500 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-white/5 rounded-full" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center p-16 text-white">
          <div className="max-w-md text-center">
            {/* Icon */}
            <div className="w-24 h-24 mx-auto mb-8 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center">
              <Trophy className="w-12 h-12 text-white" />
            </div>

            <h2 className="text-3xl font-bold mb-4">
              تعلّم بطريقة أفضل
            </h2>
            <p className="text-lg text-white/80 mb-10 leading-relaxed">
              انضم إلى أكثر من ٢٬٥٠٠ طالب يدرسون مع معلمين معتمدين في مجموعات صغيرة
            </p>

            {/* Benefits */}
            <div className="space-y-4 mb-10">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl"
                >
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-5 h-5" />
                  </div>
                  <span className="text-base font-medium">{benefit.text}</span>
                </div>
              ))}
            </div>

            {/* Steps */}
            <div className="space-y-3">
              {steps.map((item) => (
                <div key={item.step} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                    {item.step}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-white/70">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-10">
              <div className="text-center">
                <p className="text-3xl font-bold">+٢٬٥٠٠</p>
                <p className="text-sm text-white/70">طالب نشط</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">+١٥٠</p>
                <p className="text-sm text-white/70">معلم معتمد</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">٤.٨</p>
                <p className="text-sm text-white/70">تقييم المنصة</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
