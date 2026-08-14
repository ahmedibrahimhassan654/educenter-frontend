import Link from "next/link";
import { Metadata } from "next";
import PublicHeader from "@/components/public-header";
import PublicFooter from "@/components/public-footer";
import { JsonLd } from "@/components/json-ld";
import { generateLocalBusinessSchema, generateFAQSchema } from "@/lib/seo";
import {
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  Star,
  ArrowLeft,
  CheckCircle,
  Play,
  Shield,
  Clock,
  BarChart3,
  Wallet,
  Award,
  Quote,
  TrendingUp,
} from "lucide-react";

export const metadata: Metadata = {
  title: "إديو سنتر - منصة التعليم الرائدة في مصر",
  description: "منصة إديو سنتر - أكبر منصة تعليمية في مصر. نوفر تعليم متميز للمراحل الابتدائية والإعدادية والثانوية مع أفضل المعلمين. سجّل الآن!",
  keywords: ["تعليم مصر", "دروس خصوصية", "معلمين معتمدين", "ثانوية عامة", "إعدادي", "ابتدائي"],
  alternates: {
    canonical: "/",
  },
};

const stats = [
  { icon: Users, value: "+٢٬٥٠٠", label: "طالب نشط" },
  { icon: GraduationCap, value: "+١٥٠", label: "معلم متخصص" },
  { icon: BookOpen, value: "+٥٠٠", label: "درس متاح" },
  { icon: Calendar, value: "+١٠٬٠٠٠", label: "جلسة مكتملة" },
];

const features = [
  "جدولة ذكية للحصص",
  "تتبع الحضور والغياب",
  "تقارير أداء مفصلة",
  "دفع إلكتروني آمن",
];

const tutors = [
  {
    name: "أ. محمد الأحمد",
    subject: "الرياضيات",
    rating: "٤.٩",
    reviews: "١٢٨",
    students: "٤٥",
    experience: "٨ سنوات",
    badge: "معلم مميز",
  },
  {
    name: "أ. فاطمة العلي",
    subject: "اللغة العربية",
    rating: "٤.٨",
    reviews: "٩٦",
    students: "٣٨",
    experience: "٦ سنوات",
    badge: "الأكثر تقييماً",
  },
  {
    name: "أ. خالد السعود",
    subject: "الفيزياء",
    rating: "٤.٩",
    reviews: "١١٢",
    students: "٥٢",
    experience: "١٠ سنوات",
    badge: "خبير",
  },
  {
    name: "أ. نورة الحربي",
    subject: "اللغة الإنجليزية",
    rating: "٤.٧",
    reviews: "٨٤",
    students: "٤١",
    experience: "٥ سنوات",
    badge: "معلم مميز",
  },
];

