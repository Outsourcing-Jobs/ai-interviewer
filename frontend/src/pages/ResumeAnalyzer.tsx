import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { CloudUpload, FileCheck, AlertTriangle, ArrowLeft } from "lucide-react";
import type { RootState } from "../app/store";

import { useResumeUpload } from "../features/resume/hooks/useResumeUpload";
import { useResumeAnalysis } from "../features/resume/hooks/useResumeAnalysis";
import { EntityExtractionTab } from "../features/resume/components/EntityExtractionTab";
import { AtsScoreTab } from "../features/resume/components/AtsScoreTab";
import { JobMatchTab } from "../features/resume/components/JobMatchTab";
import { FeedbackTipsTab } from "../features/resume/components/FeedbackTipsTab";
import { ActionPlanFAB } from "../features/resume/components/ActionPlanFAB";

import type { ParsedProfile, ResultTab } from "../features/resume/types";

// ═══════════════════════════════════════════════════════════════════════
// Static Data
// ═══════════════════════════════════════════════════════════════════════

const SCORING_TIPS = [
  {
    title: "Sử dụng tiêu đề mục rõ ràng",
    desc: "Kỹ năng, Kinh nghiệm, Học vấn, Tóm tắt giúp máy quét ATS dễ đọc",
  },
  {
    title: "Khớp từ khóa yêu cầu công việc",
    desc: "Sử dụng các cụm từ khóa chính từ mô tả công việc (JD) để tăng điểm ATS",
  },
  {
    title: "Định lượng thành tựu bằng con số",
    desc: 'Các con số luôn tạo ấn tượng: "Tăng 40% hiệu suất", "Quản lý nhóm 5 người"',
  },
  {
    title: "Trình bày gọn gàng, súc tích",
    desc: "300-800 từ, tối ưu trong 1 trang (với dưới 5 năm kinh nghiệm)",
  },
  {
    title: "Đầy đủ thông tin liên hệ",
    desc: "Họ tên, email, số điện thoại, đường dẫn LinkedIn đặt ở đầu CV",
  },
];

const TABS: { key: ResultTab; label: string }[] = [
  { key: "ats", label: "Điểm ATS" },
  { key: "extraction", label: "Kỹ năng & Thông tin" },
  { key: "jobmatch", label: "Độ tương thích JD" },
  { key: "feedback", label: "Gợi ý & Nhận xét" },
];

// ═══════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════

