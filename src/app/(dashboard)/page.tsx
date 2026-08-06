"use client";

import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROLES } from "@/lib/constants";
import { Users, Calendar, Video, BarChart3, BookOpen } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const getRoleSpecificContent = () => {
    switch (user.role) {
      case ROLES.TEACHER:
        return (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  إجمالي المجموعات
                </CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">0</div>
                <p className="text-xs text-muted-foreground">
                  أنشئ مجموعتك الأولى
                </p>
              </CardContent>
            </Card>
            <Card className="border-secondary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  إجمالي الطلاب
                </CardTitle>
                <Users className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-secondary">0</div>
                <p className="text-xs text-muted-foreground">
                  أضف طلاب لمجموعاتك
                </p>
              </CardContent>
            </Card>
            <Card className="border-accent/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  الجلسات القادمة
                </CardTitle>
                <Calendar className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">0</div>
                <p className="text-xs text-muted-foreground">
                  جدول جلستك الأولى
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  الاشتراك
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {user.subscriptionStatus ? "نشط" : "غير نشط"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {user.subscriptionStatus
                    ? "اشتراكك نشط"
                    : "اشترك لفتح المميزات"}
                </p>
              </CardContent>
            </Card>
          </div>
        );
      case ROLES.STUDENT:
        return (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  الجلسات القادمة
                </CardTitle>
                <Calendar className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">0</div>
                <p className="text-xs text-muted-foreground">
                  لا توجد جلسات قادمة
                </p>
              </CardContent>
            </Card>
            <Card className="border-secondary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  التسجيلات المتاحة
                </CardTitle>
                <Video className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-secondary">0</div>
                <p className="text-xs text-muted-foreground">
                  شاهد الجلسات المسجلة
                </p>
              </CardContent>
            </Card>
            <Card className="border-accent/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  نسبة الحضور
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">--%</div>
                <p className="text-xs text-muted-foreground">
                  لا توجد بيانات حضور بعد
                </p>
              </CardContent>
            </Card>
          </div>
        );
      case ROLES.PARENT:
        return (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  الأبناء
                </CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">0</div>
                <p className="text-xs text-muted-foreground">
                  اربط حسابات أبنائك
                </p>
              </CardContent>
            </Card>
            <Card className="border-secondary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  تقارير الحضور
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-secondary">--</div>
                <p className="text-xs text-muted-foreground">
                  لا توجد تقارير متاحة بعد
                </p>
              </CardContent>
            </Card>
            <Card className="border-accent/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  نظرة عامة على التقدم
                </CardTitle>
                <BookOpen className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">--</div>
                <p className="text-xs text-muted-foreground">
                  اربط أبنائك لرؤية التقدم
                </p>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>مرحباً بك في {APP_NAME}</CardTitle>
              <CardDescription>لوحة التحكم جاهزة</CardDescription>
            </CardHeader>
            <CardContent>
              <p>ابدأ باستكشاف المميزات المتاحة لدورك.</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          مرحباً بعودتك، {user.name}
        </h2>
        <p className="text-muted-foreground">
          إليك نظرة عامة على حسابك
        </p>
      </div>
      {getRoleSpecificContent()}
    </div>
  );
}