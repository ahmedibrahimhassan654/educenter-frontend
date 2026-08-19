"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Sparkles,
  Loader2,
  FileText,
  HelpCircle,
  MessageSquare,
  Layers,
  BookOpenCheck,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import aiApi, { GeneratedContent } from "@/lib/ai-api";
import AIChat from "@/components/ai/AIChat";
import QuestionGenerator from "@/components/ai/QuestionGenerator";
import FlashcardViewer from "@/components/ai/FlashcardViewer";
import HomeworkViewer, { HomeworkData } from "@/components/ai/HomeworkViewer";

interface LessonMaterial {
  _id: string;
  title: string;
  type: string;
  sourceType: string;
  status: "PROCESSING" | "READY" | "ERROR";
  error?: string;
}

type ToolKey = "chat" | "questions" | "summary" | "flashcards" | "homework";

interface GeneratedQuestion {
  id: number;
  type: "multiple_choice" | "true_false" | "short_answer";
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
}

interface GeneratedFlashcard {
  id: number;
  front: string;
  back: string;
  category?: string;
}

interface FreshResults {
  summary?: string;
  questions?: GeneratedQuestion[];
  flashcards?: GeneratedFlashcard[];
  homework?: HomeworkData;
}

const TOOLS: Array<{
  key: ToolKey;
  label: string;
  Icon: typeof Sparkles;
}> = [
  { key: "chat", label: "محادثة", Icon: MessageSquare },
  { key: "summary", label: "ملخص", Icon: FileText },
  { key: "questions", label: "امتحان تدريبي", Icon: HelpCircle },
  { key: "flashcards", label: "بطاقات مراجعة", Icon: Layers },
  { key: "homework", label: "واجب", Icon: BookOpenCheck },
];

interface LessonAIPanelProps {
  groupId: string;
  lessonId: string;
  lessonTitle: string;
}

