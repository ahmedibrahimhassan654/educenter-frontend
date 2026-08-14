import Link from "next/link";
import { Metadata } from "next";
import PublicHeader from "@/components/public-header";
import PublicFooter from "@/components/public-footer";
import {
  BookOpen,
  Calendar,
  Trophy,
  Users,
  Clock,
  Star,
  ArrowLeft,
  CheckCircle,
  Play,
  Target,
  Sparkles,
  Gamepad2,
  Lightbulb,
  Rocket,
  Medal,
} from "lucide-react";

export const metadata: Metadata = {
  title: "للطلاب - ابدأ رحلتك التعليمية",
  description: "استكشف المجموعات الدراسية، سجّل في الدروس، وتتبع تقدمك التعليمي. تعليم متميز للمراحل الابتدائية والإعدادية والثانوية.",
  keywords: ["طالب", "دراسة", "دروس", "مجموعات دراسية", "تعليم أونلاين"],
  alternates: {
    canonical: "/for-students",
  },
};

const heroStats = [
  { value: "+٢٬٥٠٠", label: "طالب نشط" },
  { value: "+٥٠٠", label: "درس متاح" },
  { value: "٨٥٪", label: "تحسن الدرجات" },
  { value: "٤.٨", label: "تقييم الطلاب" },
];

const sections = [
  {
    id: 1,
    icon: BookOpen,
    color: "cyan",
    title: "تعلم بأسلوبك وفي وقتك",
    subtitle: "دروس تفاعلية تناسب مستواك",
    description:
      "اختر المادة والمعلم والوقت الذي يناسبك. مع محتوى تعليمي تفاعلي يجعل التعلم ممتعاً وسهلاً. كل درس مصمم لمساعدتك على الفهم العميق.",
    features: [
      "حصص مباشرة مع أفضل المعلمين",
      "محتوى تعليمي تفاعلي ومشوق",
      "فيديوهات شرح مسجلة للمراجعة",
      "تمارين تفاعلية بعد كل درس",
      "ملخصات ومواد قابلة للتحميل",
    ],
    mockup: {
      title: "الدروس المتاحة",
      lessons: [
        { subject: "الرياضيات - الجبر", teacher: "أ. محمد", time: "٩:٠٠ صباحاً", duration: "٦٠ دقيقة", status: "live" },
        { subject: "العلوم - الفيزياء", teacher: "أ. خالد", time: "١١:٠٠ صباحاً", duration: "٤٥ دقيقة", status: "upcoming" },
        { subject: "اللغة الإنجليزية", teacher: "أ. نورة", time: "٢:٠٠ مساءً", duration: "٥٠ دقيقة", status: "upcoming" },
      ],
    },
  },
  {
    id: 2,
    icon: Target,
    color: "violet",
    title: "تتبع تقدمك وحقق أهدافك",
    subtitle: "شاهد تطورك واحتفل بإنجازاتك",
    description:
      "لوحة تحكم شخصية تتيح لك متابعة تقدمك في كل مادة. ضع أهدافاً وحققها مع نظام مكافآت يحفزك على الاستمرار.",
    features: [
      "متابعة الدرجات والنتائج التفصيلية",
      "وضع أهداف شخصية وتتبعها",
      "شارات إنجاز ومكافآت تحفيزية",
      "رسم بياني لتطور الأداء",
      "تقارير دورية ترسل لبريدك",
    ],
    mockup: {
      title: "إنجازاتك",
      achievements: [
        { icon: Medal, title: "متفوق رياضيات", description: "حصلت على أعلى الدرجات ٥ مرات", color: "text-yellow-500" },
        { icon: Trophy, title: "نجم الأسبوع", description: "أكملت جميع الواجبات في الوقت المحدد", color: "text-violet-500" },
        { icon: Star, title: "حضور مثالي", description: "لم تغب عن أي حصة هذا الشهر", color: "text-cyan-500" },
      ],
      progress: { current: 87, target: 100, subject: "التقدم العام" },
    },
  },
  {
    id: 3,
    icon: Calendar,
    color: "emerald",
    title: "جدولك الدراسي في جيبك",
    subtitle: "نظّم وقتك بسهولة ولا تفوّت أي حصة",
    description:
      "جدول دراسي ذكي ينظم حصصك وواجباتك. تذكيرات تلقائية قبل كل حصة وجدول أسبوعي واضح يساعدك على إدارة وقتك.",
    features: [
      "جدول أسبوعي تفاعلي",
      "تذكيرات تلقائية قبل الحصص",
      "تقويم الواجبات والمشاريع",
      "مزامنة مع تقويم جوجل",
      "عرض اليوم والأسبوع والشهر",
    ],
    mockup: {
      title: "جدول اليوم",
      schedule: [
        { time: "٩:٠٠", subject: "رياضيات", type: "lesson", status: "completed" },
        { time: "١٠:٣٠", subject: "واجب علوم", type: "homework", status: "in-progress" },
        { time: "١٢:٠٠", subject: "استراحة", type: "break", status: "current" },
        { time: "٢:٠٠", subject: "لغة إنجليزية", type: "lesson", status: "upcoming" },
        { time: "٤:٠٠", subject: "مراجعة", type: "review", status: "upcoming" },
      ],
    },
  },
  {
    id: 4,
    icon: Users,
    color: "pink",
    title: "تعلم مع أصدقائك",
    subtitle: "مجتمع تعليمي يدعمك ويحفزك",
    description:
      "انضم لمجموعات دراسية مع زملائك. شارك الأسئلة، ناقش الدروس، وتعلّم معاً. التعلم مع الأصدقاء أسهل وأمتع.",
    features: [
      "مجموعات دراسية مع الزملاء",
      "منتديات نقاش ومساعدة",
      "تحديات أسبوعية بين الطلاب",
      "مشاركة الملاحظات والملخصات",
      "دعم فوري من المعلمين",
    ],
    mockup: {
      title: "مجتمع الطلاب",
      community: [
        { name: "مجموعة الرياضيات", members: 24, active: true },
        { name: "نادي العلوم", members: 18, active: true },
        { name: "تحدي الإنجليزي", members: 32, active: false },
      ],
      question: {
        user: "أحمد",
        text: "كيف أحل معادلة الدرجة الثانية؟",
        replies: 5,
        time: "منذ ١٠ دقائق",
      },
    },
  },
];

