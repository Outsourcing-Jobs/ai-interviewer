import apiClient from "./apiClient";

export interface AdminStats {
  totalUsers: number;
  totalSessions: number;
  totalResumes: number;
  completedSessions: number;
  recentSessions: Array<{
    _id: string;
    role: string;
    level: string;
    interviewType: string;
    overallScore?: number;
    status: string;
    createdAt: string;
    userId?: {
      _id: string;
      name: string;
      email: string;
    };
  }>;
}

export interface AdminUserItem {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  preferredRole?: string;
  xp?: number;
  currentLevel?: number;
  streakDays?: number;
  createdAt: string;
}

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    const response = await apiClient.get<AdminStats>("/user/admin/stats");
    return response.data;
  },

  getUsers: async (): Promise<AdminUserItem[]> => {
    const response = await apiClient.get<AdminUserItem[]>("/user/admin/users");
    return response.data;
  },

  updateUserRole: async (userId: string, role: "user" | "admin"): Promise<{ message: string; user: AdminUserItem }> => {
    const response = await apiClient.patch<{ message: string; user: AdminUserItem }>(`/user/admin/users/${userId}/role`, { role });
    return response.data;
  },
};

export default adminApi;
