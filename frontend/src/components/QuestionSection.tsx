import React from "react";

interface QuestionSectionProps {
    index: number;
    text: string;
}

const QuestionSection: React.FC<QuestionSectionProps> = ({ index, text }) => {
    return (
        <div className="bg-white border border-slate-200/80 shadow-xs p-8 sm:p-10 rounded-[2.5rem] mb-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none text-teal-600">
                <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5"><path d="M12 2v20M2 12h20M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/></svg>
            </div>
            
            <span className="bg-teal-50 border border-teal-200 text-teal-700 text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-2xs">Câu hỏi Phỏng vấn #{index + 1}</span>
            <h2 className="text-lg sm:text-xl font-extrabold leading-relaxed mt-6 text-slate-900 tracking-tight max-w-4xl font-sans">
                {text}
            </h2>
        </div>
    );
};

export default QuestionSection;
