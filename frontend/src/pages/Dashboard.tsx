import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { createSession, deleteSession, getSession } from "../features/session/sessionSlice"
import type { RootState, AppDispatch } from "../app/store"
import { toast } from "react-toastify"
import SessionCard from "../components/SessionCard"
import SkeletonSessionCard from "../components/SkeletonSessionCard"
import ConfirmModal from "../components/ConfirmModal"
import type { Session } from "../types/session"
import { ROLES, LEVELS, TYPES, COUNTS } from "../constants/interview"


import NewInterviewForm from "../components/NewInterviewForm"
import type { FormChangeEvent } from "../types/forms"
import { ResumeHistoryWidget } from "../features/resume/components/ResumeHistoryWidget"
import { GamificationWidget } from "../features/gamification/components/GamificationWidget"
import { motion } from "framer-motion"

/**
 * Dashboard Component
 * 
 * The primary control center for the user. It allows users to:
 * - View a summary of their interview activity (Total, Completed, Pending).
 * - Initiate new AI-generated interview sessions via the NewInterviewForm.
 * - Access historical interview records and analytics.
 */
const Dashboard = () => {
    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()
    const { user } = useSelector((state: RootState) => state.auth)
    const { sessions, isLoading, isGenerating, isError, message, pagination, stats } = useSelector((state: RootState) => state.session)
    const isProcessing = isGenerating || isLoading;
    const [formData, setFormData] = useState({
        role: user?.preferredRole || ROLES[0],
        level: LEVELS[0],
        interviewType: TYPES[1].value,
        count: COUNTS[0],
        company: "general",
        companyTrack: "general",
        resumeId: "",
    })

    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        sessionId: '',
    })

    useEffect(() => {
        dispatch(getSession())
    }, [dispatch]);

    useEffect(() => {
        if (isError && message) {
            toast.error(message);
        }
    }, [isError, message, dispatch]);

    const onChange = (e: FormChangeEvent) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault();
        dispatch(createSession(formData));
    };

    const viewSession = (session: Session) => {
        if (session.status === 'completed') {
            navigate(`/review/${session._id}`)
        } else if (session.status === 'in-progress') {
            navigate(`/interview/${session._id}`)
        } else {
            toast.info("Session not ready yet")
        }
    }

    const handleDelete = (e: React.MouseEvent, sessionId: string) => {
        e.stopPropagation()
        setModalConfig({
            isOpen: true,
            sessionId: sessionId,
        })
    }

    const confirmDelete = () => {
        if (modalConfig.sessionId) {
            dispatch(deleteSession(modalConfig.sessionId));
            toast.success("Session deleted successfully");
            setModalConfig({ isOpen: false, sessionId: '' });
        }
    }

    const loadMore = () => {
        if (pagination && pagination.currentPage < pagination.totalPages) {
            dispatch(getSession({ page: pagination.currentPage + 1 }));
        }
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    // Calculate stats globally
    const totalSessions = stats?.totalSessions || 0;
    const completedSessions = stats?.completedSessions || 0;
    const activeSessions = stats?.activeSessions || 0;

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-16">
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 pb-4"
            >
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200 shadow-xs">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-600"></span>
                        </span>
                        <span className="text-sm font-bold text-teal-700">Hệ thống sẵn sàng</span>
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none font-display text-slate-900">
                        Xin chào, <span className="text-teal-600 pr-4">{user?.name?.split(' ')[0]}</span>
                    </h1>
                    <p className="text-slate-600 text-base sm:text-lg font-medium max-w-md leading-relaxed">
                        Luyện tập phỏng vấn AI thông minh. Nâng tầm kỹ năng ứng tuyển của bạn ngay hôm nay.
                    </p>
                </div>

                <div className="flex flex-wrap lg:flex-nowrap items-center gap-4 w-full lg:w-auto">
                    <div className="bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow px-6 py-5 rounded-3xl flex flex-col gap-1 flex-1 min-w-[140px]">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Tổng bài phỏng vấn</p>
                        <p className="text-3xl font-black text-slate-900 font-display">{totalSessions}</p>
                    </div>
                    <div className="bg-white border border-slate-200/80 border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow px-6 py-5 rounded-3xl flex flex-col gap-1 flex-1 min-w-[140px]">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Đã hoàn thành</p>
                        <p className="text-3xl font-black text-emerald-600 font-display">{completedSessions}</p>
                    </div>
                    {activeSessions > 0 && (
                        <div className="bg-white border border-slate-200/80 border-l-4 border-l-indigo-500 shadow-sm hover:shadow-md transition-shadow px-6 py-5 rounded-3xl flex flex-col gap-1 animate-pulse flex-1 min-w-[140px]">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Đang chờ</p>
                            <p className="text-3xl font-black text-indigo-600 font-display">{activeSessions}</p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* New Interview Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="relative group z-20"
            >
                <div className="absolute -inset-1 bg-linear-to-r from-teal-500/20 to-indigo-500/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
                <div className="relative">
                    <NewInterviewForm
                        formData={formData}
                        onChange={onChange}
                        onSubmit={onSubmit}
                        isProcessing={isProcessing}
                    />
                </div>
            </motion.div>

            {/* Gamification Widget */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="pt-4"
            >
                <div className="mb-8">
                    <GamificationWidget />
                </div>
            </motion.div>

            {/* Resume History Widget */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="pt-4"
            >
                <ResumeHistoryWidget />
            </motion.div>

            {/* Interview History Section */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-8 pb-12"
            >
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black flex items-center gap-4 text-slate-900 font-display">
                        <span className="p-3 bg-white border border-slate-200/80 shadow-xs rounded-2xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                        </span>
                        Lịch sử <span className="text-slate-400 font-bold">phỏng vấn</span>
                    </h2>
                    <div className="h-px grow mx-6 bg-slate-200/80 hidden sm:block"></div>
                </div>

                <div className="grid gap-8">
                    {isLoading && (!sessions || !Array.isArray(sessions) || sessions.length === 0) ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <SkeletonSessionCard key={i} />
                            ))}
                        </div>
                    ) : (
                        (!sessions || !Array.isArray(sessions) || sessions.length === 0) ? (
                            <motion.div
                                variants={itemVariants}
                                className="bg-white rounded-[2.5rem] py-20 text-center border border-dashed border-slate-300 shadow-xs group/empty"
                            >
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-200 group-hover/empty:scale-110 transition-transform duration-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><circle cx="12" cy="12" r="10" /><path d="M8 12h8" /><path d="M12 8v8" /></svg>
                                </div>
                                <h3 className="text-2xl font-black text-slate-800">Chưa có bài phỏng vấn nào</h3>
                                <p className="text-slate-500 mt-2 font-medium max-w-sm mx-auto text-sm">Tạo buổi phỏng vấn mới để bắt đầu lưu lịch sử rèn luyện.</p>
                            </motion.div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {sessions.map((session, index) => (
                                    <motion.div key={session._id || index} variants={itemVariants}>
                                        <SessionCard
                                            session={session}
                                            onClick={viewSession}
                                            onDelete={handleDelete}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        )
                    )}
                </div>

                {pagination && pagination.currentPage < pagination.totalPages && (
                    <div className="flex justify-center pt-8">
                        <button
                            onClick={loadMore}
                            disabled={isLoading}
                            className="btn-secondary px-8 py-3 text-[10px] font-black uppercase tracking-widest disabled:opacity-50 cursor-pointer"
                        >
                            {isLoading ? 'Đang tải...' : 'Tải thêm lịch sử'}
                        </button>
                    </div>
                )}
            </motion.div>

            <ConfirmModal
                isOpen={modalConfig.isOpen}
                title="Xóa buổi phỏng vấn?"
                message="Hành động này sẽ xóa vĩnh viễn buổi phỏng vấn khỏi lịch sử của bạn. Bạn có chắc chắn không?"
                confirmText="Xóa"
                cancelText="Hủy"
                onConfirm={confirmDelete}
                onCancel={() => setModalConfig({ isOpen: false, sessionId: '' })}
                isDanger={true}
            />
        </div>
    );
}

export default Dashboard