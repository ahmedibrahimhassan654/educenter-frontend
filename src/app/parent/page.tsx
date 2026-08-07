"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard-layout";
import { useAuth } from "@/components/auth-provider";
import api from "@/lib/api";
import {
  Wallet,
  Calendar,
  BookOpen,
  ArrowLeft,
  TrendingUp,
  CheckCircle,
  Clock,
  ChevronDown,
  Loader2,
  Users,
} from "lucide-react";

interface Student {
  _id: string;
  name: string;
  grade?: string;
  email: string;
}

interface Group {
  _id: string;
  title: string;
  subject: string;
  grade: string;
  teacherId: { name: string };
  students: string[];
}

export default function ParentDashboard() {
  const { user } = useAuth();
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all groups to find which ones the children are enrolled in
        const groupsRes = await api.get("/groups?explore=true");
        setGroups(groupsRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get children from user object
  const children: Student[] = (user as any)?.students || [];
  
  // Set first child as selected if not set
  useEffect(() => {
    if (children.length > 0 && !selectedChild) {
      setSelectedChild(children[0]._id);
    }
  }, [children, selectedChild]);

  // Get groups for selected child
  const childGroups = groups.filter((g) => 
    selectedChild && g.students?.includes(selectedChild)
  );

  const getTeacherName = (group: Group) => {
    return group.teacherId?.name || "غير محدد";
  };

  if (loading) {
    return (
      <DashboardLayout role="parent">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (children.length === 0) {
    return (
      <DashboardLayout role="parent">
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-rose-500/10 to-amber-500/10 rounded-2xl p-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">مرحباً، {user?.name || "ولي الأمر"} 👋</h2>
            <p className="text-lg text-muted-foreground">متابعة أداء أبنائك والدفعات المالية</p>
          </div>
          
          <div className="text-center py-16 bg-card border rounded-xl">
            <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-bold mb-2">لم تربط أي طالب بعد</h3>
            <p className="text-muted-foreground mb-4">استخدم رمز الربط لربط حساب طفلك بحسابك</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const selectedChildInfo = children.find((c) => c._id === selectedChild);

  return (
    <DashboardLayout role="parent">
      <div className="space-y-8">
        <div className="bg-gradient-to-br from-rose-500/10 to-amber-500/10 rounded-2xl p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">مرحباً، {user?.name || "ولي الأمر"} 👋</h2>
              <p className="text-lg text-muted-foreground">متابعة أداء أبنائك والدفعات المالية</p>
            </div>
            {children.length > 1 && (
              <div className="relative">
                <select
                  value={selectedChild || ""}
                  onChange={(e) => setSelectedChild(e.target.value)}
                  className="appearance-none px-6 py-4 pr-12 bg-background border rounded-xl text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                >
                  {children.map((child) => (
                    <option key={child._id} value={child._id}>{child.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-card border rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الفصول المسجلة</p>
                <p className="text-3xl font-bold">{childGroups.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-card border rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الحالة</p>
                <p className="text-xl font-bold text-green-500">نشط</p>
              </div>
            </div>
          </div>
          <div className="bg-card border rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الطلاب</p>
                <p className="text-3xl font-bold">{children.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Groups Table */}
        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="text-xl font-bold">الفصول المسجلة - {selectedChildInfo?.name}</h3>
          </div>
          {childGroups.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">لم ينضم إلى أي مجموعة بعد</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-right py-4 px-6 text-base font-medium text-muted-foreground">المجموعة</th>
                    <th className="text-right py-4 px-6 text-base font-medium text-muted-foreground">المعلم</th>
                    <th className="text-right py-4 px-6 text-base font-medium text-muted-foreground">الصف</th>
                  </tr>
                </thead>
                <tbody>
                  {childGroups.map((group) => (
                    <tr key={group._id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="py-4 px-6">
                        <div>
                          <p className="text-base font-medium">{group.title}</p>
                          <p className="text-sm text-muted-foreground">{group.subject}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6"><p className="text-base">{getTeacherName(group)}</p></td>
                      <td className="py-4 px-6"><p className="text-base">{group.grade}</p></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/parent/payments" className="bg-card border rounded-xl p-6 hover:shadow-md transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
              <Wallet className="w-6 h-6 text-purple-500" />
            </div>
            <h4 className="text-lg font-semibold mb-2">المدفوعات والفواتير</h4>
            <p className="text-sm text-muted-foreground">عرض ودفع الفواتير المستحقة</p>
          </Link>
          <Link href="/parent/reports" className="bg-card border rounded-xl p-6 hover:shadow-md transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-blue-500" />
            </div>
            <h4 className="text-lg font-semibold mb-2">التقارير والتقييمات</h4>
            <p className="text-sm text-muted-foreground">متابعة تقارير الحضور والملاحظات</p>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
