import React, { useState, useRef, useEffect } from "react";
import { Play, Square, Terminal, ChevronUp, ChevronDown, Trash2, Clock, AlertTriangle, Check } from "lucide-react";
import { executeCode, isExecutable } from "../services/codeRunnerService";
import type { ExecutionResult } from "../types/codeRunner";

interface CodeOutputPanelProps {
    language: string;
    code: string;
}

const CodeOutputPanel: React.FC<CodeOutputPanelProps> = ({ language, code }) => {
    const [isRunning, setIsRunning] = useState(false);
    const [result, setResult] = useState<ExecutionResult | null>(null);
    const [stdin, setStdin] = useState("");
    const [showStdin, setShowStdin] = useState(false);
    const [executionTime, setExecutionTime] = useState<number | null>(null);
    const outputRef = useRef<HTMLPreElement>(null);

    const canExecute = isExecutable(language);

    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [result]);

    const handleRun = async () => {
        if (!canExecute || isRunning) return;

        setIsRunning(true);
        setResult(null);
        setExecutionTime(null);

        const startTime = performance.now();
        const res = await executeCode(language, code, stdin);
        const elapsed = performance.now() - startTime;

        setExecutionTime(Math.round(elapsed));
        setResult(res);
        setIsRunning(false);
    };

    const handleClear = () => {
        setResult(null);
        setExecutionTime(null);
    };

    const hasOutput = result && (result.stdout || result.stderr);
    const isSuccess = result && result.exitCode === 0 && !result.stderr;

    return (
        <div className="bg-white rounded-[2.5rem] group/form h-125 flex flex-col border border-slate-200/80 overflow-hidden shadow-xs">
            {/* Toolbar */}
            <div className="flex justify-between items-center px-8 py-3 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center gap-3">
                    <Terminal size={14} className="text-teal-600" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Output</span>
                    {executionTime !== null && (
                        <span className="flex items-center gap-1 text-[9px] font-bold text-slate-600 bg-slate-200/60 px-2 py-0.5 rounded-full">
                            <Clock size={10} />
                            {executionTime}ms
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowStdin(!showStdin)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer border border-slate-200"
                        title="Toggle stdin input"
                    >
                        {showStdin ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        Input
                    </button>
                    {hasOutput && (
                        <button
                            onClick={handleClear}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 transition-all cursor-pointer border border-slate-200"
                            title="Clear output"
                        >
                            <Trash2 size={12} />
                        </button>
                    )}
                    <button
                        onClick={handleRun}
                        disabled={!canExecute || isRunning}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-[0.96] border ${
                            isRunning
                                ? "bg-amber-50 text-amber-700 border-amber-200 cursor-wait"
                                : canExecute
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 cursor-pointer"
                                : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                        }`}
                    >
                        {isRunning ? (
                            <>
                                <Square size={12} className="animate-pulse" />
                                Running
                            </>
                        ) : (
                            <>
                                <Play size={12} />
                                Run
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Stdin Input */}
            {showStdin && (
                <div className="px-6 py-3 border-b border-slate-200 bg-slate-50/50">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Standard Input (stdin)</label>
                    <textarea
                        value={stdin}
                        onChange={(e) => setStdin(e.target.value)}
                        placeholder="Enter input for your program..."
                        className="w-full h-20 bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-mono text-slate-800 placeholder-slate-400 resize-none focus:outline-none focus:border-teal-500 transition-colors"
                    />
                </div>
            )}

            {/* Output Area */}
            <div className="flex-1 overflow-hidden flex flex-col bg-slate-900 text-slate-100 font-mono">
                {!result && !isRunning && (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-3">
                        <Terminal size={32} className="opacity-30" />
                        <p className="text-[10px] font-black uppercase tracking-widest">
                            {canExecute ? "Click Run to execute your code" : "This language does not support execution"}
                        </p>
                    </div>
                )}

                {isRunning && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full border-2 border-teal-500/30 border-t-teal-400 animate-spin"></div>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-teal-400 animate-pulse">
                            Compiling & Executing...
                        </p>
                    </div>
                )}

                {result && (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Status Bar */}
                        <div className={`px-6 py-2 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest border-b border-white/10 ${
                            result.timedOut 
                                ? "bg-amber-500/20 text-amber-300" 
                                : isSuccess 
                                ? "bg-emerald-500/20 text-emerald-300" 
                                : "bg-rose-500/20 text-rose-300"
                        }`}>
                            {result.timedOut ? (
                                <><AlertTriangle size={12} /> Timed Out</>
                            ) : isSuccess ? (
                                <><Check size={12} className="inline mr-1" /> Exit Code: 0</>
                            ) : (
                                <><AlertTriangle size={12} /> Exit Code: {result.exitCode}</>
                            )}
                        </div>

                        {/* Output Content */}
                        <pre
                            ref={outputRef}
                            className="flex-1 overflow-auto px-6 py-4 text-xs font-mono leading-relaxed whitespace-pre-wrap wrap-break-word"
                        >
                            {result.stdout && (
                                <span className="text-slate-100">{result.stdout}</span>
                            )}
                            {result.stderr && (
                                <span className="text-rose-400">{result.stderr}</span>
                            )}
                            {!result.stdout && !result.stderr && (
                                <span className="text-slate-500 italic">No output produced.</span>
                            )}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CodeOutputPanel;
