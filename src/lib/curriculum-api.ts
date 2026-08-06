import api from "./api";

// ==========================================
// TYPES
// ==========================================

export interface Term {
  _id?: string;
  name: string;
  code?: string;
  topics: string[];
}

export interface Subject {
  _id?: string;
  name: string;
  nameEn?: string;
  code: string;
  terms: Term[];
}

export interface Grade {
  _id?: string;
  name: string;
  nameEn?: string;
  level: number;
  subjects: Subject[];
}

export interface Stage {
  _id: string;
  name: string;
  nameEn?: string;
  key: "PRIMARY" | "PREPARATORY" | "SECONDARY";
  grades: Grade[];
  createdAt: string;
  updatedAt: string;
}

export interface CurriculumResponse {
  success: boolean;
  data: Stage[];
  statistics: {
    stages: number;
    grades: number;
    subjects: number;
    terms: number;
  };
}

export interface SingleStageResponse {
  success: boolean;
  data: Stage;
}

// ==========================================
// CURRICULUM API SERVICE
// ==========================================

const curriculumApi = {
  // ==========================================
  // FETCH OPERATIONS
  // ==========================================

  /**
   * Fetch the complete curriculum tree
   */
  getAll: async (): Promise<CurriculumResponse> => {
    const response = await api.get("/admin/curriculum");
    return response.data;
  },

  /**
   * Fetch a single stage by ID
   */
  getStageById: async (stageId: string): Promise<SingleStageResponse> => {
    const response = await api.get(`/admin/curriculum/stage/${stageId}`);
    return response.data;
  },

  /**
   * Fetch a stage by key (PRIMARY, PREPARATORY, SECONDARY)
   */
  getStageByKey: async (key: string): Promise<SingleStageResponse> => {
    const response = await api.get(`/admin/curriculum/stage/key/${key}`);
    return response.data;
  },

  // ==========================================
  // STAGE OPERATIONS
  // ==========================================

  /**
   * Create a new stage
   */
  createStage: async (data: {
    name: string;
    nameEn?: string;
    key: string;
  }): Promise<SingleStageResponse> => {
    const response = await api.post("/admin/curriculum/stage", data);
    return response.data;
  },

  /**
   * Update stage details
   */
  updateStage: async (
    stageId: string,
    data: { name?: string; nameEn?: string }
  ): Promise<SingleStageResponse> => {
    const response = await api.put(`/admin/curriculum/stage/${stageId}`, data);
    return response.data;
  },

  /**
   * Delete a stage (cascade)
   */
  deleteStage: async (
    stageId: string
  ): Promise<{ success: boolean; message: string; deleted: any }> => {
    const response = await api.delete(`/admin/curriculum/stage/${stageId}`);
    return response.data;
  },

  // ==========================================
  // GRADE OPERATIONS
  // ==========================================

  /**
   * Add a grade to a stage
   */
  addGrade: async (
    stageId: string,
    data: { name: string; nameEn?: string; level: number }
  ): Promise<SingleStageResponse> => {
    const response = await api.post(
      `/admin/curriculum/stage/${stageId}/grades`,
      data
    );
    return response.data;
  },

  /**
   * Update grade details
   */
  updateGrade: async (
    stageId: string,
    gradeLevel: number,
    data: { name?: string; nameEn?: string }
  ): Promise<SingleStageResponse> => {
    const response = await api.put(
      `/admin/curriculum/stage/${stageId}/grades/${gradeLevel}`,
      data
    );
    return response.data;
  },

  /**
   * Delete a grade (cascade)
   */
  deleteGrade: async (
    stageId: string,
    gradeLevel: number
  ): Promise<{ success: boolean; message: string; deleted: any }> => {
    const response = await api.delete(
      `/admin/curriculum/stage/${stageId}/grades/${gradeLevel}`
    );
    return response.data;
  },

  // ==========================================
  // SUBJECT OPERATIONS
  // ==========================================

  /**
   * Add a subject to a grade
   */
  addSubject: async (
    stageId: string,
    gradeLevel: number,
    data: { name: string; nameEn?: string; code: string; terms?: Term[] }
  ): Promise<SingleStageResponse> => {
    const response = await api.post(
      `/admin/curriculum/stage/${stageId}/grades/${gradeLevel}/subjects`,
      data
    );
    return response.data;
  },

  /**
   * Update subject details
   */
  updateSubject: async (
    stageId: string,
    gradeLevel: number,
    subjectCode: string,
    data: { name?: string; nameEn?: string }
  ): Promise<SingleStageResponse> => {
    const response = await api.put(
      `/admin/curriculum/stage/${stageId}/grades/${gradeLevel}/subjects/${subjectCode}`,
      data
    );
    return response.data;
  },

  /**
   * Delete a subject (cascade)
   */
  deleteSubject: async (
    stageId: string,
    gradeLevel: number,
    subjectCode: string
  ): Promise<{ success: boolean; message: string; deleted: any }> => {
    const response = await api.delete(
      `/admin/curriculum/stage/${stageId}/grades/${gradeLevel}/subjects/${subjectCode}`
    );
    return response.data;
  },

  // ==========================================
  // TERM OPERATIONS
  // ==========================================

  /**
   * Add a term to a subject
   */
  addTerm: async (
    stageId: string,
    gradeLevel: number,
    subjectCode: string,
    data: { name: string; code?: string; topics?: string[] }
  ): Promise<SingleStageResponse> => {
    const response = await api.post(
      `/admin/curriculum/stage/${stageId}/grades/${gradeLevel}/subjects/${subjectCode}/terms`,
      data
    );
    return response.data;
  },

  /**
   * Update term details
   */
  updateTerm: async (
    stageId: string,
    gradeLevel: number,
    subjectCode: string,
    termCode: string,
    data: { name?: string; topics?: string[] }
  ): Promise<SingleStageResponse> => {
    const response = await api.put(
      `/admin/curriculum/stage/${stageId}/grades/${gradeLevel}/subjects/${subjectCode}/terms/${termCode}`,
      data
    );
    return response.data;
  },

  /**
   * Delete a term
   */
  deleteTerm: async (
    stageId: string,
    gradeLevel: number,
    subjectCode: string,
    termCode: string
  ): Promise<{ success: boolean; message: string; deleted: any }> => {
    const response = await api.delete(
      `/admin/curriculum/stage/${stageId}/grades/${gradeLevel}/subjects/${subjectCode}/terms/${termCode}`
    );
    return response.data;
  },

  // ==========================================
  // GENERIC CASCADE DELETE
  // ==========================================

  /**
   * Generic cascade delete
   * @param type - "stage" | "grade" | "subject"
   * @param id - For stage: MongoDB ObjectId
   *             For grade: "stageId:gradeLevel"
   *             For subject: "stageId:gradeLevel:subjectCode"
   */
  cascadeDelete: async (
    type: "stage" | "grade" | "subject",
    id: string
  ): Promise<{ success: boolean; message: string; deleted: any }> => {
    const response = await api.delete(`/admin/curriculum/${type}/${id}`);
    return response.data;
  },
};

export default curriculumApi;
