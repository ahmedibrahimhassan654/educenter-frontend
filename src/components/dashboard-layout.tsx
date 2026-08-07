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
  Settings,
  BookOpen,
  UserCircle,
  School,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { NotificationBell } from "@/components/notification-bell";

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ElementType;
}

const teacherLinks: SidebarLink[] = [
  { href: "/teacher", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/teacher/groups", label: "المجموعات", icon: Users },
  { href: "/teacher/earnings", label: "الأرباح", icon: Wallet },
  { href: "/notifications", label: "الإشعارات", icon: Bell },
  { href: "/teacher/profile", label: "الملف الشخصي", icon: UserCircle },
];

const studentLinks: SidebarLink[] = [
  { href: "/student", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/student/explore", label: "استكشف المجموعات", icon: Search },
  { href: "/student/my-progress", label: "تقدمي", icon: BarChart3 },
  { href: "/notifications", label: "الإشعارات", icon: Bell },
];

const parentLinks: SidebarLink[] = [
  { href: "/parent", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/parent/payments", label: "المدفوعات", icon: Wallet },
  { href: "/parent/reports", label: "التقارير", icon: FileText },
  { href: "/notifications", label: "الإشعارات", icon: Bell },
];

const adminLinks: SidebarLink[] = [
  { href: "/admin", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/admin/users", label: "المستخدمين", icon: Users },
  { href: "/admin/groups", label: "المجموعات", icon: BookOpen },
  { href: "/admin/curriculum", label: "المنهاج الدراسي", icon: School },
  { href: "/admin/payments", label: "المدفوعات", icon: Wallet },
  { href: "/notifications", label: "الإشعارات", icon: Bell },
  { href: "/admin/profile", label: "الملف الشخصي", icon: UserCircle },
  { href: "/admin/settings", label: "الإعدادات", icon: Settings },
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

const roleNames: Record<string, string> = {
  teacher: "أ. محمد الأحمد",
  student: "أحمد محمد",
  parent: "أم عبدالله",
  admin: "أحمد إبراهيم",
};

export default function DashboardLayout({
  children,
  role,
}: {
  children: React.ReactNode;
  role: "teacher" | "student" | "parent" | "admin";
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const links = roleLinks[role];

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

  const displayName = user?.name || roleNames[role];
  const avatarUrl = (user as any)?.avatarUrl;

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
                <p className="text-xs text-muted-foreground">{roleLabels[role]}</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground">{roleLabels[role]}</p>
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
                    <p className="text-xs text-muted-foreground">{roleLabels[role]}</p>
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
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <link.icon className="w-5 h-5" />
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
              <NotificationBell userId={(user as any)?._id || user?.id || ""} />
              <DynamicThemeToggle />
              <Link href={`/${role}/profile`} className="flex items-center gap-2">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-8 h-8 rounded-full object-cover"
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
