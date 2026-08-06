import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="ml-4 hidden md:flex">
            <Link className="ml-6 flex items-center space-x-2 space-x-reverse" href="/">
              <span className="hidden font-bold sm:inline-block text-primary">
                {APP_NAME}
              </span>
            </Link>
            <nav className="flex items-center space-x-6 space-x-reverse text-sm font-medium">
              <Link
                href="#features"
                className="transition-colors hover:text-foreground/80"
              >
                المميزات
              </Link>
              <Link
                href="#pricing"
                className="transition-colors hover:text-foreground/80"
              >
                الأسعار
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 space-x-reverse md:justify-end">
            <nav className="flex items-center space-x-2 space-x-reverse">
              <Button variant="ghost" asChild>
                <Link href="/login">تسجيل الدخول</Link>
              </Button>
              <Button asChild>
                <Link href="/register">ابدأ الآن</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
        <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
          <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-primary">
            {APP_NAME}
          </h1>
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            منصة التعليم الذكي للدروس الخصصة والמורים
          </p>
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-lg">
            {APP_DESCRIPTION}
          </p>
          <div className="space-x-4 space-x-reverse">
            <Button size="lg" asChild>
              <Link href="/register">ابدأ كمعلم</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/register">ابدأ كطالب</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="container space-y-6 bg-slate-50 py-8 dark:bg-transparent md:py-12 lg:py-24"
      >
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl text-primary">
            المميزات
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            كل ما تحتاجه لإدارة صفوفك ودروسك الخصصة
          </p>
        </div>
        <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">للمعلمين</CardTitle>
              <CardDescription>
                إدارة المجموعات والحضور والجلسات
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-sm text-right">
                <li>إنشاء وإدارة مجموعات الطلاب</li>
                <li>جدولة الجلسات مع Google Meet</li>
                <li>تتبع الحضور تلقائياً</li>
                <li>رفع ومشاركة التسجيلات</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-secondary">للطلاب</CardTitle>
              <CardDescription>
                الوصول للجلسات وتتبع التقدم
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-sm text-right">
                <li>عرض الجلسات القادمة</li>
                <li>الانضمام للجلسات المباشرة</li>
                <li>مشاهدة التسجيلات</li>
                <li>متابعة التقدم الأكاديمي</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-accent">أولياء الأمور</CardTitle>
              <CardDescription>مراقبة تقدم ابنك</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-sm text-right">
                <li>عرض تقارير الحضور</li>
                <li>متابعة التقدم الأكاديمي</li>
                <li>استلام الإشعارات</li>
                <li>مراقبة تسجيلات الجلسات</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="container space-y-6 py-8 md:py-12 lg:py-24"
      >
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl text-primary">
            الأسعار
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            أسعار شفافة وبسيطة
          </p>
        </div>
        <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem]">
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="text-primary">اشتراك المعلم</CardTitle>
              <CardDescription className="text-2xl font-bold">
                1,000 جنيه / شهرياً
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-sm text-right">
                <li>مجموعات غير محدودة</li>
                <li>طلاب غير محدودين</li>
                <li>جميع المميزات متاحة</li>
                <li>دعم فني أولوية</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="border-secondary">
            <CardHeader>
              <CardTitle className="text-secondary">رسوم الطالب</CardTitle>
              <CardDescription className="text-2xl font-bold">
                10 جنيه / جلسة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-sm text-right">
                <li>رسوم تقنية المنصة</li>
                <li>الوصول للتسجيلات</li>
                <li>متابعة التقدم</li>
                <li>لوحة تحكم لأولياء الأمور</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            تم البناء باستخدام Next.js و Supabase و MongoDB
          </p>
          <p className="text-center text-sm text-muted-foreground">
            © 2025 {APP_NAME}. جميع الحقوق محفوظة.
          </p>
        </div>
      </footer>
    </div>
  );
}