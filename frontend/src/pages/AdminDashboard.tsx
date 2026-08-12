import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import adminApi, { type AdminStats, type AdminUserItem } from "../services/adminApi";

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"users" | "sessions">("users");

  // Filtering states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsData, usersData] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers(),
      ]);
      setStats(statsData);
      setUsers(usersData);
    } catch (error: any) {
      console.error("Failed to load admin data:", error);
      toast.error(error?.response?.data?.message || "Failed to load admin dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleRole = async (user: AdminUserItem) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    const actionText = newRole === "admin" ? "cấp quyền Quản trị viên" : "gỡ quyền Quản trị viên";
    
    if (!window.confirm(`Bạn có chắc chắn muốn ${actionText} cho người dùng "${user.name}" không?`)) {
      return;
    }

    setUpdatingUserId(user._id);
    try {
      const res = await adminApi.updateUserRole(user._id, newRole);
      toast.success(res.message || `Đã cập nhật vai trò thành ${newRole === "admin" ? "Quản trị viên" : "Người dùng"}`);
      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, role: newRole } : u))
      );
    } catch (error: any) {
      console.error("Failed to update role:", error);
      toast.error(error?.response?.data?.message || "Không thể cập nhật vai trò người dùng");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const formatStatus = (status: string) => {
    if (status === "completed") return "Hoàn thành";
    if (status === "in-progress") return "Đang làm";
    if (status === "cancelled") return "Đã hủy";
    return status;
  };

  // Filtered user list
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 text-sm font-medium">Đang tải Bảng quản trị hệ thống...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 text-xl font-bold">
              👑
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
              Bảng Quản trị Hệ thống
            </h1>
          </div>
          <p className="text-slate-500 text-sm max-w-xl font-medium">
            Trung tâm quản lý người dùng, thống kê hệ thống và theo dõi hoạt động phỏng vấn theo thời gian thực.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="self-start md:self-auto inline-flex items-center space-x-2 btn-secondary px-4 py-2.5 text-xs font-bold transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Làm mới dữ liệu</span>
        </button>
      </div>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Users */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 hover:border-teal-500/30 transition-all shadow-xs space-y-3 relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
              Tổng ứng viên
            </span>
            <div className="p-2.5 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 font-display">{stats?.totalUsers ?? 0}</div>
          <p className="text-[11px] text-slate-500 font-medium">Tài khoản đã đăng ký hệ thống</p>
        </div>

        {/* Card 2: Total Sessions */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 hover:border-indigo-500/30 transition-all shadow-xs space-y-3 relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
              Tổng bài phỏng vấn
            </span>
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-200 group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 font-display">{stats?.totalSessions ?? 0}</div>
          <p className="text-[11px] text-slate-500 font-medium">Tổng số bài phỏng vấn đã được tạo</p>
        </div>

        {/* Card 3: Total Resumes */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 hover:border-emerald-500/30 transition-all shadow-xs space-y-3 relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
              CV đã phân tích
            </span>
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 font-display">{stats?.totalResumes ?? 0}</div>
          <p className="text-[11px] text-slate-500 font-medium">Báo cáo phân tích CV bởi AI</p>
        </div>

        {/* Card 4: Completed Interviews */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 hover:border-amber-500/30 transition-all shadow-xs space-y-3 relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
              Bài đã hoàn thành
            </span>
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 font-display">{stats?.completedSessions ?? 0}</div>
          <p className="text-[11px] text-slate-500 font-medium">Số bài phỏng vấn đã được chấm điểm</p>
        </div>
      </div>

      {/* Tabs Selection */}
      <div className="flex border-b border-slate-200 space-x-8">
        <button
          onClick={() => setActiveTab("users")}
          className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative cursor-pointer ${
            activeTab === "users" ? "text-teal-700" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <span>Quản lý Người dùng ({users.length})</span>
          {activeTab === "users" && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("sessions")}
          className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative cursor-pointer ${
            activeTab === "sessions" ? "text-teal-700" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <span>Nhật ký Phỏng vấn gần đây ({stats?.recentSessions.length ?? 0})</span>
          {activeTab === "sessions" && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-full" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "users" ? (
          <motion.div
            key="users-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên hoặc email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors shadow-2xs"
                />
                <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                <span className="text-xs text-slate-500 font-medium">Lọc theo vai trò:</span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="bg-white border border-slate-200 text-xs text-slate-800 font-bold rounded-2xl px-3 py-2 focus:outline-none focus:border-teal-500 shadow-2xs"
                >
                  <option value="all">Tất cả vai trò</option>
                  <option value="user">Chỉ Người dùng</option>
                  <option value="admin">Chỉ Admin</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-widest font-extrabold text-[10px]">
                      <th className="py-4 px-6">Người dùng</th>
                      <th className="py-4 px-6">Vị trí mong muốn</th>
                      <th className="py-4 px-6">Cấp độ & XP</th>
                      <th className="py-4 px-6">Vai trò</th>
                      <th className="py-4 px-6">Ngày tham gia</th>
                      <th className="py-4 px-6 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                          Không tìm thấy người dùng nào phù hợp.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-xs uppercase shadow-xs">
                                {u.name.substring(0, 2)}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 text-sm">{u.name}</div>
                                <div className="text-slate-500 text-[11px]">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-slate-700 font-medium">
                            {u.preferredRole || "Chưa cập nhật"}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-semibold text-[10px] border border-indigo-200">
                                Lvl {u.currentLevel ?? 1}
                              </span>
                              <span className="text-slate-500 text-[11px] font-mono font-bold">
                                {u.xp ?? 0} XP
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            {u.role === "admin" ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                                👑 Admin
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                                Ứng viên
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-slate-500 text-[11px] font-medium">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString("vi-VN") : "N/A"}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              disabled={updatingUserId === u._id}
                              onClick={() => handleToggleRole(u)}
                              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border cursor-pointer ${
                                u.role === "admin"
                                  ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200"
                                  : "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200"
                              } disabled:opacity-50`}
                            >
                              {updatingUserId === u._id
                                ? "Đang lưu..."
                                : u.role === "admin"
                                ? "Hạ quyền Admin"
                                : "Thăng quyền Admin"}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="sessions-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-widest font-extrabold text-[10px]">
                      <th className="py-4 px-6">Ứng viên</th>
                      <th className="py-4 px-6">Vị trí phỏng vấn</th>
                      <th className="py-4 px-6">Trình độ & Hình thức</th>
                      <th className="py-4 px-6">Điểm số</th>
                      <th className="py-4 px-6">Trạng thái</th>
                      <th className="py-4 px-6 text-right">Ngày tạo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60">
                    {!stats?.recentSessions || stats.recentSessions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                          Chưa có bài phỏng vấn nào được ghi nhận.
                        </td>
                      </tr>
                    ) : (
                      stats.recentSessions.map((s) => (
                        <tr key={s._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-4 px-6">
                            <div className="font-bold text-slate-900 text-sm">
                              {s.userId?.name || "Người dùng ẩn danh"}
                            </div>
                            <div className="text-slate-500 text-[11px]">
                              {s.userId?.email || "N/A"}
                            </div>
                          </td>
                          <td className="py-4 px-6 font-semibold text-teal-700">
                            {s.role}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                                {s.level}
                              </span>
                              <span className="text-slate-500 text-[11px] font-medium">
                                {s.interviewType}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            {s.overallScore !== undefined && s.overallScore !== null ? (
                              <span
                                className={`px-2.5 py-1 rounded-xl text-xs font-black border ${
                                  s.overallScore >= 8
                                    ? "bg-teal-50 text-teal-700 border-teal-200"
                                    : s.overallScore >= 6
                                    ? "bg-amber-50 text-amber-800 border-amber-200"
                                    : "bg-rose-50 text-rose-700 border-rose-200"
                                }`}
                              >
                                {s.overallScore} / 10
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">N/A</span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <span className="capitalize text-[11px] font-bold text-slate-700">
                              {formatStatus(s.status)}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right text-slate-500 text-[11px] font-medium">
                            {new Date(s.createdAt).toLocaleDateString("vi-VN", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
