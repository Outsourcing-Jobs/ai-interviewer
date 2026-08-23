import React, { useState } from "react";
import MicIcon from "./MicIcon";
import { Mic, Type } from "lucide-react";

interface VerbalRecorderProps {
    isRecording: boolean;
    recordingTime: number;
    hasAudio: boolean;
    isQuestionLocked: boolean;
    startRecording: () => void;
    stopRecording: () => void;
    deleteDraftAudio: () => void;
    textAnswer?: string;
    updateTextAnswer?: (text: string) => void;
    voiceMode?: string;
}

const VerbalRecorder: React.FC<VerbalRecorderProps> = ({
    isRecording,
    recordingTime,
    hasAudio,
    isQuestionLocked,
    startRecording,
    stopRecording,
    deleteDraftAudio,
    textAnswer = "",
    updateTextAnswer,
    voiceMode = "voice"
}) => {
    const [mode, setMode] = useState<"voice" | "text">(voiceMode === "text" ? "text" : "voice");

    return (
        <div className="bg-white border border-slate-200/80 shadow-xs p-6 sm:p-8 rounded-4xl flex flex-col items-center justify-center min-h-110 relative overflow-hidden group">
            {/* Visual focus element */}
            <div className={`absolute inset-0 bg-teal-50/50 transition-opacity duration-1000 ${isRecording ? 'opacity-100' : 'opacity-0'}`}></div>

            {/* Mode Selector Header */}
            <div className="relative z-10 w-full max-w-md flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-rose-500 animate-pulse' : 'bg-teal-600'}`}></span>
                    Phương thức trả lời
                </h3>

                <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
                    <button
                        type="button"
                        onClick={() => setMode("voice")}
                        disabled={isQuestionLocked || isRecording}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${mode === "voice" ? "bg-white text-teal-700 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
                    >
                        <Mic className="w-3.5 h-3.5" />
                        Thu âm Mic
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode("text")}
                        disabled={isQuestionLocked || isRecording}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${mode === "text" ? "bg-white text-teal-700 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
                    >
                        <Type className="w-3.5 h-3.5" />
                        Gõ văn bản
                    </button>
                </div>
            </div>

            {mode === "voice" ? (
                <>
                    {!isRecording && !hasAudio ? (
                        <button
                            onClick={startRecording}
                            disabled={isQuestionLocked}
                            className="w-28 h-28 bg-teal-600 hover:bg-teal-700 rounded-full flex items-center justify-center text-white shadow-lg shadow-teal-600/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-20 cursor-pointer relative z-10 group/btn my-6"
                        >
                            <div className="absolute inset-0 rounded-full border-4 border-white/30 scale-110 group-hover/btn:scale-125 transition-all duration-500"></div>
                            <MicIcon />
                        </button>
                    ) : isRecording ? (
                        <div className="flex flex-col items-center gap-6 relative z-10 my-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-rose-200 rounded-full blur-xl animate-pulse"></div>
                                <button
                                    onClick={stopRecording}
                                    className="w-28 h-28 bg-rose-500 hover:bg-rose-600 rounded-full flex items-center justify-center text-white relative shadow-xl active:scale-95 transition-all cursor-pointer"
                                >
                                    <div className="w-7 h-7 bg-white rounded-md shadow-inner"></div>
                                </button>
                            </div>
                            <div className="text-center space-y-1">
                                <span className="text-4xl font-black text-rose-600 font-mono tracking-tighter block">
                                    {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}
                                </span>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hệ thống đang thu âm...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center relative z-10 space-y-6 my-4">
                            <div className="w-28 h-28 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto shadow-2xs">
                                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                            </div>
                            <div className="space-y-3">
                                <h4 className="text-emerald-700 font-black uppercase tracking-[0.15em] text-sm">Đã ghi âm thành công</h4>
                                {!isQuestionLocked && (
                                    <button
                                        onClick={deleteDraftAudio}
                                        className="group flex items-center gap-2 mx-auto text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-600 transition-colors cursor-pointer"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                        Xóa & Thu âm lại
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="relative z-10 w-full max-w-3xl space-y-3">
                    <textarea
                        value={textAnswer}
                        onChange={(e) => updateTextAnswer?.(e.target.value)}
                        disabled={isQuestionLocked}
                        placeholder="Nhập chi tiết câu trả lời bài làm của bạn tại đây..."
                        rows={7}
                        className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 text-slate-800 text-sm leading-relaxed transition-all resize-none outline-none disabled:opacity-60 font-medium"
                    ></textarea>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                        <span>Chế độ gõ văn bản trực tiếp</span>
                        <span>{textAnswer.length} ký tự</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VerbalRecorder;
