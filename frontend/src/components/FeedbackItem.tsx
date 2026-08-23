import React from "react";
import { Ghost } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { FeedbackItemProps } from "../types/components";
import { sanitizeQuestionText, formatIdealAnswer } from "../utils/formatters";
import SpeechAnalyticsPanel from "./SpeechAnalyticsPanel";

const FeedbackItem: React.FC<FeedbackItemProps> = ({ question, index }) => {
    return (
        <div className="bg-white border border-slate-200/80 rounded-[2.5rem] shadow-xs overflow-hidden group/item transition-all duration-500 hover:shadow-xl hover:shadow-slate-200/60">
            <div className="p-8 sm:p-12 space-y-10">
                {/* Question Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
                    <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 rounded-lg bg-teal-50 border border-teal-200 text-[10px] font-black uppercase tracking-widest text-teal-700">Câu hỏi {index + 1}</span>
                            <div className="h-px w-12 bg-slate-200"></div>
                        </div>
                        <h4 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight font-display">
                            {sanitizeQuestionText(question.questionText)}
                        </h4>
                    </div>

                    <div className="flex gap-2 sm:gap-3 shrink-0 w-full lg:w-auto">
                        <div className="flex-1 lg:flex-none px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border flex justify-center items-center gap-1.5 sm:gap-3 bg-slate-50 border-slate-200">
                            <span className="text-[8px] sm:text-[10px] font-black uppercase text-slate-500 tracking-widest">Độ chính xác</span>
                            <span className="text-xs sm:text-sm font-black text-teal-600">{question.technicalScore}%</span>
                        </div>

                        <div className="flex-1 lg:flex-none px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border flex justify-center items-center gap-1.5 sm:gap-3 bg-slate-50 border-slate-200">
                            <span className="text-[8px] sm:text-[10px] font-black uppercase text-slate-500 tracking-widest">Độ tự tin</span>
                            <span className="text-xs sm:text-sm font-black text-indigo-600">{question.confidenceScore}%</span>
                        </div>
                    </div>
                </div>

                {/* User Submission */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 ml-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Bài làm của bạn</span>
                        <div className="h-px grow bg-slate-200"></div>
                    </div>

                    <div className="bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden">
                        {question.userSubmittedCode && question.userSubmittedCode !== 'undefined' && (
                            <div className="p-6 sm:p-8 border-b border-slate-200 last:border-0 relative">
                                <div className="absolute top-4 right-6 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Mã nguồn đã nộp</div>
                                <pre className="text-xs sm:text-sm font-mono text-slate-800 overflow-x-auto custom-scrollbar pb-2 leading-relaxed">
                                    {question.userSubmittedCode}
                                </pre>
                            </div>
                        )}

                        {question.userAnswerText && (
                            <div className="p-6 sm:p-8 relative">
                                <div className="absolute top-4 right-6 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Văn bản bài làm</div>
                                <p className="text-sm sm:text-base text-slate-700 italic leading-relaxed font-medium pt-4 sm:pt-0">
                                    « {question.userAnswerText} »
                                </p>
                            </div>
                        )}

                        {!question.userAnswerText && (!question.userSubmittedCode || question.userSubmittedCode === 'undefined') && (
                            <div className="p-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest italic">
                                <Ghost className="w-8 h-8 mb-3 mx-auto opacity-40 text-slate-400" />
                                Chưa nhận được dữ liệu bài làm
                            </div>
                        )}
                    </div>
                </div>

                {/* AI Insights and Ideal Implementation */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 border-t border-slate-200">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 ml-1">
                            <div className="w-1.5 h-4 bg-teal-600 rounded-full"></div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Phân tích chi tiết AI</span>
                        </div>
                        <div className="bg-teal-50/50 p-6 sm:p-8 rounded-3xl text-sm sm:text-base text-slate-800 border-l-4 border-teal-600 leading-relaxed shadow-2xs">
                            <div className="prose max-w-none text-slate-800 prose-p:leading-relaxed prose-code:text-teal-700 prose-code:bg-white prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono">
                                <ReactMarkdown>
                                    {question.aiFeedback || ""}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 ml-1">
                            <div className="w-1.5 h-4 bg-indigo-600 rounded-full"></div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Gợi ý câu trả lời chuẩn</span>
                        </div>
                        <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl text-xs sm:text-[13px] border border-slate-200 overflow-x-auto leading-relaxed">
                            <div className="prose max-w-none text-slate-800 prose-p:my-2 prose-code:text-indigo-700 prose-code:bg-white prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-ul:my-2 prose-li:my-1 prose-pre:whitespace-pre prose-pre:overflow-x-auto prose-pre:bg-white prose-pre:p-4 prose-pre:rounded-xl">
                                <ReactMarkdown>
                                    {formatIdealAnswer(question.idealAnswer)}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Speech Analytics */}
                {question.speechMetrics && (
                    <div className="pt-8 border-t border-slate-200 mt-8">
                        <div className="flex items-center gap-3 ml-1 mb-4">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Phân tích giọng nói & Tốc độ</span>
                            <div className="h-px grow bg-slate-200"></div>
                        </div>
                        <SpeechAnalyticsPanel metrics={question.speechMetrics} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeedbackItem;
