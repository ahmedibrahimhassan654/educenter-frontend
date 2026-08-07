"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  MailCheck,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

type Step = "email" | "code" | "password" | "done";

const steps: { key: Step; label: string }[] = [
  { key: "email", label: "البريد" },
  { key: "code", label: "الرمز" },
  { key: "password", label: "كلمة المرور" },
];

/**
 * Calls the API directly with fetch rather than the shared axios client:
 * that client redirects to /login on any 401, which would eject the user
 * in the middle of this flow.
 */
async function postJson(path: string, body: unknown) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  return { ok: response.ok, status: response.status, data };
}

export default function ForgotPasswordClient() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  // Resend cooldown
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  // Move focus to the first empty box when the code step appears
  useEffect(() => {
    if (step === "code") inputsRef.current[0]?.focus();
  }, [step]);

  const requestCode = useCallback(
    async (isResend = false) => {
      setError("");
      setLoading(true);

      try {
        const { ok, data } = await postJson("/auth/forgot-password", { email });

        if (!ok) {
          setError(data?.message || "تعذر إرسال الرمز. حاول مرة أخرى.");
          return;
        }

        setDigits(Array(OTP_LENGTH).fill(""));
        setSecondsLeft(RESEND_SECONDS);
        setStep("code");
        toast.success(
          isResend ? "تم إرسال رمز جديد" : "تم إرسال الرمز إلى بريدك الإلكتروني"
        );
      } catch {
        setError("تعذر الاتصال بالخادم. تحقق من اتصالك بالإنترنت.");
      } finally {
        setLoading(false);
      }
    },
    [email]
  );

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();

    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("يرجى إدخال بريد إلكتروني صالح");
      return;
    }

    await requestCode(false);
  };

  const submitCode = useCallback(
    async (code: string) => {
      setError("");
      setLoading(true);

      try {
        const { ok, data } = await postJson("/auth/verify-otp", { email, code });

        if (!ok) {
          setError(data?.message || "الرمز غير صحيح");
          setDigits(Array(OTP_LENGTH).fill(""));
          inputsRef.current[0]?.focus();
          return;
        }

        setResetToken(data.resetToken);
        setStep("password");
      } catch {
        setError("تعذر الاتصال بالخادم. تحقق من اتصالك بالإنترنت.");
      } finally {
        setLoading(false);
      }
    },
    [email]
  );

  const handleDigitChange = (index: number, rawValue: string) => {
    const value = rawValue.replace(/\D/g, "");
    if (!value) {
      setDigits((prev) => {
        const next = [...prev];
        next[index] = "";
        return next;
      });
      return;
    }

    // Typing or pasting several digits at once fills the boxes ahead
    const chars = value.split("");
    setDigits((prev) => {
      const next = [...prev];
      let cursor = index;
      for (const char of chars) {
        if (cursor >= OTP_LENGTH) break;
        next[cursor] = char;
        cursor += 1;
      }

      const focusTarget = Math.min(cursor, OTP_LENGTH - 1);
      inputsRef.current[focusTarget]?.focus();

      const joined = next.join("");
      if (joined.length === OTP_LENGTH && !joined.includes("")) {
        void submitCode(joined);
      }
      return next;
    });
  };

  const handleDigitKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      setDigits((prev) => {
        const next = [...prev];
        if (next[index]) {
          next[index] = "";
        } else if (index > 0) {
          next[index - 1] = "";
          inputsRef.current[index - 1]?.focus();
        }
        return next;
      });
      return;
    }

    // RTL layout: ArrowRight moves to the previous (visually right) box
    if (e.key === "ArrowRight" && index > 0) {
      e.preventDefault();
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index < OTP_LENGTH - 1) {
      e.preventDefault();
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;

    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((char, i) => {
      next[i] = char;
    });
    setDigits(next);

    if (pasted.length === OTP_LENGTH) {
      void submitCode(pasted);
    } else {
      inputsRef.current[pasted.length]?.focus();
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("كلمة المرور يجب أن تكون ٦ أحرف على الأقل");
      return;
    }
    if (password !== confirmPassword) {
      setError("كلمات المرور غير متطابقة");
      return;
    }

    setLoading(true);
    try {
      const { ok, data } = await postJson("/auth/reset-password", {
        email,
        resetToken,
        newPassword: password,
      });

      if (!ok) {
        setError(data?.message || "تعذر تغيير كلمة المرور");
        return;
      }

      setStep("done");
      toast.success("تم تغيير كلمة المرور بنجاح");
      setTimeout(() => router.push("/login"), 2500);
    } catch {
      setError("تعذر الاتصال بالخادم. تحقق من اتصالك بالإنترنت.");
    } finally {
      setLoading(false);
    }
  };

  const activeStepIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-12 lg:p-16">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-3 mb-8">
              <Image src="/logo.png" alt="إديو سنتر" width={48} height={48} />
              <span className="text-2xl font-bold text-primary">إديو سنتر</span>
            </Link>

            {step !== "done" && (
              <>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-medium mb-4">
                  <KeyRound className="w-4 h-4" />
                  <span>استعادة الحساب</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                  {step === "email" && "نسيت كلمة المرور؟"}
                  {step === "code" && "أدخل رمز التحقق"}
                  {step === "password" && "كلمة مرور جديدة"}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {step === "email" &&
                    "أدخل بريدك الإلكتروني وسنرسل لك رمز تحقق"}
                  {step === "code" && (
                    <>
                      أرسلنا رمزاً مكوناً من ٦ أرقام إلى{" "}
                      <span className="font-medium text-foreground" dir="ltr">
                        {email}
                      </span>
                    </>
                  )}
                  {step === "password" && "اختر كلمة مرور قوية لحسابك"}
                </p>
              </>
            )}
          </div>

          {/* Progress */}
          {step !== "done" && (
            <div className="flex items-center gap-2 mb-8">
              {steps.map((s, index) => (
                <div key={s.key} className="flex items-center gap-2 flex-1">
                  <div
                    className={`flex items-center gap-2 ${
                      index <= activeStepIndex
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                        index < activeStepIndex
                          ? "bg-primary border-primary text-primary-foreground"
                          : index === activeStepIndex
                          ? "border-primary text-primary"
                          : "border-muted-foreground/30"
                      }`}
                    >
                      {index < activeStepIndex ? "✓" : index + 1}
                    </div>
                    <span className="text-xs font-medium hidden sm:inline">
                      {s.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-px flex-1 ${
                        index < activeStepIndex ? "bg-primary" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-base text-center animate-shake">
              {error}
            </div>
          )}

          {/* Step 1: email */}
          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-base font-medium text-foreground"
                >
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    required
                    autoFocus
                    dir="ltr"
                    className="w-full pr-12 pl-4 py-4 bg-muted/50 border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground/50 text-left"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary text-primary-foreground rounded-xl text-lg font-bold hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    إرسال رمز التحقق
                    <ArrowLeft className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: code */}
          {step === "code" && (
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="block text-base font-medium text-foreground">
                  رمز التحقق
                </label>
                <div className="flex gap-2 justify-center" dir="ltr">
                  {digits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputsRef.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      autoComplete={index === 0 ? "one-time-code" : "off"}
                      maxLength={OTP_LENGTH}
                      value={digit}
                      onChange={(e) => handleDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleDigitKeyDown(index, e)}
                      onPaste={handlePaste}
                      disabled={loading}
                      className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold bg-muted/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50"
                    />
                  ))}
                </div>
                {loading && (
                  <p className="text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جاري التحقق...
                  </p>
                )}
              </div>

              <div className="text-center">
                {secondsLeft > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    يمكنك طلب رمز جديد بعد{" "}
                    <span className="font-bold text-foreground">
                      {secondsLeft}
                    </span>{" "}
                    ثانية
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => requestCode(true)}
                    disabled={loading}
                    className="text-sm text-primary font-medium hover:underline disabled:opacity-50"
                  >
                    لم يصلك الرمز؟ إعادة الإرسال
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setError("");
                }}
                className="w-full py-3 text-base text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                تغيير البريد الإلكتروني
              </button>
            </div>
          )}

          {/* Step 3: new password */}
          {step === "password" && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-base font-medium text-foreground"
                >
                  كلمة المرور الجديدة
                </label>
                <div className="relative">
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="٦ أحرف على الأقل"
                    required
                    autoFocus
                    className="w-full pr-12 pl-12 py-4 bg-muted/50 border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="block text-base font-medium text-foreground"
                >
                  تأكيد كلمة المرور
                </label>
                <div className="relative">
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="أعد إدخال كلمة المرور"
                    required
                    className="w-full pr-12 pl-12 py-4 bg-muted/50 border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  >
                    {showConfirm ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary text-primary-foreground rounded-xl text-lg font-bold hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    تغيير كلمة المرور
                    <ArrowLeft className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 4: done */}
          {step === "done" && (
            <div className="text-center py-8 animate-fade-in">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                تم تغيير كلمة المرور
              </h1>
              <p className="text-base text-muted-foreground mb-8">
                يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-3 w-full py-4 bg-primary text-primary-foreground rounded-xl text-lg font-bold hover:bg-primary/90 transition-all"
              >
                تسجيل الدخول
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </div>
          )}

          {/* Back to login */}
          {step !== "done" && (
            <p className="text-center text-base text-muted-foreground mt-8">
              تذكرت كلمة المرور؟{" "}
              <Link
                href="/login"
                className="text-primary font-bold hover:underline"
              >
                تسجيل الدخول
              </Link>
            </p>
          )}
        </div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-red-600 via-rose-500 to-orange-500 relative overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-white/5 rounded-full" />

        <div className="relative z-10 flex flex-col items-center justify-center p-16 text-white">
          <div className="max-w-md text-center">
            <div className="w-24 h-24 mx-auto mb-8 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center animate-float">
              <ShieldCheck className="w-12 h-12 text-white" />
            </div>

            <h2 className="text-3xl font-bold mb-4">حسابك في أمان</h2>
            <p className="text-lg text-white/80 mb-10 leading-relaxed">
              نستخدم رمز تحقق مؤقت للتأكد من هويتك قبل تغيير كلمة المرور
            </p>

            <div className="space-y-4 text-right">
              {[
                {
                  icon: MailCheck,
                  title: "رمز يصل لبريدك",
                  text: "رمز مكوّن من ٦ أرقام يُرسل إلى بريدك المسجل",
                },
                {
                  icon: KeyRound,
                  title: "صالح لمدة ١٠ دقائق",
                  text: "ينتهي الرمز تلقائياً للحفاظ على أمان حسابك",
                },
                {
                  icon: ShieldCheck,
                  title: "استخدام واحد فقط",
                  text: "لا يمكن إعادة استخدام الرمز بعد التحقق منه",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-base">{item.title}</p>
                    <p className="text-sm text-white/70 mt-1">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
