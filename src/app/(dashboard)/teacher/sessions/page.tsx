"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Calendar, Video, Clock } from "lucide-react";

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">الجلسات</h2>
          <p className="text-muted-foreground">
            إدارة جلسات التدريس
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="ml-2 h-4 w-4" />
              إنشاء جلسة
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>إنشاء جلسة جديدة</DialogTitle>
              <DialogDescription>
                جدول جلسة جديدة لمجموعتك
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="group">المجموعة</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر مجموعة" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Groups will be loaded here */}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">عنوان الجلسة</Label>
                <Input id="title" placeholder="مثال: مقدمة في الجبر" className="text-right" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">التاريخ والوقت</Label>
                <Input id="date" type="datetime-local" />
              </div>
              <div className="flex justify-start space-x-2 space-x-reverse">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={() => setIsDialogOpen(false)}>
                  إنشاء الجلسة
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {sessions.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>لا توجد جلسات بعد</CardTitle>
            <CardDescription>
              أنشئ جلستك الأولى للبدء
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 space-x-reverse text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <p>الجلسات هي حصص مجدومة مع طلابك</p>
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