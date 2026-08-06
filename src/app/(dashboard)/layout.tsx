"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { APP_NAME, ROLES } from "@/lib/constants";
import { getInitials } from "@/lib/utils";
import { LogOut, User, Settings, Menu } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, fetchUser, signOut } = useAuth();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getNavLinks = () => {
    switch (user.role) {
      case ROLES.TEACHER:
        return [
          { href: "/dashboard", label: "لوحة التحكم" },
          { href: "/dashboard/groups", label: "المجموعات" },
          { href: "/dashboard/sessions", label: "الجلسات" },
          { href: "/dashboard/students", label: "الطلاب" },
        ];
      case ROLES.STUDENT:
        return [
          { href: "/dashboard", label: "لوحة التحكم" },
          { href: "/dashboard/schedule", label: "الجدول" },
          { href: "/dashboard/recordings", label: "التسجيلات" },
        ];
      case ROLES.PARENT:
        return [
          { href: "/dashboard", label: "لوحة التحكم" },
          { href: "/dashboard/children", label: "أبنائي" },
          { href: "/dashboard/reports", label: "التقارير" },
        ];
      default:
        return [{ href: "/dashboard", label: "لوحة التحكم" }];
    }
  };

  const navLinks = getNavLinks();

  return (
    <div className="flex min-h-screen flex-col" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="ml-4 hidden md:flex">
            <Link className="ml-6 flex items-center space-x-2 space-x-reverse" href="/dashboard">
              <span className="hidden font-bold sm:inline-block text-primary">
                {APP_NAME}
              </span>
            </Link>
            <nav className="flex items-center space-x-6 space-x-reverse text-sm font-medium">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 space-x-reverse md:justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
                  <User className="ml-2 h-4 w-4" />
                  <span>الملف الشخصي</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                  <Settings className="ml-2 h-4 w-4" />
                  <span>الإعدادات</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="ml-2 h-4 w-4" />
                  <span>تسجيل الخروج</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container py-6">{children}</div>
      </main>
    </div>
  );
}