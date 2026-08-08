"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  HelpCircle,
  FileText,
  Loader2,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIContent } from "@/lib/ai-api";
import aiApi from "@/lib/ai-api";
import AIChat from "@/components/ai/AIChat";
import ContentSelector from "@/components/ai/ContentSelector";
import QuestionGenerator from "@/components/ai/QuestionGenerator";
import FlashcardViewer from "@/components/ai/FlashcardViewer";

export default function StudentAIStudyPage() {
  const [contents, setContents] = useState<AIContent[]>([]);
  const [selectedContent, setSelectedContent] = useState<AIContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("chat");
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [generatedFlashcards, setGeneratedFlashcards] = useState<any[]>([]);
  const [generatedSummary, setGeneratedSummary] = useState("");
  const [isGenerating, setIsGenerating] = useState("");

  useEffect(() => {
    loadContents();
  }, []);

  const loadContents = async () => {
    try {
      setIsLoading(true);
      const response = await aiApi.getContents({ limit: 50 });
      setContents(response.data.filter((c) => c.status === "READY"));
    } catch (error) {
      console.error("Error loading contents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!selectedContent) return;
    setIsGenerating("questions");
    try {
      const response = await aiApi.generateQuestions({
        contentId: selectedContent._id,
        count: 5,
        difficulty: "medium",
        language: "ar",
        questionType: "mixed",
      });
      setGeneratedQuestions(response.data.questions);
    } catch (error: any) {
      console.error("Error generating questions:", error);
    } finally {
      setIsGenerating("");
    }
  };

  const handleGenerateSummary = async () => {
    if (!selectedContent) return;
    setIsGenerating("summary");
    try {
      const response = await aiApi.generateSummary(selectedContent._id, "ar");
      setGeneratedSummary(response.data.summary);
    } catch (error: any) {
      console.error("Error generating summary:", error);
    } finally {
      setIsGenerating("");
    }
  };

  const handleGenerateFlashcards = async () => {
    if (!selectedContent) return;
    setIsGenerating("flashcards");
    try {
      const response = await aiApi.generateFlashcards(selectedContent._id, 15, "ar");
      setGeneratedFlashcards(response.data.flashcards);
    } catch (error: any) {
      console.error("Error generating flashcards:", error);
    } finally {
      setIsGenerating("");
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" />
          المعلم الذكي
        </h1>
        <p className="text-muted-foreground mt-1">
          تعلم بالذكاء الاصطناعي - ادرس محتواك واطرح أسئلتك
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ContentSelector
            contents={contents}
            selectedId={selectedContent?._id}
            onSelect={setSelectedContent}
            onRefresh={loadContents}
            isLoading={isLoading}
          />
        </div>

        <div className="lg:col-span-2">
          {selectedContent ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant={activeTab === "chat" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("chat")}
                >
                  <Sparkles className="w-4 h-4 ml-1" />
                  محادثة
                </Button>
                <Button
                  variant={activeTab === "questions" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setActiveTab("questions");
                    if (generatedQuestions.length === 0) handleGenerateQuestions();
                  }}
                  disabled={isGenerating === "questions"}
                >
                  {isGenerating === "questions" ? (
                    <Loader2 className="w-4 h-4 ml-1 animate-spin" />
                  ) : (
                    <HelpCircle className="w-4 h-4 ml-1" />
                  )}
                  تدرب
                </Button>
                <Button
                  variant={activeTab === "summary" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setActiveTab("summary");
                    if (!generatedSummary) handleGenerateSummary();
                  }}
                  disabled={isGenerating === "summary"}
                >
                  {isGenerating === "summary" ? (
                    <Loader2 className="w-4 h-4 ml-1 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4 ml-1" />
                  )}
                  ملخص
                </Button>
                <Button
                  variant={activeTab === "flashcards" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setActiveTab("flashcards");
                    if (generatedFlashcards.length === 0) handleGenerateFlashcards();
                  }}
                  disabled={isGenerating === "flashcards"}
                >
                  {isGenerating === "flashcards" ? (
                    <Loader2 className="w-4 h-4 ml-1 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 ml-1" />
                  )}
                  بطاقات
                </Button>
              </div>

              {activeTab === "chat" && (
                <AIChat
                  contentId={selectedContent._id}
                  contentTitle={selectedContent.title}
                />
              )}

              {activeTab === "questions" && (
                <div className="bg-background rounded-xl border p-6">
                  {isGenerating === "questions" ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                      <p className="text-muted-foreground">جاري إنشاء أسئلة للتدريب...</p>
                    </div>
                  ) : generatedQuestions.length > 0 ? (
                    <QuestionGenerator questions={generatedQuestions} />
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>اضغط على زر تدرب لإنشاء أسئلة</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "summary" && (
                <div className="bg-background rounded-xl border p-6">
                  {isGenerating === "summary" ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                      <p className="text-muted-foreground">جاري إنشاء الملخص...</p>
                    </div>
                  ) : generatedSummary ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {generatedSummary}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>اضغط على زر ملخص لإنشاء ملخص من المحتوى</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "flashcards" && (
                <div className="bg-background rounded-xl border p-6">
                  {isGenerating === "flashcards" ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                      <p className="text-muted-foreground">جاري إنشاء البطاقات...</p>
                    </div>
                  ) : generatedFlashcards.length > 0 ? (
                    <FlashcardViewer flashcards={generatedFlashcards} />
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>اضغط على زر بطاقات لإنشاء بطاقات مراجعة</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-background rounded-xl border p-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto text-primary/30 mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                اختر محتوى للبدء
              </h3>
              <p className="text-sm text-muted-foreground">
                اختر محتوى من القائمة للمحادثة أو المراجعة أو التدريب
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
