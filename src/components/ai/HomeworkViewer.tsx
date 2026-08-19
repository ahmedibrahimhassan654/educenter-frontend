"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, XCircle, Printer, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface HomeworkQuestion {
  id: number;
  type: "multiple_choice" | "true_false" | "short_answer";
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
}

interface HomeworkSection {
  name: string;
  questions: HomeworkQuestion[];
}

export interface HomeworkData {
  title?: string;
  instructions?: string;
  sections?: HomeworkSection[];
}

interface HomeworkViewerProps {
  homework: HomeworkData;
}

function normalizeHomework(homework: HomeworkData): HomeworkData {
  if (!homework) return {};
  let sections = homework.sections;
  // Tolerate a flat questions[] payload wrapped as {questions: [...]}.
  if (!Array.isArray(sections) && Array.isArray((homework as any).questions)) {
    sections = [
      {
        name: "الأسئلة",
        questions: (homework as any).questions as HomeworkQuestion[],
      },
    ];
  }
  return {
    title: homework.title,
    instructions: homework.instructions,
    sections: Array.isArray(sections)
      ? sections.filter((s) => s && Array.isArray(s.questions))
      : [],
  };
}

export default function HomeworkViewer({
  homework: rawHomework,
}: HomeworkViewerProps) {
  const homework = useMemo(() => normalizeHomework(rawHomework), [rawHomework]);

  const allQuestions = useMemo(
    () => (homework.sections || []).flatMap((s) => s.questions || []),
    [homework]
  );

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const gradedCount = allQuestions.filter(
    (q) => q.type !== "short_answer"
  ).length;
  const correctCount = useMemo(() => {
    if (!submitted) return 0;
    return allQuestions.filter((q) => {
      if (q.type === "short_answer") return false;
      return (
        (answers[q.id] || "").trim().toLowerCase() ===
        (q.correctAnswer || "").trim().toLowerCase()
      );
    }).length;
  }, [answers, submitted, allQuestions]);

  const score =
    gradedCount > 0 ? Math.round((correctCount / gradedCount) * 100) : 0;

  const unanswered = allQuestions.filter(
    (q) => !(answers[q.id] || "").trim()
  ).length;

  const setAnswer = (id: number, value: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const reset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  const isCorrect = (q: HomeworkQuestion) =>
    (answers[q.id] || "").trim().toLowerCase() ===
    (q.correctAnswer || "").trim().toLowerCase();

  return (
    <div dir="rtl">
      {/* Interactive mode (hidden when printing) */}
      <div className="print:hidden space-y-4">
        {homework.title && (
          <h3 className="font-cairo text-lg font-extrabold">{homework.title}</h3>
        )}
        {homework.instructions && (
          <p className="text-sm text-muted-foreground bg-muted/40 border rounded-xl p-3">
            {homework.instructions}
          </p>
        )}

        {allQuestions.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            تعذر توليد الواجب — جرّب مرة أخرى
          </div>
        )}

        {allQuestions.length > 0 && (
          <>
            <div className="space-y-5">
              {(homework.sections || []).map((section, si) => (
                <div key={si} className="space-y-3">
                  <h4 className="font-bold text-sm text-primary flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-xs">
                      {si + 1}
                    </span>
                    {section.name}
                  </h4>
                  {section.questions.map((q, qi) => {
                    const answered = Boolean((answers[q.id] || "").trim());
                    const wrong = submitted && !isCorrect(q);
                    const right = submitted && isCorrect(q);
                    return (
                      <div
                        key={q.id}
                        className={cn(
                          "rounded-xl border p-4 space-y-3 transition-colors",
                          submitted && q.type !== "short_answer"
                            ? right
                              ? "border-emerald-500/40 bg-emerald-500/5"
                              : "border-red-500/40 bg-red-500/5"
                            : "bg-card"
                        )}
                      >
                        <p className="text-sm font-bold">
                          {si * 100 + qi + 1}. {q.question}
                        </p>

                        {q.type === "multiple_choice" && q.options?.length ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {q.options.map((opt, oi) => {
                              const letter = String.fromCharCode(65 + oi);
                              const selected = answers[q.id] === letter;
                              const isRight =
                                submitted && letter === q.correctAnswer;
                              return (
                                <button
                                  key={oi}
                                  type="button"
                                  onClick={() => setAnswer(q.id, letter)}
                                  disabled={submitted}
                                  className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm text-right transition-colors",
                                    selected
                                      ? "border-primary bg-primary/10 font-bold"
                                      : "border-border hover:bg-muted/60",
                                    submitted && isRight
                                      ? "border-emerald-500 bg-emerald-500/10"
                                      : "",
                                    submitted && selected && !isRight
                                      ? "border-red-500 bg-red-500/10"
                                      : ""
                                  )}
                                >
                                  <span className="w-6 h-6 rounded-md bg-muted flex items-center justify-center text-xs font-bold shrink-0">
                                    {letter}
                                  </span>
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        ) : q.type === "true_false" ? (
                          <div className="flex flex-wrap gap-2">
                            {["صحيح", "خطأ"].map((opt) => {
                              const selected = answers[q.id] === opt;
                              const isRight =
                                submitted && opt === q.correctAnswer;
                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => setAnswer(q.id, opt)}
                                  disabled={submitted}
                                  className={cn(
                                    "px-4 py-2 rounded-lg border text-sm font-bold transition-colors",
                                    selected
                                      ? "border-primary bg-primary/10"
                                      : "border-border hover:bg-muted/60",
                                    submitted && isRight
                                      ? "border-emerald-500 bg-emerald-500/10"
                                      : "",
                                    submitted && selected && !isRight
                                      ? "border-red-500 bg-red-500/10"
                                      : ""
                                  )}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <textarea
                            value={answers[q.id] || ""}
                            onChange={(e) => setAnswer(q.id, e.target.value)}
                            disabled={submitted}
                            rows={3}
                            placeholder="اكتب إجابتك هنا..."
                            className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y"
                          />
                        )}

                        {submitted && (
                          <div
                            className={cn(
                              "flex items-start gap-2 text-xs rounded-lg p-2.5",
                              q.type === "short_answer"
                                ? "bg-muted/50 text-muted-foreground"
                                : wrong
                                ? "bg-red-500/10 text-red-600"
                                : "bg-emerald-500/10 text-emerald-600"
                            )}
                          >
                            {q.type === "short_answer" ? (
                              <RotateCcw className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            ) : wrong ? (
                              <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            )}
                            <div>
                              {q.type === "short_answer" ? (
                                <>
                                  <span className="font-bold">الإجابة المتوقعة: </span>
                                  {q.correctAnswer}
                                </>
                              ) : (
                                <>
                                  {wrong && (
                                    <>
                                      <span className="font-bold">الإجابة الصحيحة: </span>
                                      {q.correctAnswer} —{" "}
                                    </>
                                  )}
                                  {q.explanation}
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {!submitted ? (
                <button
                  type="button"
                  onClick={() => setSubmitted(true)}
                  disabled={unanswered > 0}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:pointer-events-none"
                >
                  تصحيح الواجب
                  {unanswered > 0 && (
                    <span className="text-xs opacity-80">
                      ({allQuestions.length - unanswered}/{allQuestions.length})
                    </span>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-muted text-foreground rounded-xl text-sm font-bold hover:bg-muted/80 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  إعادة المحاولة
                </button>
              )}

              {submitted && (
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-extrabold",
                      score >= 85
                        ? "bg-emerald-500/10 text-emerald-600"
                        : score >= 50
                        ? "bg-amber-500/10 text-amber-600"
                        : "bg-red-500/10 text-red-600"
                    )}
                  >
                    النتيجة: {correctCount}/{gradedCount} ({score}%)
                  </span>
                  <span className="text-xs text-muted-foreground">
                    الأسئلة المقالية تُراجع مع معلمك
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-5 py-2.5 border rounded-xl text-sm font-bold hover:bg-muted/60 transition-colors"
              >
                <Printer className="w-4 h-4" />
                طباعة الواجب
              </button>
            </div>
          </>
        )}
      </div>

      {/* Printable sheet (only visible when printing) */}
      <div className="hidden print:block text-black">
        <h2 className="text-xl font-bold mb-1">
          {homework.title || "واجب منزلي"}
        </h2>
        {homework.instructions && (
          <p className="text-sm mb-4 whitespace-pre-wrap">
            {homework.instructions}
          </p>
        )}
        <hr className="mb-4" />
        <div className="text-left text-xs mb-4">
          الاسم: ______________ &nbsp;&nbsp; التاريخ: ______________
        </div>
        {(homework.sections || []).map((section, si) => (
          <div key={si} className="mb-5">
            <h3 className="font-bold mb-2">
              {si + 1}. {section.name}
            </h3>
            {section.questions.map((q, qi) => (
              <div key={q.id} className="mb-4">
                <p className="font-medium mb-1">
                  {si * 100 + qi + 1}. {q.question}
                </p>
                {q.type === "multiple_choice" && q.options?.length ? (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    {q.options.map((opt, oi) => (
                      <div key={oi}>
                        {String.fromCharCode(65 + oi)}) {opt}
                      </div>
                    ))}
                  </div>
                ) : q.type === "true_false" ? (
                  <div className="text-sm">
                    صحيح ( ) &nbsp;&nbsp;&nbsp; خطأ ( )
                  </div>
                ) : (
                  <div className="border-b border-dotted border-gray-400 h-16 mt-2" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}