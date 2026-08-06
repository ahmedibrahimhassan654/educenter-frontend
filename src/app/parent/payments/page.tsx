"use client";

import { useState } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import {
  Wallet,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  Smartphone,
} from "lucide-react";

const invoices = [
  {
    id: 1,
    child: "عبدالله محمد",
    subject: "الفيزياء - الصف الثاني الثانوي",
    sessions: 8,
    pricePerSession: "٥٠ ج.م",
    total: "٤٠٠ ج.م",
    status: "paid",
    dueDate: "٠١ يناير ٢٠٢٥",
    paidDate: "٢٨ ديسمبر ٢٠٢٤",
  },
  {
    id: 2,
    child: "عبدالله محمد",
    subject: "الرياضيات - الصف الثاني الثانوي",
    sessions: 8,
    pricePerSession: "٥٠ ج.م",
    total: "٤٠٠ ج.م",
    status: "paid",
    dueDate: "٠١ يناير ٢٠٢٥",
    paidDate: "٣٠ ديسمبر ٢٠٢٤",
  },
  {
    id: 3,
    child: "عبدالله محمد",
    subject: "الكيمياء - الصف الثاني الثانوي",
    sessions: 8,
    pricePerSession: "٥٠ ج.م",
    total: "٤٠٠ ج.م",
    status: "pending",
    dueDate: "٠١ فبراير ٢٠٢٥",
    paidDate: null,
  },
  {
    id: 4,
    child: "فاطمة محمد",
    subject: "العلوم - الصف الأول الإعدادي",
    sessions: 8,
    pricePerSession: "٥٠ ج.م",
    total: "٤٠٠ ج.م",
    status: "pending",
    dueDate: "٠١ فبراير ٢٠٢٥",
    paidDate: null,
  },
  {
    id: 5,
    child: "فاطمة محمد",
    subject: "اللغة العربية - الصف الأول الإعدادي",
    sessions: 8,
    pricePerSession: "٥٠ ج.م",
    total: "٤٠٠ ج.م",
    status: "overdue",
    dueDate: "١٥ يناير ٢٠٢٥",
    paidDate: null,
  },
];

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  paid: { label: "مدفوع", color: "text-green-500", bg: "bg-green-500/10", icon: CheckCircle },
  pending: { label: "مستحق", color: "text-yellow-500", bg: "bg-yellow-500/10", icon: Clock },
  overdue: { label: "متأخر", color: "text-red-500", bg: "bg-red-500/10", icon: AlertCircle },
};

export default function ParentPaymentsPage() {
  const [selectedTab, setSelectedTab] = useState("all");

  const filteredInvoices = selectedTab === "all"
    ? invoices
    : invoices.filter((inv) => inv.status === selectedTab);

  const totalDue = invoices
    .filter((inv) => inv.status !== "paid")
    .reduce((sum, inv) => sum + parseInt(inv.total.replace(/[^\d]/g, "")), 0);

  const totalPaid = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + parseInt(inv.total.replace(/[^\d]/g, "")), 0);

  return (
    <DashboardLayout role="parent">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">المدفوعات والفواتير</h2>
          <p className="text-base text-muted-foreground mt-1">إدارة فواتير أبنائك وسداد المستحقات</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-card border rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">المستحق</p>
                <p className="text-3xl font-bold text-red-500">{totalDue.toLocaleString("ar-EG")} ج.م</p>
              </div>
            </div>
          </div>
          <div className="bg-card border rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">المدفوع</p>
                <p className="text-3xl font-bold text-green-500">{totalPaid.toLocaleString("ar-EG")} ج.م</p>
              </div>
            </div>
          </div>
          <div className="bg-card border rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الإجمالي</p>
                <p className="text-3xl font-bold">{(totalDue + totalPaid).toLocaleString("ar-EG")} ج.م</p>
              </div>
            </div>
          </div>
        </div>

        {totalDue > 0 && (
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border rounded-xl p-8">
            <h3 className="text-xl font-bold mb-6">اختر طريقة الدفع</h3>
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              <button className="flex items-center gap-3 p-4 bg-background border-2 border-primary rounded-xl hover:bg-primary/5 transition-colors">
                <Smartphone className="w-6 h-6 text-primary" />
                <div className="text-right">
                  <p className="font-bold">فودافون كاش</p>
                  <p className="text-xs text-muted-foreground">دفع فوري</p>
                </div>
              </button>
              <button className="flex items-center gap-3 p-4 bg-background border rounded-xl hover:bg-muted transition-colors">
                <Wallet className="w-6 h-6 text-orange-500" />
                <div className="text-right">
                  <p className="font-bold">فوري</p>
                  <p className="text-xs text-muted-foreground">دفع من أي فرع</p>
                </div>
              </button>
              <button className="flex items-center gap-3 p-4 bg-background border rounded-xl hover:bg-muted transition-colors">
                <CreditCard className="w-6 h-6 text-blue-500" />
                <div className="text-right">
                  <p className="font-bold">بطاقة ائتمان</p>
                  <p className="text-xs text-muted-foreground">فيزا / ماستركارد</p>
                </div>
              </button>
            </div>
            <button className="w-full py-4 bg-primary text-primary-foreground rounded-xl text-lg font-bold hover:bg-primary/90 transition-colors">
              سداد {totalDue.toLocaleString("ar-EG")} ج.م
            </button>
          </div>
        )}

        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="p-6 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-xl font-bold">الفواتير</h3>
            <div className="flex gap-2">
              {[
                { key: "all", label: "الكل" },
                { key: "pending", label: "مستحق" },
                { key: "overdue", label: "متأخر" },
                { key: "paid", label: "مدفوع" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedTab(tab.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedTab === tab.key
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-right py-4 px-6 text-base font-medium text-muted-foreground">الطفل</th>
                  <th className="text-right py-4 px-6 text-base font-medium text-muted-foreground">المادة</th>
                  <th className="text-right py-4 px-6 text-base font-medium text-muted-foreground">الحصص</th>
                  <th className="text-right py-4 px-6 text-base font-medium text-muted-foreground">السعر/حصة</th>
                  <th className="text-right py-4 px-6 text-base font-medium text-muted-foreground">الإجمالي</th>
                  <th className="text-right py-4 px-6 text-base font-medium text-muted-foreground">الاستحقاق</th>
                  <th className="text-right py-4 px-6 text-base font-medium text-muted-foreground">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => {
                  const status = statusConfig[invoice.status];
                  const StatusIcon = status.icon;
                  return (
                    <tr key={invoice.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="py-4 px-6"><p className="text-base">{invoice.child}</p></td>
                      <td className="py-4 px-6"><p className="text-base font-medium">{invoice.subject}</p></td>
                      <td className="py-4 px-6"><p className="text-base">{invoice.sessions} حصص</p></td>
                      <td className="py-4 px-6"><p className="text-base">{invoice.pricePerSession}</p></td>
                      <td className="py-4 px-6"><p className="text-base font-bold">{invoice.total}</p></td>
                      <td className="py-4 px-6"><p className="text-base">{invoice.dueDate}</p></td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.color}`}>
                          <StatusIcon className="w-4 h-4" />
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
