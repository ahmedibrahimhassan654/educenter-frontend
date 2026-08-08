"use client";

import { useState } from "react";
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Question {
  id: number;
  type: "multiple_choice" | "true_false" | "short_answer";
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
}

interface QuestionGeneratorProps {
  questions: Question[];
  onRegenerate?: () => void;
}

export default function QuestionGenerator({ questions, onRegenerate }: QuestionGeneratorProps) {
  const [showAnswers, setShowAnswers] = useState<Record<number, boolean>>({});
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  const toggleAnswer = (qId: number) => {
    setShowAnswers((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const selectAnswer = (qId: number, answer: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [qId]: answer }));
  };

  const getScore = () => {
    let correct = 0;
    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) correct++;
    });
    return correct;
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case "multiple_choice":
        return "اختيار من متعدد";
      case "true_false":
        return "صح أو خطأ";
      case "short_answer":
        return "إجابة قصيرة";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">الأسئلة المُنشأة</h3>
            <p className="text-xs text-muted-foreground">{questions.length} سؤال</p>
          </div>
        </div>
        <div className="flex gap-2">
          {Object.keys(selectedAnswers).length > 0 && (
            <Button variant="outline" size="sm" onClick={() => setShowResults(true)}>
              <CheckCircle2 className="w-4 h-4 ml-1" />
              عرض النتيجة
            </Button>
          )}
          {onRegenerate && (
            <Button variant="outline" size="sm" onClick={onRegenerate}>
              <RotateCcw className="w-4 h-4 ml-1" />
              إعادة إنشاء
            </Button>
          )}
        </div>
      </div>

      {showResults && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-primary">
            {getScore()} / {questions.length}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {getScore() >= questions.length * 0.8
              ? "ممتاز! 🎉"
              : getScore() >= questions.length * 0.5
              ? "جيد! استمر في المراجعة"
              : "تحتاج مراجعة أكثر"}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => {
              setShowResults(false);
              setSelectedAnswers({});
              setShowAnswers({});
            }}
          >
            إعادة المحاولة
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div key={q.id} className="bg-background rounded-xl border p-4">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="shrink-0 mt-0.5">
                {idx + 1}
              </Badge>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-xs">
                    {getQuestionTypeLabel(q.type)}
                  </Badge>
                </div>
                <p className="text-sm font-medium mb-3">{q.question}</p>

                {q.options && q.options.length > 0 && (
                  <div className="space-y-2">
                    {q.options.map((option, optIdx) => {
                      const isSelected = selectedAnswers[q.id] === option;
                      const isCorrect = showResults && q.correctAnswer === option;
                      const isWrong = showResults && isSelected && q.correctAnswer !== option;

                      return (
                        <button
                          key={optIdx}
                          onClick={() => !showResults && selectAnswer(q.id, option)}
                          disabled={showResults}
                          className={`w-full text-right px-4 py-2.5 rounded-lg border text-sm transition-colors ${
                            isCorrect
                              ? "bg-green-50 border-green-300 text-green-800 dark:bg-green-500/10 dark:border-green-500/30"
                              : isWrong
                              ? "bg-red-50 border-red-300 text-red-800 dark:bg-red-500/10 dark:border-red-500/30"
                              : isSelected
                              ? "bg-primary/10 border-primary"
                              : "hover:bg-muted"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {isCorrect && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                            {isWrong && <XCircle className="w-4 h-4 text-red-500" />}
                            {option}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {q.type === "short_answer" && !showResults && (
                  <input
                    type="text"
                    placeholder="اكتب إجابتك هنا..."
                    className="w-full px-4 py-2 rounded-lg border bg-background text-sm"
                    onBlur={(e) => selectAnswer(q.id, e.target.value)}
                  />
                )}

                <button
                  onClick={() => toggleAnswer(q.id)}
                  className="flex items-center gap-1 text-xs text-primary mt-3 hover:underline"
                >
                  <Eye className="w-3 h-3" />
                  {showAnswers[q.id] ? "إخفاء الإجابة" : "عرض الإجابة"}
                </button>

                {showAnswers[q.id] && (
                  <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs font-medium text-green-700 dark:text-green-400">
                      الإجابة الصحيحة: {q.correctAnswer}
                    </p>
                    {q.explanation && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {q.explanation}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
