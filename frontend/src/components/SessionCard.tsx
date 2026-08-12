import {
    Layout,
    Server,
    Cloud,
    BarChart3,
    Palette,
    Smartphone,
    Cpu,
    ShieldCheck,
    Gamepad2,
    Database,
    // eslint-disable-next-line no-shadow-restricted-names
    Infinity,
    Code2,
    Box,
    Atom,
    Hexagon,
    Terminal,
    Coffee,
    Workflow
} from "lucide-react";

import type { SessionCardProps } from "../types/components";

const SessionCard = ({ session, onClick, onDelete }: SessionCardProps) => {
    const isDeletable = session.status !== 'pending';

    const renderIcon = () => {
        const role = session.role || '';
        const size = 28;
        const className = "transition-transform group-hover:scale-110 duration-500";

        if (role.includes('Python')) return <Code2 size={size} className={className} />
        if (role.includes('Java')) return <Coffee size={size} className={className} />
        if (role.includes('C++') || role.includes('C#')) return <Terminal size={size} className={className} />
        if (role.includes('JavaScript') || role.includes('TypeScript')) return <Code2 size={size} className={className} />
        if (role.includes('React')) return <Atom size={size} className={className} />
        if (role.includes('Node')) return <Hexagon size={size} className={className} />
        if (role.includes('SQL') || role.includes('MongoDB') || role.includes('Database')) return <Database size={size} className={className} />
        if (role.includes('Docker')) return <Box size={size} className={className} />
        if (role.includes('Kubernetes')) return <Infinity size={size} className={className} />
        if (role.includes('AWS') || role.includes('Azure') || role.includes('Cloud')) return <Cloud size={size} className={className} />
        if (role.includes('Mobile') || role.includes('Android') || role.includes('iOS')) return <Smartphone size={size} className={className} />
        if (role.includes('Game')) return <Gamepad2 size={size} className={className} />
        if (role.includes('Security') || role.includes('Cyber')) return <ShieldCheck size={size} className={className} />
        if (role.includes('ML') || role.includes('Machine Learning') || role.includes('AI')) return <Cpu size={size} className={className} />
        if (role.includes('Data')) return <BarChart3 size={size} className={className} />
        if (role.includes('DevOps')) return <Infinity size={size} className={className} />
        if (role.includes('Frontend') || role.includes('Web')) return <Layout size={size} className={className} />
        if (role.includes('Backend')) return <Server size={size} className={className} />
        if (role.includes('Full Stack') || role.includes('MERN') || role.includes('MEAN')) return <Workflow size={size} className={className} />
        if (role.includes('Design') || role.includes('UI/UX')) return <Palette size={size} className={className} />

        return <Terminal size={size} className={className} />
    }

    const formatStatus = (status: string) => {
        if (status === "completed") return "Hoàn thành";
        if (status === "in-progress") return "Đang làm";
        if (status === "cancelled") return "Đã hủy";
        return status;
    };

    const statusColor = session.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : session.status === 'in-progress' ? 'bg-amber-50 text-amber-700 border-amber-200' : session.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-teal-50 text-teal-700 border-teal-200';

    const iconBg = session.status === 'completed' ? 'bg-teal-50 text-teal-700 border-teal-100' : session.status === 'cancelled' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-100 text-slate-700 border-slate-200';

    const scoreColor = session.status === 'completed' ? ((session.overallScore ?? 0) > 75 ? 'text-emerald-600' : 'text-amber-600') : session.status === 'cancelled' ? 'text-rose-500' : 'text-slate-400';

    return (
        <div
            onClick={() => onClick(session)}
            className="group bg-white border border-slate-200/80 rounded-3xl shadow-xs hover:shadow-xl hover:shadow-slate-200/60 hover:border-teal-500/40 p-6 flex flex-col items-stretch gap-6 transition-all duration-300 hover:-translate-y-1 active:scale-[0.99] cursor-pointer relative"
        >
            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none opacity-60"></div>

            <div className="flex items-center gap-4 relative z-10">
                <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center border shadow-2xs ${iconBg}`}>
                    {renderIcon()}
                </div>
                <div className="overflow-hidden grow">
                    <h3 className="font-black text-slate-900 text-lg truncate tracking-tight group-hover:text-teal-600 transition-colors font-display">
                        {session.role}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-black text-slate-500 mt-1 uppercase tracking-widest">
                        <span>{session.createdAt ? new Date(session.createdAt).toLocaleDateString() : 'N/A'}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className="text-slate-600 font-bold">
                            {session.level}
                        </span>
                        {session.company && session.company !== 'general' && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                <span className="text-teal-700 px-1.5 py-0.5 rounded-md border border-teal-200 bg-teal-50 font-bold">
                                    {session.company.toUpperCase()}
                                </span>
                            </>
                        )}
                    </div>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); if (isDeletable) onDelete(e, session._id) }}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer border border-transparent"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                </button>
            </div>

            <div className="flex items-center justify-between mt-1 pt-4 border-t border-slate-100 relative z-10">
                <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Đánh giá tổng quan</p>
                    <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                            <svg className="w-8 h-8 -rotate-90 transform" viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="15.9155" fill="none" className="stroke-slate-100" strokeWidth="4" />
                                <circle cx="18" cy="18" r="15.9155" fill="none" className={`stroke-current ${scoreColor} transition-all duration-1000 ease-out`} strokeWidth="4" strokeDasharray={`${session.status === 'completed' ? (session.overallScore || 0) : 0}, 100`} strokeLinecap="round" />
                            </svg>
                            <span className={`absolute text-[9px] font-black tracking-tighter ${scoreColor}`}>
                                {session.status === 'completed' ? Math.round(session.overallScore || 0) : '--'}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className={`text-base leading-none font-black ${scoreColor}`}>
                                {session.status === 'completed' ? session.overallScore?.toFixed(1) : '0.0'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${statusColor}`}>
                        {formatStatus(session.status)}
                    </span>
                    <div className="text-teal-600 font-black text-[10px] flex items-center gap-1 group-hover:gap-2 transition-all uppercase tracking-widest">
                        {session.status === 'completed' ? 'Xem kết quả' : session.status === 'cancelled' ? 'Đã hủy' : 'Tiếp tục'}
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SessionCard;
