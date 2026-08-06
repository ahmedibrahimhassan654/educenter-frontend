"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart3, TrendingUp, Calendar, CheckCircle } from "lucide-react";

export default function ReportsPage() {
  const [reports, setReports] = useState([]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">التقارير</h2>
        <p className="text-muted-foreground">
          عرض تقارير الحضور والتقدم
        </p>
      </div>
      {reports.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>لا توجد تقارير متاحة</CardTitle>
            <CardDescription>
              اربط أبنائك لرؤية تقاريرهم
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 space-x-reverse text-sm text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              <p>تقارير الحضور والتقدم ستظهر هنا</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Report cards will go here */}
        </div>
      )}
    </div>
  );
}