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
  GraduationCap,
  BookOpen,
  Users,
  Star,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import api from "@/lib/api";

const features = [
  { icon: GraduationCap, text: "أفضل المعلمين المعتمدين" },
  { icon: BookOpen, text: "محتوى تعليمي تفاعلي" },
  { icon: Users, text: "مجموعات صغيرة حتى ٢٠ طالب" },
  { icon: Star, text: "تقييم ٤.٨ من المستخدمين" },
];

const roleRedirects: Record<string, string> = {
  ADMIN: "/admin",
  TEACHER: "/teacher",
  STUDENT: "/student",
  PARENT: "/parent",
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
        setLoading(false);
        return;
      }

      if (data.user) {
        // Fetch user profile from MongoDB to get role
        try {
          const response = await api.get("/auth/me");
          const userRole = response.data?.role || "STUDENT";
          const redirectPath = roleRedirects[userRole] || "/";

          toast.success("تم تسجيل الدخول بنجاح", {
            description: `مرحباً بعودتك!`,
            duration: 3000,
          });

          // Small delay to show toast before redirect
          setTimeout(() => {
            router.push(redirectPath);
            router.refresh();
          }, 500);
        } catch {
          // If fetching profile fails, redirect to home
          toast.success("تم تسجيل الدخول بنجاح");
          router.push("/");
          router.refresh();
        }
      }
    } catch {
      setError("حدث خطأ أثناء تسجيل الدخول. حاول مرة أخرى.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-12 lg:p-16">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-10">
            <Link href="/" className="inline-flex items-center gap-3 mb-8">
              <Image src="/logo.png" alt="إديو سنتر" width={48} height={48} />
              <span className="text-2xl font-bold text-primary">إديو سنتر</span>
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              مرحباً بعودتك 👋
            </h1>
            <p className="text-lg text-muted-foreground">
              سجّل دخولك لمتابعة رحلتك التعليمية
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-base text-center animate-shake">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
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
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  required
                  className="w-full pr-12 pl-4 py-4 bg-muted/50 border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-base font-medium text-foreground">
                  كلمة المرور
                </label>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  نسيت كلمة المرور؟
                </Link>
              </div>
              <div className="relative">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pr-12 pl-12 py-4 bg-muted/50 border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-3">
              <input
                id="remember"
                type="checkbox"
                className="w-5 h-5 rounded border-muted-foreground/30 text-primary focus:ring-primary"
              />
              <label htmlFor="remember" className="text-base text-muted-foreground cursor-pointer">
                تذكرني
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
                  جاري تسجيل الدخول...
                </>
              ) : (
                <>
                  تسجيل الدخول
                  <ArrowLeft className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-sm text-muted-foreground">أو</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Register Links */}
          <div className="space-y-3">
            <p className="text-center text-base text-muted-foreground">
              ليس لديك حساب؟
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/register/teacher"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-primary text-primary rounded-lg text-base font-medium hover:bg-primary/10 transition-colors"
              >
                <GraduationCap className="w-4 h-4" />
                تسجيل كمعلم
              </Link>
              <Link
                href="/register/student"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-primary text-primary rounded-lg text-base font-medium hover:bg-primary/10 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                تسجيل كطالب
              </Link>
              <Link
                href="/register/parent"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-primary text-primary rounded-lg text-base font-medium hover:bg-primary/10 transition-colors"
              >
                <Users className="w-4 h-4" />
                تسجيل كولي أمر
              </Link>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-8">
            بتسجيل دخولك، أنت توافق على{" "}
            <Link href="/terms" className="hover:underline">الشروط والأحكام</Link>
            {" "}و{" "}
            <Link href="/privacy" className="hover:underline">سياسة الخصوصية</Link>
          </p>
        </div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary via-primary/90 to-primary/80 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-white/5 rounded-full" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center p-16 text-white">
          <div className="max-w-md text-center">
            {/* Icon */}
            <div className="w-24 h-24 mx-auto mb-8 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center animate-float">
              <GraduationCap className="w-12 h-12 text-white" />
            </div>

            <h2 className="text-3xl font-bold mb-4">
              ابدأ رحلة التعلم
            </h2>
            <p className="text-lg text-white/80 mb-10 leading-relaxed">
              انضم إلى آلاف الطلاب والمعلمين في أكبر منصة تعليمية في مصر
            </p>

            {/* Features */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <span className="text-base font-medium">{feature.text}</span>
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
                <p className="text-sm text-white/70">تقييم المستخدمين</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
