"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { APP_NAME, ROLES } from "@/lib/constants";

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await signUp(email, password, name, phone, role);
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "فشل إنشاء الحساب");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">
          إنشاء حساب في {APP_NAME}
        </CardTitle>
        <CardDescription className="text-center">
          أدخل معلوماتك لإنشاء حساب جديد
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-2">
            {error && (
              <div className="text-sm text-red-500 text-center bg-red-50 p-2 rounded">
                {error}
              </div>
            )}
            <div className="grid gap-1">
              <Label htmlFor="name">الاسم الكامل</Label>
              <Input
                id="name"
                type="text"
                placeholder="أحمد إبراهيم حسن"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="text-right"
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="ahmed@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-right"
                dir="ltr"
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+20 1xxxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="text-right"
                dir="ltr"
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-right"
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="role">أنا</Label>
              <Select value={role} onValueChange={setRole} required>
                <SelectTrigger>
                  <SelectValue placeholder="اختر دورك" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ROLES.STUDENT}>طالب</SelectItem>
                  <SelectItem value={ROLES.TEACHER}>معلم</SelectItem>
                  <SelectItem value={ROLES.PARENT}>ولي أمر</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
            </Button>
          </div>
        </form>
        <div className="text-center text-sm">
          لديك حساب بالفعل؟{" "}
          <Link href="/login" className="underline text-primary font-medium">
            تسجيل الدخول
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}