const whyChooseUs = [
  {
    icon: Shield,
    title: "מורים معتمدون",
    description: "جميع معلمينا معتمدين وذوي خبرة في مجالاتهم",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: Clock,
    title: "مرونة المواعيد",
    description: "اختر الوقت المناسب لك مع إمكانية التعديل بسهولة",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    icon: BarChart3,
    title: "تقارير مفصلة",
    description: "تتبع تقدم طلابك مع تقارير أداء شاملة",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: Wallet,
    title: "دفع آمن",
    description: "خيارات دفع متعددة وآمنة مع فاتورة إلكترونية",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
];

const testimonials = [
  {
    name: "أم عبدالله",
    role: "والدة طالب",
    content: "منصة إديو سنتر غيرت تجربة التعليم لابني بالكامل. المعلمون متميزون والتقارير تساعدني على متابعة تقدمه باستمرار.",
    rating: 5,
  },
  {
    name: "أ. سعيد المطيري",
    role: "معلم رياضيات",
    content: "كمعلم، وفرت لي المنصة أدوات رائعة لإدارة حصصي وتتبع أداء طلابي. أنصح بها كل معلم يبحث عن تنظيم عمله.",
    rating: 5,
  },
  {
    name: "طلال العمري",
    role: "طالب جامعي",
    content: "بدأت استخدم المنصة قبل سنة وكنت أتابع دروسي الخصوصية بسهولة. النتائج تحسنت بشكل ملحوظ.",
    rating: 4,
  },
  {
    name: "أ. منى الخالدي",
    role: "معلمة لغة إنجليزية",
    content: "المنصة سهلة الاستخدام وتوفر لي وقت كبير في التنظيم. نظام الحجز الإلكتروني ممتاز والدفع سريع.",
    rating: 5,
  },
  {
    name: "عبدالرحمن الشمري",
    role: "والد طالبة",
    content: "ابنتي تحب الحصص عبر المنصة. المعلمات محترفات والمتابعة ممتازة. شكراً إديو سنتر على هذه الخدمة.",
    rating: 5,
  },
  {
    name: "أ. يوسف البلوي",
    role: "معلم فيزياء",
    content: "منصة متكاملة تجمع كل ما يحتاجه المعلم. من الجدولة إلى التقييم إلى التواصل مع أولياء الأمور.",
    rating: 5,
  },
];

export default function Home() {
  const faqSchema = generateFAQSchema([
    {
      question: "كيف أسجل كمعلم في إديو سنتر؟",
      answer: "يمكنك التسجيل كمعلم من خلال صفحة التسجيل الخاصة بالمعلمين. ستحتاج إلى إدخال بياناتك الشخصية والمؤهلات التعليمية.",
    },
    {
      question: "ما هي المراحل الدراسية المتاحة؟",
      answer: "نوفر تعليم للمراحل الابتدائية (الصف الأول حتى السادس)، والإعدادية (الصف الأول حتى الثالث)، والثانوية (الصف الأول حتى الثالث).",
    },
    {
      question: "كيف يمكن لأولياء الأمور متابعة أبنائهم؟",
      answer: "يمكن لأولياء الأمور إنشاء حساب وربطه بحساب الطالب باستخدام رمز الربط الخاص. ثم يمكنهم متابعة الحضور والأداء والتقدم التعليمي.",
    },
    {
      question: "ما هي طرق الدفع المتاحة؟",
      answer: "نقبل الدفع عبر فودافون كاش، والتحويل البنكي، وبطاقات الائتمان. جميع المدفوعات آمنة ومشفرة.",
    },
  ]);

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <JsonLd data={generateLocalBusinessSchema()} />
      <JsonLd data={faqSchema} />
      
      <PublicHeader active="home" />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

          <div className="container relative py-24 md:py-36">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Content */}
              <div className="text-center lg:text-right">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 text-primary text-base font-medium mb-8">
                  <Star className="w-5 h-5" />
                  <span>المنصة الأولى للتعليم الذكي</span>
                </div>

                {/* Heading */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-8 leading-tight">
                  <span className="text-primary">منصة متكاملة</span>
                  <br />
                  لإدارة التعليم الخصوصي
                </h1>

                {/* Description */}
                <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 mb-12 leading-relaxed">
                  نوفر لك أدوات احترافية لإدارة حصصك الخصوصية، تتبع أداء طلابك،
                  وتنظيم جدولك الزمني بكفاءة عالية
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start mb-14">
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-primary text-primary-foreground rounded-xl text-xl font-medium hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25"
                  >
                    ابدأ مجاناً
                    <ArrowLeft className="w-6 h-6" />
                  </Link>
                  <button className="inline-flex items-center justify-center gap-3 px-10 py-5 border-2 border-border rounded-xl text-xl font-medium hover:bg-muted transition-colors">
                    <Play className="w-6 h-6 text-primary" />
                    شاهد الفيديو
                  </button>
                </div>

                {/* Features List */}
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  {features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-2 text-base text-muted-foreground"
                    >
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hero Image/Illustration */}
              <div className="relative hidden lg:block">
                <div className="relative">
                  {/* Main Card */}
                  <div className="bg-card border rounded-2xl shadow-2xl p-8 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                    <div className="flex items-center gap-5 mb-8">
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                        <GraduationCap className="w-7 h-7 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">لوحة التحكم</h3>
                        <p className="text-base text-muted-foreground">مرحباً، أحمد</p>
                      </div>
                    </div>
                    <div className="space-y-5">
                      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <span className="text-base">الحصص اليوم</span>
                        <span className="text-lg font-semibold text-primary">٥ حصص</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <span className="text-base">الطلاب النشطين</span>
                        <span className="text-lg font-semibold text-primary">٢٨ طالب</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <span className="text-base">الأرباح الشهر</span>
                        <span className="text-lg font-semibold text-green-500">+١٢٬٥٠٠ ج.م</span>
                      </div>
                    </div>
                  </div>

                  {/* Floating Card */}
                  <div className="absolute -bottom-6 -left-6 bg-card border rounded-xl shadow-lg p-5 animate-bounce-slow">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      </div>
                      <div>
                        <p className="text-base font-medium">تم الحجز</p>
                        <p className="text-sm text-muted-foreground">الرياضيات - الصف ٣</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-y bg-muted/50">
          <div className="container py-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary mb-4">
                    <stat.icon className="w-7 h-7" />
                  </div>
                  <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                    {stat.value}
                  </div>
                  <div className="text-base text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-20">
          <div className="container text-center">
            <p className="text-lg text-muted-foreground mb-8">موثوق من قبل أكثر من ١٠٠ مركز تعليمي</p>
            <div className="flex flex-wrap items-center justify-center gap-10 opacity-50">
              {["مركز النخبة", "أكاديمية المستقبل", "معهد التميز", "مدرسة الرواد"].map((name) => (
                <div key={name} className="text-xl font-semibold text-muted-foreground">
                  {name}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Tutors Section */}
        <section className="py-24 bg-muted/30">
          <div className="container">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 text-primary text-base font-medium mb-6">
                <Award className="w-5 h-5" />
                <span>أفضل المعلمين</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                تعرّف على معلمينا المتميزين
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                نخبة من أفضل المعلمين ذوي الخبرة والكفاءة العالية في مختلف التخصصات
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {tutors.map((tutor) => (
                <div
                  key={tutor.name}
                  className="group bg-card border rounded-2xl p-8 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Avatar */}
                  <div className="relative mb-6">
                    <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <span className="text-3xl font-bold text-primary">
                        {tutor.name.charAt(2)}
                      </span>
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                        <Star className="w-3 h-3 fill-current" />
                        {tutor.badge}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="text-center mt-8">
                    <h3 className="text-lg font-semibold text-foreground mb-2">{tutor.name}</h3>
                    <p className="text-base text-primary font-medium mb-4">{tutor.subject}</p>
                    
                    {/* Stats */}
                    <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-5">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span>{tutor.rating}</span>
                        <span>({tutor.reviews})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{tutor.students} طالب</span>
                      </div>
                    </div>

                    {/* Experience */}
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-5">
                      <Clock className="w-4 h-4" />
                      <span>{tutor.experience} خبرة</span>
                    </div>

                    {/* CTA */}
                    <Link
                      href={`/tutors/${tutor.name.replace(/\s+/g, '-')}`}
                      className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 bg-primary/10 text-primary rounded-lg text-base font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      عرض الملف
                      <ArrowLeft className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/tutors"
                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-primary text-primary rounded-xl text-lg font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                عرض جميع المعلمين
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-24">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              {/* Content */}
              <div>
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-secondary/10 text-secondary text-base font-medium mb-6">
                  <CheckCircle className="w-5 h-5" />
                  <span>لماذا نحن؟</span>
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-8">
                  نوفر لك تجربة تعليمية
                  <span className="text-secondary"> استثنائية</span>
                </h2>
                <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
                  نجمع بين التكنولوجيا المتقدمة والخبرة التعليمية لنقدم لك أفضل منصة للتعليم الخصوصي
                </p>

                <div className="space-y-8">
                  {whyChooseUs.map((item) => (
                    <div
                      key={item.title}
                      className="flex gap-5 p-5 rounded-xl hover:bg-muted/50 transition-colors"
                    >
                      <div className={`w-14 h-14 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0`}>
                        <item.icon className={`w-7 h-7 ${item.color}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                        <p className="text-base text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Illustration */}
              <div className="relative hidden lg:block">
                <div className="relative">
                  {/* Main Card */}
                  <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border rounded-3xl p-10">
                    <div className="grid grid-cols-2 gap-5">
                      {/* Stat Cards */}
                      <div className="bg-card border rounded-xl p-5 text-center">
                        <div className="w-12 h-12 mx-auto rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
                          <Users className="w-6 h-6 text-blue-500" />
                        </div>
                        <div className="text-3xl font-bold text-foreground">٩٨٪</div>
                        <div className="text-sm text-muted-foreground mt-1">رضا العملاء</div>
                      </div>
                      <div className="bg-card border rounded-xl p-5 text-center">
                        <div className="w-12 h-12 mx-auto rounded-lg bg-green-500/10 flex items-center justify-center mb-3">
                          <TrendingUp className="w-6 h-6 text-green-500" />
                        </div>
                        <div className="text-3xl font-bold text-foreground">٨٥٪</div>
                        <div className="text-sm text-muted-foreground mt-1">تحسن الدرجات</div>
                      </div>
                      <div className="bg-card border rounded-xl p-5 text-center">
                        <div className="w-12 h-12 mx-auto rounded-lg bg-purple-500/10 flex items-center justify-center mb-3">
                          <Clock className="w-6 h-6 text-purple-500" />
                        </div>
                        <div className="text-3xl font-bold text-foreground">٢٤/٧</div>
                        <div className="text-sm text-muted-foreground mt-1">دعم متواصل</div>
                      </div>
                      <div className="bg-card border rounded-xl p-5 text-center">
                        <div className="w-12 h-12 mx-auto rounded-lg bg-orange-500/10 flex items-center justify-center mb-3">
                          <Award className="w-6 h-6 text-orange-500" />
                        </div>
                        <div className="text-3xl font-bold text-foreground">+٢٠٠</div>
                        <div className="text-sm text-muted-foreground mt-1">معلم معتمد</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-8 p-5 bg-card border rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-base font-medium">تقدم الطالب</span>
                        <span className="text-base text-primary font-semibold">٨٧٪</span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div className="h-full w-[87%] bg-gradient-to-r from-primary to-secondary rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Floating Badge */}
                  <div className="absolute -top-4 -right-4 bg-card border shadow-lg rounded-xl p-4 animate-bounce-slow">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                      <span className="text-base font-medium">+٥٠ طالب جديد</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials & Reviews Section */}
        <section className="py-24 bg-muted/30">
          <div className="container">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-base font-medium mb-6">
                <Quote className="w-5 h-5" />
                <span>آراء المستخدمين</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                ماذا يقول مستخدمونا؟
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                اكتشف تجارب المعلمين والطلاب وأولياء الأمور مع إديو سنتر
              </p>
            </div>

            {/* Testimonials Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.name}
                  className={`bg-card border rounded-2xl p-8 hover:shadow-lg transition-all duration-300 ${
                    index === 0 ? "md:col-span-2 lg:col-span-1" : ""
                  }`}
                >
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < testimonial.rating
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-muted"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <div className="relative mb-5">
                    <Quote className="absolute -top-2 -right-2 w-10 h-10 text-primary/10" />
                    <p className="text-lg text-muted-foreground leading-relaxed pr-8">
                      {testimonial.content}
                    </p>
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-4 pt-5 border-t">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <span className="text-base font-bold text-primary">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-foreground">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-10 mt-16 pt-10 border-t">
              <div className="text-center">
                <div className="text-4xl font-bold text-foreground">٤.٨</div>
                <div className="flex items-center gap-1 justify-center mt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <div className="text-sm text-muted-foreground mt-2">متوسط التقييم</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-center">
                <div className="text-4xl font-bold text-foreground">+٢٬٥٠٠</div>
                <div className="text-sm text-muted-foreground mt-2">تقييم موثق</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-center">
                <div className="text-4xl font-bold text-foreground">٩٨٪</div>
                <div className="text-sm text-muted-foreground mt-2">راضون عن الخدمة</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
