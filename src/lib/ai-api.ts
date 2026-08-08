import api from "./api";

export interface AIContent {
  _id: string;
  userId: string;
  type: "DOCUMENT" | "VIDEO_TRANSCRIPT";
  title: string;
  sourceType: "SESSION_RECORDING" | "UPLOAD" | "CURRICULUM";
  sourceId?: string;
  status: "PROCESSING" | "READY" | "ERROR";
  error?: string;
  metadata: {
    fileType?: string;
    fileSize?: number;
    pageCount?: number;
    duration?: number;
    language?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatHistory {
  _id: string;
  userId: string;
  contentId?: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedContent {
  _id: string;
  userId: string;
  contentId: string;
  type: "QUESTIONS" | "SUMMARY" | "FLASHCARDS" | "STUDY_NOTES";
  title: string;
  data: any;
  config: {
    questionCount?: number;
    difficulty?: string;
    language: string;
    questionType?: string;
  };
  createdAt: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

const aiApi = {
  getContents: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
  }): Promise<PaginatedResponse<AIContent[]>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.type) searchParams.set("type", params.type);

    const { data } = await api.get(`/ai/contents?${searchParams.toString()}`);
    return data;
  },

  getContent: async (id: string): Promise<ApiResponse<AIContent>> => {
    const { data } = await api.get(`/ai/contents/${id}`);
    return data;
  },

  deleteContent: async (id: string): Promise<ApiResponse<null>> => {
    const { data } = await api.delete(`/ai/contents/${id}`);
    return data;
  },

  processDocument: async (
    file: File,
    title?: string,
    onProgress?: (progress: number) => void
  ): Promise<
    ApiResponse<{
      id: string;
      title: string;
      type: string;
      status: string;
      tokenCount: number;
      pageCount?: number;
      createdAt: string;
    }>
  > => {
    const formData = new FormData();
    formData.append("file", file);
    if (title) formData.append("title", title);

    const { data } = await api.post("/ai/process-document", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120000,
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        }
      },
    });
    return data;
  },

  processVideo: async (
    sessionId?: string,
    videoPath?: string
  ): Promise<
    ApiResponse<{
      id: string;
      title: string;
      type: string;
      status: string;
      message: string;
      createdAt: string;
    }>
  > => {
    const { data } = await api.post("/ai/process-video", { sessionId, videoPath });
    return data;
  },

  startChat: async (
    contentId?: string,
    title?: string
  ): Promise<ApiResponse<{ chatId: string; title: string; createdAt: string }>> => {
    const { data } = await api.post("/ai/chat/start", { contentId, title });
    return data;
  },

  sendMessage: async (
    chatId: string,
    contentId: string | undefined,
    messages: ChatMessage[]
  ): Promise<ApiResponse<{ messageId: string }>> => {
    const { data } = await api.post("/ai/chat", { chatId, contentId, messages });
    return data;
  },

  getChatHistory: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<ChatHistory[]>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));

    const { data } = await api.get(`/ai/chat-history?${searchParams.toString()}`);
    return data;
  },

  getChat: async (id: string): Promise<ApiResponse<ChatHistory>> => {
    const { data } = await api.get(`/ai/chat-history/${id}`);
    return data;
  },

  deleteChat: async (id: string): Promise<ApiResponse<null>> => {
    const { data } = await api.delete(`/ai/chat-history/${id}`);
    return data;
  },

  generateQuestions: async (params: {
    contentId: string;
    count?: number;
    difficulty?: string;
    language?: string;
    questionType?: string;
  }): Promise<
    ApiResponse<{
      id: string;
      type: string;
      title: string;
      questions: any[];
      createdAt: string;
    }>
  > => {
    const { data } = await api.post("/ai/generate-questions", params);
    return data;
  },

  generateSummary: async (
    contentId: string,
    language?: string
  ): Promise<
    ApiResponse<{
      id: string;
      type: string;
      title: string;
      summary: string;
      createdAt: string;
    }>
  > => {
    const { data } = await api.post("/ai/generate-summary", { contentId, language });
    return data;
  },

  generateFlashcards: async (
    contentId: string,
    count?: number,
    language?: string
  ): Promise<
    ApiResponse<{
      id: string;
      type: string;
      title: string;
      flashcards: any[];
      createdAt: string;
    }>
  > => {
    const { data } = await api.post("/ai/generate-flashcards", { contentId, count, language });
    return data;
  },

  generateNotes: async (
    contentId: string,
    language?: string
  ): Promise<
    ApiResponse<{
      id: string;
      type: string;
      title: string;
      notes: string;
      createdAt: string;
    }>
  > => {
    const { data } = await api.post("/ai/generate-notes", { contentId, language });
    return data;
  },

  getGenerated: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    contentId?: string;
  }): Promise<PaginatedResponse<GeneratedContent[]>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.type) searchParams.set("type", params.type);
    if (params?.contentId) searchParams.set("contentId", params.contentId);

    const { data } = await api.get(`/ai/generated?${searchParams.toString()}`);
    return data;
  },

  getGeneratedById: async (id: string): Promise<ApiResponse<GeneratedContent>> => {
    const { data } = await api.get(`/ai/generated/${id}`);
    return data;
  },

  deleteGenerated: async (id: string): Promise<ApiResponse<null>> => {
    const { data } = await api.delete(`/ai/generated/${id}`);
    return data;
  },
};

export default aiApi;

export async function streamChat(
  contentId: string | undefined,
  messages: ChatMessage[],
  onChunk: (chunk: string) => void,
  onError?: (error: string) => void
): Promise<string> {
  const { createClient } = await import("./supabase/client");
  const supabase = createClient();
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  try {
    const response = await fetch(`${apiUrl}/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ contentId, messages }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullResponse = "";

    if (!reader) {
      throw new Error("No response body");
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value, { stream: true });
      const lines = text.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") break;

          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              fullResponse += parsed.content;
              onChunk(parsed.content);
            }
            if (parsed.error) {
              onError?.(parsed.error);
            }
          } catch {
            // Ignore parse errors for incomplete chunks
          }
        }
      }
    }

    return fullResponse;
  } catch (error: any) {
    onError?.(error.message || "Stream failed");
    throw error;
  }
}
