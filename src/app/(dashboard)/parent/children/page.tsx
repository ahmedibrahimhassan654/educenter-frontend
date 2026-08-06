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
import { Plus, Users, Link as LinkIcon } from "lucide-react";

export default function ChildrenPage() {
  const [children, setChildren] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">أبنائي</h2>
          <p className="text-muted-foreground">
            إدارة حسابات أبنائك
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <LinkIcon className="ml-2 h-4 w-4" />
              ربط حساب ابن
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>ربط حساب ابن</DialogTitle>
              <DialogDescription>
                أدخل رمز الربط الخاص بابنك لربط حسابه
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="linkingCode">رمز الربط</Label>
                <Input
                  id="linkingCode"
                  placeholder="أدخل رمز الربط"
                  className="text-center text-lg tracking-widest"
                />
              </div>
              <div className="flex justify-start space-x-2 space-x-reverse">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={() => setIsDialogOpen(false)}>
                  ربط الحساب
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {children.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>لا يوجد أبناء مربوطين</CardTitle>
            <CardDescription>
              اربط حسابات أبنائك لمراقبة تقدمهم
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 space-x-reverse text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <p>استخدم رمز الربط لربط حساب ابنك</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Child cards will go here */}
        </div>
      )}
    </div>
  );
}