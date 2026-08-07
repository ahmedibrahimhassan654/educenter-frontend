import { Metadata } from "next";

export const metadata: Metadata = {
  title: "استعادة كلمة المرور",
  description:
    "استعد الوصول إلى حسابك في إديو سنتر عبر رمز تحقق يُرسل إلى بريدك الإلكتروني.",
  alternates: {
    canonical: "/forgot-password",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
