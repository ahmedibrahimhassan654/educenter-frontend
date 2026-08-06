"use client";

import DashboardLayout from "@/components/dashboard-layout";
import {
  Wallet,
  TrendingUp,
  ArrowDownToLine,
  CheckCircle,
  Download,
  CreditCard,
} from "lucide-react";

const monthlyStats = {
  totalRevenue: "٣٢٬٠٠٠ ج.م",
  platformFee: "٤٬٨٠٠ ج.م",
  netEarnings: "٢٧٬٢٠٠ ج.م",
  lastMonth: "٢٣٬٦٠٠ ج.م",
  growth: "+١٥٪",
};

const groupsBreakdown = [
  {
    id: 1,
    name: "الفيزياء - الصف الثاني الثانوي",
    students: 18,
    maxStudents: 20,
    sessions: 6,
    revenue: "٧٬٢٠٠ ج.م",
    fee: "١٬٠٨٠ ج.م",
    net: "٦٬١٢٠ ج.م",
  },
  {
    id: 2,
    name: "الرياضيات - الصف الأول الثانوي",
    students: 20,
    maxStudents: 20,
    sessions: 8,
    revenue: "٨٬٠٠٠ ج.م",
    fee: "١٬٢٠٠ ج.م",
    net: "٦٬٨٠٠ ج.م",
  },
  {
    id: 3,
    name: "الكيمياء - الصف الثالث الثانوي",
    students: 15,
    maxStudents: 20,
    sessions: 5,
    revenue: "٦٬٠٠٠ ج.م",
    fee: "٩٠٠ ج.م",
    net: "٥٬١٠٠ ج.م",
  },
  {
    id: 4,
    name: "العلوم - الصف الثالث الإعدادي",
    students: 19,
    maxStudents: 20,
    sessions: 7,
    revenue: "١٠٬٨٠٠ ج.م",
    fee: "١٬٦٢٠ ج.م",
    net: "٩٬١٨٠ ج.م",
  },
];

const payoutHistory = [
  {
    id: 1,
    date: "٠١ يناير ٢٠٢٥",
    amount: "٢٣٬٦٠٠ ج.م",
    method: "تحويل بنكي",
    status: "completed",
  },
  {
    id: 2,
    date: "٠١ ديسمبر ٢٠٢٤",
    amount: "٢٠٬٤٠٠ ج.م",
    method: "تحويل بنكي",
    status: "completed",
  },
  {
    id: 3,
    date: "٠١ نوفمبر ٢٠٢٤",
    amount: "١٨٬٢٠٠ ج.م",
    method: "فودافون كاش",
    status: "completed",
  },
];

