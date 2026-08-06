"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Play, Clock } from "lucide-react";

export default function RecordingsPage() {
  const [recordings, setRecordings] = useState([]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">التسجيلات</h2>
        <p className="text-muted-foreground">
          مشاهدة الجلسات المسجلة
        </p>
      </div>
      {recordings.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>لا توجد تسجيلات متاحة</CardTitle>
            <CardDescription>
              ستظهر التسجيلات المسجلة هنا
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 space-x-reverse text-sm text-muted-foreground">
              <Video className="h-4 w-4" />
              <p>شاهد تسجيلات الجلسات بالسرعة التي تناسبك</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Recording cards will go here */}
        </div>
      )}
    </div>
  );
}