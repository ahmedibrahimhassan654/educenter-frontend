"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Video,
  FileText,
  HelpCircle,
  Layers,
  FileEdit,
  Loader2,
  Sparkles,
  Clock,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIContent } from "@/lib/ai-api";
import aiApi from "@/lib/ai-api";
import AIChat from "@/components/ai/AIChat";
import ContentSelector from "@/components/ai/ContentSelector";
import QuestionGenerator from "@/components/ai/QuestionGenerator";
import FlashcardViewer from "@/components/ai/FlashcardViewer";

export default function TeacherAIToolsPage() {
  const router = useRouter();
  const [contents, setContents] = useState<AIContent[]>([]);
  const [selectedContent, setSelectedContent] = useState<AIContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("chat");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [generatedFlashcards, setGeneratedFlashcards] = useState<any[]>([]);
  const [generatedSummary, setGeneratedSummary] = useState("");
  const [generatedNotes, setGeneratedNotes] = useState("");
  const [isGenerating, setIsGenerating] = useState("");

  useEffect(() => {
    loadContents();
  }, []);

  const loadContents = async () => {
    try {
      setIsLoading(true);
      const response = await aiApi.getContents({ limit: 50 });
      setContents(response.data);
    } catch (error) {
      console.error("Error loading contents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) return;
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const title = uploadTitle || uploadFile.name;
      const response = await aiApi.processDocument(uploadFile, title, (progress) => {
        setUploadProgress(progress);
      });

      setContents((prev) => [response.data as any, ...prev]);
      setIsUploadOpen(false);
      setUploadFile(null);
      setUploadTitle("");
    } catch (error: any) {
      console.error("Error uploading document:", error);
      alert("حدث خطأ أثناء رفع الملف: " + (error.message || "حاول مرة أخرى"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المحتوى؟")) return;
    try {
      await aiApi.deleteContent(id);
      setContents((prev) => prev.filter((c) => c._id !== id));
      if (selectedContent?._id === id) setSelectedContent(null);
    } catch (error) {
      console.error("Error deleting content:", error);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!selectedContent) return;
    setIsGenerating("questions");
    try {
      const response = await aiApi.generateQuestions({
        contentId: selectedContent._id,
        count: 10,
        difficulty: "medium",
        language: "ar",
        questionType: "mixed",
      });
      setGeneratedQuestions(response.data.questions);
    } catch (error: any) {
      console.error("Error generating questions:", error);
      alert("حدث خطأ أثناء إنشاء الأسئلة");
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
      alert("حدث خطأ أثناء إنشاء الملخص");
    } finally {
      setIsGenerating("");
    }
  };

  const handleGenerateFlashcards = async () => {
    if (!selectedContent) return;
    setIsGenerating("flashcards");
    try {
      const response = await aiApi.generateFlashcards(selectedContent._id, 20, "ar");
      setGeneratedFlashcards(response.data.flashcards);
    } catch (error: any) {
      console.error("Error generating flashcards:", error);
      alert("حدث خطأ أثناء إنشاء البطاقات");
    } finally {
      setIsGenerating("");
    }
  };

  const handleGenerateNotes = async () => {
    if (!selectedContent) return;
    setIsGenerating("notes");
    try {
      const response = await aiApi.generateNotes(selectedContent._id, "ar");
      setGeneratedNotes(response.data.notes);
    } catch (error: any) {
      console.error("Error generating notes:", error);
      alert("حدث خطأ أثناء إنشاء الملاحظات");
    } finally {
      setIsGenerating("");
    }
  };

  const handleProcessVideo = async () => {
    const sessionId = prompt("أدخل معرف الجلسة (Session ID):");
    if (!sessionId) return;

    try {
      setIsGenerating("video");
      const response = await aiApi.processVideo(sessionId);
      alert(response.data.message);
      loadContents();
    } catch (error: any) {
      console.error("Error processing video:", error);
      alert("حدث خطأ أثناء معالجة الفيديو: " + (error.message || ""));
    } finally {
      setIsGenerating("");
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            أدوات الذكاء الاصطناعي
          </h1>
          <p className="text-muted-foreground mt-1">
            أنشئ أسئلة، ملخصات، بطاقات مراجعة من محتواك
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ContentSelector
            contents={contents}
            selectedId={selectedContent?._id}
            onSelect={setSelectedContent}
            onUpload={() => setIsUploadOpen(true)}
            onProcessVideo={handleProcessVideo}
            onDelete={handleDelete}
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
                  أسئلة
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
                    <Layers className="w-4 h-4 ml-1" />
                  )}
                  بطاقات
                </Button>
                <Button
                  variant={activeTab === "notes" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setActiveTab("notes");
                    if (!generatedNotes) handleGenerateNotes();
                  }}
                  disabled={isGenerating === "notes"}
                >
                  {isGenerating === "notes" ? (
                    <Loader2 className="w-4 h-4 ml-1 animate-spin" />
                  ) : (
                    <FileEdit className="w-4 h-4 ml-1" />
                  )}
                  ملاحظات
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
                      <p className="text-muted-foreground">جاري إنشاء الأسئلة...</p>
                    </div>
                  ) : generatedQuestions.length > 0 ? (
                    <QuestionGenerator questions={generatedQuestions} />
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>اضغط على زر الأسئلة لإنشاء أسئلة من المحتوى</p>
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
                      <p>اضغط على زر الملخص لإنشاء ملخص من المحتوى</p>
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
                      <Layers className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>اضغط على زر البطاقات لإنشاء بطاقات مراجعة</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "notes" && (
                <div className="bg-background rounded-xl border p-6">
                  {isGenerating === "notes" ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                      <p className="text-muted-foreground">جاري إنشاء الملاحظات...</p>
                    </div>
                  ) : generatedNotes ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {generatedNotes}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileEdit className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>اضغط على زر الملاحظات لإنشاء ملاحظات دراسية</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-background rounded-xl border p-12 text-center">
              <Sparkles className="w-16 h-16 mx-auto text-primary/30 mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                اختر محتوى للبدء
              </h3>
              <p className="text-sm text-muted-foreground">
                اختر ملفاً أو نص فيديو من القائمة الجانبية للمحادثة وإنشاء المحتوى
              </p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>رفع ملف جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">عنوان الملف (اختياري)</label>
              <Input
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="مثال: كتاب الرياضيات - الفصل الأول"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">الملف</label>
              <div className="border-2 border-dashed rounded-xl p-6 text-center">
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md,.doc,.docx"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="ai-file-upload"
                />
                <label htmlFor="ai-file-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {uploadFile ? uploadFile.name : "اضغط لاختيار ملف"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, صور, نصوص - حتى 10 ميجابايت
                  </p>
                </label>
              </div>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {uploadProgress < 100 ? `جاري الرفع... ${uploadProgress}%` : "جاري المعالجة..."}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={!uploadFile || isUploading}
                className="flex-1"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 ml-1 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 ml-1" />
                )}
                {isUploading ? "جاري الرفع..." : "رفع ومعالجة"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsUploadOpen(false)}
                disabled={isUploading}
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
