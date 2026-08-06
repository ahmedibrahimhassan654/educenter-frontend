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
import { Plus, Users, UserPlus } from "lucide-react";

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">الطلاب</h2>
          <p className="text-muted-foreground">
            إدارة طلابك
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="ml-2 h-4 w-4" />
              إضافة طالب
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة طالب</DialogTitle>
              <DialogDescription>
                أضف طالب لمجموعتك باستخدام رمز الربط
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="linkingCode">رمز ربط الطالب</Label>
                <Input id="linkingCode" placeholder="أدخل رمز الربط" className="text-center text-lg tracking-widest" />
              </div>
              <div className="flex justify-start space-x-2 space-x-reverse">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={() => setIsDialogOpen(false)}>
                  إضافة الطالب
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {students.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>لا يوجد طلاب بعد</CardTitle>
            <CardDescription>
              أضف طلاب لمجموعاتك للبدء
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 space-x-reverse text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <p>يمكن للطلاب الانضمام لمجموعاتك باستخدام رمز الربط</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Student list will go here */}
        </div>
      )}
    </div>
  );
}