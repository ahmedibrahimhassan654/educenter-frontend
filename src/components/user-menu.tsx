"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import {
  User,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const roleLabels: Record<string, string> = {
  ADMIN: "مدير",
  TEACHER: "معلم",
  STUDENT: "طالب",
  PARENT: "ولي أمر",
};

const roleDashboards: Record<string, string> = {
  ADMIN: "/admin",
  TEACHER: "/teacher",
  STUDENT: "/student",
  PARENT: "/parent",
};

export default function UserMenu() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setIsOpen(false);

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

  if (isLoading) {
    return (
      <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-base font-medium hover:bg-primary/90 transition-colors"
        >
          تسجيل الدخول
        </Link>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-colors"
      >
        {(user as any).avatarUrl ? (
          <img
            src={(user as any).avatarUrl}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-base font-bold text-primary">
              {user.name.charAt(0)}
            </span>
          </div>
        )}
        <div className="hidden md:block text-right">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-muted-foreground">{roleLabels[user.role]}</p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-64 bg-background border rounded-xl shadow-lg overflow-hidden animate-scale-in z-50">
          {/* User Info */}
          <div className="p-4 border-b bg-muted/30">
            <p className="font-bold">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
              {roleLabels[user.role]}
            </span>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            <Link
              href={roleDashboards[user.role] || "/"}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
            >
              <LayoutDashboard className="w-5 h-5 text-muted-foreground" />
              <span className="text-base">لوحة التحكم</span>
            </Link>
            <Link
              href={`/${user.role.toLowerCase()}/profile`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
            >
              <User className="w-5 h-5 text-muted-foreground" />
              <span className="text-base">الملف الشخصي</span>
            </Link>
          </div>

          {/* Logout */}
          <div className="p-2 border-t">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors w-full"
            >
              {isLoggingOut ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <LogOut className="w-5 h-5" />
              )}
              <span className="text-base">
                {isLoggingOut ? "جاري تسجيل الخروج..." : "تسجيل الخروج"}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
