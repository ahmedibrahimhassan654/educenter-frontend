"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { DynamicThemeToggle } from "@/lib/dynamic-imports";
import { useAuth } from "@/components/auth-provider";
import {
  LayoutDashboard,
  Users,
  Wallet,
  Search,
  BarChart3,
  FileText,
  Bell,
  LogOut,
  Menu,
  X,
  GraduationCap,
  UserCircle,
  School,
  Shield,
  Clock,
  XCircle,
  Sparkles,
  Settings,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { NotificationBell } from "@/components/notification-bell";
import { iconColor, type IconColorToken } from "@/lib/icon-styles";

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ElementType;
  color: IconColorToken;
}

const teacherLinks: SidebarLink[] = [
  { href: "/teacher", label: "لوحة التحكم", icon: LayoutDashboard, color: "primary" },
  { href: "/teacher/ai-tools", label: "الذكاء الاصطناعي", icon: Sparkles, color: "learning" },
  { href: "/teacher/groups", label: "المجموعات", icon: Users, color: "people" },
  { href: "/teacher/earnings", label: "الأرباح", icon: Wallet, color: "money" },
  { href: "/notifications", label: "الإشعارات", icon: Bell, color: "alert" },
  { href: "/teacher/profile", label: "الملف الشخصي", icon: UserCircle, color: "neutral" },
];

// Limited links for unverified teachers
const unverifiedTeacherLinks: SidebarLink[] = [
  { href: "/teacher/verification", label: "تحقق من الحساب", icon: Shield, color: "security" },
  { href: "/teacher/profile", label: "الملف الشخصي", icon: UserCircle, color: "neutral" },
];

const studentLinks: SidebarLink[] = [
  { href: "/student", label: "لوحة التحكم", icon: LayoutDashboard, color: "primary" },
  { href: "/student/ai-study", label: "المعلم الذكي", icon: Sparkles, color: "learning" },
  { href: "/student/explore", label: "استكشف المجموعات", icon: Search, color: "people" },
  { href: "/student/my-progress", label: "تقدمي", icon: BarChart3, color: "progress" },
  { href: "/notifications", label: "الإشعارات", icon: Bell, color: "alert" },
];

const parentLinks: SidebarLink[] = [
  { href: "/parent", label: "لوحة التحكم", icon: LayoutDashboard, color: "primary" },
  { href: "/parent/payments", label: "المدفوعات", icon: Wallet, color: "money" },
  { href: "/parent/reports", label: "التقارير", icon: FileText, color: "document" },
  { href: "/notifications", label: "الإشعارات", icon: Bell, color: "alert" },
];

const adminLinks: SidebarLink[] = [
  { href: "/admin", label: "لوحة التحكم", icon: LayoutDashboard, color: "primary" },
  { href: "/admin/users", label: "المستخدمين", icon: Users, color: "people" },
  { href: "/admin/verifications", label: "طلبات التحقق", icon: Shield, color: "security" },
  { href: "/admin/groups", label: "المجموعات", icon: GraduationCap, color: "learning" },
  { href: "/admin/settings", label: "إعدادات المنصة", icon: Settings, color: "neutral" },
  { href: "/admin/curriculum", label: "المنهاج الدراسي", icon: School, color: "learning" },
  { href: "/notifications", label: "الإشعارات", icon: Bell, color: "alert" },
  { href: "/admin/profile", label: "الملف الشخصي", icon: UserCircle, color: "neutral" },
];

const roleLinks: Record<string, SidebarLink[]> = {
  teacher: teacherLinks,
  student: studentLinks,
  parent: parentLinks,
  admin: adminLinks,
};

