import { Metadata } from "next";
import LoginPageClient from "./page-client";

export const metadata: Metadata = {
  title: "تسجيل الدخول",
  description: "سجّل دخولك إلى إديو سنتر. الوصول إلى لوحة التحكم، المجموعات، والتقارير.",
  alternates: {
    canonical: "/login",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function LoginPage() {
  return <LoginPageClient />;
}
