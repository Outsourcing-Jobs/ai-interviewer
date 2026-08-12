import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../app/store";
import { getAnalytics } from "../features/analytics/analyticsSlice";
import { ResumeAnalysisHistory } from "../features/resume/components/ResumeAnalysisHistory";
import { ACHIEVEMENTS } from "../config/achievements";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import type { ChartOptions } from "chart.js";
import { Line } from "react-chartjs-2";

interface ProgressItem {
  date: string;
  technicalScore: number;
  confidenceScore: number;
}

interface RoleItem {
  _id: string;
  avgScore: number;
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const calculateXpProgress = (xp: number, currentLevelXp: number, nextLevelXp: number | null) => {
  if (nextLevelXp === null || nextLevelXp <= currentLevelXp) return 100;
  return Math.max(0, Math.min(100, ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100));
};

const AnalyticsDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, isLoading, isError, message } = useSelector((state: RootState) => state.analytics);

  const [hiddenDatasets, setHiddenDatasets] = useState<Record<number, boolean>>({
    0: false,
    1: false,
  });

  const toggleDataset = (index: number) => {
    setHiddenDatasets(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  useEffect(() => {
    dispatch(getAnalytics());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh] w-full">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-10 bg-white p-8 rounded-3xl border border-rose-200 shadow-xs max-w-2xl mx-auto mt-20">
        <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4 border border-rose-200">
          <svg className="w-8 h-8 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-rose-700 font-bold text-lg">Không thể tải dữ liệu phân tích</p>
        <p className="text-slate-500 text-sm mt-2">{message}</p>
      </div>
    );
  }

  if (!data) return null;

  const { stats, progress, byRole, speech, gamification } = data;

  // Progress Over Time Chart
  const technicalScores = progress?.map((p: ProgressItem) => p.technicalScore) || [];
  const confidenceScores = progress?.map((p: ProgressItem) => p.confidenceScore) || [];
  const progressLabels = progress?.map((p: ProgressItem) => {
    const parts = String(p.date).split('-');
    return parts.length === 3 ? `${parts[1]}/${parts[2]}` : String(p.date);
  }) || [];

  const lineChartData = {
    labels: progressLabels,
    datasets: [
      {
        label: "Technical Score",
        data: technicalScores,
        borderColor: "rgba(13, 148, 136, 1)",
        backgroundColor: "rgba(13, 148, 136, 0.15)",
        fill: true,
        tension: 0.4,
        hidden: hiddenDatasets[0],
      },
      {
        label: "Confidence Score",
        data: confidenceScores,
        borderColor: "rgba(99, 102, 241, 1)",
        backgroundColor: "rgba(99, 102, 241, 0.15)",
        fill: true,
        tension: 0.4,
        hidden: hiddenDatasets[1],
      },
    ]
  };

  const lineChartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#0f172a",
        bodyColor: "#334155",
        borderColor: "rgba(203, 213, 225, 0.8)",
        borderWidth: 1,
        padding: 12,
        boxPadding: 4,
        usePointStyle: true,
      }
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        grid: { color: "rgba(0,0,0,0.06)" },
        ticks: { color: "#64748b", font: { family: "'Inter', sans-serif", weight: 'bold' } }
      },
      x: {
        grid: { color: "rgba(0,0,0,0.06)" },
        ticks: {
          color: "#64748b",
          font: { size: 10, family: "'Inter', sans-serif", weight: 'bold' },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8
        }
      }
    }
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-3 font-display">Bảng điều khiển phân tích</h1>
          <p className="text-slate-600 font-medium max-w-2xl text-[15px]">
            Phân tích chuyên sâu về hiệu suất phỏng vấn, sự phát triển kỹ năng và các chỉ số sẵn sàng.
          </p>
        </div>
      </div>

      {/* Top 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Professional Development */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 flex flex-col justify-between shadow-xs relative overflow-hidden group">
          <div className="flex justify-between items-start mb-8 relative z-10">
            <h3 className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Thăng tiến</h3>
            <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center border border-teal-200">
              <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div className="mb-10 relative z-10">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-slate-900 font-display">Lvl. {gamification?.currentLevel || 0}</span>
              <span className="text-slate-500 font-bold text-sm">{gamification?.currentTitle || 'Beginner'}</span>
            </div>
          </div>
          <div className="relative z-10">
            <div className="flex justify-between text-[10px] font-black text-slate-500 mb-3 uppercase tracking-widest">
              <span>Tiến trình hiện tại</span>
              <span className="text-teal-600">{gamification?.xp || 0} / {gamification?.nextLevelXp || 'MAX'} XP</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-teal-600 h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${calculateXpProgress(gamification?.xp || 0, gamification?.currentLevelXp || 0, gamification?.nextLevelXp || null)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 flex flex-col justify-between shadow-xs relative overflow-hidden group">
          <div className="flex justify-between items-start mb-8 relative z-10">
            <h3 className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Tổng bài phỏng vấn</h3>
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-200">
              <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mb-6 relative z-10">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-slate-900 font-display">{stats?.totalSessions || 0}</span>
              <span className="text-slate-500 font-bold text-sm">Bài hoàn thành</span>
            </div>
          </div>
          <div className="flex items-end justify-between gap-1.5 h-16 mt-auto relative z-10">
            {Array.from({ length: 14 }).map((_, i) => {
              const scoreIdx = technicalScores.length - 14 + i;
              const score = scoreIdx >= 0 ? technicalScores[scoreIdx] : 0;
              return (
                <div
                  key={i}
                  className="flex-1 bg-slate-100 rounded-sm relative overflow-hidden"
                  style={{ height: '100%' }}
                >
                  <div
                    className="absolute bottom-0 w-full bg-indigo-500 rounded-sm transition-all duration-500 ease-out"
                    style={{ height: score > 0 ? `${score}%` : '0%' }}
                  ></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Performance Consistency */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 flex flex-col justify-between shadow-xs relative overflow-hidden group md:col-span-2 lg:col-span-1">
          <div className="flex justify-between items-start mb-8 relative z-10">
            <h3 className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Chuỗi Streak</h3>
            <div className="flex items-center gap-1.5 text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
              </svg>
              Hoạt động
            </div>
          </div>
          <div className="mt-auto relative z-10">
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-5xl font-black text-slate-900 font-display">{gamification?.streakDays || 0}</span>
              <span className="text-slate-500 font-bold text-sm">Ngày liên tiếp</span>
            </div>
            <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span>Điểm trung bình</span>
              <span className="text-teal-700 font-black">{Math.round(stats?.averageOverallScore || 0)}/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skill Acquisition Velocity */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 flex flex-col shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-center mb-8 relative z-10">
            <h3 className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Tiến độ qua thời gian</h3>
            <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest">
              <div
                className={`flex items-center gap-2 cursor-pointer transition-opacity select-none ${hiddenDatasets[0] ? 'opacity-50 text-slate-400' : 'text-slate-700 hover:opacity-80'}`}
                onClick={() => toggleDataset(0)}
              >
                <div className={`w-2.5 h-2.5 rounded-full ${hiddenDatasets[0] ? 'bg-slate-300' : 'bg-teal-600'}`}></div>
                Điểm kỹ thuật
              </div>
              <div
                className={`flex items-center gap-2 cursor-pointer transition-opacity select-none ${hiddenDatasets[1] ? 'opacity-50 text-slate-400' : 'text-slate-700 hover:opacity-80'}`}
                onClick={() => toggleDataset(1)}
              >
                <div className={`w-2.5 h-2.5 rounded-full ${hiddenDatasets[1] ? 'bg-slate-300' : 'bg-indigo-600'}`}></div>
                Độ tự tin
              </div>
            </div>
          </div>
          <div className="h-64 w-full relative z-10">
            {progress && progress.length > 0 ? (
              <Line data={lineChartData} options={lineChartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 font-medium text-sm bg-slate-50 rounded-2xl border border-slate-200">Chưa đủ dữ liệu để hiển thị biểu đồ</div>
            )}
          </div>
        </div>

        {/* Target Competency Analysis */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 flex flex-col shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-center mb-8 relative z-10">
            <h3 className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Năng lực theo vị trí</h3>
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
            </div>
          </div>
          <div className="space-y-6 flex-1 flex flex-col justify-center relative z-10">
            {byRole && byRole.length > 0 ? byRole.map((role: RoleItem, idx: number) => (
              <div key={idx} className="group">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-3 group-hover:text-slate-900 transition-colors">
                  <span
                    className="truncate pr-4"
                    title={role._id.length >= 50 ? `${role._id.trim()}...` : role._id}
                  >
                    {role._id.length >= 50 ? `${role._id.trim()}...` : role._id}
                  </span>
                  <span className="text-teal-700 shrink-0 font-black">{Math.round(role.avgScore)}/100</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-teal-600 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.round(role.avgScore)}%` }}></div>
                </div>
              </div>
            )) : (
              <div className="h-full flex items-center justify-center text-slate-400 font-medium text-sm bg-slate-50 rounded-2xl border border-slate-200">Chưa có dữ liệu vị trí</div>
            )}
          </div>
        </div>
      </div>

      {/* Speech Behavioral Analytics */}
      {speech && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xs relative overflow-hidden mt-6">
          <div className="flex items-center gap-5 mb-10 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-700 border border-teal-200 shadow-2xs">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-slate-900 font-black text-xl font-display tracking-tight">Phân tích giọng nói trung bình</h3>
              <p className="text-[13px] text-slate-500 font-medium mt-1">Chỉ số phát âm và tốc độ nói trong các bài phỏng vấn</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-200 relative z-10">
            {/* Ring 1 */}
            <div className="flex flex-col items-center justify-center pt-6 md:pt-0">
              <div className="relative w-36 h-36 mb-6">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-slate-100" strokeWidth="6" />
                  <circle
                    cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-teal-600 transition-all duration-1000 ease-out" strokeWidth="6"
                    strokeDasharray="282.7"
                    strokeDashoffset={282.7 - (282.7 * (Math.min(speech.avgPace, 200) / 200))}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-slate-900 font-display">{Math.round(speech.avgPace)}</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">TỪ/PHÚT</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-slate-900 font-bold text-[15px] mb-1.5">Tốc độ nói trung bình</div>
                <div className="text-teal-700 text-xs font-bold uppercase tracking-widest">Số từ trên phút</div>
              </div>
            </div>

            {/* Ring 2 */}
            <div className="flex flex-col items-center justify-center pt-6 md:pt-0">
              <div className="relative w-36 h-36 mb-6">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-slate-100" strokeWidth="6" />
                  <circle
                    cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-amber-500 transition-all duration-1000 ease-out" strokeWidth="6"
                    strokeDasharray="282.7"
                    strokeDashoffset={282.7 - (282.7 * (Math.min(speech.avgFillerWords, 30) / 30))}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-slate-900 font-display">{Math.round(speech.avgFillerWords)}</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">TỪ ẬM Ừ</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-slate-900 font-bold text-[15px] mb-1.5">Từ ậm ừ trung bình</div>
                <div className="text-amber-600 text-xs font-bold uppercase tracking-widest">Mỗi câu hỏi</div>
              </div>
            </div>

            {/* Ring 3 */}
            <div className="flex flex-col items-center justify-center pt-6 md:pt-0">
              <div className="relative w-36 h-36 mb-6">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-slate-100" strokeWidth="6" />
                  <circle
                    cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-indigo-600 transition-all duration-1000 ease-out" strokeWidth="6"
                    strokeDasharray="282.7"
                    strokeDashoffset={282.7 - (282.7 * (speech.avgClarity / 100))}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-slate-900 font-display">{Math.round(speech.avgClarity)}</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">ĐIỂM</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-slate-900 font-bold text-[15px] mb-1.5">Điểm độ rõ ràng</div>
                <div className="text-indigo-700 text-xs font-bold uppercase tracking-widest">Chất lượng diễn đạt</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Achievements & Badges Gallery */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xs relative overflow-hidden mt-6">
        <div className="flex items-center gap-5 mb-10 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-200 shadow-2xs">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-slate-900 font-black text-xl font-display tracking-tight">Thành tựu & Huy hiệu</h3>
            <p className="text-[13px] text-slate-500 font-medium mt-1">Mở khóa huy hiệu bằng cách rèn luyện đều đặn mỗi ngày</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 relative z-10">
          {ACHIEVEMENTS.map((badge) => {
            const isUnlocked = gamification?.badges?.some((b) => b.badgeId === badge.id);
            const badgeRecord = gamification?.badges?.find((b) => b.badgeId === badge.id);

            return (
              <div
                key={badge.id}
                className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center gap-3 relative overflow-hidden group
                  ${isUnlocked
                    ? 'bg-amber-50/50 border-amber-200 shadow-2xs hover:bg-amber-50'
                    : 'bg-slate-50/50 border-slate-200 opacity-60 grayscale hover:grayscale-0 hover:opacity-100'}`}
              >
                <div className={`text-4xl ${!isUnlocked && 'opacity-50'}`}>
                  {badge.icon}
                </div>

                <div className="space-y-1">
                  <h4 className={`text-sm font-black ${isUnlocked ? 'text-amber-800' : 'text-slate-500'}`}>
                    {badge.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium leading-snug">
                    {badge.desc}
                  </p>
                </div>

                {isUnlocked && badgeRecord?.earnedAt && (
                  <div className="text-[9px] font-bold text-amber-600 uppercase tracking-widest mt-auto pt-2 border-t border-amber-200/60 w-full">
                    {new Date(badgeRecord.earnedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Resume Analysis History */}
      <ResumeAnalysisHistory />
    </div>
  );
};

export default AnalyticsDashboard;
