export interface CompanyTrack {
  id: string;
  name: string;
  description: string;
  levels: string[];
}

export interface CompanyProfile {
  id: string;
  name: string;
  tracks: CompanyTrack[];
}

export const COMPANIES: Record<string, CompanyProfile> = {
  general: {
    id: "general",
    name: "Chung (Không chọn công ty cụ thể)",
    tracks: [
      { id: "general", name: "Chung", description: "Phỏng vấn tiêu chuẩn", levels: [] }
    ]
  },
  google: {
    id: "google",
    name: "Google",
    tracks: [
      { id: "swe-general", name: "SWE General", description: "Kỹ sư phần mềm tổng quát", levels: ["L3", "L4", "L5", "L6"] },
      { id: "frontend", name: "Frontend Engineer", description: "Kỹ sư phần mềm chuyên Frontend", levels: ["L3", "L4", "L5"] },
      { id: "backend", name: "Backend Engineer", description: "Backend & Hệ thống", levels: ["L3", "L4", "L5", "L6"] },
      { id: "ml-engineer", name: "ML Engineer", description: "Học máy & Trí tuệ nhân tạo (AI)", levels: ["L3", "L4", "L5"] },
    ],
  },
  amazon: {
    id: "amazon",
    name: "Amazon",
    tracks: [
      { id: "sde-1", name: "SDE I", description: "Kỹ sư phần mềm mới đi làm (Entry-level)", levels: ["SDE I"] },
      { id: "sde-2", name: "SDE II", description: "Kỹ sư phần mềm cấp trung (Mid-level)", levels: ["SDE II"] },
      { id: "sde-3", name: "SDE III", description: "Kỹ sư phần mềm cấp cao (Senior)", levels: ["SDE III"] },
      { id: "frontend", name: "Frontend Engineer", description: "Giao diện Web UI/UX", levels: ["FEE I", "FEE II", "FEE III"] },
    ],
  },
  meta: {
    id: "meta",
    name: "Meta",
    tracks: [
      { id: "swe", name: "Software Engineer", description: "Kỹ sư phần mềm tổng quát", levels: ["E3", "E4", "E5", "E6"] },
      { id: "frontend", name: "Frontend Engineer", description: "React / Nền tảng Web", levels: ["E3", "E4", "E5"] },
      { id: "infrastructure", name: "Production Engineer", description: "Hệ thống & Hạ tầng (Systems/Infra)", levels: ["E3", "E4", "E5"] }
    ],
  },
  microsoft: {
    id: "microsoft",
    name: "Microsoft",
    tracks: [
      { id: "swe", name: "Software Engineer", description: "Kỹ sư phần mềm tổng quát", levels: ["59", "60", "61", "62", "63"] }
    ],
  }
};
