"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Eye,
  GraduationCap,
  FileText,
  Mail,
  Phone,
  Calendar,
  X,
  File,
  Download,
} from "lucide-react";

interface TeacherVerification {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  verificationStatus: "PENDING" | "SUBMITTED" | "VERIFIED" | "REJECTED";
  verificationData?: {
    experience?: string;
    curriculum?: string[];
    bio?: string;
    documents?: string[];
  };
  verificationNotes?: string;
  verifiedAt?: string;
  createdAt: string;
}

const statusConfig = {
  PENDING: { label: "في الانتظار", color: "text-gray-500", bg: "bg-gray-500/10", icon: Clock },
  SUBMITTED: { label: "مقدم", color: "text-yellow-500", bg: "bg-yellow-500/10", icon: Clock },
  VERIFIED: { label: "محقق", color: "text-green-500", bg: "bg-green-500/10", icon: CheckCircle },
  REJECTED: { label: "مرفوض", color: "text-red-500", bg: "bg-red-500/10", icon: XCircle },
};

export default function AdminVerificationsPage() {
  const [teachers, setTeachers] = useState<TeacherVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("SUBMITTED");
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherVerification | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionNotes, setActionNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsLoaded, setDocsLoaded] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/verification/pending?status=${filter}`);
      setTeachers(response.data.data || []);
    } catch (error) {
      console.error("Error fetching verifications:", error);
      toast.error("حدث خطأ أثناء جلب طلبات التحقق");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [filter]);

  const handleApprove = async (teacherId: string) => {
    setProcessing(true);
    try {
      await api.put(`/verification/${teacherId}/approve`, { notes: actionNotes });
      toast.success("تم الموافقة على المعلم بنجاح");
      setShowModal(false);
      setSelectedTeacher(null);
      setActionNotes("");
      fetchTeachers();
    } catch (error: any) {
      const message = error.response?.data?.message || "حدث خطأ أثناء الموافقة";
      toast.error(message);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (teacherId: string) => {
    if (!actionNotes.trim()) {
      toast.error("يرجى إدخال سبب الرفض");
      return;
    }

    setProcessing(true);
    try {
      await api.put(`/verification/${teacherId}/reject`, { notes: actionNotes });
      toast.success("تم رفض المعلم");
      setShowModal(false);
      setSelectedTeacher(null);
      setActionNotes("");
      fetchTeachers();
    } catch (error: any) {
      const message = error.response?.data?.message || "حدث خطأ أثناء الرفض";
      toast.error(message);
    } finally {
      setProcessing(false);
    }
  };

  const openModal = async (teacher: TeacherVerification) => {
    setSelectedTeacher(teacher);
    setActionNotes("");
    setShowModal(true);
    setDocsLoaded(false);
    setImageErrors({});

    // The list response omits the (large) documents, so load them on demand
    let docs = teacher.verificationData?.documents;
    if (!docs) {
      setDocsLoading(true);
      try {
        const response = await api.get(`/verification/${teacher._id}/documents`);
        docs = response.data?.data?.documents || [];
        const loadedTeacher = {
          ...teacher,
          verificationData: { ...teacher.verificationData, documents: docs },
        };
        setSelectedTeacher(loadedTeacher);
      } catch {
        toast.error("تعذر تحميل المستندات");
        docs = [];
      } finally {
        setDocsLoading(false);
      }
    }

    // Preload document images
    if (docs && docs.length > 0) {
      const imageDocs = docs.filter((url) => url.match(/\.(jpg|jpeg|png|webp)$/i) || url.startsWith("data:image"));
      if (imageDocs.length > 0) {
        setDocsLoading(true);
        let loaded = 0;
        imageDocs.forEach((url) => {
          const img = new window.Image();
          img.onload = () => {
            loaded++;
            if (loaded === imageDocs.length) {
              setDocsLoading(false);
              setDocsLoaded(true);
            }
          };
          img.onerror = () => {
            loaded++;
            if (loaded === imageDocs.length) {
              setDocsLoading(false);
              setDocsLoaded(true);
            }
          };
          img.src = url;
        });
      } else {
        setDocsLoaded(true);
      }
    } else {
      setDocsLoaded(true);
    }
  };

  const filters = [
    { value: "SUBMITTED", label: "قيد المراجعة" },
    { value: "VERIFIED", label: "مقبول" },
    { value: "REJECTED", label: "مرفوض" },
    { value: "all", label: "الكل" },
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">طلبات التحقق</h2>
          <p className="text-base text-muted-foreground mt-1">
            مراجعة والموافقة على طلبات تسجيل المعلمين
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-lg text-base font-medium transition-colors ${
                filter === f.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-background border hover:bg-muted"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Teachers List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : teachers.length === 0 ? (
          <div className="text-center py-16 bg-card border rounded-xl">
            <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-bold mb-2">لا توجد طلبات</h3>
            <p className="text-muted-foreground">
              {filter === "SUBMITTED"
                ? "لا توجد طلبات جديدة للمراجعة"
                : "لا توجد طلبات بهذا الفلتر"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {teachers.map((teacher) => {
              const status = statusConfig[teacher.verificationStatus];
              const StatusIcon = status.icon;

              return (
                <div
                  key={teacher._id}
                  className="bg-card border rounded-xl p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {teacher.avatarUrl ? (
                        <img
                          src={teacher.avatarUrl}
                          alt={teacher.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <GraduationCap className="w-6 h-6 text-primary" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-bold">{teacher.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {teacher.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {teacher.phone}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.color}`}
                      >
                        <StatusIcon className="w-4 h-4" />
                        {status.label}
                      </span>
                      <button
                        onClick={() => openModal(teacher)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        مراجعة
                      </button>
                    </div>
                  </div>

                  {/* Preview Data */}
                  {teacher.verificationData && (
                    <div className="mt-4 pt-4 border-t grid md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">الخبرة</p>
                        <p className="text-sm line-clamp-2">
                          {teacher.verificationData.experience || "غير محدد"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">المناهج</p>
                        <div className="flex flex-wrap gap-1">
                          {teacher.verificationData.curriculum?.map((c) => (
                            <span
                              key={c}
                              className="px-2 py-0.5 bg-muted rounded text-xs"
                            >
                              {c}
                            </span>
                          )) || "غير محدد"}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">تاريخ الطلب</p>
                        <p className="text-sm">
                          {new Date(teacher.createdAt).toLocaleDateString("ar-EG")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showModal && selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowModal(false)}
          />
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-background rounded-2xl shadow-xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-background border-b p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">مراجعة طلب التحقق</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-muted rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Teacher Info */}
              <div className="flex items-center gap-4">
                {selectedTeacher.avatarUrl ? (
                  <img
                    src={selectedTeacher.avatarUrl}
                    alt={selectedTeacher.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <GraduationCap className="w-8 h-8 text-primary" />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold">{selectedTeacher.name}</h3>
                  <p className="text-muted-foreground">{selectedTeacher.email}</p>
                  <p className="text-muted-foreground">{selectedTeacher.phone}</p>
                </div>
              </div>

              {/* Verification Data */}
              {selectedTeacher.verificationData && (
                <>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      الخبرة التعليمية
                    </h4>
                    <p className="text-muted-foreground">
                      {selectedTeacher.verificationData.experience || "غير محدد"}
                    </p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      المناهج الدراسية
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTeacher.verificationData.curriculum?.map((c) => (
                        <span
                          key={c}
                          className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                        >
                          {c}
                        </span>
                      )) || "غير محدد"}
                    </div>
                  </div>

                  {selectedTeacher.verificationData.bio && (
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">نبذة عن المعلم</h4>
                      <p className="text-muted-foreground">
                        {selectedTeacher.verificationData.bio}
                      </p>
                    </div>
                  )}

                  {/* Documents */}
                  {selectedTeacher.verificationData.documents && selectedTeacher.verificationData.documents.length > 0 && (
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <File className="w-4 h-4" />
                        المستندات المرفقة
                      </h4>
                      {docsLoading ? (
                        <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span className="text-sm">جاري تحميل المستندات...</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {selectedTeacher.verificationData.documents.map((docUrl, index) => {
                            const docLabels = ["البطاقة الشخصية", "شهادة التخرج", "شهادة إضافية"];
                            const label = docLabels[index] || `مستند ${index + 1}`;
                            const isImage = docUrl.match(/\.(jpg|jpeg|png|webp)$/i) || docUrl.startsWith("data:image");
                            
                            return (
                              <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                {isImage ? (
                                  <div className="flex-1">
                                    <p className="text-sm font-medium mb-2">{label}</p>
                                    {imageErrors[index] ? (
                                      <div className="flex items-center gap-2 text-sm text-destructive py-2">
                                        <XCircle className="w-4 h-4" />
                                        <span>فشل تحميل الصورة</span>
                                      </div>
                                    ) : (
                                      <a href={docUrl} target="_blank" rel="noopener noreferrer">
                                        <img
                                          src={docUrl}
                                          alt={label}
                                          className="max-w-full h-auto max-h-48 rounded-lg border"
                                          onError={(e) => {
                                            setImageErrors((prev) => ({ ...prev, [index]: true }));
                                          }}
                                        />
                                      </a>
                                    )}
                                  </div>
                                ) : (
                                  <>
                                    <FileText className="w-5 h-5 text-blue-500" />
                                    <div className="flex-1">
                                      <p className="text-sm font-medium">{label}</p>
                                      <a
                                        href={docUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                                      >
                                        <Download className="w-3 h-3" />
                                        عرض / تحميل
                                      </a>
                                    </div>
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Previous Notes */}
              {selectedTeacher.verificationNotes && (
                <div className="border rounded-lg p-4 bg-muted/50">
                  <h4 className="font-semibold mb-2">ملاحظات سابقة</h4>
                  <p className="text-muted-foreground">{selectedTeacher.verificationNotes}</p>
                </div>
              )}

              {/* Action Notes */}
              {selectedTeacher.verificationStatus !== "VERIFIED" && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    ملاحظات {selectedTeacher.verificationStatus === "REJECTED" ? "(مطلوب للرفض)" : "(اختياري)"}
                  </label>
                  <textarea
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="أضف ملاحظاتك هنا..."
                    className="w-full min-h-[100px] px-4 py-3 border rounded-lg bg-background text-base focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {selectedTeacher.verificationStatus !== "VERIFIED" && (
              <div className="sticky bottom-0 bg-background border-t p-6 flex gap-3 justify-end">
                <button
                  onClick={() => handleReject(selectedTeacher._id)}
                  disabled={processing}
                  className="px-6 py-2.5 border border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-50"
                >
                  {processing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "رفض"
                  )}
                </button>
                <button
                  onClick={() => handleApprove(selectedTeacher._id)}
                  disabled={processing}
                  className="px-6 py-2.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  {processing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "موافقة"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
