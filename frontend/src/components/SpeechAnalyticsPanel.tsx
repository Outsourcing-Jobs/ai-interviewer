import React from "react";
import { motion } from "framer-motion";
import type { SpeechMetrics } from "../types/session";

interface SpeechAnalyticsPanelProps {
    metrics?: SpeechMetrics;
}

const SpeechAnalyticsPanel: React.FC<SpeechAnalyticsPanelProps> = ({ metrics }) => {
    if (!metrics) return null;

    const getPaceColor = (rating: string) => {
        if (rating === "Good") return "text-emerald-400";
        if (rating === "Fast") return "text-amber-400";
        return "text-indigo-400";
    };

    const formatPaceRating = (rating: string) => {
        if (rating === "Good") return "Tốc độ vừa phải";
        if (rating === "Fast") return "Nói hơi nhanh";
        if (rating === "Slow") return "Nói hơi chậm";
        return rating || "Bình thường";
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 20 }} className="bg-white border border-slate-200/80 p-4 rounded-2xl border-l-4 border-l-teal-600 shadow-2xs">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tốc độ nói</p>
                <div className="flex items-end gap-2 mt-2">
                    <span className="text-2xl font-black text-slate-900 font-display">{Math.round(metrics.speakingPaceWpm || 0)}</span>
                    <span className="text-xs text-slate-500 pb-1 uppercase tracking-widest font-black">Từ/Phút</span>
                </div>
                <p className={`text-[10px] uppercase tracking-widest font-black mt-1 ${getPaceColor(metrics.paceRating || "")}`}>
                    {formatPaceRating(metrics.paceRating || "")}
                </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }} className="bg-white border border-slate-200/80 p-4 rounded-2xl border-l-4 border-l-rose-500 shadow-2xs">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Từ ngập ngừng / Từ đệm</p>
                <div className="flex items-end gap-2 mt-2">
                    <span className="text-2xl font-black text-slate-900 font-display">{metrics.fillerWordCount || 0}</span>
                    <span className="text-xs text-slate-500 pb-1 uppercase tracking-widest font-black">Từ</span>
                </div>
                <p className="text-[10px] uppercase tracking-widest font-black mt-1 text-slate-500">
                    {(metrics.fillerWordCount || 0) > 5 ? "Cần cải thiện" : "Rất tốt"}
                </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 20 }} className="bg-white border border-slate-200/80 p-4 rounded-2xl border-l-4 border-l-amber-500 shadow-2xs">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Số lần ngắt nghỉ</p>
                <div className="flex items-end gap-2 mt-2">
                    <span className="text-2xl font-black text-slate-900 font-display">{metrics.pauseCount || 0}</span>
                    <span className="text-xs text-slate-500 pb-1 uppercase tracking-widest font-black">Lần</span>
                </div>
                <p className="text-[10px] uppercase tracking-widest font-black mt-1 text-slate-500">
                    Tổng {Math.round((metrics.totalPauseDurationMs || 0) / 1000)}s
                </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, type: "spring", stiffness: 260, damping: 20 }} className="bg-white border border-slate-200/80 p-4 rounded-2xl border-l-4 border-l-emerald-500 shadow-2xs">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Độ phát âm rõ ràng</p>
                <div className="flex items-end gap-2 mt-2">
                    <span className="text-2xl font-black text-slate-900 font-display">{Math.min(100, Math.max(0, metrics.clarityScore || 0))}</span>
                    <span className="text-xs text-slate-500 pb-1 uppercase tracking-widest font-black">/100</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, Math.max(0, metrics.clarityScore || 0))}%` }}></div>
                </div>
            </motion.div>
        </div>
    );
};

export default SpeechAnalyticsPanel;