const roleLabels: Record<string, string> = {
  teacher: "معلم",
  student: "طالب",
  parent: "ولي أمر",
  admin: "مدير",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Navigation is always derived from the authenticated user, never the route
  const activeRole = (user?.role || "").toLowerCase();

  // Check if teacher needs to complete verification
  const isPendingTeacher =
    user?.role === "TEACHER" && user?.verificationStatus === "PENDING";

  // Check if teacher is awaiting verification
  const isSubmittedTeacher =
    user?.role === "TEACHER" && user?.verificationStatus === "SUBMITTED";

  // Check if teacher is rejected
  const isRejectedTeacher =
    user?.role === "TEACHER" && user?.verificationStatus === "REJECTED";

  // Redirect all non-VERIFIED teachers to verification page
  const isRestrictedTeacher = isPendingTeacher || isSubmittedTeacher || isRejectedTeacher;

  useEffect(() => {
    if (isRestrictedTeacher && pathname !== "/teacher/verification" && pathname !== "/teacher/profile") {
      router.push("/teacher/verification");
    }
  }, [isRestrictedTeacher, pathname, router]);

  const links = isRestrictedTeacher
    ? unverifiedTeacherLinks
    : roleLinks[activeRole] ?? [];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success("تم تسجيل الخروج بنجاح");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("حدث خطأ أثناء تسجيل الخروج");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const displayName = user?.name || "";
  const avatarUrl = user?.avatarUrl;

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-muted/30 flex" dir="rtl">
        <aside className="hidden lg:flex flex-col w-72 min-h-screen bg-background border-l">
          <div className="p-6 border-b">
            <div className="h-10 w-40 rounded bg-muted animate-pulse" />
          </div>
          <div className="flex-1 p-4 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        </aside>
        <main className="flex-1 p-6 md:p-8 lg:p-10">
          <div className="h-8 w-56 rounded bg-muted animate-pulse mb-6" />
          <div className="h-64 rounded-xl bg-muted animate-pulse" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30" dir="rtl">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 bg-background border-b">
        <div className="container flex h-16 items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-muted rounded-lg"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="إديو سنتر" width={32} height={32} />
            <span className="font-bold">إديو سنتر</span>
          </Link>
          <DynamicThemeToggle />
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex flex-col w-72 min-h-screen bg-background border-l sticky top-0 h-screen overflow-y-auto">
          {/* Logo */}
          <div className="p-6 border-b">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/logo.png" alt="إديو سنتر" width={40} height={40} />
              <div>
                <span className="text-lg font-bold">إديو سنتر</span>
                <p className="text-xs text-muted-foreground">{roleLabels[activeRole]}</p>
              </div>
            </Link>
          </div>

          {/* Verification Warning for Teachers */}
          {isPendingTeacher && (
            <div className="p-4 mx-4 mt-4 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-yellow-800 dark:text-yellow-300">
                    حسابك غير محقق
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                    يرجى إكمال عملية التحقق للوصول لجميع الميزات
                  </p>
                  <Link
                    href="/teacher/verification"
                    className="text-xs text-yellow-800 dark:text-yellow-300 font-medium hover:underline mt-2 inline-block"
                  >
                    إكمال التحقق ←
                  </Link>
                </div>
              </div>
            </div>
          )}

          {isSubmittedTeacher && (
            <div className="p-4 mx-4 mt-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-blue-800 dark:text-blue-300">
                    طلبك قيد المراجعة
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                    يمكنك الوصول للوحة التحكم بميزات محدودة حتى يتم الموافقة على طلبك
                  </p>
                </div>
              </div>
            </div>
          )}

          {isRejectedTeacher && (
            <div className="p-4 mx-4 mt-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-red-800 dark:text-red-300">
                    تم رفض طلب التحقق
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                    يرجى مراجعة سبب الرفض وإعادة تقديم الطلب
                  </p>
                  <Link
                    href="/teacher/verification"
                    className="text-xs text-red-800 dark:text-red-300 font-medium hover:underline mt-2 inline-block"
                  >
                    مراجعة الطلب ←
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {/* Active item keeps the primary colour so the state stays obvious */}
                  <link.icon
                    className={`w-5 h-5 shrink-0 ${isActive ? "" : iconColor[link.color]}`}
                  />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={displayName}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground">{roleLabels[activeRole]}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-3 px-4 py-3 mt-2 rounded-lg text-base text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors w-full"
            >
              <LogOut className="w-5 h-5" />
              <span>{isLoggingOut ? "جاري تسجيل الخروج..." : "تسجيل الخروج"}</span>
            </button>
          </div>
        </aside>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="absolute right-0 top-0 w-72 min-h-screen bg-background shadow-xl">
              <div className="p-6 border-b">
                <Link href="/" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
                  <Image src="/logo.png" alt="إديو سنتر" width={40} height={40} />
                  <div>
                    <span className="text-lg font-bold">إديو سنتر</span>
                    <p className="text-xs text-muted-foreground">{roleLabels[activeRole]}</p>
                  </div>
                </Link>
              </div>
              <nav className="p-4 space-y-1">
                {links.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3.5 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <link.icon
                        className={`w-5 h-5 shrink-0 ${isActive ? "" : iconColor[link.color]}`}
                      />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </nav>
              <div className="p-4 border-t">
                <button
                  onClick={() => {
                    setSidebarOpen(false);
                    handleLogout();
                  }}
                  disabled={isLoggingOut}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-base text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors w-full"
                >
                  <LogOut className="w-5 h-5" />
                  <span>{isLoggingOut ? "جاري تسجيل الخروج..." : "تسجيل الخروج"}</span>
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Desktop Header */}
          <header className="hidden lg:flex items-center justify-between bg-background border-b px-8 py-4 sticky top-0 z-30">
            <div>
              <h1 className="text-xl font-bold">
                {links.find((l) => l.href === pathname)?.label || "لوحة التحكم"}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell userId={user?._id || user?.id || ""} />
              <DynamicThemeToggle />
              <Link href={`/${activeRole}/profile`} className="flex items-center gap-2">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={displayName}
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">
                      {displayName.charAt(0)}
                    </span>
                  </div>
                )}
              </Link>
            </div>
          </header>

          {/* Page Content */}
          <div className="p-6 md:p-8 lg:p-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
