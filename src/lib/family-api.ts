import api from "./api";
import type { ParentChildInvitation, FamilyUserRef } from "@/types";

export interface FamilyInvitationsResponse {
  success: boolean;
  data: {
    incoming: ParentChildInvitation[];
    outgoing: ParentChildInvitation[];
  };
}

export interface FamilyConnectionsResponse {
  success: boolean;
  data: {
    connections: FamilyUserRef[];
    role: "PARENT" | "STUDENT";
  };
}

export interface SendInvitationPayload {
  targetEmail?: string;
  targetPhone?: string;
  message?: string;
}

const familyApi = {
  /**
   * Send a family-link invitation by email or phone.
   * Parent -> student, or student -> parent (role determined server-side).
   */
  sendInvitation: async (payload: SendInvitationPayload): Promise<ParentChildInvitation> => {
    const response = await api.post("/family/invitations", payload);
    return response.data.data;
  },

  /**
   * List incoming and outgoing family invitations.
   */
  getInvitations: async (): Promise<FamilyInvitationsResponse["data"]> => {
    const response = await api.get("/family/invitations");
    return response.data.data;
  },

  /**
   * List the current user's linked family connections.
   */
  getConnections: async (): Promise<FamilyConnectionsResponse["data"]> => {
    const response = await api.get("/family/connections");
    return response.data.data;
  },

  /**
   * Accept a pending family invitation.
   */
  acceptInvitation: async (invitationId: string): Promise<ParentChildInvitation> => {
    const response = await api.post(`/family/invitations/${invitationId}/accept`);
    return response.data.data;
  },

  /**
   * Reject a pending family invitation.
   */
  rejectInvitation: async (invitationId: string): Promise<ParentChildInvitation> => {
    const response = await api.post(`/family/invitations/${invitationId}/reject`);
    return response.data.data;
  },

  /**
   * Cancel a pending invitation (sender only).
   */
  cancelInvitation: async (invitationId: string): Promise<void> => {
    await api.delete(`/family/invitations/${invitationId}`);
  },

  /**
   * Unlink a child from the parent (parent only).
   */
  unlinkChild: async (studentId: string): Promise<void> => {
    await api.delete(`/family/connections/${studentId}`);
  },

  /**
   * Unlink the current student from their parent (student only).
   */
  unlinkParent: async (): Promise<void> => {
    await api.delete("/family/parent-link");
  },

  /**
   * Parent monitoring for a linked child: wallet balance, transactions, and
   * lessons paid for from the wallet with group + lesson info.
   */
  getChildMonitoring: async (
    childId: string
  ): Promise<{
    child: {
      id: string;
      name: string;
      avatarUrl: string | null;
      stage: string | null;
      grade: string | null;
    };
    balance: number;
    transactions: Array<{
      id: string;
      type: "PURCHASE" | "OPEN_LESSON";
      amount: number;
      notes: string;
      groupName: string | null;
      lessonTitle: string | null;
      createdAt: string;
    }>;
    paidLessons: Array<{
      id: string;
      groupId: string;
      groupName: string | null;
      subject: string | null;
      stage: string | null;
      grade: string | null;
      lessonId: string;
      lessonTitle: string | null;
      lessonType: string | null;
      scheduledAt: string | null;
      consumedAt: string;
    }>;
  }> => {
    const response = await api.get(`/family/children/${childId}/monitoring`);
    return response.data.data;
  },
};

export default familyApi;