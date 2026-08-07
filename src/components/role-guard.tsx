"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import DashboardLayout from "@/components/dashboard-layout";

export const roleDashboards: Record<string, string> = {
  ADMIN: "/admin",
  TEACHER: "/teacher",
  STUDENT: "/student",
  PARENT: "/parent",
};

function GuardSkeleton() {
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

export default function RoleGuard({
  role,
  children,
}: {
  role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const isAllowed = !!user && user.role === role;

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role !== role) {
      router.replace(roleDashboards[user.role] || "/");
    }
  }, [isLoading, user, role, router]);

  if (isLoading || !isAllowed) {
    return <GuardSkeleton />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
