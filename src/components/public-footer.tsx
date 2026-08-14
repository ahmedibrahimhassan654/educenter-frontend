import Link from "next/link";
import Image from "next/image";

export default function PublicFooter() {
  return (
    <footer className="border-t bg-muted/30 py-16">
      <div className="container">
        <div className="grid md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <Image src="/logo.png" alt="إديو سنتر" width={36} height={36} />
              <span className="text-xl font-bold">إديو سنتر</span>
            </div>
            <p className="text-base text-muted-foreground">
              منصة متكاملة لإدارة التعليم الخصوصي
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-5">المنصة</h4>
            <ul className="space-y-3 text-base text-muted-foreground">
              <li>
                <Link href="/groups" className="hover:text-foreground transition-colors">
                  المجموعات
                </Link>
              </li>
              <li>
                <Link href="/for-teachers" className="hover:text-foreground transition-colors">
                  للمعلمين
                </Link>
              </li>
              <li>
                <Link href="/for-parents" className="hover:text-foreground transition-colors">
                  لأولياء الأمور
                </Link>
              </li>
              <li>
                <Link href="/for-students" className="hover:text-foreground transition-colors">
                  للطلاب
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-5">الدعم</h4>
            <ul className="space-y-3 text-base text-muted-foreground">
              <li>
                <Link href="/help" className="hover:text-foreground transition-colors">
                  مركز المساعدة
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  اتصل بنا
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-foreground transition-colors">
                  الأسئلة الشائعة
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-5">قانوني</h4>
            <ul className="space-y-3 text-base text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  سياسة الخصوصية
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  الشروط والأحكام
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-10 pt-10 text-center text-base text-muted-foreground">
          © {new Date().getFullYear()} إديو سنتر. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
}