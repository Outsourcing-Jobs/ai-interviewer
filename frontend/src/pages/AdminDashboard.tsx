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
    const actionName = newRole === "admin" ? "Promote to Admin" : "Revoke Admin";
    
    if (!window.confirm(`Are you sure you want to ${actionName} for "${user.name}"?`)) {
      return;
    }

    setUpdatingUserId(user._id);
    try {
      const res = await adminApi.updateUserRole(user._id, newRole);
      toast.success(res.message || `Updated role to ${newRole}`);
      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, role: newRole } : u))
      );
    } catch (error: any) {
      console.error("Failed to update role:", error);
      toast.error(error?.response?.data?.message || "Failed to update user role");
    } finally {
      setUpdatingUserId(null);
    }
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
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-surface-400 text-sm font-medium">Loading System Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-surface-800/60 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-2 z-10">
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xl font-bold">
              👑
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              System Administration Portal
            </h1>
          </div>
          <p className="text-surface-400 text-sm max-w-xl">
            Real-time control center for user management, system statistics, and interview activity.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="self-start md:self-auto inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-surface-700/80 hover:bg-surface-700 text-surface-200 text-xs font-bold transition-all duration-300 border border-white/10 hover:border-white/20 active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Users */}
        <div className="bg-surface-800/40 backdrop-blur-md p-6 rounded-3xl border border-white/5 hover:border-primary-500/30 transition-all duration-300 shadow-xl space-y-3 relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-surface-400 uppercase tracking-widest">
              Total Candidates
            </span>
            <div className="p-2.5 rounded-2xl bg-primary-500/10 text-primary-400 border border-primary-500/20 group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-black text-white">{stats?.totalUsers ?? 0}</div>
          <p className="text-[11px] text-surface-400">Registered platform accounts</p>
        </div>

        {/* Card 2: Total Sessions */}
        <div className="bg-surface-800/40 backdrop-blur-md p-6 rounded-3xl border border-white/5 hover:border-indigo-500/30 transition-all duration-300 shadow-xl space-y-3 relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-surface-400 uppercase tracking-widest">
              Interview Sessions
            </span>
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-black text-white">{stats?.totalSessions ?? 0}</div>
          <p className="text-[11px] text-surface-400">Total mock interviews generated</p>
        </div>

        {/* Card 3: Total Resumes */}
        <div className="bg-surface-800/40 backdrop-blur-md p-6 rounded-3xl border border-white/5 hover:border-emerald-500/30 transition-all duration-300 shadow-xl space-y-3 relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-surface-400 uppercase tracking-widest">
              Resumes Analyzed
            </span>
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-black text-white">{stats?.totalResumes ?? 0}</div>
          <p className="text-[11px] text-surface-400">AI CV parsing & reports</p>
        </div>

        {/* Card 4: Completed Interviews */}
        <div className="bg-surface-800/40 backdrop-blur-md p-6 rounded-3xl border border-white/5 hover:border-amber-500/30 transition-all duration-300 shadow-xl space-y-3 relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-surface-400 uppercase tracking-widest">
              Completed Tests
            </span>
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-black text-white">{stats?.completedSessions ?? 0}</div>
          <p className="text-[11px] text-surface-400">Evaluated & scored sessions</p>
        </div>
      </div>

      {/* Tabs Selection */}
      <div className="flex border-b border-white/10 space-x-8">
        <button
          onClick={() => setActiveTab("users")}
          className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${
            activeTab === "users" ? "text-primary-400" : "text-surface-400 hover:text-white"
          }`}
        >
          <span>User Management ({users.length})</span>
          {activeTab === "users" && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-400 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("sessions")}
          className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${
            activeTab === "sessions" ? "text-primary-400" : "text-surface-400 hover:text-white"
          }`}
        >
          <span>Recent Interview Logs ({stats?.recentSessions.length ?? 0})</span>
          {activeTab === "sessions" && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-400 rounded-full" />
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
                  placeholder="Search user by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-800/80 border border-white/10 rounded-2xl text-xs text-white placeholder-surface-400 focus:outline-none focus:border-primary-500 transition-colors"
                />
                <svg className="w-4 h-4 text-surface-400 absolute left-3.5 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                <span className="text-xs text-surface-400 font-medium">Filter Role:</span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="bg-surface-800/80 border border-white/10 text-xs text-white rounded-2xl px-3 py-2 focus:outline-none focus:border-primary-500"
                >
                  <option value="all">All Roles</option>
                  <option value="user">Users Only</option>
                  <option value="admin">Admins Only</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-surface-800/40 backdrop-blur-xl rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-surface-800/80 text-surface-400 uppercase tracking-widest font-extrabold text-[10px]">
                      <th className="py-4 px-6">User</th>
                      <th className="py-4 px-6">Preferred Role</th>
                      <th className="py-4 px-6">Level & XP</th>
                      <th className="py-4 px-6">Role</th>
                      <th className="py-4 px-6">Joined Date</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-surface-400 text-xs">
                          No users found matching filter.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u._id} className="hover:bg-surface-700/30 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs uppercase shadow-md">
                                {u.name.substring(0, 2)}
                              </div>
                              <div>
                                <div className="font-bold text-white text-sm">{u.name}</div>
                                <div className="text-surface-400 text-[11px]">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-surface-300 font-medium">
                            {u.preferredRole || "N/A"}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 font-semibold text-[10px] border border-indigo-500/30">
                                Lvl {u.currentLevel ?? 1}
                              </span>
                              <span className="text-surface-400 text-[11px] font-mono">
                                {u.xp ?? 0} XP
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            {u.role === "admin" ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                👑 Admin
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-surface-700 text-surface-300 border border-white/5">
                                Candidate
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-surface-400 text-[11px]">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "N/A"}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              disabled={updatingUserId === u._id}
                              onClick={() => handleToggleRole(u)}
                              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border ${
                                u.role === "admin"
                                  ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30"
                                  : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30"
                              } disabled:opacity-50`}
                            >
                              {updatingUserId === u._id
                                ? "Updating..."
                                : u.role === "admin"
                                ? "Demote User"
                                : "Promote Admin"}
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
            <div className="bg-surface-800/40 backdrop-blur-xl rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-surface-800/80 text-surface-400 uppercase tracking-widest font-extrabold text-[10px]">
                      <th className="py-4 px-6">Candidate</th>
                      <th className="py-4 px-6">Interview Role</th>
                      <th className="py-4 px-6">Level & Type</th>
                      <th className="py-4 px-6">Score</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {!stats?.recentSessions || stats.recentSessions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-surface-400 text-xs">
                          No interview sessions logged yet.
                        </td>
                      </tr>
                    ) : (
                      stats.recentSessions.map((s) => (
                        <tr key={s._id} className="hover:bg-surface-700/30 transition-colors">
                          <td className="py-4 px-6">
                            <div className="font-bold text-white text-sm">
                              {s.userId?.name || "Anonymous User"}
                            </div>
                            <div className="text-surface-400 text-[11px]">
                              {s.userId?.email || "N/A"}
                            </div>
                          </td>
                          <td className="py-4 px-6 font-semibold text-primary-300">
                            {s.role}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-0.5 rounded-lg bg-surface-700 text-surface-200 text-[10px] font-bold">
                                {s.level}
                              </span>
                              <span className="text-surface-400 text-[11px]">
                                {s.interviewType}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            {s.overallScore !== undefined && s.overallScore !== null ? (
                              <span
                                className={`px-2.5 py-1 rounded-xl text-xs font-black border ${
                                  s.overallScore >= 8
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                    : s.overallScore >= 6
                                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                    : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                                }`}
                              >
                                {s.overallScore} / 10
                              </span>
                            ) : (
                              <span className="text-surface-500 text-[11px]">N/A</span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <span className="capitalize text-[11px] font-bold text-surface-300">
                              {s.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right text-surface-400 text-[11px]">
                            {new Date(s.createdAt).toLocaleDateString("en-US", {
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
