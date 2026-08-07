"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { createClient } from "@/lib/supabase/client";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  GraduationCap,
  FileText,
  Upload,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  AlertCircle,
  BookOpen,
  Send,
  Trash2,
  File,
  Image as ImageIcon,
  Shield,
} from "lucide-react";

interface Curriculum {
  _id: string;
  name: string;
  grades: Array<{
    name: string;
    subjects: Array<{
      name: string;
      code: string;
    }>;
  }>;
}

interface UploadedDocument {
  url: string;
  name: string;
  type: string;
}

const documentTypes = [
  { id: "nationalId", label: "البطاقة الشخصية / الرقم القومي", required: true },
  { id: "graduationCert", label: "شهادة التخرج", required: true },
  { id: "otherCert", label: "شهادات أخرى (اختياري)", required: false },
];

export default function TeacherVerificationPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [curriculum, setCurriculum] = useState<Curriculum[]>([]);
  const [loadingCurriculum, setLoadingCurriculum] = useState(true);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  
  const [formData, setFormData] = useState({
    experience: "",
    selectedCurriculum: [] as string[],
    bio: "",
  });
  
  const [documents, setDocuments] = useState<Record<string, UploadedDocument>>({});

  const verificationStatus = user?.verificationStatus || "PENDING";

  useEffect(() => {
    const fetchCurriculum = async () => {
      try {
        const response = await api.get("/curriculum");
        setCurriculum(response.data);
      } catch (error) {
        console.error("Error fetching curriculum:", error);
      } finally {
        setLoadingCurriculum(false);
      }
    };

    fetchCurriculum();
  }, []);

  // Load existing verification data if resubmitting
  useEffect(() => {
    if (user?.verificationData) {
      setFormData({
        experience: user.verificationData.experience || "",
        selectedCurriculum: user.verificationData.curriculum || [],
        bio: user.verificationData.bio || "",
      });
      // Load existing documents
      if (user.verificationData.documents && user.verificationData.documents.length > 0) {
        const docs: Record<string, UploadedDocument> = {};
        user.verificationData.documents.forEach((url, index) => {
          const docType = documentTypes[index]?.id || `doc_${index}`;
          docs[docType] = {
            url,
            name: `document_${index + 1}`,
            type: "application/pdf",
          };
        });
        setDocuments(docs);
      }
    }
  }, [user]);

  // If teacher is already verified, redirect to dashboard
  useEffect(() => {
    if (verificationStatus === "VERIFIED") {
      router.push("/teacher");
    }
  }, [verificationStatus, router]);

  const handleCurriculumToggle = (curriculumName: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedCurriculum: prev.selectedCurriculum.includes(curriculumName)
        ? prev.selectedCurriculum.filter((c) => c !== curriculumName)
        : [...prev.selectedCurriculum, curriculumName],
    }));
  };

  const handleFileUpload = async (docType: string, file: File) => {
    // Validate file
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("يرجى اختيار ملف صورة أو PDF صالح");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الملف يجب أن يكون أقل من 5 ميجابايت");
      return;
    }

    setUploading((prev) => ({ ...prev, [docType]: true }));

    try {
      const supabase = createClient();
      const userId = (user as any)?._id || user?.id;
      
      const fileExt = file.name.split(".").pop();
      const fileName = `verification/${userId}/${docType}-${Date.now()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from("documents")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError && uploadError.message?.includes("Bucket not found")) {
        // Fallback: convert to base64
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          setDocuments((prev) => ({
            ...prev,
            [docType]: {
              url: dataUrl,
              name: file.name,
              type: file.type,
            },
          }));
          toast.success("تم رفع الملف بنجاح");
          setUploading((prev) => ({ ...prev, [docType]: false }));
        };
        reader.readAsDataURL(file);
        return;
      }

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("documents").getPublicUrl(fileName);
      
      setDocuments((prev) => ({
        ...prev,
        [docType]: {
          url: urlData.publicUrl,
          name: file.name,
          type: file.type,
        },
      }));

      toast.success("تم رفع الملف بنجاح");
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast.error(error.message || "حدث خطأ أثناء رفع الملف");
    } finally {
      setUploading((prev) => ({ ...prev, [docType]: false }));
    }
  };

  const removeDocument = (docType: string) => {
    setDocuments((prev) => {
      const newDocs = { ...prev };
      delete newDocs[docType];
      return newDocs;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.experience.trim()) {
      toast.error("يرجى إدخال خبراتك");
      return;
    }

    if (formData.selectedCurriculum.length === 0) {
      toast.error("يرجى اختيار منهج واحد على الأقل");
      return;
    }

    // Check required documents
    const requiredDocs = documentTypes.filter((d) => d.required);
    for (const doc of requiredDocs) {
      if (!documents[doc.id]) {
        toast.error(`يرجى رفع ${doc.label}`);
        return;
      }
    }

    setLoading(true);
    try {
      const documentUrls = Object.values(documents).map((doc) => doc.url);
      
      await api.post("/verification/submit", {
        experience: formData.experience,
        curriculum: formData.selectedCurriculum,
        bio: formData.bio,
        documents: documentUrls,
      });

      await refreshUser();
      toast.success("تم إرسال طلب التحقق بنجاح");
    } catch (error: any) {
      const message = error.response?.data?.message || "حدث خطأ أثناء إرسال الطلب";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Show status if already submitted
  if (verificationStatus === "SUBMITTED") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border rounded-2xl p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-yellow-500/10 flex items-center justify-center mb-6">
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
          <h1 className="text-2xl font-bold mb-3">طلبك قيد المراجعة</h1>
          <p className="text-muted-foreground mb-6">
            تم إرسال طلب التحقق الخاص بك بنجاح. سيقوم المدير بمراجعة طلبك والتواصل معك قريباً.
          </p>
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-muted-foreground">
              سيتم إعلامك عبر البريد الإلكتروني عند الموافقة على طلبك أو رفضه.
            </p>
          </div>
          <button
            onClick={() => router.push("/login")}
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            العودة لتسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  if (verificationStatus === "REJECTED") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border rounded-2xl p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center mb-6">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold mb-3">تم رفض طلبك</h1>
          <p className="text-muted-foreground mb-4">
            تم رفض طلب التحقق الخاص بك.
          </p>
          {user?.verificationNotes && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-4 mb-6 text-right">
              <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">سبب الرفض:</p>
              <p className="text-sm text-red-700 dark:text-red-400">{user.verificationNotes}</p>
            </div>
          )}
          <button
            onClick={() => {
              refreshUser();
              window.location.reload();
            }}
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            إعادة تقديم الطلب
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">تحقق من حسابك كمعلم</h1>
          <p className="text-muted-foreground">
            يرجى ملء المعلومات التالية وإرفاق المستندات المطلوبة لإكمال عملية التحقق
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Experience */}
          <div className="bg-card border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold">الخبرة التعليمية</h2>
                <p className="text-sm text-muted-foreground">أخبرنا عن خبراتك في التدريس</p>
              </div>
            </div>
            <textarea
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              placeholder="مثال: 5 سنوات خبرة في تدريس الفيزياء للمرحلة الثانوية..."
              className="w-full min-h-[120px] px-4 py-3 border rounded-lg bg-background text-base focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              required
            />
          </div>

          {/* Curriculum Selection */}
          <div className="bg-card border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold">المنهج الدراسي</h2>
                <p className="text-sm text-muted-foreground">اختر المناهج التي ستعمل بها</p>
              </div>
            </div>

            {loadingCurriculum ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : curriculum.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">لا توجد مناهج متاحة</p>
            ) : (
              <div className="space-y-4">
                {curriculum.map((stage) => (
                  <div key={stage._id} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">{stage.name}</h3>
                    <div className="space-y-2">
                      {stage.grades.map((grade) => (
                        <div key={grade.name}>
                          <p className="text-sm text-muted-foreground mb-2">{grade.name}</p>
                          <div className="flex flex-wrap gap-2">
                            {grade.subjects.map((subject) => {
                              const isSelected = formData.selectedCurriculum.includes(subject.name);
                              return (
                                <button
                                  key={subject.code}
                                  type="button"
                                  onClick={() => handleCurriculumToggle(subject.name)}
                                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                    isSelected
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted hover:bg-muted/80 text-foreground"
                                  }`}
                                >
                                  {subject.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {formData.selectedCurriculum.length > 0 && (
              <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                <p className="text-sm font-medium text-primary">
                  المختارة: {formData.selectedCurriculum.join("، ")}
                </p>
              </div>
            )}
          </div>

          {/* Documents Upload */}
          <div className="bg-card border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold">المستندات المطلوبة</h2>
                <p className="text-sm text-muted-foreground">يرجى رفع المستندات التالية للتحقق من هويتك</p>
              </div>
            </div>

            <div className="space-y-4">
              {documentTypes.map((docType) => {
                const isUploading = uploading[docType.id];
                const uploadedDoc = documents[docType.id];

                return (
                  <div key={docType.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium">
                          {docType.label}
                          {docType.required && <span className="text-red-500 mr-1">*</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          JPG, PNG, PDF - حد أقصى 5 ميجابايت
                        </p>
                      </div>
                    </div>

                    {uploadedDoc ? (
                      <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-green-800 dark:text-green-300 truncate">
                            {uploadedDoc.name}
                          </p>
                          <a
                            href={uploadedDoc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-green-600 dark:text-green-400 hover:underline"
                          >
                            عرض الملف
                          </a>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDocument(docType.id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="file"
                          ref={(el) => {
                            fileInputRefs.current[docType.id] = el;
                          }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(docType.id, file);
                            }
                          }}
                          accept="image/jpeg,image/png,image/webp,application/pdf"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRefs.current[docType.id]?.click()}
                          disabled={isUploading}
                          className="w-full flex items-center justify-center gap-3 p-4 border-2 border-dashed rounded-lg hover:bg-muted/50 transition-colors disabled:opacity-50"
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin text-primary" />
                              <span className="text-sm text-muted-foreground">جاري الرفع...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-5 h-5 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">اختر ملف للرفع</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bio */}
          <div className="bg-card border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold">نبذة عنك</h2>
                <p className="text-sm text-muted-foreground">أخبر الطلاب عن نفسك (اختياري)</p>
              </div>
            </div>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="مرحباً، أنا معلم فيزياء بخبرة 5 سنوات..."
              className="w-full min-h-[100px] px-4 py-3 border rounded-lg bg-background text-base focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">ملاحظة</p>
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                  بعد إرسال الطلب، سيتم مراجعته من قبل الإدارة. سيتم إعلامك عبر البريد الإلكتروني عند الموافقة على طلبك.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary text-primary-foreground rounded-xl text-lg font-bold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                جاري الإرسال...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                إرسال طلب التحقق
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
