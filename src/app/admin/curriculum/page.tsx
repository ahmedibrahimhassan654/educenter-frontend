"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import curriculumApi, { Stage, Grade, Subject, Term } from "@/lib/curriculum-api";
import { toast } from "sonner";
import {
  BookOpen,
  GraduationCap,
  School,
  ChevronDown,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Search,
  X,
  Layers,
  FileText,
} from "lucide-react";

export default function AdminCurriculumPage() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());
  const [expandedGrades, setExpandedGrades] = useState<Set<string>>(new Set());
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"stage" | "grade" | "subject" | "term" | null>(null);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [stageForm, setStageForm] = useState({ name: "", nameEn: "", key: "PRIMARY" });
  const [gradeForm, setGradeForm] = useState({ name: "", nameEn: "", level: 1 });
  const [subjectForm, setSubjectForm] = useState({ name: "", nameEn: "", code: "" });
  const [termForm, setTermForm] = useState({ name: "", code: "", topics: "" });

  const fetchCurriculum = async () => {
    try {
      setIsLoading(true);
      const response = await curriculumApi.getAll();
      if (response.success) setStages(response.data);
    } catch (error: any) {
      toast.error("خطأ في جلب البيانات");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurriculum();
  }, []);

  const toggleStage = (id: string) => {
    setExpandedStages((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleGrade = (key: string) => {
    setExpandedGrades((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleSubject = (key: string) => {
    setExpandedSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const openAddModal = (type: typeof modalType, stage?: Stage, grade?: Grade, subject?: Subject) => {
    setModalType(type);
    setModalMode("add");
    setSelectedStage(stage || null);
    setSelectedGrade(grade || null);
    setSelectedSubject(subject || null);
    if (type === "stage") setStageForm({ name: "", nameEn: "", key: "PRIMARY" });
    if (type === "grade") setGradeForm({ name: "", nameEn: "", level: (stage?.grades.length || 0) + 1 });
    if (type === "subject") setSubjectForm({ name: "", nameEn: "", code: "" });
    if (type === "term") setTermForm({ name: "", code: `TERM_${(subject?.terms.length || 0) + 1}`, topics: "" });
    setShowModal(true);
  };

  const openEditModal = (type: typeof modalType, stage: Stage, grade?: Grade, subject?: Subject, term?: Term) => {
    setModalType(type);
    setModalMode("edit");
    setSelectedStage(stage);
    setSelectedGrade(grade || null);
    setSelectedSubject(subject || null);
    setSelectedTerm(term || null);
    if (type === "stage") setStageForm({ name: stage.name, nameEn: stage.nameEn || "", key: stage.key });
    if (type === "grade" && grade) setGradeForm({ name: grade.name, nameEn: grade.nameEn || "", level: grade.level });
    if (type === "subject" && subject) setSubjectForm({ name: subject.name, nameEn: subject.nameEn || "", code: subject.code });
    if (type === "term" && term) setTermForm({ name: term.name, code: term.code || "", topics: term.topics.join(", ") });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (modalType === "stage") {
        if (!stageForm.name) { toast.error("اسم المرحلة مطلوب"); return; }
        if (modalMode === "add") {
          await curriculumApi.createStage(stageForm);
          toast.success("تم إنشاء المرحلة بنجاح");
        } else if (selectedStage) {
          await curriculumApi.updateStage(selectedStage._id, { name: stageForm.name, nameEn: stageForm.nameEn });
          toast.success("تم تحديث المرحلة بنجاح");
        }
      } else if (modalType === "grade" && selectedStage) {
        if (!gradeForm.name) { toast.error("اسم الصف مطلوب"); return; }
        if (modalMode === "add") {
          await curriculumApi.addGrade(selectedStage._id, gradeForm);
          toast.success("تم إضافة الصف بنجاح");
        } else if (selectedGrade) {
          await curriculumApi.updateGrade(selectedStage._id, selectedGrade.level, { name: gradeForm.name, nameEn: gradeForm.nameEn });
          toast.success("تم تحديث الصف بنجاح");
        }
      } else if (modalType === "subject" && selectedStage && selectedGrade) {
        if (!subjectForm.name || !subjectForm.code) { toast.error("اسم المادة والكود مطلوبان"); return; }
        if (modalMode === "add") {
          await curriculumApi.addSubject(selectedStage._id, selectedGrade.level, {
            ...subjectForm,
            terms: [
              { name: "الفصل الأول", code: "TERM_1", topics: [] },
              { name: "الفصل الثاني", code: "TERM_2", topics: [] },
            ],
          });
          toast.success("تم إضافة المادة بنجاح");
        } else if (selectedSubject) {
          await curriculumApi.updateSubject(selectedStage._id, selectedGrade.level, selectedSubject.code, { name: subjectForm.name, nameEn: subjectForm.nameEn });
          toast.success("تم تحديث المادة بنجاح");
        }
      } else if (modalType === "term" && selectedStage && selectedGrade && selectedSubject) {
        if (!termForm.name) { toast.error("اسم الترم مطلوب"); return; }
        const topicsArray = termForm.topics.split(",").map((t) => t.trim()).filter(Boolean);
        if (modalMode === "add") {
          await curriculumApi.addTerm(selectedStage._id, selectedGrade.level, selectedSubject.code, { name: termForm.name, code: termForm.code, topics: topicsArray });
          toast.success("تم إضافة الترم بنجاح");
        } else if (selectedTerm) {
          await curriculumApi.updateTerm(selectedStage._id, selectedGrade.level, selectedSubject.code, selectedTerm.code || "", { name: termForm.name, topics: topicsArray });
          toast.success("تم تحديث الترم بنجاح");
        }
      }
      await fetchCurriculum();
      closeModal();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "خطأ في الحفظ");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (type: string, stage: Stage, grade?: Grade, subject?: Subject, term?: Term) => {
    const messages: Record<string, string> = {
      stage: `هل أنت متأكد من حذف المرحلة "${stage.name}"؟`,
      grade: `هل أنت متأكد من حذف الصف "${grade?.name}"؟`,
      subject: `هل أنت متأكد من حذف المادة "${subject?.name}"؟`,
      term: `هل أنت متأكد من حذف الترم "${term?.name}"؟`,
    };
    if (!confirm(messages[type])) return;
    try {
      if (type === "stage") await curriculumApi.deleteStage(stage._id);
      else if (type === "grade" && grade) await curriculumApi.deleteGrade(stage._id, grade.level);
      else if (type === "subject" && grade && subject) await curriculumApi.deleteSubject(stage._id, grade.level, subject.code);
      else if (type === "term" && grade && subject && term) await curriculumApi.deleteTerm(stage._id, grade.level, subject.code, term.code || "");
      toast.success("تم الحذف بنجاح");
      await fetchCurriculum();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "خطأ في الحذف");
    }
  };

  const filteredStages = stages.filter((stage) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      stage.name.toLowerCase().includes(q) ||
      stage.nameEn?.toLowerCase().includes(q) ||
      stage.grades.some((g) => g.name.toLowerCase().includes(q) || g.subjects.some((s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)))
    );
  });

  const getStageIcon = (key: string) => {
    if (key === "PRIMARY") return <School className="w-5 h-5" />;
    if (key === "PREPARATORY") return <BookOpen className="w-5 h-5" />;
    return <GraduationCap className="w-5 h-5" />;
  };

  const getStageColor = (key: string) => {
    if (key === "PRIMARY") return "text-blue-500 bg-blue-500/10";
    if (key === "PREPARATORY") return "text-green-500 bg-green-500/10";
    return "text-purple-500 bg-purple-500/10";
  };

  if (isLoading) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">المنهاج الدراسي</h2>
            <p className="text-base text-muted-foreground mt-1">إدارة المراحل الدراسية والصفوف والمواد</p>
          </div>
          <Button onClick={() => openAddModal("stage")} className="gap-2">
            <Plus className="w-4 h-4" /> إضافة مرحلة
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center"><Layers className="w-5 h-5 text-blue-500" /></div>
              <div><p className="text-2xl font-bold">{stages.length}</p><p className="text-sm text-muted-foreground">مراحل</p></div>
            </div>
          </div>
          <div className="bg-card border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center"><School className="w-5 h-5 text-green-500" /></div>
              <div><p className="text-2xl font-bold">{stages.reduce((a, s) => a + s.grades.length, 0)}</p><p className="text-sm text-muted-foreground">صفوف</p></div>
            </div>
          </div>
          <div className="bg-card border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center"><BookOpen className="w-5 h-5 text-purple-500" /></div>
              <div><p className="text-2xl font-bold">{stages.reduce((a, s) => a + s.grades.reduce((b, g) => b + g.subjects.length, 0), 0)}</p><p className="text-sm text-muted-foreground">مواد</p></div>
            </div>
          </div>
          <div className="bg-card border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center"><FileText className="w-5 h-5 text-orange-500" /></div>
              <div><p className="text-2xl font-bold">{stages.reduce((a, s) => a + s.grades.reduce((b, g) => b + g.subjects.reduce((c, sub) => c + sub.terms.length, 0), 0), 0)}</p><p className="text-sm text-muted-foreground">ترمات</p></div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="بحث عن مرحلة، صف، أو مادة..." className="pr-10 h-12" />
          {searchQuery && <button onClick={() => setSearchQuery("")} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>}
        </div>

        {/* Curriculum Tree */}
        <div className="space-y-4">
          {filteredStages.map((stage) => (
            <div key={stage._id} className="bg-card border rounded-xl overflow-hidden">
              {/* Stage Header */}
              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => toggleStage(stage._id)}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${getStageColor(stage.key)} flex items-center justify-center`}>{getStageIcon(stage.key)}</div>
                  <div>
                    <h3 className="font-bold text-lg">{stage.name}</h3>
                    <p className="text-sm text-muted-foreground">{stage.nameEn} • {stage.grades.length} صفوف</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{stage.key}</Badge>
                  <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); openEditModal("stage", stage); }}><Edit2 className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon-sm" className="text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete("stage", stage); }}><Trash2 className="w-4 h-4" /></Button>
                  {expandedStages.has(stage._id) ? <ChevronDown className="w-5 h-5 text-muted-foreground" /> : <ChevronRight className="w-5 h-5 text-muted-foreground" />}
                </div>
              </div>

              {/* Grades */}
              {expandedStages.has(stage._id) && (
                <div className="border-t">
                  <div className="p-4 bg-muted/30">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">الصفوف الدراسية</h4>
                      <Button variant="outline" size="sm" onClick={() => openAddModal("grade", stage)} className="gap-1"><Plus className="w-3 h-3" /> إضافة صف</Button>
                    </div>
                    <div className="space-y-2">
                      {stage.grades.map((grade) => {
                        const gk = `${stage._id}-${grade.level}`;
                        return (
                          <div key={gk} className="bg-background rounded-lg border">
                            <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => toggleGrade(gk)}>
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center"><span className="text-sm font-bold text-primary">{grade.level}</span></div>
                                <div><p className="font-medium">{grade.name}</p><p className="text-xs text-muted-foreground">{grade.nameEn} • {grade.subjects.length} مواد</p></div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); openEditModal("grade", stage, grade); }}><Edit2 className="w-3 h-3" /></Button>
                                <Button variant="ghost" size="icon-xs" className="text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete("grade", stage, grade); }}><Trash2 className="w-3 h-3" /></Button>
                                {expandedGrades.has(gk) ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                              </div>
                            </div>

                            {/* Subjects */}
                            {expandedGrades.has(gk) && (
                              <div className="border-t p-3 bg-muted/20">
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="text-sm font-semibold">المواد</h5>
                                  <Button variant="ghost" size="xs" onClick={() => openAddModal("subject", stage, grade)} className="gap-1"><Plus className="w-3 h-3" /> إضافة مادة</Button>
                                </div>
                                <div className="space-y-2">
                                  {grade.subjects.map((subject) => {
                                    const sk = `${stage._id}-${grade.level}-${subject.code}`;
                                    return (
                                      <div key={sk} className="bg-muted/30 rounded-md border">
                                        <div className="flex items-center justify-between p-2 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => toggleSubject(sk)}>
                                          <div className="flex items-center gap-2">
                                            <BookOpen className="w-4 h-4 text-muted-foreground" />
                                            <div><p className="text-sm font-medium">{subject.name}</p><p className="text-xs text-muted-foreground">{subject.code} • {subject.terms.length} ترمات</p></div>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); openEditModal("subject", stage, grade, subject); }}><Edit2 className="w-3 h-3" /></Button>
                                            <Button variant="ghost" size="icon-xs" className="text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete("subject", stage, grade, subject); }}><Trash2 className="w-3 h-3" /></Button>
                                            {expandedSubjects.has(sk) ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                                          </div>
                                        </div>

                                        {/* Terms */}
                                        {expandedSubjects.has(sk) && (
                                          <div className="border-t p-2 bg-muted/40">
                                            <div className="flex items-center justify-between mb-2">
                                              <h6 className="text-xs font-semibold">الترمات</h6>
                                              <Button variant="ghost" size="xs" onClick={() => openAddModal("term", stage, grade, subject)} className="gap-1 text-xs"><Plus className="w-3 h-3" /> إضافة</Button>
                                            </div>
                                            <div className="space-y-1">
                                              {subject.terms.map((term) => (
                                                <div key={term._id || term.code} className="flex items-center justify-between p-2 bg-background rounded border">
                                                  <div>
                                                    <p className="text-sm font-medium">{term.name}</p>
                                                    {term.topics.length > 0 && <p className="text-xs text-muted-foreground">{term.topics.join(" • ")}</p>}
                                                  </div>
                                                  <div className="flex items-center gap-1">
                                                    <Button variant="ghost" size="icon-xs" onClick={() => openEditModal("term", stage, grade, subject, term)}><Edit2 className="w-3 h-3" /></Button>
                                                    <Button variant="ghost" size="icon-xs" className="text-destructive" onClick={() => handleDelete("term", stage, grade, subject, term)}><Trash2 className="w-3 h-3" /></Button>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
          <div className="relative bg-background rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">
                {modalMode === "add" ? "إضافة" : "تعديل"}{" "}
                {modalType === "stage" ? "مرحلة" : modalType === "grade" ? "صف" : modalType === "subject" ? "مادة" : "ترم"}
              </h3>
              <button onClick={closeModal} className="p-1 hover:bg-muted rounded"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              {modalType === "stage" && (
                <>
                  <div><Label>اسم المرحلة</Label><Input value={stageForm.name} onChange={(e) => setStageForm({ ...stageForm, name: e.target.value })} placeholder="مثال: المرحلة الابتدائية" /></div>
                  <div><Label>الاسم بالإنجليزية</Label><Input value={stageForm.nameEn} onChange={(e) => setStageForm({ ...stageForm, nameEn: e.target.value })} placeholder="Example: Primary Stage" /></div>
                  {modalMode === "add" && (
                    <div>
                      <Label>المفتاح</Label>
                      <select value={stageForm.key} onChange={(e) => setStageForm({ ...stageForm, key: e.target.value })} className="w-full h-10 px-3 rounded-lg border bg-background">
                        <option value="PRIMARY">PRIMARY</option>
                        <option value="PREPARATORY">PREPARATORY</option>
                        <option value="SECONDARY">SECONDARY</option>
                      </select>
                    </div>
                  )}
                </>
              )}
              {modalType === "grade" && (
                <>
                  <div><Label>اسم الصف</Label><Input value={gradeForm.name} onChange={(e) => setGradeForm({ ...gradeForm, name: e.target.value })} placeholder="مثال: الصف الأول الابتدائي" /></div>
                  <div><Label>الاسم بالإنجليزية</Label><Input value={gradeForm.nameEn} onChange={(e) => setGradeForm({ ...gradeForm, nameEn: e.target.value })} placeholder="Example: Primary 1" /></div>
                  {modalMode === "add" && <div><Label>المستوى</Label><Input type="number" value={gradeForm.level} onChange={(e) => setGradeForm({ ...gradeForm, level: parseInt(e.target.value) })} /></div>}
                </>
              )}
              {modalType === "subject" && (
                <>
                  <div><Label>اسم المادة</Label><Input value={subjectForm.name} onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })} placeholder="مثال: الرياضيات" /></div>
                  <div><Label>الاسم بالإنجليزية</Label><Input value={subjectForm.nameEn} onChange={(e) => setSubjectForm({ ...subjectForm, nameEn: e.target.value })} placeholder="Example: Mathematics" /></div>
                  <div><Label>الكود</Label><Input value={subjectForm.code} onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })} placeholder="مثال: MATH_PRIMARY_1" disabled={modalMode === "edit"} /></div>
                </>
              )}
              {modalType === "term" && (
                <>
                  <div><Label>اسم الترم</Label><Input value={termForm.name} onChange={(e) => setTermForm({ ...termForm, name: e.target.value })} placeholder="مثال: الفصل الأول" /></div>
                  <div><Label>الكود</Label><Input value={termForm.code} onChange={(e) => setTermForm({ ...termForm, code: e.target.value })} placeholder="مثال: TERM_1" /></div>
                  <div><Label>المواضيع (مفصولة بفاصلة)</Label><Input value={termForm.topics} onChange={(e) => setTermForm({ ...termForm, topics: e.target.value })} placeholder="مثال: الأعداد، الجمع، الطرح" /></div>
                </>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={closeModal} className="flex-1">إلغاء</Button>
              <Button onClick={handleSave} disabled={isSaving} className="flex-1">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
                {modalMode === "add" ? "إضافة" : "حفظ"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
