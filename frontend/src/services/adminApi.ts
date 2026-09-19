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
    user?: {
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

export interface AdminUserDetail {
  user: AdminUserItem & { lastActiveDate?: string };
  gamification?: {
    currentStreak: number;
    longestStreak: number;
    xp: number;
    level: number;
    badges: Array<{ badgeId: string; earnedAt: string }>;
    achievements: Array<{ achievementId: string; progress: number; isCompleted: boolean }>;
  };
  stats: {
    totalSessions: number;
    completedSessions: number;
    totalResumes: number;
  };
  recentSessions: any[];
  recentResumes: any[];
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

  getUserDetail: async (userId: string): Promise<AdminUserDetail> => {
    const response = await apiClient.get<AdminUserDetail>(`/user/admin/users/${userId}`);
    return response.data;
  },

  getSessionDetail: async (sessionId: string): Promise<{ message: string; session: any }> => {
    const response = await apiClient.get<{ message: string; session: any }>(`/sessions/${sessionId}`);
    return response.data;
  },

  updateUserRole: async (userId: string, role: "user" | "admin"): Promise<{ message: string; user: AdminUserItem }> => {
    const response = await apiClient.patch<{ message: string; user: AdminUserItem }>(`/user/admin/users/${userId}/role`, { role });
    return response.data;
  },
};

export default adminApi;
