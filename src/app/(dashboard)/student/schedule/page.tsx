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
import { Calendar, Video, ExternalLink } from "lucide-react";

export default function SchedulePage() {
  const [sessions, setSessions] = useState([]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">الجدول</h2>
        <p className="text-muted-foreground">
          عرض الجلسات القادمة
        </p>
      </div>
      {sessions.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>لا توجد جلسات قادمة</CardTitle>
            <CardDescription>
              ليس لديك جلسات مجدولة بعد
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 space-x-reverse text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <p>ستظهر الجلسات هنا بمجرد الانضمام لمجموعة</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Session cards will go here */}
        </div>
      )}
    </div>
  );
}