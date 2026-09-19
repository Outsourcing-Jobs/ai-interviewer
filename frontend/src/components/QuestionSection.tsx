import React from "react";
import { Volume2, VolumeX } from "lucide-react";

interface QuestionSectionProps {
    index: number;
    text: string;
    isSpeaking?: boolean;
    onToggleSpeak?: () => void;
}

const QuestionSection: React.FC<QuestionSectionProps> = ({ index, text, isSpeaking, onToggleSpeak }) => {
    return (
        <div className={`bg-white border shadow-xs p-8 sm:p-10 rounded-[2.5rem] mb-8 relative overflow-hidden group transition-all duration-500 ${isSpeaking ? 'border-teal-400 ring-4 ring-teal-500/10 shadow-md' : 'border-slate-200/80'}`}>
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none text-teal-600">
                <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5"><path d="M12 2v20M2 12h20M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/></svg>
            </div>
            
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <span className="bg-teal-50 border border-teal-200 text-teal-700 text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-2xs">
                    Câu hỏi Phỏng vấn #{index + 1}
                </span>

                {onToggleSpeak && (
                    <button
                        type="button"
                        onClick={onToggleSpeak}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${isSpeaking ? 'bg-teal-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                        title={isSpeaking ? "Dừng đọc" : "Nghe câu hỏi bằng giọng đọc AI"}
                    >
                        {isSpeaking ? (
                            <>
                                <VolumeX className="w-3.5 h-3.5" />
                                <span>Dừng đọc</span>
                            </>
                        ) : (
                            <>
                                <Volume2 className="w-3.5 h-3.5 text-teal-600" />
                                <span>Nghe câu hỏi</span>
                            </>
                        )}
                    </button>
                )}
            </div>

            <h2 className="text-lg sm:text-xl font-extrabold leading-relaxed mt-6 text-slate-900 tracking-tight max-w-4xl font-sans">
                {text}
            </h2>
        </div>
    );
};

export default QuestionSection;

