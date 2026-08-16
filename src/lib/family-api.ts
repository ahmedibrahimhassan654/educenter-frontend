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
};

export default familyApi;