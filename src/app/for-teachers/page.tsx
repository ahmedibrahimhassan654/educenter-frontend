import Link from "next/link";
import { Metadata } from "next";
import PublicHeader from "@/components/public-header";
import PublicFooter from "@/components/public-footer";
import { JsonLd } from "@/components/json-ld";
import { generateBreadcrumbSchema } from "@/lib/seo";
import {
  GraduationCap,
  Calendar,
  BarChart3,
  Wallet,
  Users,
  Shield,
  ArrowLeft,
  CheckCircle,
  Zap,
  TrendingUp,
  Bell,
} from "lucide-react";

export const metadata: Metadata = {
  title: "للمعلمين - انضم إلى فريق المعلمين",
  description: "انضم إلى أكثر من ١٥٠ معلم في إديو سنتر. إدارة ذكية للجداول، تقارير أداء مفصلة، نظام مالي متكامل. سجّل كمعلم الآن!",
  keywords: ["معلم", "تدريس", "دروس خصوصية", "وظائف تعليمية", "التدريس أونلاين"],
  alternates: {
    canonical: "/for-teachers",
  },
  openGraph: {
    title: "للمعلمين - انضم إلى فريق المعلمين | إديو سنتر",
    description: "انضم إلى أكثر من ١٥٠ معلم في إديو سنتر. إدارة ذكية للجداول، تقارير أداء مفصلة، نظام مالي متكامل.",
  },
};

const heroStats = [
  { value: "+١٥٠", label: "معلم نشط" },
  { value: "٩٥٪", label: "معدل الرضا" },
  { value: "+١٢٬٠٠٠", label: "حصة مكتملة" },
  { value: "٤.٩", label: "تقييم المعلمين" },
];

const sections = [
  {
    id: 1,
    icon: Calendar,
    color: "blue",
    title: "إدارة ذكية للجداول والحصص",
    subtitle: "نظام جدولة متكامل يوفر وقتك وجهدك",
    description:
      "صممنا نظام جدولة ذكي يفهم احتياجاتك ويساعدك على تنظيم حصصك بسهولة. مع واجهة سهلة الاستخدام، يمكنك إنشاء وإدارة جدولك الزمني في دقائق معدودة.",
    features: [
      "جدولة تلقائية للحصص بناءً على توافرك",
      "تقويم مزامن مع تقويم جوجل",
      "تذكيرات تلقائية للطلاب قبل الحصة",
      "إدارة الإجازات والتعديلات بسهولة",
      "عرض أسبوعي وشهري للجدول",
    ],
    mockup: {
      title: "جدول الأسبوع",
      items: [
        { time: "٠٩:٠٠", subject: "رياضيات", student: "أحمد", status: "confirmed" },
        { time: "١١:٠٠", subject: "فيزياء", student: "سارة", status: "confirmed" },
        { time: "٠٢:٠٠", subject: "كيمياء", student: "محمد", status: "pending" },
        { time: "٠٤:٠٠", subject: "رياضيات", student: "نورة", status: "confirmed" },
      ],
    },
  },
  {
    id: 2,
    icon: BarChart3,
    color: "green",
    title: "تقارير أداء مفصلة وشاملة",
    subtitle: "اتخذ قرارات مبنية على بيانات حقيقية",
    description:
      "نوفر لك لوحات تحكم تفاعلية وتقارير مفصلة تساعدك على فهم أداء طلابك وتتبع تقدمهم. كل ما تحتاجه لاتخاذ قرارات تعليمية أفضل.",
    features: [
      "متابعة تقدم كل طالب بشكل فردي",
      "تقارير الحضور والغياب التفصيلية",
      "تحليل أداء الامتحانات والواجبات",
      "رسوم بيانية تفاعلية سهلة القراءة",
      "تصدير التقارير بصيغة محددة",
    ],
    mockup: {
      title: "أداء الطلاب",
      stats: [
        { label: "متوسط الدرجات", value: "٨٧٪", trend: "+٥٪" },
        { label: "نسبة الحضور", value: "٩٤٪", trend: "+٢٪" },
        { label: "الواجبات المكتملة", value: "٨٩٪", trend: "+٨٪" },
      ],
    },
  },
  {
    id: 3,
    icon: Wallet,
    color: "purple",
    title: "نظام مالي متكامل وآمن",
    subtitle: "إدارة أرباحك بسهولة وأمان",
    description:
      "نظام مالي متكامل يتيح لك متابعة أرباحك وإدارة المدفوعات بسهولة. مع فواتير إلكترونية وخيارات سحب مرنة.",
    features: [
      "متابعة الأرباح في الوقت الفعلي",
      "فواتير إلكترونية تلقائية",
      "خيارات سحب متعددة ومرنة",
      "تقارير مالية شهرية وسنوية",
      "نظام اشتراكات مرن للطلاب",
    ],
    mockup: {
      title: "الأرباح",
      stats: [
        { label: "هذا الشهر", value: "١٢٬٥٠٠ ج.م", trend: "+١٥٪" },
        { label: "الشهر الماضي", value: "١٠٬٨٠٠ ج.م", trend: "" },
        { label: "إجمالي الأرباح", value: "٨٥٬٠٠٠ ج.م", trend: "" },
      ],
    },
  },
  {
    id: 4,
    icon: Users,
    color: "orange",
    title: "تواصل فعال مع الطلاب وأولياء الأمور",
    subtitle: "بناء جسور التواصل والثقة",
    description:
      "أدوات تواصل متكاملة تتيح لك التواصل مع طلابك وأولياء أمورهم بسهولة. رسائل فورية، اجتماعات عبر الفيديو، وتحديثات مستمرة.",
    features: [
      "رسائل فورية مع الطلاب",
      "تواصل مع أولياء الأمور",
      "مشاركة الملفات والمواد التعليمية",
      "اجتماعات فيديو مدمجة",
      "إشعارات فورية للتحديثات",
    ],
    mockup: {
      title: "الرسائل الأخيرة",
      messages: [
        { name: "أم أحمد", message: "شكراً على متابعة أحمد", time: "٥ دقائق" },
        { name: "سارة", message: "هل يمكن تأجيل الواجب؟", time: "١٥ دقيقة" },
        { name: "أب محمد", message: "متى موعد الاجتماع القادم؟", time: "ساعة" },
      ],
    },
  },
];

