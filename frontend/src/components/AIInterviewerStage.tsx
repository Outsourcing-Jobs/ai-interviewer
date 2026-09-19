import React from "react";
import { Volume2, VolumeX, Play, Pause, Square, RotateCcw, Bot, Radio } from "lucide-react";

interface AIInterviewerStageProps {
    role: string;
    company?: string;
    isSpeaking: boolean;
    isPaused: boolean;
    autoSpeak: boolean;
    rate: number;
    isCandidateRecording: boolean;
    onPlay: () => void;
    onPause: () => void;
    onResume: () => void;
    onStop: () => void;
    onReplay: () => void;
    onToggleAutoSpeak: () => void;
    onChangeRate: (rate: number) => void;
}

const AIInterviewerStage: React.FC<AIInterviewerStageProps> = ({
    role,
    company,
    isSpeaking,
    isPaused,
    autoSpeak,
    rate,
    isCandidateRecording,
    onPlay,
    onPause,
    onResume,
    onStop,
    onReplay,
    onToggleAutoSpeak,
    onChangeRate,
}) => {
    return (
        <div className="bg-linear-to-r from-slate-900 via-slate-800 to-teal-950 text-white p-6 sm:p-7 rounded-[2rem] shadow-xl border border-slate-700/60 mb-8 relative overflow-hidden">
            {/* Background ambient lighting */}
            <div className={`absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${isSpeaking ? 'bg-teal-500/30 scale-125' : isCandidateRecording ? 'bg-rose-500/20 scale-110' : 'bg-indigo-500/15'}`} />
            <div className={`absolute -left-16 -bottom-16 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${isSpeaking ? 'bg-cyan-500/20' : 'bg-teal-500/10'}`} />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Left: AI Avatar & Status */}
                <div className="flex items-center gap-5 w-full md:w-auto">
                    {/* Glowing Avatar */}
                    <div className="relative shrink-0">
                        {isSpeaking && (
                            <>
                                <span className="absolute -inset-2 rounded-2xl bg-teal-400/40 animate-ping opacity-75"></span>
                                <span className="absolute -inset-1 rounded-2xl bg-teal-500/50 blur-sm animate-pulse"></span>
                            </>
                        )}
                        {isCandidateRecording && !isSpeaking && (
                            <span className="absolute -inset-1.5 rounded-2xl bg-rose-500/40 animate-pulse"></span>
                        )}
                        <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center border transition-all duration-300 ${isSpeaking ? 'bg-teal-600 border-teal-300 shadow-lg shadow-teal-500/30 text-white' : isCandidateRecording ? 'bg-rose-950 border-rose-500 text-rose-300' : 'bg-slate-800/90 border-slate-700 text-teal-400'}`}>
                            {isSpeaking ? (
                                <Radio className="w-8 h-8 animate-pulse" />
                            ) : (
                                <Bot className="w-8 h-8" />
                            )}
                        </div>
                    </div>

                    {/* AI Info & Speaking State */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2 font-display">
                                AI Interviewer
                                {company && company !== "general" && (
                                    <span className="text-[9px] bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-md font-mono font-bold tracking-widest uppercase">
                                        {company}
                                    </span>
                                )}
                            </h3>
                            <span className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-teal-400 animate-ping' : isCandidateRecording ? 'bg-rose-400 animate-pulse' : 'bg-emerald-400'}`} />
                        </div>
                        <p className="text-xs text-slate-300 font-medium">
                            {isSpeaking ? (
                                <span className="text-teal-300 font-bold flex items-center gap-2">
                                    <span className="inline-flex gap-0.5 items-end h-3">
                                        <span className="w-1 bg-teal-400 rounded-full h-full animate-[bounce_0.6s_infinite]"></span>
                                        <span className="w-1 bg-teal-400 rounded-full h-2 animate-[bounce_0.8s_infinite]"></span>
                                        <span className="w-1 bg-teal-400 rounded-full h-full animate-[bounce_0.5s_infinite]"></span>
                                    </span>
                                    Đang đọc câu hỏi phỏng vấn...
                                </span>
                            ) : isPaused ? (
                                <span className="text-amber-300 font-bold">Đã tạm dừng giọng đọc</span>
                            ) : isCandidateRecording ? (
                                <span className="text-rose-300 font-bold">Đang lắng nghe câu trả lời của bạn...</span>
                            ) : (
                                <span className="text-slate-400">Người phỏng vấn {role} • Giọng nói tương tác</span>
                            )}
                        </p>
                    </div>
                </div>

                {/* Right: Audio Controls Toolbar */}
                <div className="flex flex-wrap items-center justify-end gap-3 w-full md:w-auto">
                    {/* Voice speed selector */}
                    <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/80 text-xs">
                        {[0.8, 1.0, 1.2].map((r) => (
                            <button
                                key={r}
                                onClick={() => onChangeRate(r)}
                                className={`px-2.5 py-1 rounded-lg font-bold text-[10px] tracking-wider transition-all cursor-pointer ${rate === r ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
                                title={`Tốc độ đọc: ${r}x`}
                            >
                                {r}x
                            </button>
                        ))}
                    </div>

                    {/* Auto-speak toggle */}
                    <button
                        onClick={onToggleAutoSpeak}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold tracking-wide transition-all cursor-pointer ${autoSpeak ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 hover:bg-teal-500/30' : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'}`}
                        title={autoSpeak ? "Tắt tự động đọc câu hỏi" : "Bật tự động đọc khi chuyển câu hỏi"}
                    >
                        {autoSpeak ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">Tự động đọc</span>
                    </button>

                    {/* Play / Pause / Stop / Replay Voice Controls */}
                    {isSpeaking ? (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onPause}
                                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 text-xs font-black uppercase tracking-wider cursor-pointer transition-all"
                            >
                                <Pause className="w-3.5 h-3.5 fill-current" />
                                Tạm dừng
                            </button>
                            <button
                                onClick={onStop}
                                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 text-xs font-black uppercase tracking-wider cursor-pointer transition-all"
                                title="Dừng đọc hoàn toàn"
                            >
                                <Square className="w-3.5 h-3.5 fill-current" />
                                Dừng
                            </button>
                            <button
                                onClick={onReplay}
                                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer transition-all"
                                title="Đọc lại từ đầu"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ) : isPaused ? (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onResume}
                                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-black uppercase tracking-wider cursor-pointer transition-all shadow-md"
                            >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                Tiếp tục
                            </button>
                            <button
                                onClick={onStop}
                                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 text-xs font-black uppercase tracking-wider cursor-pointer transition-all"
                                title="Dừng đọc hoàn toàn"
                            >
                                <Square className="w-3.5 h-3.5 fill-current" />
                                Dừng
                            </button>
                            <button
                                onClick={onReplay}
                                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer transition-all"
                                title="Đọc lại từ đầu"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={onPlay}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-black uppercase tracking-wider cursor-pointer transition-all shadow-md hover:scale-105 active:scale-95"
                        >
                            <Volume2 className="w-4 h-4" />
                            Đọc câu hỏi
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIInterviewerStage;

