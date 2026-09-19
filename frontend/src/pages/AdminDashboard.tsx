import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  X,
  User,
  Award,
  Flame,
  FileText,
  Video,
  CheckCircle2,
  Code2,
  Activity,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import adminApi, {
  type AdminStats,
  type AdminUserItem,
  type AdminUserDetail
} from "../services/adminApi";

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"users" | "sessions">("users");

  // Filtering states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // User Detail Modal States
  const [selectedUserDetail, setSelectedUserDetail] = useState<AdminUserDetail | null>(null);
  const [isUserModalLoading, setIsUserModalLoading] = useState<boolean>(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState<boolean>(false);

  // Session Detail Modal States
  const [selectedSessionDetail, setSelectedSessionDetail] = useState<any | null>(null);
  const [isSessionModalLoading, setIsSessionModalLoading] = useState<boolean>(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState<boolean>(false);
  const [expandedQuestionIdx, setExpandedQuestionIdx] = useState<number | null>(0);

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
      toast.error(error?.response?.data?.message || "Không thể tải dữ liệu bảng quản trị");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenUserDetail = async (userId: string) => {
    setIsUserModalOpen(true);
    setIsUserModalLoading(true);
    try {
      const detail = await adminApi.getUserDetail(userId);
      setSelectedUserDetail(detail);
    } catch (error: any) {
      console.error("Failed to fetch user detail:", error);
      toast.error(error?.response?.data?.message || "Không thể lấy thông tin chi tiết người dùng");
      setIsUserModalOpen(false);
    } finally {
      setIsUserModalLoading(false);
    }
  };

  const handleOpenSessionDetail = async (sessionId: string) => {
    setIsSessionModalOpen(true);
    setIsSessionModalLoading(true);
    setExpandedQuestionIdx(0);
    try {
      const res = await adminApi.getSessionDetail(sessionId);
      setSelectedSessionDetail(res.session);
    } catch (error: any) {
      console.error("Failed to fetch session detail:", error);
      toast.error(error?.response?.data?.message || "Không thể lấy chi tiết buổi phỏng vấn");
      setIsSessionModalOpen(false);
    } finally {
      setIsSessionModalLoading(false);
    }
  };

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
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, role: newRole } : u))
      );
      if (selectedUserDetail && selectedUserDetail.user._id === user._id) {
        setSelectedUserDetail({
          ...selectedUserDetail,
          user: { ...selectedUserDetail.user, role: newRole },
        });
      }
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
    if (status === "failed") return "Thất bại";
    if (status === "pending") return "Chờ xử lý";
    return status;
  };

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
          <Activity className="w-4 h-4 text-teal-600 animate-pulse" />
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
              <User className="w-5 h-5" />
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
              <Video className="w-5 h-5" />
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
              <FileText className="w-5 h-5" />
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
              <CheckCircle2 className="w-5 h-5" />
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
          <span>Nhật ký Phỏng vấn gần đây ({stats?.recentSessions?.length ?? 0})</span>
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
                        <tr
                          key={u._id}
                          className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                          onClick={() => handleOpenUserDetail(u._id)}
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-xs uppercase shadow-xs">
                                {u.name.substring(0, 2)}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 text-sm group-hover:text-teal-700 transition-colors">
                                  {u.name}
                                </div>
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
                          <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleOpenUserDetail(u._id)}
                                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-teal-700 transition-colors border border-slate-200"
                                title="Xem hồ sơ chi tiết"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

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
                            </div>
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
                      <th className="py-4 px-6 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60">
                    {!stats?.recentSessions || stats.recentSessions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                          Chưa có bài phỏng vấn nào được ghi nhận.
                        </td>
                      </tr>
                    ) : (
                      stats.recentSessions.map((s: any) => {
                        const userName = s.userId?.name || s.user?.name || "Người dùng ẩn danh";
                        const userEmail = s.userId?.email || s.user?.email || "N/A";
                        const score = s.overallScore;
                        const isScoreHigh = score !== undefined && score !== null && (score >= 80 || (score <= 10 && score >= 8));
                        const isScoreMed = score !== undefined && score !== null && (score >= 60 || (score <= 10 && score >= 6));

                        return (
                          <tr
                            key={s._id}
                            className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                            onClick={() => handleOpenSessionDetail(s._id)}
                          >
                            <td className="py-4 px-6">
                              <div className="font-bold text-slate-900 text-sm group-hover:text-teal-700 transition-colors">
                                {userName}
                              </div>
                              <div className="text-slate-500 text-[11px]">
                                {userEmail}
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
                              {score !== undefined && score !== null ? (
                                <span
                                  className={`px-2.5 py-1 rounded-xl text-xs font-black border ${
                                    isScoreHigh
                                      ? "bg-teal-50 text-teal-700 border-teal-200"
                                      : isScoreMed
                                      ? "bg-amber-50 text-amber-800 border-amber-200"
                                      : "bg-rose-50 text-rose-700 border-rose-200"
                                  }`}
                                >
                                  {score > 10 ? `${score}/100` : `${score}/10`}
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
                            <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => handleOpenSessionDetail(s._id)}
                                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 font-bold text-[11px] transition-colors border border-slate-200"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Chi tiết</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 1. USER DETAIL MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isUserModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden my-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50/50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
                    {selectedUserDetail?.user.name.substring(0, 2) || "U"}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 font-display">
                      Hồ sơ Ứng viên: {selectedUserDetail?.user.name || "Đang tải..."}
                    </h3>
                    <p className="text-slate-500 text-xs">{selectedUserDetail?.user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsUserModalOpen(false)}
                  className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {isUserModalLoading || !selectedUserDetail ? (
                  <div className="flex flex-col items-center justify-center py-16 space-y-3">
                    <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-400 text-xs">Đang tải dữ liệu hồ sơ...</p>
                  </div>
                ) : (
                  <>
                    {/* User Profile & Gamification Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                          Cấp độ & XP
                        </span>
                        <div className="text-lg font-black text-indigo-700 mt-1">
                          Lvl {selectedUserDetail.user.currentLevel ?? 1}
                        </div>
                        <span className="text-xs text-slate-500 font-mono font-bold">
                          {selectedUserDetail.user.xp ?? 0} XP
                        </span>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                          Chuỗi ngày Streak
                        </span>
                        <div className="text-lg font-black text-amber-600 mt-1 flex items-center space-x-1">
                          <Flame className="w-4 h-4 fill-amber-500" />
                          <span>{selectedUserDetail.user.streakDays ?? 0} ngày</span>
                        </div>
                        <span className="text-xs text-slate-500">
                          Kỷ lục: {selectedUserDetail.gamification?.longestStreak ?? 0} ngày
                        </span>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                          Bài Phỏng Vấn
                        </span>
                        <div className="text-lg font-black text-teal-700 mt-1">
                          {selectedUserDetail.stats.completedSessions} / {selectedUserDetail.stats.totalSessions}
                        </div>
                        <span className="text-xs text-slate-500">Đã hoàn thành</span>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                          CV Tải Lên
                        </span>
                        <div className="text-lg font-black text-emerald-700 mt-1">
                          {selectedUserDetail.stats.totalResumes}
                        </div>
                        <span className="text-xs text-slate-500">Hồ sơ đã phân tích</span>
                      </div>
                    </div>

                    {/* Unlocked Badges */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span>Huy hiệu đã đạt ({selectedUserDetail.gamification?.badges?.length ?? 0})</span>
                      </h4>
                      {selectedUserDetail.gamification?.badges?.length ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {selectedUserDetail.gamification.badges.map((b: { badgeId: string; earnedAt: string }, i: number) => (
                            <div key={i} className="flex items-center space-x-2.5 p-3 rounded-2xl bg-amber-50/60 border border-amber-200/80">
                              <span className="text-xl">🏆</span>
                              <div>
                                <div className="text-xs font-black text-amber-900 uppercase tracking-tight">
                                  {b.badgeId.replace(/_/g, " ")}
                                </div>
                                <div className="text-[10px] text-amber-700/80">
                                  {new Date(b.earnedAt).toLocaleDateString("vi-VN")}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Chưa đạt được huy hiệu nào.</p>
                      )}
                    </div>

                    {/* Recent Sessions for this user */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                        <Video className="w-4 h-4 text-indigo-500" />
                        <span>Lịch sử phỏng vấn gần đây ({selectedUserDetail.recentSessions?.length ?? 0})</span>
                      </h4>
                      {selectedUserDetail.recentSessions?.length ? (
                        <div className="border border-slate-200 rounded-2xl overflow-hidden">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[10px] uppercase">
                              <tr>
                                <th className="py-2.5 px-4">Vị trí</th>
                                <th className="py-2.5 px-4">Hình thức</th>
                                <th className="py-2.5 px-4">Điểm số</th>
                                <th className="py-2.5 px-4">Trạng thái</th>
                                <th className="py-2.5 px-4 text-right">Hành động</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {selectedUserDetail.recentSessions.map((s: any) => (
                                <tr key={s._id} className="hover:bg-slate-50">
                                  <td className="py-3 px-4 font-semibold text-slate-800">{s.role}</td>
                                  <td className="py-3 px-4 text-slate-500">{s.interviewType} ({s.level})</td>
                                  <td className="py-3 px-4 font-black text-teal-700">
                                    {s.overallScore !== undefined ? `${s.overallScore}/100` : "N/A"}
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className="capitalize font-bold text-slate-600 text-[10px]">
                                      {formatStatus(s.status)}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-right">
                                    <button
                                      onClick={() => {
                                        setIsUserModalOpen(false);
                                        handleOpenSessionDetail(s._id);
                                      }}
                                      className="text-teal-600 hover:text-teal-800 font-bold text-xs inline-flex items-center space-x-1"
                                    >
                                      <span>Xem</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Chưa thực hiện buổi phỏng vấn nào.</p>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div>
                  {selectedUserDetail && (
                    <button
                      onClick={() => handleToggleRole(selectedUserDetail.user)}
                      className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all border cursor-pointer ${
                        selectedUserDetail.user.role === "admin"
                          ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200"
                          : "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200"
                      }`}
                    >
                      {selectedUserDetail.user.role === "admin" ? "Hạ quyền Admin" : "Thăng quyền Admin"}
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 2. SESSION DETAIL MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isSessionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden my-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50/50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-black text-slate-900 font-display">
                        {selectedSessionDetail?.role || "Chi tiết Buổi phỏng vấn"}
                      </h3>
                      {selectedSessionDetail?.company && (
                        <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 text-[10px] font-black border border-indigo-200">
                          {selectedSessionDetail.company}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 text-xs font-medium">
                      Ứng viên: <span className="font-bold text-slate-800">{selectedSessionDetail?.user?.name || "N/A"}</span> ({selectedSessionDetail?.user?.email || "N/A"})
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsSessionModalOpen(false)}
                  className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {isSessionModalLoading || !selectedSessionDetail ? (
                  <div className="flex flex-col items-center justify-center py-16 space-y-3">
                    <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-400 text-xs">Đang tải chi tiết buổi phỏng vấn...</p>
                  </div>
                ) : (
                  <>
                    {/* Scores Overview Strip */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-teal-50/60 p-4 rounded-2xl border border-teal-200">
                        <span className="text-[10px] font-black text-teal-800 uppercase tracking-wider block">
                          Điểm Tổng Quan (Overall)
                        </span>
                        <div className="text-2xl font-black text-teal-700 mt-1 font-display">
                          {selectedSessionDetail.overallScore ?? 0} / 100
                        </div>
                        <span className="text-[11px] text-teal-600 font-medium">
                          Trạng thái: {formatStatus(selectedSessionDetail.status)}
                        </span>
                      </div>

                      <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-200">
                        <span className="text-[10px] font-black text-indigo-800 uppercase tracking-wider block">
                          Điểm Kỹ Thuật (Technical)
                        </span>
                        <div className="text-2xl font-black text-indigo-700 mt-1 font-display">
                          {selectedSessionDetail.metrics?.avgTechnical ?? 0} / 100
                        </div>
                        <span className="text-[11px] text-indigo-600 font-medium">Trung bình các câu hỏi</span>
                      </div>

                      <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200">
                        <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider block">
                          Điểm Tự Tin (Confidence)
                        </span>
                        <div className="text-2xl font-black text-amber-700 mt-1 font-display">
                          {selectedSessionDetail.metrics?.avgConfidence ?? 0} / 100
                        </div>
                        <span className="text-[11px] text-amber-600 font-medium">Phong thái và lưu loát</span>
                      </div>
                    </div>

                    {/* Questions Accordion */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                        <Layers className="w-4 h-4 text-teal-600" />
                        <span>Danh sách Câu hỏi & Đánh giá AI ({selectedSessionDetail.questions?.length ?? 0} câu)</span>
                      </h4>

                      <div className="space-y-3">
                        {selectedSessionDetail.questions?.map((q: any, idx: number) => {
                          const isExpanded = expandedQuestionIdx === idx;

                          return (
                            <div
                              key={idx}
                              className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs"
                            >
                              <div
                                onClick={() => setExpandedQuestionIdx(isExpanded ? null : idx)}
                                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                              >
                                <div className="flex items-center space-x-3 pr-4">
                                  <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center border border-slate-200">
                                    {idx + 1}
                                  </span>
                                  <div>
                                    <div className="flex items-center space-x-2">
                                      <span className="font-bold text-slate-900 text-sm line-clamp-1">
                                        {q.questionText}
                                      </span>
                                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold uppercase border border-slate-200">
                                        {q.questionType}
                                      </span>
                                    </div>
                                    <div className="text-slate-500 text-[11px] mt-0.5">
                                      Kỹ thuật: <span className="font-bold text-teal-700">{q.technicalScore ?? 0}/100</span> | Tự tin: <span className="font-bold text-indigo-700">{q.confidenceScore ?? 0}/100</span>
                                    </div>
                                  </div>
                                </div>

                                <button className="text-slate-400">
                                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                              </div>

                              {isExpanded && (
                                <div className="p-5 border-t border-slate-100 space-y-4 bg-slate-50/40 text-xs">
                                  {/* Question Full */}
                                  <div>
                                    <span className="font-black text-slate-500 uppercase tracking-wider text-[10px] block mb-1">
                                      Nội dung câu hỏi:
                                    </span>
                                    <p className="text-slate-900 font-medium">{q.questionText}</p>
                                  </div>

                                  {/* Candidate Answer */}
                                  {q.userAnswerText && (
                                    <div>
                                      <span className="font-black text-slate-500 uppercase tracking-wider text-[10px] block mb-1">
                                        Câu trả lời của ứng viên:
                                      </span>
                                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-800">
                                        {q.userAnswerText}
                                      </div>
                                    </div>
                                  )}

                                  {/* Code submitted if any */}
                                  {q.userSubmittedCode && (
                                    <div>
                                      <span className="font-black text-slate-500 uppercase tracking-wider text-[10px] block mb-1 flex items-center space-x-1">
                                        <Code2 className="w-3.5 h-3.5 text-indigo-500" />
                                        <span>Mã nguồn đã nộp:</span>
                                      </span>
                                      <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl overflow-x-auto text-[11px] font-mono">
                                        <code>{q.userSubmittedCode}</code>
                                      </pre>
                                    </div>
                                  )}

                                  {/* AI Feedback */}
                                  {q.aiFeedback && (
                                    <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-xl space-y-1">
                                      <span className="font-black text-teal-900 uppercase tracking-wider text-[10px] flex items-center space-x-1">
                                        <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                                        <span>Đánh giá của AI:</span>
                                      </span>
                                      <p className="text-teal-950 font-medium leading-relaxed">{q.aiFeedback}</p>
                                    </div>
                                  )}

                                  {/* Speech Metrics */}
                                  {q.speechMetrics && q.speechMetrics.speakingPaceWpm > 0 && (
                                    <div className="p-3 bg-slate-100/80 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                                      <div>
                                        <span className="text-slate-500 text-[10px] block">Tốc độ nói:</span>
                                        <span className="font-bold text-slate-800">{q.speechMetrics.speakingPaceWpm} WPM ({q.speechMetrics.paceRating})</span>
                                      </div>
                                      <div>
                                        <span className="text-slate-500 text-[10px] block">Từ đệm (Fillers):</span>
                                        <span className="font-bold text-slate-800">{q.speechMetrics.fillerWordCount} từ</span>
                                      </div>
                                      <div>
                                        <span className="text-slate-500 text-[10px] block">Số lần ngập ngừng:</span>
                                        <span className="font-bold text-slate-800">{q.speechMetrics.pauseCount} lần</span>
                                      </div>
                                      <div>
                                        <span className="text-slate-500 text-[10px] block">Độ rõ ràng:</span>
                                        <span className="font-bold text-teal-700">{q.speechMetrics.clarityScore}/100</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50/50 flex items-center justify-end space-x-3">
                <button
                  onClick={() => setIsSessionModalOpen(false)}
                  className="px-5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
