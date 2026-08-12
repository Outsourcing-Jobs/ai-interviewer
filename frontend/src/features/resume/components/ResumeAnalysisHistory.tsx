import { useState, useEffect, useCallback } from "react";
import { Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getUserResumes, deleteResume } from "../../../services/resumeApi";
import type { ResumeData } from "../types";

// ═══════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════

const FILE_TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pdf: { label: "PDF", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  docx: { label: "DOCX", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  txt: { label: "TXT", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  completed: { label: "Analyzed", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  failed: { label: "Failed", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  processing: { label: "Processing", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  analyzing: { label: "Analyzing", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  pending: { label: "Pending", color: "text-surface-400", bg: "bg-surface-500/10", border: "border-surface-500/20" },
  parsed: { label: "Parsed", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  matching: { label: "Matching", color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
};

const getRelativeTime = (dateStr?: string) => {
  if (!dateStr) return "Unknown";
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const getAtsScore = (r: ResumeData) =>
  r.scores?.ats || r.analysisReport?._v2?.scores?.ats_score || r.analysisReport?.evaluation?.ats_score || 0;

const getOverallScore = (r: ResumeData) =>
  r.scores?.overall || r.analysisReport?._v2?.scores?.overall_quality || r.analysisReport?.evaluation?.overall_quality || 0;

const getTopSkills = (r: ResumeData): string[] => {
  const skills =
    r.analysisReport?._v2?.skills?.technical ||
    r.analysisReport?.extracted_data?.skills?.technical ||
    [];
  return skills.slice(0, 3);
};

const getStrength = (r: ResumeData): string | null => {
  const strengths =
    r.analysisReport?._v2?.analysis?.strengths ||
    r.analysisReport?.evaluation?.strengths ||
    [];
  return strengths[0] || null;
};

// ═══════════════════════════════════════════════════════════════════════
// Score Ring Component
// ═══════════════════════════════════════════════════════════════════════

const ScoreRing = ({ score, size = 56, strokeWidth = 5 }: { score: number; size?: number; strokeWidth?: number }) => {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (circumference * Math.min(score, 100)) / 100;
  const color = score >= 75 ? "text-emerald-600" : score >= 50 ? "text-amber-600" : "text-rose-600";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" className="text-slate-100" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor"
          className={`${color} transition-all duration-1000 ease-out`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-black text-slate-900 font-display">{score}</span>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// Skeleton Card
// ═══════════════════════════════════════════════════════════════════════

const SkeletonCard = () => (
  <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs animate-pulse">
    <div className="flex items-start justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-200" />
        <div>
          <div className="h-4 w-36 bg-slate-200 rounded-full mb-2" />
          <div className="h-3 w-20 bg-slate-200 rounded-full" />
        </div>
      </div>
      <div className="w-14 h-14 rounded-full bg-slate-200" />
    </div>
    <div className="flex gap-2 mb-4">
      <div className="h-5 w-16 bg-slate-200 rounded-full" />
      <div className="h-5 w-14 bg-slate-200 rounded-full" />
      <div className="h-5 w-12 bg-slate-200 rounded-full" />
    </div>
    <div className="h-2 w-full bg-slate-200 rounded-full mb-3" />
    <div className="h-3 w-3/4 bg-slate-200 rounded-full" />
  </div>
);

// ═══════════════════════════════════════════════════════════════════════
// Resume Card Component
// ═══════════════════════════════════════════════════════════════════════

interface ResumeCardProps {
  resume: ResumeData;
  index: number;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

const ResumeCard = ({ resume, index, onDelete, isDeleting }: ResumeCardProps) => {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  const atsScore = getAtsScore(resume);
  const overallScore = getOverallScore(resume);
  const topSkills = getTopSkills(resume);
  const strength = getStrength(resume);
  const fileType = FILE_TYPE_CONFIG[resume.fileType || "pdf"] || FILE_TYPE_CONFIG.pdf;
  const status = STATUS_CONFIG[resume.status] || STATUS_CONFIG.pending;
  const isCompleted = resume.status === "completed";
  const jdMatch = resume.scores?.jdMatch || 0;

  const handleClick = () => {
    if (isCompleted) {
      navigate(`/resume-analyzer?id=${resume._id}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 260, damping: 20 }}
      className={`bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs relative overflow-hidden group transition-all duration-300 ${isCompleted ? "cursor-pointer hover:border-teal-500/40 hover:shadow-xl" : ""
        }`}
      onClick={handleClick}
    >
      {/* Header: filename + ATS ring */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* File type icon */}
          <div className={`w-10 h-10 rounded-xl ${fileType.bg} border ${fileType.border} flex items-center justify-center shrink-0`}>
            <span className={`text-[10px] font-black ${fileType.color} uppercase`}>{fileType.label}</span>
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-slate-900 truncate pr-2 group-hover:text-teal-700 transition-colors font-sans" title={resume.originalFilename}>
              {resume.originalFilename}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-slate-400 font-bold" title={resume.createdAt ? new Date(resume.createdAt).toLocaleString() : ""}>
                {getRelativeTime(resume.createdAt)}
              </span>
              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${status.bg} ${status.color} border ${status.border}`}>
                {status.label}
              </span>
            </div>
          </div>
        </div>

        {/* ATS Score Ring */}
        {isCompleted && <ScoreRing score={atsScore} />}
      </div>

      {/* Scores row */}
      {isCompleted && (
        <div className="flex items-center gap-4 mb-4 relative z-10">
          <div className="flex-1">
            <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
              <span>Overall</span>
              <span className="text-slate-700 font-black">{overallScore}/100</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-teal-600 h-full rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(overallScore, 100)}%` }}
              />
            </div>
          </div>
          {jdMatch > 0 && (
            <div className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-[10px] font-black text-indigo-700 uppercase tracking-wider shrink-0">
              JD {jdMatch}%
            </div>
          )}
        </div>
      )}

      {/* Skills pills */}
      {isCompleted && topSkills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3 relative z-10">
          {topSkills.map((skill, i) => (
            <span key={i} className="text-[10px] font-bold text-slate-700 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Strength */}
      {isCompleted && strength && (
        <p className="text-[11px] text-slate-600 font-medium line-clamp-2 relative z-10 leading-relaxed flex items-start gap-1">
          <Sparkles className="w-3 h-3 text-teal-600 shrink-0 mt-0.5" /> 
          <span>{strength}</span>
        </p>
      )}

      {/* Delete button */}
      <div className="absolute top-4 right-4 z-20" onClick={(e) => e.stopPropagation()}>
        {showConfirm ? (
          <div className="flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                onDelete(resume._id);
                setShowConfirm(false);
              }}
              disabled={isDeleting}
              className="text-[9px] font-black text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg uppercase tracking-wider hover:bg-rose-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isDeleting ? "..." : "Xóa"}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="text-[9px] font-black text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg uppercase tracking-wider hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Hủy
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowConfirm(true)}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer"
            title="Delete resume"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </button>
        )}
      </div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════

export const ResumeAnalysisHistory = () => {
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchResumes = useCallback(async (pageNum: number, append = false) => {
    try {
      if (append) setIsLoadingMore(true);
      const result = await getUserResumes(pageNum);
      setResumes(prev => append ? [...prev, ...result.data] : result.data);
      setHasMore(result.hasMore);
      setTotal(result.total);
      setPage(pageNum);
    } catch (error) {
      console.error("Failed to fetch resume history:", error);
      toast.error("Failed to load resume history");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchResumes(1);
  }, [fetchResumes]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteResume(id);
      setResumes(prev => prev.filter(r => r._id !== id));
      setTotal(prev => prev - 1);
      toast.success("Resume deleted successfully");
    } catch (error) {
      console.error("Failed to delete resume:", error);
      toast.error("Failed to delete resume");
    } finally {
      setDeletingId(null);
    }
  };

  const handleLoadMore = () => {
    fetchResumes(page + 1, true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-slate-200 animate-pulse" />
          <div>
            <div className="h-5 w-52 bg-slate-200 rounded-full animate-pulse mb-2" />
            <div className="h-3 w-80 bg-slate-200 rounded-full animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-3xl p-12 shadow-xs text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-5 border border-slate-200">
          <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-slate-900 font-black text-lg mb-2 font-display">Chưa có lịch sử phân tích CV</h3>
        <p className="text-slate-500 text-sm font-medium max-w-md mx-auto">
          Tải lên bản CV đầu tiên của bạn ở trang Phân tích CV để theo dõi lịch sử tại đây.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-5">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-700 border border-teal-200 shadow-2xs">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-slate-900 font-black text-xl font-display tracking-tight">Lịch sử Phân tích CV</h3>
          <p className="text-[13px] text-slate-500 font-medium mt-1">
            Đã phân tích {total} bản CV — bấm vào để xem báo cáo chi tiết
          </p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {resumes.map((resume, index) => (
            <ResumeCard
              key={resume._id}
              resume={resume}
              index={index}
              onDelete={handleDelete}
              isDeleting={deletingId === resume._id}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="flex items-center gap-3 px-8 py-3 rounded-2xl bg-surface-800/60 border border-surface-600/30 text-sm font-bold text-surface-300 hover:text-white hover:border-primary-500/30 hover:bg-surface-800/80 transition-all duration-300 cursor-pointer disabled:opacity-50 shadow-lg shadow-black/20"
          >
            {isLoadingMore ? (
              <>
                <span className="w-4 h-4 border-2 border-surface-500 border-t-primary-500 rounded-full animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Load More Resumes
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
