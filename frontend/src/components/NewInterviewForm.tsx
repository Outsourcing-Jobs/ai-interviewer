import React, { useState, useEffect } from "react";
import { ROLES, LEVELS, TYPES, COUNTS, LANGUAGES, VOICE_MODES } from "../constants/interview";
import CustomSelect from "./CustomSelect";
import { COMPANIES } from "../constants/companies";
import type { NewInterviewFormProps } from "../types/forms";
import type { ResumeData } from "../features/resume/types";
import { getUserResumes } from "../services/resumeApi";
import { toast } from "react-toastify";

const NewInterviewForm: React.FC<NewInterviewFormProps> = ({
    formData,
    onChange,
    onSubmit,
    isProcessing,
}) => {
    const handleCustomChange = (name: string, value: string | number) => {
        onChange({ target: { name, value } });
    };

    const [resumes, setResumes] = useState<ResumeData[]>([]);

    useEffect(() => {
        const fetchResumes = async () => {
            try {
                const { data } = await getUserResumes();
                // Filter only completed resumes that have text/analysis
                setResumes(data.filter((r: ResumeData) => r.status === 'completed' || r.parsedData));
            } catch (error) {
                console.error("Failed to fetch resumes:", error);
                if (error && typeof error === 'object' && 'response' in error) {
                    const axiosError = error as { response?: { status?: number } };
                    if (axiosError.response?.status === 401) {
                        return;
                    }
                }
                toast.error("Failed to load your resumes. Please try again later.");
            }
        };
        fetchResumes();
    }, []);

    const resumeOptions = [
        { label: "Không đính kèm (Phỏng vấn tiêu chuẩn)", value: "" },
        ...resumes.map(r => ({ label: r.originalFilename || "CV chưa đặt tên", value: r._id }))
    ];

    const companyOptions = Object.values(COMPANIES).map(c => ({
        label: c.name,
        value: c.id
    }));

    const selectedCompany = COMPANIES[formData.company || "general"];
    const trackOptions = selectedCompany?.tracks.map(t => ({
        label: t.name,
        value: t.id
    })) || [{ label: "Chung", value: "general" }];

    return (
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-lg shadow-slate-200/50 relative group/form z-10">
            <div className="bg-slate-50 px-8 py-5 border-b border-slate-200 flex items-center justify-between rounded-t-3xl">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-3 font-display">
                    <span className="bg-teal-600 w-1.5 h-6 rounded-full shadow-xs"></span>
                    Tạo buổi <span className="text-teal-600">Phỏng vấn mới</span>
                </h2>
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-400/40"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400/40"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/40"></div>
                </div>
            </div>
            <form onSubmit={onSubmit} className="p-8 sm:p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <CustomSelect
                    label="Vị trí ứng tuyển"
                    name="role"
                    options={ROLES}
                    value={formData.role}
                    onChange={handleCustomChange}
                />

                <CustomSelect
                    label="Trình độ kinh nghiệm"
                    name="level"
                    options={LEVELS}
                    value={formData.level}
                    onChange={handleCustomChange}
                />

                <CustomSelect
                    label="Số lượng câu hỏi"
                    name="count"
                    options={COUNTS.map(c => ({ label: `${c} Câu hỏi`, value: c }))}
                    value={formData.count}
                    onChange={handleCustomChange}
                />

                <CustomSelect
                    label="Hình thức phỏng vấn"
                    name="interviewType"
                    options={TYPES}
                    value={formData.interviewType}
                    onChange={handleCustomChange}
                />

                <CustomSelect
                    label="Công ty mục tiêu"
                    name="company"
                    options={companyOptions}
                    value={formData.company || "general"}
                    onChange={(_, value) => {
                        handleCustomChange("company", value);
                        // Reset track when company changes
                        const companyObj = COMPANIES[value as string];
                        if (companyObj && companyObj.tracks.length > 0) {
                            handleCustomChange("companyTrack", companyObj.tracks[0].id);
                        } else {
                            handleCustomChange("companyTrack", "general");
                        }
                    }}
                />

                <CustomSelect
                    label="Chuyên môn công ty"
                    name="companyTrack"
                    options={trackOptions}
                    value={formData.companyTrack || "general"}
                    onChange={handleCustomChange}
                />

                <CustomSelect
                    label="Đính kèm CV (Không bắt buộc)"
                    name="resumeId"
                    options={resumeOptions}
                    value={formData.resumeId || ""}
                    onChange={handleCustomChange}
                />

                <CustomSelect
                    label="Ngôn ngữ phỏng vấn"
                    name="language"
                    options={LANGUAGES}
                    value={formData.language || "vi"}
                    onChange={handleCustomChange}
                />

                <CustomSelect
                    label="Chế độ câu trả lời (Giọng nói / Text)"
                    name="voiceMode"
                    options={VOICE_MODES}
                    value={formData.voiceMode || "voice"}
                    onChange={handleCustomChange}
                />

                <div className="pt-5.5 lg:col-span-3 md:col-span-2 flex justify-end">
                    <button
                        type="submit"
                        disabled={isProcessing}
                        className={`w-full h-12 rounded-2xl font-black text-xs uppercase tracking-widest text-white flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${isProcessing ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'btn-primary'}`}
                    >
                        {isProcessing ? (
                            <>
                                <span className="animate-spin h-4 w-4 border-2 border-slate-400 border-t-transparent rounded-full"></span>
                                Đang tạo câu hỏi AI...
                            </>
                        ) : (
                            <>
                                Bắt đầu phỏng vấn
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NewInterviewForm;
