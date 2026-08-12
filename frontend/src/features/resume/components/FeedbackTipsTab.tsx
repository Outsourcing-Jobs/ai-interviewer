/* eslint-disable @typescript-eslint/no-unused-vars */
import { motion } from "framer-motion";
import { AlertCircle, Star } from "lucide-react";
import type { ResumeData } from "../types";
import ReactMarkdown, { type Components } from "react-markdown";

interface FeedbackTipsTabProps {
  resumeData?: ResumeData;
  issues?: string[];
  strengths?: string[];
  streamingText?: string;
  isStreaming?: boolean;
}

export const FeedbackTipsTab = ({ issues = [], strengths = [], streamingText = "", isStreaming = false }: FeedbackTipsTabProps) => {
  const hasLegacyData = issues.length > 0 || strengths.length > 0;
  const showStreamingView = isStreaming || (streamingText && !hasLegacyData);

  let issuesText = "";
  let strengthsText = "";
  let parts: string[] = [];

  if (showStreamingView) {
    parts = streamingText.split(/##?\s*(?:🌟\s*)?Strengths/i);
    issuesText = parts[0].replace(/##?\s*(?:🚨\s*)?Issues\s*(?:Found)?/iu, "").replace(/[🚨🌟💡]/gu, "").trim();
    if (parts.length > 1) {
      strengthsText = parts[1].replace(/[🚨🌟💡]/gu, "").trim();
    }
  }

  const mdComponents: Components = {
    h1: ({ node: _, ...props }) => <h1 className="text-2xl font-black text-slate-900 mt-8 mb-4 font-display" {...props} />,
    h2: ({ node: _, ...props }) => <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4 font-display" {...props} />,
    h3: ({ node: _, ...props }) => <h3 className="text-lg font-bold text-slate-900 mt-6 mb-3 font-display" {...props} />,
    p: ({ node: _, ...props }) => <p className="text-[15px] text-slate-700 leading-relaxed mb-4" {...props} />,
    ul: ({ node: _, ...props }) => <ul className="space-y-4 mb-8 mt-4" {...props} />,
    li: ({ node: _, className, children, ...props }) => (
      <li className="flex items-start gap-3" {...props}>
        <div className="w-2 h-2 rounded-full bg-teal-600 mt-2 shrink-0" />
        <div className="text-[15px] text-slate-700 leading-relaxed">
          {children}
        </div>
      </li>
    ),
    strong: ({ node: _, ...props }) => <strong className="font-bold text-slate-900" {...props} />,
  };

  return (
    <motion.div
      key="feedback"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="space-y-10"
    >
      {showStreamingView ? (
        <div className="space-y-8">
          <section className="bg-white border border-rose-200 rounded-3xl p-6 sm:p-10 shadow-xs relative overflow-hidden">
            <div className="flex items-center gap-4 mb-6 sm:mb-8 relative z-10">
              <div className="shrink-0 w-10 h-10 rounded-2xl border border-rose-200 bg-rose-50 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-rose-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3 tracking-tight font-display">
                Điểm cần cải thiện (Issues Found)
                {isStreaming && !strengthsText && <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-rose-50 text-rose-700 uppercase tracking-widest ml-2 animate-pulse border border-rose-200">Live</span>}
              </h3>
            </div>
            <div className="max-w-none relative z-10">
              <ReactMarkdown components={mdComponents}>{issuesText}</ReactMarkdown>
              {isStreaming && !strengthsText && (
                <span className="inline-block w-2 h-4 bg-rose-500 ml-1 animate-pulse align-middle" />
              )}
            </div>
          </section>

          {(strengthsText || (isStreaming && parts?.length > 1)) && (
            <section className="bg-white border border-teal-200 rounded-3xl p-6 sm:p-10 shadow-xs relative overflow-hidden">
              <div className="flex items-center gap-4 mb-6 sm:mb-8 relative z-10">
                <div className="shrink-0 w-10 h-10 rounded-2xl border border-teal-200 bg-teal-50 flex items-center justify-center">
                  <Star className="w-5 h-5 text-teal-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3 tracking-tight font-display">
                  Điểm mạnh (Strengths)
                  {isStreaming && strengthsText && <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-teal-50 text-teal-700 uppercase tracking-widest ml-2 animate-pulse border border-teal-200">Live</span>}
                </h3>
              </div>
              <div className="max-w-none relative z-10">
                <ReactMarkdown components={mdComponents}>{strengthsText}</ReactMarkdown>
                {isStreaming && strengthsText && (
                  <span className="inline-block w-2 h-4 bg-teal-600 ml-1 animate-pulse align-middle" />
                )}
              </div>
            </section>
          )}
        </div>
      ) : hasLegacyData ? (
        <>
          {/* Issues Section */}
          {issues.length > 0 && (
            <section className="bg-white border border-rose-200 rounded-3xl p-6 sm:p-10 shadow-xs relative overflow-hidden">
              <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="w-1.5 h-8 bg-rose-500 rounded-full" />
                <h3 className="text-xl font-black text-slate-900 tracking-tight font-display">Điểm cần cải thiện</h3>
                <span className="px-3 py-1 rounded-lg bg-rose-50 text-rose-700 text-[10px] font-black border border-rose-200 uppercase tracking-widest">
                  {issues.length}
                </span>
              </div>
              <div className="space-y-4 relative z-10">
                {issues.map((issue: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-start gap-5 bg-rose-50/50 border border-rose-200/80 rounded-2xl p-5"
                  >
                    <div className="shrink-0 w-10 h-10 rounded-xl border border-rose-200 bg-white flex items-center justify-center mt-0.5 shadow-2xs">
                      <AlertCircle className="w-5 h-5 text-rose-600" />
                    </div>
                    <p className="text-[14.5px] text-slate-800 leading-relaxed font-medium">{issue}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Strengths Section */}
          {strengths.length > 0 && (
            <section className="bg-white border border-teal-200 rounded-3xl p-6 sm:p-10 shadow-xs relative overflow-hidden mt-8">
              <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="w-1.5 h-8 bg-teal-600 rounded-full" />
                <h3 className="text-xl font-black text-slate-900 tracking-tight font-display">Điểm mạnh</h3>
                <span className="px-3 py-1 rounded-lg bg-teal-50 text-teal-700 text-[10px] font-black border border-teal-200 uppercase tracking-widest">
                  {strengths.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                {strengths.map((strength: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-start gap-5 bg-teal-50/50 border border-teal-200/80 rounded-2xl p-5"
                  >
                    <div className="shrink-0 w-10 h-10 rounded-xl border border-teal-200 bg-white flex items-center justify-center mt-0.5 shadow-2xs">
                      <span className="text-teal-700 font-black text-sm">{idx + 1}</span>
                    </div>
                    <p className="text-[14.5px] text-slate-800 leading-relaxed font-medium">{strength}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      ) : (
        <div className="flex items-center justify-center p-12 text-slate-400 text-sm">
          Chưa có nhận xét chi tiết...
        </div>
      )}
    </motion.div>
  );
};
