import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { DynamicThemeToggle } from "@/lib/dynamic-imports";
import PublicNavActions from "@/components/public-nav-actions";
import {
  Eye,
  Shield,
  Bell,
  Heart,
  MessageSquare,
  Star,
  ArrowLeft,
  CheckCircle,
  TrendingUp,
  FileText,
  Calendar,
  CreditCard,
  Smartphone,
  Phone,
} from "lucide-react";

export const metadata: Metadata = {
  title: "لأولياء الأمور - تابع تقدم طفلك",
  description: "تابع حضور وأداء طفلك التعليمي. تقارير مفصلة، تواصل مع المعلمين، وإدارة المدفوعات بسهولة وأمان.",
  keywords: ["ولي أمر", "متابعة الطلاب", "أداء الطلاب", "تواصل مع المعلمين"],
  alternates: {
    canonical: "/for-parents",
  },
};

const heroStats = [
  { value: "+٢٬٥٠٠", label: "ولي أمر مسجل" },
  { value: "٩٨٪", label: "معدل الرضا" },
  { value: "+٥٠", label: "مركز تعليمي" },
  { value: "٢٤/٧", label: "متابعة مستمرة" },
];

const sections = [
  {
    id: 1,
    icon: Eye,
    color: "rose",
    title: "متابعة مستمرة لتقدم طفلك",
    subtitle: "كن على اطلاع دائم بأداء طفلك الدراسي",
    description:
      "نوفر لك لوحة تحكم شاملة تتيح لك متابعة تقدم طفلك في الوقت الفعلي. اعرف درجاته، حضوره، وأداءه في كل المواد.",
    features: [
      "متابعة الدرجات والنتائج فورياً",
      "تقارير أداء مفصلة لكل مادة",
      "إشعارات فورية عند نشر النتائج",
      "مقارنة الأداء عبر الفترات الزمنية",
      "ملخص أسبوعي يرسل لبريدك",
    ],
    mockup: {
      title: "أداء طفلك - أحمد",
      stats: [
        { subject: "الرياضيات", grade: "٩٢٪", trend: "up" },
        { subject: "العلوم", grade: "٨٨٪", trend: "up" },
        { subject: "اللغة العربية", grade: "٨٥٪", trend: "stable" },
        { subject: "اللغة الإنجليزية", grade: "٩٠٪", trend: "up" },
      ],
    },
  },
  {
    id: 2,
    icon: Bell,
    color: "amber",
    title: "إشعارات وتذكيرات ذكية",
    subtitle: "لا تفوّت أي موعد أو مهمة مهمة",
    description:
      "نظام إ\Notifications ذكي يبقيك على اطلاع بكل ما يحدث. من مواعيد الحصص إلى الواجبات المطلوبة، كل شيء في مكان واحد.",
    features: [
      "تذكيرات بمواعيد الحصص القادمة",
      "إشعارات الواجبات والمشاريع",
      "تنبيهات الحضور والغياب",
      "تحديثات المعلمين والملاحظات",
      "إشعارات المدفوعات والفواتير",
    ],
    mockup: {
      title: "الإشعارات الأخيرة",
      notifications: [
        { icon: Calendar, text: "حصة الرياضيات غداً الساعة ٩ صباحاً", time: "منذ ساعة", color: "text-blue-500" },
        { icon: FileText, text: "واجب العلوم يجب تسليمه الأحد", time: "منذ ساعتين", color: "text-orange-500" },
        { icon: Star, text: "أحمد حصل على ٩٥٪ في امتحان الرياضيات", time: "أمس", color: "text-green-500" },
        { icon: Bell, text: "اجتماع أولياء الأمور الخميس القادم", time: "أمس", color: "text-purple-500" },
      ],
    },
  },
  {
    id: 3,
    icon: MessageSquare,
    color: "blue",
    title: "تواصل مباشر مع المعلمين",
    subtitle: "جسور تواصل قوية بين البيت والمدرسة",
    description:
      "إمكانية التواصل المباشر مع معلم طفلك للاستفسار عن أدائه أو مناقشة أي مخاوف. تواصل فعال يخدم مصلحة طفلك.",
    features: [
      "محادثات مباشرة مع المعلمين",
      "حجز موعد للاجتماعات",
      "مشاركة الملاحظات والمخاوف",
      "متابعة توصيات المعلمين",
      "تقييم المعلمين بعد كل فترة",
    ],
    mockup: {
      title: "المحادثات",
      chats: [
        {
          name: "أ. محمد - رياضيات",
          lastMessage: "أحمد يتحسن بشكل ممتاز في الجبر",
          time: "١٠ دقائق",
          unread: 2,
        },
        {
          name: "أ. فاطمة - علوم",
          lastMessage: "سأرسل تقرير الأداء الأسبوع القادم",
          time: "ساعة",
          unread: 0,
        },
        {
          name: "أ. خالد - لغة عربية",
          lastMessage: "نحتاج لمناقشة أداء سارة في الكتابة",
          time: "٣ ساعات",
          unread: 1,
        },
      ],
    },
  },
  {
    id: 4,
    icon: CreditCard,
    color: "green",
    title: "إدارة المدفوعات بسهولة",
    subtitle: "دفع آمن ومتابعة مالية شاملة",
    description:
      "نظام دفع إلكتروني آمن وسهل الاستخدام. ادفع رسوم الحصص وتتبع مدفوعاتك مع فواتير إلكترونية مفصلة.",
    features: [
      "دفع إلكتروني آمن ومشفر",
      "فواتير إلكترونية تفصيلية",
      "متابعة تاريخ المدفوعات",
      "تنبيهات استحقاق الفواتير",
      "خصومات وعروض حصرية",
    ],
    mockup: {
      title: "المدفوعات",
      payments: [
        { description: "حصة الرياضيات - يناير", amount: "٤٠٠ ج.م", status: "paid", date: "٠١/٠١" },
        { description: "حصة العلوم - يناير", amount: "٣٥٠ ج.م", status: "paid", date: "٠٥/٠١" },
        { description: "حصة اللغة العربية - فبراير", amount: "٤٠٠ ج.م", status: "pending", date: "٠١/٠٢" },
      ],
    },
  },
];

