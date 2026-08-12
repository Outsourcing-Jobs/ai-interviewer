import { useState } from "react";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
import { useInterviewSession } from "../hooks/useInterviewSession";

import ConfirmModal from "../components/ConfirmModal";
import InterviewHeader from "../components/InterviewHeader";
import QuestionSection from "../components/QuestionSection";
import VerbalRecorder from "../components/VerbalRecorder";
import CodeEditorSection from "../components/CodeEditorSection";
import CodeOutputPanel from "../components/CodeOutputPanel";
import AIFeedbackSection from "../components/AIFeedbackSection";
import InterviewLoading from "../components/InterviewLoading";
import WhiteboardModal from "../components/WhiteboardModal";

const InterviewRunner = () => {
    const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
    const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
    const [isFinishing, setIsFinishing] = useState(false);

    const {
        isRecording,
        recordingTime,
        startRecording,
        stopRecording,
        setRecordingTime
    } = useAudioRecorder();


    const {
        activeSession,
        isLoading,
        sessionMessage,
        currentQuestionIndex,
        currentQuestion,
        selectedLanguage,
        setSelectedLanguage,
        drafts,
        isQuestionLocked,
        isProcessing,
        submittedLocal,
        handleNavigation,
        updateDraftCode,
        updateDraftAudio,
        updateDraftDiagram,
        deleteDraftAudio,
        handleSubmitAnswer,
        confirmFinishInterview
    } = useInterviewSession(stopRecording, setRecordingTime);



    const handleConfirmFinish = async () => {
        if (isFinishing) return;
        setIsFinishing(true);
        setIsFinishModalOpen(false);
        try {

            await confirmFinishInterview();
        } catch (error) {
            console.error("Failed to finish interview:", error);
            setIsFinishing(false);
            alert("Failed to finalize session. Please try again or refresh.");
        }
    };

    if (!activeSession || !activeSession.questions || activeSession.questions.length === 0 || isFinishing) {
        return <InterviewLoading sessionMessage={isFinishing ? "Finalizing Interview..." : sessionMessage} />;
    }

    const currentDraft = drafts[currentQuestionIndex] || {};
    const isCodingQuestion = currentQuestion?.questionType === 'coding';
    const nextQuestion = activeSession.questions[currentQuestionIndex + 1];
    const hasFollowUp = nextQuestion?.isFollowUp && nextQuestion?.parentQuestionIndex === currentQuestionIndex;

    return (
        <div className="max-w-7xl mx-auto px-4 pb-32">
            <InterviewHeader
                role={activeSession.role}
                startTime={activeSession.createdAt || activeSession.updatedAt || new Date().toISOString()}
                questions={activeSession.questions}
                currentQuestionIndex={currentQuestionIndex}
                submittedLocal={submittedLocal}
                handleNavigation={handleNavigation}
                handleFinishInterview={() => setIsFinishModalOpen(true)}
                isLoading={isLoading}
                questionsCount={activeSession.questions.length}
                company={activeSession.company}
            />

            <QuestionSection
                index={currentQuestionIndex}
                text={currentQuestion?.questionText || ""}
            />

            {isCodingQuestion ? (
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                    <CodeEditorSection
                        language={selectedLanguage}
                        code={currentDraft.code || ""}
                        isQuestionLocked={isQuestionLocked}
                        setLanguage={setSelectedLanguage}
                        updateCode={updateDraftCode}
                    />
                    <CodeOutputPanel
                        language={selectedLanguage}
                        code={currentDraft.code || ""}
                    />
                </div>
            ) : (
                <div className="grid gap-6 grid-cols-1">
                    <VerbalRecorder
                        isRecording={isRecording}
                        recordingTime={recordingTime}
                        hasAudio={!!currentDraft.audio}
                        isQuestionLocked={isQuestionLocked}
                        startRecording={() => startRecording(updateDraftAudio)}
                        stopRecording={stopRecording}
                        deleteDraftAudio={deleteDraftAudio}
                    />
                    {currentQuestion?.questionType === 'system-design' && (
                        <div className="flex justify-center mt-2">
                            <button
                                onClick={() => setIsWhiteboardOpen(true)}
                                disabled={isQuestionLocked}
                                className="px-6 py-3 rounded-xl bg-white border border-slate-200 hover:border-teal-500 text-sm font-black uppercase tracking-widest text-slate-800 shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                            >
                                <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                {currentDraft.diagram ? 'Chỉnh sửa sơ đồ hệ thống' : 'Mở bảng vẽ sơ đồ hệ thống'}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {isWhiteboardOpen && (
                <WhiteboardModal
                    initialElements={currentDraft.diagramElements}
                    onClose={() => setIsWhiteboardOpen(false)}
                    onSubmit={(blob, elements) => {
                        updateDraftDiagram(blob, elements);
                        setIsWhiteboardOpen(false);
                    }}
                />
            )}

            <AIFeedbackSection
                isEvaluated={!!currentQuestion?.isEvaluated}
                feedback={currentQuestion?.aiFeedback || ""}
                score={currentQuestion?.technicalScore || 0}
                speechMetrics={currentQuestion?.speechMetrics}
                hasFollowUp={hasFollowUp}
            />

            <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200/80 p-4 px-6 md:px-12 flex justify-between items-center z-50 shadow-lg">
                <button
                    onClick={() => handleNavigation(currentQuestionIndex - 1)}
                    disabled={currentQuestionIndex === 0}
                    className="text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-slate-900 disabled:opacity-30 cursor-pointer transition-colors"
                >
                    ← Câu trước
                </button>

                <div className="flex flex-col items-center">
                    {isProcessing && sessionMessage && (
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest text-teal-700 bg-teal-50 px-4 py-1.5 rounded-full animate-pulse border border-teal-200 shadow-xs">
                            {sessionMessage}...
                        </div>
                    )}

                    <button
                        onClick={handleSubmitAnswer}
                        disabled={isQuestionLocked}
                        className={`px-10 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest text-white shadow-md transition-all active:scale-[0.98] ${isProcessing ? 'bg-slate-300 text-slate-500 cursor-wait' : currentQuestion?.isEvaluated ? 'bg-emerald-600 shadow-emerald-600/20' : isQuestionLocked ? 'bg-slate-300 text-slate-500' : 'btn-primary'}`}
                    >
                        {isProcessing ? 'Đang phân tích...' : currentQuestion?.isEvaluated ? 'Đã nộp' : isQuestionLocked ? 'Đã khóa' : 'Nộp câu trả lời'}
                    </button>
                </div>

                <button
                    onClick={() => handleNavigation(currentQuestionIndex + 1)}
                    disabled={currentQuestionIndex === (activeSession?.questions?.length || 0) - 1}
                    className="text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-slate-900 disabled:opacity-30 cursor-pointer transition-colors"
                >
                    Câu tiếp →
                </button>
            </div>

            <ConfirmModal
                isOpen={isFinishModalOpen}
                title="Hoàn thành bài phỏng vấn?"
                message="Bạn có chắc chắn muốn kết thúc bài phỏng vấn này không? Bạn sẽ không thể chỉnh sửa lại câu trả lời sau khi hoàn thành."
                confirmText="Hoàn thành"
                cancelText="Tiếp tục làm"
                onConfirm={handleConfirmFinish}
                onCancel={() => setIsFinishModalOpen(false)}
                isDanger={false}
            />
        </div>
    );
};

export default InterviewRunner;