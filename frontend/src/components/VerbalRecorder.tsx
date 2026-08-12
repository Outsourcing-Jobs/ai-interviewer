import React from "react";
import MicIcon from "./MicIcon";

interface VerbalRecorderProps {
    isRecording: boolean;
    recordingTime: number;
    hasAudio: boolean;
    isQuestionLocked: boolean;
    startRecording: () => void;
    stopRecording: () => void;
    deleteDraftAudio: () => void;
}

const VerbalRecorder: React.FC<VerbalRecorderProps> = ({
    isRecording,
    recordingTime,
    hasAudio,
    isQuestionLocked,
    startRecording,
    stopRecording,
    deleteDraftAudio
}) => {
    return (
        <div className="bg-white border border-slate-200/80 shadow-xs p-8 rounded-4xl flex flex-col items-center justify-center min-h-110 relative overflow-hidden group">
            {/* Visual focus element */}
            <div className={`absolute inset-0 bg-teal-50/50 transition-opacity duration-1000 ${isRecording ? 'opacity-100' : 'opacity-0'}`}></div>
            
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-10 relative z-10 flex items-center gap-3">
                <span className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-rose-500 animate-pulse' : 'bg-teal-600'}`}></span>
                Thu âm Trả lời Thần tốc
            </h3>
            
            {!isRecording && !hasAudio ? (
                <button
                    onClick={startRecording}
                    disabled={isQuestionLocked}
                    className="w-28 h-28 bg-teal-600 hover:bg-teal-700 rounded-full flex items-center justify-center text-white shadow-lg shadow-teal-600/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-20 cursor-pointer relative z-10 group/btn"
                >
                    <div className="absolute inset-0 rounded-full border-4 border-white/30 scale-110 group-hover/btn:scale-125 transition-all duration-500"></div>
                    <MicIcon />
                </button>
            ) : isRecording ? (
                <div className="flex flex-col items-center gap-6 relative z-10">
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
                <div className="text-center relative z-10 space-y-6">
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
        </div>
    );
};

export default VerbalRecorder;