const colorMap: Record<string, { bg: string; text: string; light: string }> = {
  rose: { bg: "bg-rose-500", text: "text-rose-500", light: "bg-rose-500/10" },
  amber: { bg: "bg-amber-500", text: "text-amber-500", light: "bg-amber-500/10" },
  blue: { bg: "bg-blue-500", text: "text-blue-500", light: "bg-blue-500/10" },
  green: { bg: "bg-emerald-500", text: "text-emerald-500", light: "bg-emerald-500/10" },
};

const whyUs = [
  { icon: Shield, title: "خصوصية تامة", description: "بيانات طفلك محمية بأعلى معايير الأمان" },
  { icon: Heart, title: "راحة البال", description: "تابع طفلك من أي مكان وفي أي وقت" },
  { icon: Smartphone, title: "سهولة الوصول", description: "تطبيق متاح على جميع الأجهزة" },
  { icon: Phone, title: "دعم فني متواصل", description: "فريق دعم متاح لمساعدتك على مدار الساعة" },
];

export default function ForParentsPage() {
  return (
    <div className="min-h-screen" dir="rtl">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur-md sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="شعار المنصة" width={40} height={40} priority />
            <span className="text-xl font-bold text-primary">إديو سنتر</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-base font-medium hover:text-primary transition-colors">
              الرئيسية
            </Link>
            <Link href="/for-teachers" className="text-base font-medium hover:text-primary transition-colors">
              للمعلمين
            </Link>
            <Link href="/for-parents" className="text-base font-medium text-primary">
              لأولياء الأمور
            </Link>
            <Link href="/for-students" className="text-base font-medium hover:text-primary transition-colors">
              للطلاب
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <DynamicThemeToggle />
            <PublicNavActions ctaHref="/register" ctaLabel="ابدأ الآن" />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 md:py-36">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-background to-amber-500/5" />
        <div className="absolute top-20 left-0 w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-3xl" />

        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-base font-medium mb-8">
              <Heart className="w-5 h-5" />
              <span>لمحة عن تقدم طفلك</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-8 leading-tight">
              اطمئن على طفلك
              <span className="text-rose-500"> وتابع</span>
              <br />
              تقدمه الدراسي بسهولة
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              منصة متكاملة تتيح لك متابعة أداء طفلك الدراسي والتواصل مع معلميه والدفع الإلكتروني بأمان تام
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center mb-20">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-primary text-primary-foreground rounded-xl text-xl font-medium hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25"
              >
                سجّل كولي أمر
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center gap-3 px-10 py-5 border-2 border-border rounded-xl text-xl font-medium hover:bg-muted transition-colors"
              >
                اكتشف المميزات
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {heroStats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-base text-muted-foreground mt-2">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Sections */}
      <section id="features">
        {sections.map((section, index) => {
          const colors = colorMap[section.color];
          const isEven = index % 2 === 0;

          return (
            <div
              key={section.id}
              className={`py-24 md:py-32 ${isEven ? "bg-background" : "bg-muted/30"}`}
            >
              <div className="container">
                <div
                  className={`grid lg:grid-cols-2 gap-20 items-center ${
                    !isEven ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  {/* Content */}
                  <div className={!isEven ? "lg:order-2" : ""}>
                    <div
                      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full ${colors.light} ${colors.text} text-base font-medium mb-6`}
                    >
                      <section.icon className="w-5 h-5" />
                      <span>الميزة {section.id}</span>
                    </div>

                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-5">
                      {section.title}
                    </h2>
                    <p className="text-xl text-primary font-medium mb-6">{section.subtitle}</p>
                    <p className="text-lg text-muted-foreground mb-10 leading-relaxed">{section.description}</p>

                    <div className="space-y-5">
                      {section.features.map((feature) => (
                        <div key={feature} className="flex items-start gap-4">
                          <div className={`w-7 h-7 rounded-full ${colors.light} flex items-center justify-center flex-shrink-0 mt-1`}>
                            <CheckCircle className={`w-5 h-5 ${colors.text}`} />
                          </div>
                          <span className="text-lg text-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mockup */}
                  <div className={!isEven ? "lg:order-1" : ""}>
                    <div className="relative">
                      <div className="bg-card border rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300">
                        <div className="flex items-center justify-between mb-8">
                          <h3 className="text-lg font-semibold text-foreground">{section.mockup.title}</h3>
                          <div className={`w-10 h-10 rounded-lg ${colors.light} flex items-center justify-center`}>
                            <section.icon className={`w-5 h-5 ${colors.text}`} />
                          </div>
                        </div>

                        {/* Performance Mockup */}
                        {section.id === 1 && section.mockup.stats && (
                          <div className="space-y-5">
                            {section.mockup.stats.map((stat, i) => (
                              <div key={i} className="flex items-center gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-base text-muted-foreground">{stat.subject}</span>
                                    <span className="text-base font-bold text-foreground">{stat.grade}</span>
                                  </div>
                                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className={`h-full ${colors.bg} rounded-full transition-all duration-500`}
                                      style={{ width: stat.grade }}
                                    />
                                  </div>
                                </div>
                                <TrendingUp className={`w-5 h-5 ${stat.trend === "up" ? "text-green-500" : "text-yellow-500"}`} />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Notifications Mockup */}
                        {section.id === 2 && section.mockup.notifications && (
                          <div className="space-y-4">
                            {section.mockup.notifications.map((notif, i) => (
                              <div
                                key={i}
                                className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                              >
                                <div className={`w-10 h-10 rounded-full ${colors.light} flex items-center justify-center flex-shrink-0`}>
                                  <notif.icon className={`w-5 h-5 ${notif.color}`} />
                                </div>
                                <div className="flex-1">
                                  <p className="text-base text-foreground">{notif.text}</p>
                                  <span className="text-sm text-muted-foreground">{notif.time}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Chats Mockup */}
                        {section.id === 3 && section.mockup.chats && (
                          <div className="space-y-4">
                            {section.mockup.chats.map((chat, i) => (
                              <div
                                key={i}
                                className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                              >
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <span className="text-base font-bold text-primary">
                                    {chat.name.charAt(2)}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <span className="text-base font-medium text-foreground truncate">{chat.name}</span>
                                    <span className="text-sm text-muted-foreground flex-shrink-0">{chat.time}</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground truncate mt-1">{chat.lastMessage}</p>
                                </div>
                                {chat.unread > 0 && (
                                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs text-white font-bold">{chat.unread}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Payments Mockup */}
                        {section.id === 4 && section.mockup.payments && (
                          <div className="space-y-4">
                            {section.mockup.payments.map((payment, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                              >
                                <div className="flex-1">
                                  <p className="text-base font-medium text-foreground">{payment.description}</p>
                                  <span className="text-sm text-muted-foreground">{payment.date}</span>
                                </div>
                                <div className="text-left flex items-center gap-4">
                                  <span className="text-lg font-bold text-foreground">{payment.amount}</span>
                                  <span
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                                      payment.status === "paid"
                                        ? "bg-green-500/10 text-green-500"
                                        : "bg-yellow-500/10 text-yellow-500"
                                    }`}
                                  >
                                    {payment.status === "paid" ? "مدفوع" : "مستحق"}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Floating decoration */}
                      <div className={`absolute -bottom-4 -left-4 w-24 h-24 ${colors.light} rounded-2xl -z-10`} />
                      <div className={`absolute -top-4 -right-4 w-16 h-16 ${colors.light} rounded-xl -z-10`} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Why Us Section */}
      <section className="py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              لماذا تختار إديو سنتر؟
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              نضع راحة بالك وأمان طفلك في المقام الأول
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyUs.map((item) => (
              <div
                key={item.title}
                className="bg-card border rounded-xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-xl bg-rose-500/10 flex items-center justify-center mb-5">
                  <item.icon className="w-7 h-7 text-rose-500" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{item.title}</h3>
                <p className="text-base text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container">
          <div className="relative overflow-hidden bg-gradient-to-br from-rose-500 to-amber-500 rounded-3xl p-14 md:p-20 text-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />

            <div className="relative">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                ابدأ بمتابعة تقدم طفلك اليوم
              </h2>
              <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                انضم إلى آلاف أولياء الأمور الذين يثقون بمنصنا لمتابعة أبنائهم
              </p>
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-rose-600 rounded-xl text-xl font-medium hover:bg-white/90 transition-colors"
              >
                سجّل مجاناً
                <ArrowLeft className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12">
        <div className="container text-center text-base text-muted-foreground">
          <p>© {new Date().getFullYear()} إديو سنتر. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}
