import api from "./api";

// ==========================================
// TYPES
// ==========================================

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR" | "SYSTEM";
  category: "GENERAL" | "USER" | "PAYMENT" | "GROUP" | "SESSION" | "ATTENDANCE" | "SYSTEM" | "FAMILY";
  isRead: boolean;
  link?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSettings {
  newStudent: boolean;
  studentPayment: boolean;
  sessionReminder: boolean;
  sessionCancelled: boolean;
  groupUpdate: boolean;
  newSession: boolean;
  homeworkGraded: boolean;
  attendanceMarked: boolean;
  childAttendance: boolean;
  childProgress: boolean;
  paymentReminder: boolean;
  systemUpdates: boolean;
  weeklyReport: boolean;
  promotions: boolean;
}

export interface NotificationsResponse {
  success: boolean;
  data: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  unreadCount: number;
}

// ==========================================
// NOTIFICATION API SERVICE
// ==========================================

const notificationApi = {
  /**
   * Get notifications for the authenticated user
   */
  getNotifications: async (options: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  } = {}): Promise<NotificationsResponse> => {
    const params = new URLSearchParams();
    if (options.page) params.append("page", options.page.toString());
    if (options.limit) params.append("limit", options.limit.toString());
    if (options.unreadOnly) params.append("unreadOnly", "true");

    const response = await api.get(`/notifications?${params.toString()}`);
    return response.data;
  },

  /**
   * Get unread notification count
   */
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get("/notifications/unread-count");
    return response.data.unreadCount;
  },

  /**
   * Mark a notification as read
   */
  markAsRead: async (notificationId: string): Promise<boolean> => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data.success;
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<number> => {
    const response = await api.put("/notifications/read-all");
    return response.data.message;
  },

  /**
   * Delete a notification
   */
  deleteNotification: async (notificationId: string): Promise<boolean> => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data.success;
  },

  /**
   * Delete all notifications
   */
  deleteAllNotifications: async (): Promise<number> => {
    const response = await api.delete("/notifications");
    return response.data.message;
  },

  /**
   * Get notification settings
   */
  getSettings: async (): Promise<NotificationSettings> => {
    const response = await api.get("/notifications/settings");
    return response.data.data;
  },

  /**
   * Update notification settings
   */
  updateSettings: async (settings: Partial<NotificationSettings>): Promise<NotificationSettings> => {
    const response = await api.put("/notifications/settings", settings);
    return response.data.data;
  },
};

export default notificationApi;