export default function TeacherEarningsPage() {
  return (
    <DashboardLayout role="teacher">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">الأرباح والمدفوعات</h2>
          <p className="text-base text-muted-foreground mt-1">
            متابعة أرباحك وإدارة طلبات السحب
          </p>
        </div>

        {/* Main Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الإيرادات</p>
                <p className="text-3xl font-bold text-green-500">{monthlyStats.totalRevenue}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">هذا الشهر</p>
          </div>

          <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">عمولة المنصة (١٥٪)</p>
                <p className="text-3xl font-bold text-red-500">{monthlyStats.platformFee}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">يتم خصمها تلقائياً</p>
          </div>

          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">صافي الأرباح</p>
                <p className="text-3xl font-bold text-primary">{monthlyStats.netEarnings}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-green-500 font-medium">{monthlyStats.growth}</span>
              <span className="text-sm text-muted-foreground">عن الشهر الماضي</span>
            </div>
          </div>
        </div>

        {/* Payout Button */}
        <div className="bg-card border rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold mb-1">رصيد قابل للسحب</h3>
              <p className="text-3xl font-bold text-primary">٢٧٬٢٠٠ ج.م</p>
              <p className="text-sm text-muted-foreground mt-1">
                آخر سحب: ٠١ يناير ٢٠٢٥
              </p>
            </div>
            <button className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl text-lg font-medium hover:bg-primary/90 transition-colors">
              <ArrowDownToLine className="w-6 h-6" />
              طلب سحب
            </button>
          </div>
        </div>

        {/* Groups Breakdown */}
        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="text-xl font-bold">تفاصيل الأرباح حسب المجموعة</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-right py-4 px-6 text-base font-medium text-muted-foreground">
                    المجموعة
                  </th>
                  <th className="text-right py-4 px-6 text-base font-medium text-muted-foreground">
                    الطلاب
                  </th>
                  <th className="text-right py-4 px-6 text-base font-medium text-muted-foreground">
                    الحصص
                  </th>
                  <th className="text-right py-4 px-6 text-base font-medium text-muted-foreground">
                    الإيراد
                  </th>
                  <th className="text-right py-4 px-6 text-base font-medium text-muted-foreground">
                    العمولة
                  </th>
                  <th className="text-right py-4 px-6 text-base font-medium text-muted-foreground">
                    الصافي
                  </th>
                </tr>
              </thead>
              <tbody>
                {groupsBreakdown.map((group) => (
                  <tr
                    key={group.id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <p className="text-base font-medium">{group.name}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-base">
                        {group.students}/{group.maxStudents}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-base">{group.sessions}/٨</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-base">{group.revenue}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-base text-red-500">{group.fee}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-base font-bold text-green-500">{group.net}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted/50 font-bold">
                  <td className="py-4 px-6 text-base">الإجمالي</td>
                  <td className="py-4 px-6 text-base">٧٢ طالب</td>
                  <td className="py-4 px-6 text-base">٢٦ حصة</td>
                  <td className="py-4 px-6 text-base">{monthlyStats.totalRevenue}</td>
                  <td className="py-4 px-6 text-base text-red-500">{monthlyStats.platformFee}</td>
                  <td className="py-4 px-6 text-base text-green-500">
                    {monthlyStats.netEarnings}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Financial Summary Card */}
        <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border rounded-xl p-8">
          <h3 className="text-xl font-bold mb-6">ملخص الأرباح الشهرية</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">حساب الأرباح</h4>
              <div className="space-y-3 text-base">
                <div className="flex justify-between">
                  <span>عدد المجموعات النشطة</span>
                  <span className="font-bold">٤ مجموعات</span>
                </div>
                <div className="flex justify-between">
                  <span>إجمالي الطلاب</span>
                  <span className="font-bold">٧٢ طالب</span>
                </div>
                <div className="flex justify-between">
                  <span>سعر الحصة للطالب</span>
                  <span className="font-bold">٥٠ ج.م</span>
                </div>
                <div className="flex justify-between">
                  <span>عدد الحصص الشهرية</span>
                  <span className="font-bold">٨ حصص/مجموعة</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">الصيغة الحسابية</h4>
              <div className="bg-background rounded-lg p-4 space-y-2 text-base font-mono">
                <p>إيراد الحصة = ٢٠ طالب × ٥٠ ج.م = ١٬٠٠٠ ج.م</p>
                <p>إيراد الشهر = ١٬٠٠٠ × ٨ حصص = ٨٬٠٠٠ ج.م</p>
                <p>عمولة المنصة = ٨٬٠٠٠ × ١٥٪ = ١٬٢٠٠ ج.م</p>
                <p className="text-green-500 font-bold">الصافي = ٨٬٠٠٠ - ١٬٢٠٠ = ٦٬٨٠٠ ج.م</p>
              </div>
              <p className="text-sm text-muted-foreground">
                * الحساب لكل مجموعة مكتملة العدد (٢٠ طالب)
              </p>
            </div>
          </div>
        </div>

        {/* Payout History */}
        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="p-6 border-b flex items-center justify-between">
            <h3 className="text-xl font-bold">سجل السحوبات</h3>
            <button className="inline-flex items-center gap-2 text-base text-primary hover:underline">
              <Download className="w-5 h-5" />
              تصدير التقرير
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-right py-4 px-6 text-base font-medium text-muted-foreground">
                    التاريخ
                  </th>
                  <th className="text-right py-4 px-6 text-base font-medium text-muted-foreground">
                    المبلغ
                  </th>
                  <th className="text-right py-4 px-6 text-base font-medium text-muted-foreground">
                    طريقة السحب
                  </th>
                  <th className="text-right py-4 px-6 text-base font-medium text-muted-foreground">
                    الحالة
                  </th>
                </tr>
              </thead>
              <tbody>
                {payoutHistory.map((payout) => (
                  <tr
                    key={payout.id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <span className="text-base">{payout.date}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-base font-bold">{payout.amount}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-base">{payout.method}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        مكتمل
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
