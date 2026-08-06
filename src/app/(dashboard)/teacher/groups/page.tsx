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
import { Plus, Users, Edit, Trash2 } from "lucide-react";

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">المجموعات</h2>
          <p className="text-muted-foreground">
            إدارة مجموعات الطلاب
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="ml-2 h-4 w-4" />
              إنشاء مجموعة
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>إنشاء مجموعة جديدة</DialogTitle>
              <DialogDescription>
                أدخل البيانات لإنشاء مجموعة جديدة
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">اسم المجموعة</Label>
                <Input id="title" placeholder="مثال: رياضيات الصف العاشر" className="text-right" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">المادة</Label>
                <Input id="subject" placeholder="مثال: رياضيات" className="text-right" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grade">الصف</Label>
                <Input id="grade" placeholder="مثال: الصف العاشر" className="text-right" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meetLink">رابط Google Meet</Label>
                <Input id="meetLink" placeholder="https://meet.google.com/..." dir="ltr" />
              </div>
              <div className="flex justify-start space-x-2 space-x-reverse">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={() => setIsDialogOpen(false)}>
                  إنشاء المجموعة
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {groups.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>لا توجد مجموعات بعد</CardTitle>
            <CardDescription>
              أنشئ مجموعتك الأولى للبدء
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 space-x-reverse text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <p>المجموعات تتيح لك تنظيم الطلاب وجدولة الجلسات</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Group cards will go here */}
        </div>
      )}
    </div>
  );
}