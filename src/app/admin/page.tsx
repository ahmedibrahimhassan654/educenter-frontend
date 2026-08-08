"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import api from "@/lib/api";
import { iconChip, iconColor } from "@/lib/icon-styles";
import {
  Users,
  GraduationCap,
  BookOpen,
  ArrowLeft,
  Loader2,
  UserCircle,
  Bell,
  Settings,
} from "lucide-react";

interface UserStats {
  total: number;
  teachers: number;
  students: number;
  parents: number;
  admins: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, statsRes] = await Promise.all([
          api.get("/users?limit=5&sort=-createdAt"),
          api.get("/users/stats"),
        ]);
        setUsers(usersRes.data.data || []);
        setUserStats(statsRes.data.data || null);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const displayName = user?.name?.split(" ")[0] || "المدير";

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      ADMIN: "مدير",
      TEACHER: "معلم",
      STUDENT: "طالب",
      PARENT: "ولي أمر",
    };
    return labels[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      ADMIN: "bg-red-500/10 text-red-500",
      TEACHER: "bg-blue-500/10 text-blue-500",
      STUDENT: "bg-green-500/10 text-green-500",
      PARENT: "bg-purple-500/10 text-purple-500",
    };
    return colors[role] || "bg-gray-500/10 text-gray-500";
  };

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            مرحباً، {displayName} 👋
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            إليك ملخص المنصة اليوم.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg text-base font-medium hover:bg-primary/90 transition-colors"
            >
              إدارة المستخدمين
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card border rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Users className={`w-6 h-6 ${iconColor.people}`} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">إجمالي المستخدمين</p>
            <p className="text-3xl font-bold mb-2">{userStats?.total || 0}</p>
          </div>
          <div className="bg-card border rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <GraduationCap className={`w-6 h-6 ${iconColor.learning}`} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">المعلمين</p>
            <p className="text-3xl font-bold mb-2">{userStats?.teachers || 0}</p>
          </div>
          <div className="bg-card border rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <BookOpen className={`w-6 h-6 ${iconColor.learning}`} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">الطلاب</p>
            <p className="text-3xl font-bold mb-2">{userStats?.students || 0}</p>
          </div>
          <div className="bg-card border rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Users className={`w-6 h-6 ${iconColor.people}`} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">أولياء الأمور</p>
            <p className="text-3xl font-bold mb-2">{userStats?.parents || 0}</p>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="p-6 border-b flex items-center justify-between">
            <h3 className="text-xl font-bold">أحدث المستخدمين</h3>
            <Link href="/admin/users" className="text-base text-primary hover:underline">
              عرض الكل
            </Link>
          </div>
          {users.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">لا يوجد مستخدمين بعد</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">الاسم</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">البريد</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">الدور</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="py-3 px-4">
                        <p className="text-sm font-medium">{u.name}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground">{u.email}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getRoleColor(u.role)}`}>
                          {getRoleLabel(u.role)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground">
                          {new Date(u.createdAt).toLocaleDateString("ar-EG")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-6">
          <Link href="/admin/users" className="bg-card border rounded-xl p-6 hover:shadow-md transition-all hover:-translate-y-1">
            <div className={`w-12 h-12 rounded-xl ${iconChip.people} flex items-center justify-center mb-4`}>
              <Users className={`w-6 h-6 ${iconColor.people}`} />
            </div>
            <h4 className="text-lg font-semibold mb-2">إدارة المستخدمين</h4>
            <p className="text-sm text-muted-foreground">عرض وإدارة جميع المستخدمين</p>
          </Link>
          <Link href="/admin/settings" className="bg-card border rounded-xl p-6 hover:shadow-md transition-all hover:-translate-y-1">
            <div className={`w-12 h-12 rounded-xl ${iconChip.neutral} flex items-center justify-center mb-4`}>
              <Settings className={`w-6 h-6 ${iconColor.neutral}`} />
            </div>
            <h4 className="text-lg font-semibold mb-2">إعدادات المنصة</h4>
            <p className="text-sm text-muted-foreground">الأسعار الافتراضية وسعة المجموعات</p>
          </Link>
          <Link href="/admin/curriculum" className="bg-card border rounded-xl p-6 hover:shadow-md transition-all hover:-translate-y-1">
            <div className={`w-12 h-12 rounded-xl ${iconChip.learning} flex items-center justify-center mb-4`}>
              <BookOpen className={`w-6 h-6 ${iconColor.learning}`} />
            </div>
            <h4 className="text-lg font-semibold mb-2">المنهج الدراسي</h4>
            <p className="text-sm text-muted-foreground">إدارة المراحل والمواد</p>
          </Link>
          <Link href="/admin/profile" className="bg-card border rounded-xl p-6 hover:shadow-md transition-all hover:-translate-y-1">
            <div className={`w-12 h-12 rounded-xl ${iconChip.neutral} flex items-center justify-center mb-4`}>
              <UserCircle className={`w-6 h-6 ${iconColor.neutral}`} />
            </div>
            <h4 className="text-lg font-semibold mb-2">الملف الشخصي</h4>
            <p className="text-sm text-muted-foreground">تعديل بياناتك الشخصية</p>
          </Link>
          <Link href="/notifications" className="bg-card border rounded-xl p-6 hover:shadow-md transition-all hover:-translate-y-1">
            <div className={`w-12 h-12 rounded-xl ${iconChip.alert} flex items-center justify-center mb-4`}>
              <Bell className={`w-6 h-6 ${iconColor.alert}`} />
            </div>
            <h4 className="text-lg font-semibold mb-2">الإشعارات</h4>
            <p className="text-sm text-muted-foreground">عرض جميع الإشعارات</p>
          </Link>
        </div>
      </div>
    </>
  );
}
