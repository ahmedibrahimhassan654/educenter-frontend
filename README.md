# EduCenter - Frontend

واجهة أمامية لمنصة EduCenter التعليمية

## التقنيات المستخدمة

- **Next.js 14** - إطار عمل React
- **TypeScript** - لغة البرمجة
- **Tailwind CSS** - تصميم الواجهات
- **shadcn/ui** - مكتبة المكونات
- **Supabase** - المصادقة والتخزين

## التثبيت

1. قم بتثبيت Node.js من [nodejs.org](https://nodejs.org)

2. افتح المجلد في Terminal وأنفذ:

```bash
npm install
```

3. انسخ `.env.example` إلى `.env.local`:

```bash
cp .env.example .env.local
```

4. افتح ملف `.env.local` وأدخل بيانات Supabase الخاصة بك

## التشغيل

```bash
npm run dev
```

افتح المتصفح على: http://localhost:3000

## هيكل المشروع

```
src/
├── app/
│   ├── (auth)/          # صفحاتتسجيل الدخول
│   ├── (dashboard)/     # لوحة التحكم
│   └── page.tsx         # الصفحة الرئيسية
├── components/
│   ├── ui/              # مكونات shadcn/ui
│   └── shared/          # مكونات مشتركة
├── lib/
│   ├── supabase/        # إعدادات Supabase
│   └── api.ts           # عميل API
├── hooks/               # React Hooks
└── types/               # أنماط TypeScript
```

## الأدوار

- **معلم (TEACHER)**: إدارة المجموعات والجلسات
- **طالب (STUDENT)**: عرض الجدول والتسجيلات
- **ولي أمر (PARENT)**: مراقبة تقدم الأبناء

## النشر

```bash
npm run build
```

يرجى النشر على Vercel أو أي استضافة أخرى تدعم Next.js