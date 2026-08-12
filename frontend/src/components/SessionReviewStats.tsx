import React from "react";

interface SessionReviewStatsProps {
    overallScore: number;
    avgTechnical: number;
    avgConfidence: number;
    duration: string;
}

const SessionReviewStats: React.FC<SessionReviewStatsProps> = ({
    overallScore,
    avgTechnical,
    avgConfidence,
    duration,
}) => {
    const stats = [
        { label: 'Overall Result', value: `${overallScore}%`, color: 'teal' },
        { label: 'Avg. Technical', value: `${avgTechnical}%`, color: 'teal' },
        { label: 'Avg Confidence', value: `${avgConfidence}%`, color: 'teal' },
        { label: 'Session Time', value: duration, color: 'teal' }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, i) => (
                <div key={i} className="bg-white border border-slate-200/80 rounded-3xl sm:rounded-[2rem] shadow-xs p-5 sm:p-8 border-l-4 border-l-teal-600 relative overflow-hidden group hover:border-l-teal-700 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-teal-50 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none"></div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-2 sm:mb-3">{stat.label}</p>
                    <p className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tighter transition-colors font-display">{stat.value}</p>
                </div>
            ))}
        </div>
    );
};

export default SessionReviewStats;