const colorMap: Record<string, { bg: string; text: string; light: string }> = {
  cyan: { bg: "bg-cyan-500", text: "text-cyan-500", light: "bg-cyan-500/10" },
  violet: { bg: "bg-violet-500", text: "text-violet-500", light: "bg-violet-500/10" },
  emerald: { bg: "bg-emerald-500", text: "text-emerald-500", light: "bg-emerald-500/10" },
  pink: { bg: "bg-pink-500", text: "text-pink-500", light: "bg-pink-500/10" },
};

const features = [
  { icon: Gamepad2, title: "تعلم ممتع", description: "دروس تفاعلية تجعل التعلم ممتعاً" },
  { icon: Lightbulb, title: "شرح مبسط", description: "معلمون يشرحون بأسلوب سهل وواضح" },
  { icon: Rocket, title: "تقدم سريع", description: "شاهد تحسن مستمر في درجاتك" },
  { icon: Sparkles, title: "مكافآت تحفيزية", description: "احصل على شارات وجوائز لإنجازاتك" },
];

export default function ForStudentsPage() {
  return (
    <div className="min-h-screen" dir="rtl">
      {/* Header */}
      <PublicHeader active="students" />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 md:py-36">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-background to-violet-500/5" />
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-3xl" />

        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-base font-medium mb-8">
              <Sparkles className="w-5 h-5" />
              <span>ابدأ رحلة التعلم</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-8 leading-tight">
              تعلّم بسهولة
              <span className="text-cyan-500"> وانجح</span>
              <br />
              مع أفضل المعلمين
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              اختر مادتك ومعلمك المفضل وابدأ التعلم في أي وقت ومن أي مكان. مع محتوى تفاعلي يجعل التعلم ممتعاً
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center mb-20">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-primary text-primary-foreground rounded-xl text-xl font-medium hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25"
              >
                سجّل كطالب
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center gap-3 px-10 py-5 border-2 border-border rounded-xl text-xl font-medium hover:bg-muted transition-colors"
              >
                <Play className="w-6 h-6 text-primary" />
                شاهد الفيديو التعريفي
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

                        {/* Lessons Mockup */}
                        {section.id === 1 && section.mockup.lessons && (
                          <div className="space-y-4">
                            {section.mockup.lessons.map((lesson, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                              >
                                <div className={`w-12 h-12 rounded-lg ${colors.light} flex items-center justify-center flex-shrink-0`}>
                                  <Play className={`w-6 h-6 ${colors.text}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-base font-medium text-foreground">{lesson.subject}</div>
                                  <div className="text-sm text-muted-foreground">{lesson.teacher}</div>
                                </div>
                                <div className="text-left flex-shrink-0">
                                  <div className="text-base font-medium">{lesson.time}</div>
                                  <div className="text-sm text-muted-foreground">{lesson.duration}</div>
                                </div>
                                {lesson.status === "live" && (
                                  <div className="px-3 py-1.5 rounded-full bg-red-500/10 text-red-500 text-sm font-medium flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                    مباشر
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Achievements Mockup */}
                        {section.id === 2 && section.mockup.achievements && (
                          <div className="space-y-5">
                            {section.mockup.achievements.map((achievement, i) => (
                              <div
                                key={i}
                                className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg"
                              >
                                <div className={`w-12 h-12 rounded-full ${colors.light} flex items-center justify-center flex-shrink-0`}>
                                  <achievement.icon className={`w-6 h-6 ${achievement.color}`} />
                                </div>
                                <div>
                                  <div className="text-base font-medium text-foreground">{achievement.title}</div>
                                  <div className="text-sm text-muted-foreground">{achievement.description}</div>
                                </div>
                              </div>
                            ))}
                            {section.mockup.progress && (
                              <div className="p-5 bg-muted/50 rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-base font-medium">{section.mockup.progress.subject}</span>
                                  <span className="text-base font-bold text-primary">{section.mockup.progress.current}٪</span>
                                </div>
                                <div className="h-3 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className={`h-full bg-gradient-to-r ${colors.bg} rounded-full transition-all duration-1000`}
                                    style={{ width: `${section.mockup.progress.current}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Schedule Mockup */}
                        {section.id === 3 && section.mockup.schedule && (
                          <div className="space-y-3">
                            {section.mockup.schedule.map((item, i) => (
                              <div
                                key={i}
                                className={`flex items-center gap-4 p-4 rounded-lg ${
                                  item.status === "current" ? "bg-primary/10 border border-primary/20" : "bg-muted/50"
                                } ${item.status === "completed" ? "opacity-60" : ""}`}
                              >
                                <div className="text-base font-medium text-muted-foreground w-14">{item.time}</div>
                                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                                  item.type === "lesson" ? "bg-cyan-500" :
                                  item.type === "homework" ? "bg-violet-500" :
                                  item.type === "review" ? "bg-emerald-500" :
                                  "bg-gray-400"
                                }`} />
                                <div className="flex-1">
                                  <div className="text-base font-medium text-foreground">{item.subject}</div>
                                </div>
                                {item.status === "completed" && <CheckCircle className="w-5 h-5 text-green-500" />}
                                {item.status === "current" && <Clock className="w-5 h-5 text-primary animate-pulse" />}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Community Mockup */}
                        {section.id === 4 && section.mockup.community && (
                          <div className="space-y-5">
                            <div className="space-y-3">
                              {section.mockup.community.map((group, i) => (
                                <div
                                  key={i}
                                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                                >
                                  <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                                      <Users className="w-5 h-5 text-pink-500" />
                                    </div>
                                    <div>
                                      <div className="text-base font-medium text-foreground">{group.name}</div>
                                      <div className="text-sm text-muted-foreground">{group.members} عضو</div>
                                    </div>
                                  </div>
                                  {group.active && (
                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                  )}
                                </div>
                              ))}
                            </div>
                            {section.mockup.question && (
                              <div className="p-5 bg-muted/50 rounded-lg border-r-4 border-pink-500">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center">
                                    <span className="text-sm font-bold text-pink-500">{section.mockup.question.user.charAt(0)}</span>
                                  </div>
                                  <span className="text-base font-medium">{section.mockup.question.user}</span>
                                  <span className="text-sm text-muted-foreground">{section.mockup.question.time}</span>
                                </div>
                                <p className="text-base text-foreground mb-3">{section.mockup.question.text}</p>
                                <div className="text-sm text-muted-foreground">{section.mockup.question.replies} ردود</div>
                              </div>
                            )}
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

      {/* Features Grid */}
      <section className="py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              لماذا يحب الطلاب منصتنا؟
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              نجعل التعلم تجربة ممتعة ومليئة بالتحفيز
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-card border rounded-xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-5">
                  <feature.icon className="w-7 h-7 text-cyan-500" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-base text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container">
          <div className="relative overflow-hidden bg-gradient-to-br from-cyan-500 to-violet-500 rounded-3xl p-14 md:p-20 text-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />

            <div className="relative">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                ابدأ رحلة التعلم الآن
              </h2>
              <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                انضم إلى آلاف الطلاب الذين يتعلمون ويحققون نتائج ممتازة مع منصتنا
              </p>
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-cyan-600 rounded-xl text-xl font-medium hover:bg-white/90 transition-colors"
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
