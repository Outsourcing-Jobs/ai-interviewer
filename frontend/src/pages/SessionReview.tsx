import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../app/store";
import { useParams, Link } from "react-router-dom";
import { getSessionById } from "../features/session/sessionSlice";
import type { Question } from "../types/session";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import SessionReviewStats from "../components/SessionReviewStats";
import FeedbackItem from "../components/FeedbackItem";
import { formatDuration } from "../utils/formatters";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SessionReview = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const { activeSession, isLoading } = useSelector((state: RootState) => state.session);

    useEffect(() => {
        if (sessionId) {
            dispatch(getSessionById(sessionId));
        }
    }, [sessionId, dispatch]);

    if (isLoading) return <div className="text-center py-32 font-black text-surface-500 animate-pulse uppercase tracking-[0.3em] text-[10px]">Đang tổng hợp báo cáo...</div>

    if (!activeSession || activeSession.status !== 'completed') {
        return (
            <div className="max-w-2xl mx-auto mt-20 p-12 bg-white border border-slate-200/80 shadow-2xl rounded-[3rem] text-center">
                <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-teal-100">
                    <span className="text-3xl">⌛</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight uppercase font-display">Đang xử lý kết quả</h2>
                <p className="text-slate-500 mb-10 font-bold text-xs uppercase tracking-widest leading-relaxed">
                    Hệ thống AI đang tổng hợp và phân tích dữ liệu bài làm của bạn.<br />Vui lòng kiểm tra lại sau ít phút.
                </p>
                <Link to="/" className="btn-primary inline-flex items-center gap-3">
                    Trở về Trang chủ
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                </Link>
            </div>
        );
    }

    const { overallScore, metrics, role, level, questions, startTime, endTime, company } = activeSession;
    const finalMetrics = metrics || {};

    const barData = {
        labels: (questions || []).map((_: unknown, i: number) => `Câu ${i + 1}`),
        datasets: [{
            label: 'Điểm chuyên môn',
            data: (questions || []).map((q: Question) => q.technicalScore || 0),
            backgroundColor: (questions || []).map((q: Question) => (q.technicalScore || 0) > 70 ? '#0d9488' : '#6366f1'),
            borderRadius: 6,
            hoverBackgroundColor: '#14b8a6',
        }],
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col gap-8">
                <div className="w-full">
                    <span className="text-teal-700 font-black uppercase tracking-[0.3rem] text-[10px] bg-teal-50 px-4 py-1.5 rounded-full border border-teal-200 shadow-2xs">Báo cáo đánh giá</span>
                    <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight mt-6 uppercase leading-[1.1] sm:leading-tight flex items-center gap-4 flex-wrap font-display">
                        {role} <span className="text-slate-400 font-bold block sm:inline whitespace-nowrap">/ {level}</span>
                        {company && company !== 'general' && (
                            <span className="text-sm bg-teal-50 text-teal-700 border border-teal-200 px-3 py-1 rounded-lg tracking-widest self-center mt-2 sm:mt-0 font-extrabold">
                                {company.toUpperCase()}
                            </span>
                        )}
                    </h1>
                </div>
                <div className="flex gap-4 shrink-0 flex-col sm:flex-row sm:justify-end">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-200 bg-white px-4 py-2 rounded-xl flex items-center justify-center whitespace-nowrap shadow-2xs">Mã buổi: {sessionId?.slice(-8)}</span>

                    <button onClick={() => window.print()} className="btn-secondary flex items-center justify-center gap-2 px-6 py-2.5 text-[10px] tracking-widest uppercase font-black print:hidden cursor-pointer whitespace-nowrap">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                        Xuất báo cáo PDF
                    </button>
                </div>
            </div>

            <SessionReviewStats
                overallScore={overallScore || 0}
                avgTechnical={finalMetrics.avgTechnical || 0}
                avgConfidence={finalMetrics.avgConfidence || 0}
                duration={formatDuration(startTime, endTime)}
            />

            <div className="bg-white border border-slate-200/80 rounded-3xl sm:rounded-[2.5rem] shadow-xs px-3 py-6 sm:p-10 relative group break-inside-avoid print:shadow-none">
                <div className="absolute top-0 right-0 p-5 sm:p-10 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity print:hidden hidden sm:block text-teal-600">
                    <svg className="w-32 h-32 sm:w-48 sm:h-48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5"><path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20V16" /></svg>
                </div>
                <h3 className="text-[10px] font-black text-slate-500 mb-6 sm:mb-10 uppercase tracking-[0.25rem] flex items-center gap-3">
                    <span className="w-1.5 h-4 bg-teal-600 rounded-full"></span>
                    Biểu đồ điểm số kỹ thuật
                </h3>
                <div className="relative w-full">
                    {/* Sticky Y-Axis Overlay */}
                    <div className="absolute left-0 top-0 bottom-4 w-[45px] z-10 bg-transparent border-r border-slate-200 overflow-hidden pointer-events-none">
                        <div
                            className="h-64 sm:h-80"
                            style={{ width: `${Math.max(100, (questions?.length || 0) * 40)}px` }}
                        >
                            <Bar data={{
                                ...barData,
                                datasets: barData.datasets.map(ds => ({
                                    ...ds,
                                    backgroundColor: 'transparent',
                                    hoverBackgroundColor: 'transparent'
                                }))
                            }} options={{
                                maintainAspectRatio: false,
                                animation: false,
                                responsive: true,
                                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        max: 100,
                                        grid: { display: false },
                                        border: { display: false },
                                        ticks: { color: 'rgba(0,0,0,0.4)', font: { size: 10, weight: 'bold' } }
                                    },
                                    x: {
                                        grid: { display: false },
                                        border: { display: false },
                                        ticks: { color: 'transparent', font: { size: 10, weight: 'bold' } }
                                    }
                                }
                            }} />
                        </div>
                    </div>

                    {/* Scrolling Chart */}
                    <div className="w-full overflow-x-auto pb-4 custom-scrollbar" style={{ maskImage: 'linear-gradient(to right, transparent 0px, transparent 45px, black 45px, black 100%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0px, transparent 45px, black 45px, black 100%)' }}>
                        <div
                            className="h-64 sm:h-80 relative print:max-w-[180mm] print:mx-auto pl-[45px]"
                            style={{ minWidth: `${Math.max(100, (questions?.length || 0) * 40) + 45}px` }}
                        >
                            <Bar data={barData} options={{
                                maintainAspectRatio: false,
                                animation: false,
                                responsive: true,
                                plugins: { legend: { display: false } },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        max: 100,
                                        grid: { color: 'rgba(0,0,0,0.05)' },
                                        border: { display: false },
                                        ticks: { display: false }
                                    },
                                    x: {
                                        grid: { display: false },
                                        ticks: { color: 'rgba(0,0,0,0.6)', font: { size: 10, weight: 'bold' } }
                                    }
                                }
                            }} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-12">
                <div className="flex items-center gap-6 break-inside-avoid">
                    <h2 className="text-xl font-black uppercase tracking-widest text-slate-900 font-display">Chi tiết từng câu hỏi</h2>
                    <div className="h-px grow bg-slate-200"></div>
                </div>
                <div className="grid gap-10">
                    {(questions || []).map((q: Question, index: number) => (
                        <FeedbackItem key={index} question={q} index={index} />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default SessionReview;