const colorMap: Record<string, { bg: string; text: string; light: string }> = {
  blue: { bg: "bg-blue-500", text: "text-blue-500", light: "bg-blue-500/10" },
  green: { bg: "bg-emerald-500", text: "text-emerald-500", light: "bg-emerald-500/10" },
  purple: { bg: "bg-violet-500", text: "text-violet-500", light: "bg-violet-500/10" },
  orange: { bg: "bg-orange-500", text: "text-orange-500", light: "bg-orange-500/10" },
};

const benefits = [
  { icon: Zap, title: "سهولة الاستخدام", description: "واجهة بسيطة وسهلة لا تحتاج لتدريب" },
  { icon: Shield, title: "أمان البيانات", description: "حماية كاملة لبياناتك وبيانات طلابك" },
  { icon: TrendingUp, title: "نمو مستمر", description: "أدوات تساعدك على تنمية مهاراتك وعملك" },
  { icon: Bell, title: "دعم فني متواصل", description: "فريق دعم متاح على مدار الساعة" },
];

export default function ForTeachersPage() {
  return (
    <div className="min-h-screen" dir="rtl">
      {/* Header */}
      <PublicHeader active="teachers" />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 md:py-36">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-background to-violet-500/5" />
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-3xl" />

        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-base font-medium mb-8">
              <GraduationCap className="w-5 h-5" />
              <span>انضم إلى فريق المعلمين</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-8 leading-tight">
              وظّف مهاراتك
              <span className="text-primary"> وانجح</span>
              <br />
              مع أفضل منصة تعليمية
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              نوفر لك كل الأدوات التي تحتاجها لإدارة حصصك، تتبع طلابك، وتنمية عملك التعليمي بكفاءة عالية
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center mb-20">
              <Link
                href="/register/teacher"
                className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-primary text-primary-foreground rounded-xl text-xl font-medium hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25"
              >
                سجّل كمعلم الآن
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

                        {/* Schedule Mockup */}
                        {section.id === 1 && section.mockup.items && (
                          <div className="space-y-4">
                            {section.mockup.items.map((item, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                              >
                                <div className="text-base font-medium text-muted-foreground w-16">
                                  {item.time}
                                </div>
                                <div className="flex-1">
                                  <div className="text-base font-medium text-foreground">{item.subject}</div>
                                  <div className="text-sm text-muted-foreground">{item.student}</div>
                                </div>
                                <div
                                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                                    item.status === "confirmed"
                                      ? "bg-green-500/10 text-green-500"
                                      : "bg-yellow-500/10 text-yellow-500"
                                  }`}
                                >
                                  {item.status === "confirmed" ? "مؤكد" : "قيد الانتظار"}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Stats Mockup */}
                        {section.id === 2 && section.mockup.stats && (
                          <div className="space-y-5">
                            {section.mockup.stats.map((stat, i) => (
                              <div key={i} className="p-5 bg-muted/50 rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-base text-muted-foreground">{stat.label}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                                    <span className="text-sm text-green-500 font-medium">{stat.trend}</span>
                                  </div>
                                </div>
                                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${colors.bg} rounded-full`}
                                    style={{ width: stat.value }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Finance Mockup */}
                        {section.id === 3 && section.mockup.stats && (
                          <div className="space-y-5">
                            {section.mockup.stats.map((stat, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between p-5 bg-muted/50 rounded-lg"
                              >
                                <span className="text-base text-muted-foreground">{stat.label}</span>
                                <div className="text-left">
                                  <div className="text-xl font-bold text-foreground">{stat.value}</div>
                                  {stat.trend && (
                                    <div className="text-sm text-green-500">{stat.trend}</div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Messages Mockup */}
                        {section.id === 4 && section.mockup.messages && (
                          <div className="space-y-4">
                            {section.mockup.messages.map((msg, i) => (
                              <div
                                key={i}
                                className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg"
                              >
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <span className="text-sm font-bold text-primary">
                                    {msg.name.charAt(0)}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-base font-medium text-foreground">{msg.name}</span>
                                    <span className="text-sm text-muted-foreground">{msg.time}</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">{msg.message}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Floating decoration */}
                      <div
                        className={`absolute -bottom-4 -left-4 w-24 h-24 ${colors.light} rounded-2xl -z-10`}
                      />
                      <div
                        className={`absolute -top-4 -right-4 w-16 h-16 ${colors.light} rounded-xl -z-10`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              مميزات إضافية تجعل عملك أسهل
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              نوفر لك بيئة عمل متكاملة تساعدك على التركيز على ما تفعله أفضل: التعليم
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="bg-card border rounded-xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <benefit.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{benefit.title}</h3>
                <p className="text-base text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container">
          <div className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-14 md:p-20 text-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />

            <div className="relative">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                ابدأ رحلتك التعليمية الآن
              </h2>
              <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                انضم إلى أكثر من ١٥٠ معلم يثقون بمنصتنا لإدارة حصصهم وتنمية أعمالهم
              </p>
              <Link
                href="/register/teacher"
                className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-primary rounded-xl text-xl font-medium hover:bg-white/90 transition-colors"
              >
                سجّل مجاناً
                <ArrowLeft className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