export default function LessonAIPanel({
  groupId,
  lessonId,
  lessonTitle,
}: LessonAIPanelProps) {
  const [materials, setMaterials] = useState<LessonMaterial[]>([]);
  const [generated, setGenerated] = useState<GeneratedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [indexing, setIndexing] = useState(false);
  const [generating, setGenerating] = useState<ToolKey | null>(null);
  const [activeTool, setActiveTool] = useState<ToolKey>("chat");

  // Freshly generated results (fall back to the persisted generated list).
  const [fresh, setFresh] = useState<FreshResults>({});

  const load = useCallback(async () => {
    try {
      const res = await aiApi.getLessonAI(groupId, lessonId);
      setMaterials(res.data.materials || []);
      setGenerated(res.data.generated || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [groupId, lessonId]);

  useEffect(() => {
    load();
  }, [load]);

  const readyCount = materials.filter((m) => m.status === "READY").length;
  const hasReady = readyCount > 0;

  const handleIndex = async () => {
    setIndexing(true);
    try {
      const res = await aiApi.indexLessonAI(groupId, lessonId);
      const statuses = res.data || [];
      const failed = statuses.some((s) => s.status === "ERROR");
      await load();
      if (failed) {
        // Still surface, but the failed items carry their error text.
      }
    } catch {
      // ignore
    } finally {
      setIndexing(false);
    }
  };

  const persistLatest = (item: GeneratedContent) => {
    setGenerated((prev) => [item, ...prev.filter((g) => g._id !== item._id)]);
  };

  const handleGenerate = async (tool: ToolKey) => {
    if (!hasReady || generating) return;
    setGenerating(tool);
    setActiveTool(tool);
    try {
      if (tool === "summary") {
        const res = await aiApi.generateSummary(undefined, "ar", lessonId);
        setFresh((f) => ({ ...f, summary: res.data.summary }));
        persistLatest(res.data as unknown as GeneratedContent);
      } else if (tool === "questions") {
        const res = await aiApi.generateQuestions({
          lessonId,
          count: 6,
          difficulty: "medium",
          language: "ar",
          questionType: "mixed",
        });
        setFresh((f) => ({ ...f, questions: res.data.questions }));
        persistLatest(res.data as unknown as GeneratedContent);
      } else if (tool === "flashcards") {
        const res = await aiApi.generateFlashcards(undefined, 12, "ar", lessonId);
        setFresh((f) => ({ ...f, flashcards: res.data.flashcards }));
        persistLatest(res.data as unknown as GeneratedContent);
      } else if (tool === "homework") {
        const res = await aiApi.generateHomework({
          groupId,
          lessonId,
          difficulty: "medium",
          language: "ar",
        });
        setFresh((f) => ({ ...f, homework: res.data.homework }));
        persistLatest(res.data as unknown as GeneratedContent);
      }
    } catch (error) {
      console.error("Generate error:", error);
    } finally {
      setGenerating(null);
    }
  };

  const latestOfType = useMemo(() => {
    const map: Partial<Record<ToolKey, GeneratedContent>> = {};
    for (const item of generated) {
      const key =
        item.type === "QUESTIONS"
          ? "questions"
          : item.type === "SUMMARY"
          ? "summary"
          : item.type === "FLASHCARDS"
          ? "flashcards"
          : item.type === "HOMEWORK"
          ? "homework"
          : null;
      if (key && !map[key]) map[key] = item;
    }
    return map;
  }, [generated]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-5">
      {/* Material status */}
      <div className="bg-card border rounded-2xl p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <h3 className="font-cairo text-base font-extrabold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-500" />
            مواد الذكاء الاصطناعي
          </h3>
          <button
            type="button"
            onClick={handleIndex}
            disabled={indexing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors disabled:opacity-60"
          >
            {indexing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {indexing ? "جارٍ تجهيز المواد..." : "جهّز مواد الدرس"}
          </button>
        </div>

        {materials.length === 0 ? (
          <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4 text-center">
            <p className="text-sm font-bold text-muted-foreground">
              لم يتم تجهيز مواد هذا الدرس بعد
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              اضغط «جهّز مواد الدرس» لتحويل المستندات (والمقاطع القصيرة) إلى ملخصات وامتحانات
              وواجبات بالذكاء الاصطناعي
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {materials.map((m) => (
              <div
                key={m._id}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/40 border text-sm"
              >
                {m.status === "READY" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                ) : m.status === "PROCESSING" ? (
                  <Loader2 className="w-4 h-4 text-amber-500 animate-spin shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                )}
                <div className="min-w-0">
                  <p className="font-bold text-xs">{m.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {m.status === "READY" &&
                      (m.sourceType === "LESSON_DOCUMENT"
                        ? "مستند جاهز للتلخيص"
                        : "تفريغ الفيديو جاهز")}
                    {m.status === "PROCESSING" && (
                      <span className="inline-flex items-center gap-1 text-amber-600">
                        <Clock className="w-3 h-3" /> جارٍ المعالجة
                      </span>
                    )}
                    {m.status === "ERROR" && (m.error || "تعذر تجهيز هذا العنصر")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tools */}
      <div className="bg-card border rounded-2xl p-5">
        <h3 className="font-cairo text-base font-extrabold mb-3 flex items-center gap-2">
          <BookOpenCheck className="w-5 h-5 text-primary" />
          أدوات الدراسة الذكية
        </h3>

        <div className="flex flex-wrap gap-2 mb-4">
          {TOOLS.map(({ key, label, Icon }) => {
            const active = activeTool === key;
            const busy = generating === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() =>
                  key === "chat" ? setActiveTool("chat") : handleGenerate(key)
                }
                disabled={!hasReady || Boolean(generating)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted",
                  !hasReady && "opacity-50"
                )}
              >
                {busy ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
                {label}
              </button>
            );
          })}
        </div>

        {!hasReady ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
            <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-bold">
              جهّز مواد الدرس أولاً لتفعيل أدوات الذكاء الاصطناعي
            </p>
          </div>
        ) : activeTool === "chat" ? (
          <AIChat lessonId={lessonId} contentTitle={lessonTitle} />
        ) : (
          <div className="bg-muted/20 border rounded-xl p-5">
            {generating === activeTool ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-sm text-muted-foreground">
                  جارٍ إنشاء المحتوى بالذكاء الاصطناعي...
                </p>
              </div>
            ) : (
              <>
                {activeTool === "summary" && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      ملخص الدرس — من المستندات والتفريغ الصوتي معاً
                    </p>
                    {(() => {
                      const text =
                        fresh.summary ||
                        (latestOfType.summary?.data as { summary?: string } | undefined)
                          ?.summary;
                      return text ? (
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {text}
                        </div>
                      ) : (
                        <EmptyTool
                          text="اضغط على زر ملخص لإنشاء ملخص من مواد الدرس"
                          Icon={FileText}
                        />
                      );
                    })()}
                  </div>
                )}

                {activeTool === "questions" && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5" />
                      امتحان تدريبي قصير مع تصحيح فوري
                    </p>
                    {fresh.questions?.length ? (
                      <QuestionGenerator questions={fresh.questions} />
                    ) : latestOfType.questions ? (
                      <QuestionGenerator
                        questions={latestOfType.questions.data as GeneratedQuestion[]}
                      />
                    ) : (
                      <EmptyTool
                        text="اضغط على زر امتحان تدريبي لإنشاء أسئلة من مواد الدرس"
                        Icon={HelpCircle}
                      />
                    )}
                  </div>
                )}

                {activeTool === "flashcards" && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      بطاقات مراجعة سريعة للمذاكرة
                    </p>
                    {fresh.flashcards?.length ? (
                      <FlashcardViewer flashcards={fresh.flashcards} />
                    ) : latestOfType.flashcards ? (
                      <FlashcardViewer
                        flashcards={latestOfType.flashcards.data as GeneratedFlashcard[]}
                      />
                    ) : (
                      <EmptyTool
                        text="اضغط على زر بطاقات مراجعة لإنشاء بطاقات من مواد الدرس"
                        Icon={Layers}
                      />
                    )}
                  </div>
                )}

                {activeTool === "homework" && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
                      <BookOpenCheck className="w-3.5 h-3.5" />
                      واجب منزلي قابل للتصحيح والطباعة
                    </p>
                    {fresh.homework ? (
                      <HomeworkViewer homework={fresh.homework} />
                    ) : latestOfType.homework ? (
                      <HomeworkViewer homework={latestOfType.homework.data} />
                    ) : (
                      <EmptyTool
                        text="اضغط على زر واجب لإنشاء واجب منزلي من مواد الدرس"
                        Icon={BookOpenCheck}
                      />
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyTool({ text, Icon }: { text: string; Icon: typeof FileText }) {
  return (
    <div className="text-center py-12 text-muted-foreground">
      <Icon className="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p className="text-sm font-bold">{text}</p>
    </div>
  );
}