const ResumeAnalyzer = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?._id || user?.id;

  const {
    isUploading,
    setIsUploading,
    status,
    setStatus,
    resumeData,
    setResumeData,
    activeTab,
    setActiveTab,
    getStatusMessage,
    handleResetAnalysis,
    streamingFeedbackText,
    fetchResumeDetails,
  } = useResumeAnalysis({ userId });

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      // Clear the query parameter so refreshing doesn't keep reloading it unnecessarily if we navigate away
      // but keeping it is also fine. Let's just fetch it.
      setIsUploading(true);
      fetchResumeDetails(id);
    }
  }, [searchParams, fetchResumeDetails, setIsUploading]);

  const {
    file,
    jdText,
    setJdText,
    dragActive,
    fileInputRef,
    handleFileChange,
    handleDrag,
    handleDrop,
    handleUpload,
    handleReset: handleResetUpload,
  } = useResumeUpload({
    onUploadStart: () => {
      setIsUploading(true);
      setStatus("pending");
      setResumeData(null);
    },
    onUploadSuccess: () => {
      // The socket logic handles hiding the loading spinner when complete
    },
    onUploadError: () => {
      setIsUploading(false);
      setStatus(null);
    },
  });

  const handleResetAll = () => {
    handleResetAnalysis();
    handleResetUpload();
    if (searchParams.has("id")) {
      setSearchParams(new URLSearchParams());
    }
  };

  // ─── Derived Data ────────────────────────────────────────────────────
  const profile: ParsedProfile | undefined =
    resumeData?.analysisReport?.extracted_data || resumeData?.parsedData?.parsedProfile;
  const personalInfo = profile?.personal_info;
  const skills =
    resumeData?.analysisReport?.extracted_data?.skills ||
    resumeData?.analysisReport?._v2?.skills;
  const experience = profile?.experience || [];
  const education = profile?.education || [];
  const summary =
    profile?.summary ||
    resumeData?.analysisReport?.evaluation?.candidate_summary;

  const issues = resumeData?.analysisReport?._v2?.analysis?.weaknesses ||
    resumeData?.analysisReport?.evaluation?.weaknesses ||
    resumeData?.analysisReport?.evaluation?.improvement_suggestions ||
    ["Add your LinkedIn URL - many ATS systems require it for screening.", "Add your GitHub or portfolio URL - essential for technical roles."];

  const strengths = resumeData?.analysisReport?._v2?.analysis?.strengths ||
    resumeData?.analysisReport?.evaluation?.strengths ||
    ["No excessive all-caps text.", "Bullet point lengths look good.", "All sections have content.", "Good resume length (400 words).", "Mostly active voice - good.", "Email address present.", "Phone number present.", "Line density looks ATS-friendly.", "Good section structure (5 headers found)."];

  // ═══════════════════════════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════════════════════════

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 relative">
      {/* ════════════════════════ UPLOAD VIEW ════════════════════════ */}
      {!resumeData && !isUploading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-12"
        >
          {/* ── Hero ── */}
          <div className="text-center space-y-6 relative py-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 20 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-teal-200 bg-teal-50/80 backdrop-blur-sm text-[10px] font-black tracking-widest text-teal-700 uppercase shadow-2xs"
            >
              <span className="relative flex h-2 w-2 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
              Trí tuệ nhân tạo AI · Phân tích tức thì
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
              className="text-4xl md:text-5xl font-black text-slate-900 leading-[1.15] tracking-tight font-display"
            >
              Đánh giá chính xác
              <br />
              <span className="bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent">chất lượng CV của bạn</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 20 }}
              className="text-slate-600 max-w-2xl mx-auto leading-relaxed text-[15px] font-medium"
            >
              Tải lên CV của bạn để nhận điểm chuẩn ATS tức thì, trích xuất kỹ năng, kinh nghiệm và kiểm tra độ tương thích với mô tả công việc.
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 260, damping: 20 }}
              className="flex items-center justify-center gap-8 pt-4"
            >
              {[
                { value: "100", label: "Thang điểm ATS" },
                { value: "6", label: "Mục đánh giá" },
                { value: "AI", label: "Công nghệ Gemini" },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-8">
                  {i > 0 && <div className="w-px h-12 bg-slate-200 -ml-4" />}
                  <div className="text-center group cursor-default">
                    <span className="block text-3xl font-black text-slate-900 font-display group-hover:text-teal-600 transition-colors duration-300">
                      {s.value}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold mt-1 block">
                      {s.label}
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Upload + Tips Grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Upload Card */}
            <div className="lg:col-span-3 bg-white border border-slate-200/80 rounded-3xl p-8 space-y-6 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between relative z-10">
                <h2 className="text-lg font-black text-slate-900 tracking-tight font-display">Tải CV lên</h2>
                <span className="px-3 py-1 bg-slate-50 rounded-full text-xs font-bold text-slate-500 border border-slate-200">PDF · DOCX · TXT · Tối đa 5MB</span>
              </div>

              {/* Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative h-48 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden group ${dragActive
                  ? "bg-teal-50 border-2 border-dashed border-teal-500"
                  : file
                    ? "bg-teal-50/50 border border-teal-300"
                    : "bg-slate-50 border border-dashed border-slate-300 hover:border-teal-500"
                  }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                />

                <div className="relative z-10 flex flex-col items-center text-center">
                  {file ? (
                    <>
                      <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mb-3 text-teal-700">
                        <FileCheck className="w-6 h-6 text-teal-700" strokeWidth={2.5} />
                      </div>
                      <span className="text-sm font-black text-slate-900">{file.name}</span>
                      <span className="text-[11px] text-slate-500 font-medium tracking-wide mt-1">Bấm hoặc kéo thả file khác để thay thế</span>
                    </>
                  ) : (
                    <>
                      <CloudUpload className="w-10 h-10 text-slate-400 group-hover:text-teal-600 transition-colors duration-300 mb-3" strokeWidth={1.5} />
                      <span className="text-[13px] font-bold text-slate-700 tracking-wide">
                        Kéo thả CV vào đây hoặc{" "}
                        <span className="text-teal-600 underline underline-offset-4 decoration-teal-300 group-hover:decoration-teal-600 transition-colors">chọn file</span>
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* JD Section */}
              <div className="space-y-2 relative z-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800">Mô tả công việc (JD)</h3>
                  <span className="text-xs font-semibold text-teal-600">Không bắt buộc</span>
                </div>
                <textarea
                  className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl p-4 text-[13px] text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-all placeholder:text-slate-400 resize-none"
                  placeholder="Dán nội dung mô tả công việc (JD) để đánh giá độ tương thích..."
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                />
              </div>

              {/* Button */}
              <button
                onClick={handleUpload}
                disabled={!file}
                className={`relative z-10 w-full py-4 rounded-xl font-bold text-base transition-all duration-300 overflow-hidden ${file
                  ? "btn-primary cursor-pointer"
                  : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed!"
                  }`}
              >
                <span className="relative z-10">Bắt đầu phân tích CV</span>
              </button>
            </div>

            {/* Tips Card (Bento Box) */}
            <div className="lg:col-span-2 flex flex-col h-full space-y-4">
              <h3 className="text-sm font-bold text-slate-700 pt-2">Mẹo tối ưu điểm CV</h3>
              <div className="grid grid-cols-1 gap-3 flex-1">
                {SCORING_TIPS.map((tip, i) => (
                  <div key={i} className="group relative bg-white border border-slate-200/80 rounded-2xl p-4 overflow-hidden hover:border-teal-300 transition-all duration-300 cursor-default shadow-xs">
                    <div className="relative z-10">
                      <p className="text-sm font-extrabold mb-1 text-slate-900">{tip.title}</p>
                      <p className="text-[12px] text-slate-600 leading-relaxed font-medium">{tip.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ════════════════════════ RESULTS VIEW ════════════════════════ */}
      {(resumeData || isUploading) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-0 pb-12 relative"
        >
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-6">
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                FILE: {resumeData?.originalFilename || file?.name || "Processing..."}
              </p>
              <h2 className="text-2xl font-black text-slate-900 font-display">
                {isUploading ? getStatusMessage() : "Hoàn thành phân tích"}
              </h2>
            </div>
            {!isUploading && (
              <button
                onClick={handleResetAll}
                className="w-full sm:w-auto btn-secondary px-5 py-2.5 text-xs font-bold whitespace-nowrap cursor-pointer"
              >
                Phân tích CV khác
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-slate-200" />

          {status === "invalid_document" ? (
            <div className="py-16 text-center space-y-6">
              <div className="w-24 h-24 bg-rose-50 border border-rose-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-12 h-12 text-rose-500" strokeWidth={2} />
              </div>
              <h3 className="text-3xl font-black text-slate-900">File không giống một tài liệu CV</h3>
              <p className="text-slate-600 max-w-lg mx-auto text-sm leading-relaxed">
                Hệ thống không tìm thấy thông tin kinh nghiệm hoặc học vấn tiêu chuẩn. Vui lòng tải lại một bản CV hợp lệ.
              </p>
              <button
                onClick={handleResetAll}
                className="mt-8 btn-primary px-8 py-4 text-base rounded-xl inline-flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
                Tải lại file khác
              </button>
            </div>
          ) : (
            <>
              {/* Tab Bar */}
              <div className="flex items-center gap-6 border-b border-slate-200 mt-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {TABS.map((tab) => {
                  const isTabActive = isUploading ? (streamingFeedbackText ? tab.key === "feedback" : tab.key === "ats") : activeTab === tab.key;
                  const handleClick = () => {
                    if (!isUploading) setActiveTab(tab.key);
                  };

                  return (
                    <button
                      key={tab.key}
                      onClick={handleClick}
                      className={`relative pb-3 pt-4 text-sm font-extrabold whitespace-nowrap transition-colors ${isUploading && !streamingFeedbackText ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                        } ${isTabActive ? "text-teal-700 opacity-100!" : "text-slate-500 hover:text-slate-900"}`}
                    >
                      {tab.label}
                      {isTabActive && (
                        <motion.div
                          layoutId="tab-indicator"
                          className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-teal-600 rounded-full"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* ──────── Tab Content ──────── */}
              <div className="pt-6">
                <AnimatePresence mode="wait">
                  {isUploading && !streamingFeedbackText ? (
                    <AtsScoreTab isLoading={true} />
                  ) : isUploading && streamingFeedbackText ? (
                    <FeedbackTipsTab
                      isStreaming={true}
                      streamingText={streamingFeedbackText}
                    />
                  ) : (
                    <>
                      {activeTab === "extraction" && (
                        <EntityExtractionTab
                          resumeData={resumeData!}
                          profile={profile}
                          summary={summary}
                          skills={skills}
                          personalInfo={personalInfo}
                          experience={experience}
                          education={education}
                        />
                      )}
                      {activeTab === "ats" && <AtsScoreTab resumeData={resumeData!} />}
                      {activeTab === "jobmatch" && <JobMatchTab resumeData={resumeData!} />}
                      {activeTab === "feedback" && (
                        <FeedbackTipsTab
                          resumeData={resumeData!}
                          issues={issues}
                          strengths={strengths}
                          streamingText={resumeData?.streamingFeedbackText || streamingFeedbackText}
                          isStreaming={status === "analyzing" || status === "processing" || status === "parsed" || status === "pending"}
                        />
                      )}
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Action Plan FAB */}
              {!isUploading && resumeData && <ActionPlanFAB issues={issues} />}
            </>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;
