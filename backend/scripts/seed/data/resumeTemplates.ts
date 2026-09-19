/**
 * @file scripts/seed/data/resumeTemplates.ts
 * @description Realistic CV samples, ATS scores, and JD match reports
 */

export interface ResumeTemplate {
  title: string;
  role: string;
  parsedData: Record<string, any>;
  analysisReport: Record<string, any>;
  jdText: string;
  jdMatchReport: Record<string, any>;
  scores: {
    ats: number;
    overall: number;
    jdMatch: number;
  };
}

export const RESUME_TEMPLATES: ResumeTemplate[] = [
  {
    title: "Nguyen_Van_A_Senior_Fullstack.pdf",
    role: "Full Stack Developer",
    scores: { ats: 92, overall: 90, jdMatch: 94 },
    parsedData: {
      candidateName: "Nguyễn Văn A",
      email: "nguyen.vana.dev@gmail.com",
      phone: "+84 987 654 321",
      location: "Hà Nội, Việt Nam",
      experienceYears: 5,
      skills: ["React", "TypeScript", "Node.js", "Express", "NestJS", "PostgreSQL", "MongoDB", "Docker", "AWS", "Redis"],
      education: [
        {
          degree: "Cử nhân Công nghệ Thông tin",
          school: "Đại học Bách Khoa Hà Nội",
          year: "2015 - 2019",
          gpa: "3.6/4.0",
        },
      ],
      workExperience: [
        {
          company: "Tech Corp Inc.",
          position: "Senior Full Stack Engineer",
          duration: "2021 - Present",
          highlights: [
            "Kiến trúc và xây dựng microservices xử lý hơn 2 triệu giao dịch/ngày.",
            "Tối ưu React frontend giúp giảm LCP từ 3.2s xuống 1.1s.",
            "Triển khai CI/CD pipeline với GitHub Actions & AWS ECS."
          ],
        },
        {
          company: "StartUp Lab",
          position: "Software Engineer",
          duration: "2019 - 2021",
          highlights: [
            "Xây dựng RESTful APIs bằng Express/MongoDB và real-time chat qua Socket.io.",
            "Tích hợp cổng thanh toán VNPay, Stripe và MoMo."
          ],
        },
      ],
    },
    analysisReport: {
      summary: "Ứng viên sở hữu bộ kỹ năng Fullstack toàn diện, kinh nghiệm thực chiến vững vàng với các hệ thống high-traffic và cloud architecture.",
      strengths: [
        "Có số liệu định lượng rõ ràng trong các thành tựu công việc (2 triệu req/ngày, giảm LCP 65%).",
        "Stack công nghệ hiện đại và phù hợp cao với yêu cầu thị trường (React, Node, TS, AWS, Docker).",
        "Bố cục CV chuẩn ATS, không chứa bảng biểu hay định dạng phức tạp gây lỗi parse."
      ],
      weaknesses: [
        "Chưa đề cập nhiều đến kinh nghiệm quản lý hoặc mentor junior engineers.",
        "Thiếu chứng chỉ Cloud chính thức (e.g. AWS Certified Solutions Architect)."
      ],
      atsKeywordMatch: ["React", "TypeScript", "Node.js", "Microservices", "Docker", "AWS", "CI/CD"],
    },
    jdText: "Tuyển Dụng Senior Full Stack Developer (React / Node.js / Cloud). Yêu cầu tối thiểu 4 năm kinh nghiệm, thành thạo TypeScript, Microservices, AWS, Docker.",
    jdMatchReport: {
      matchPercentage: 94,
      matchedSkills: ["React", "TypeScript", "Node.js", "Microservices", "AWS", "Docker", "PostgreSQL"],
      missingSkills: ["Kubernetes", "GraphQL"],
      fitAssessment: "Rất phù hợp (Strong Fit). Ứng viên đáp ứng hầu hết tiêu chí cốt lõi của vị trí Senior Full Stack.",
    },
  },
  {
    title: "Tran_Thi_B_Frontend_React.pdf",
    role: "Frontend Developer",
    scores: { ats: 86, overall: 84, jdMatch: 88 },
    parsedData: {
      candidateName: "Trần Thị B",
      email: "tran.thib.fe@gmail.com",
      phone: "+84 912 345 678",
      location: "TP. Hồ Chí Minh, Việt Nam",
      experienceYears: 3,
      skills: ["React", "Next.js", "Tailwind CSS", "Redux Toolkit", "Zustand", "TypeScript", "Jest", "Vite"],
      education: [
        {
          degree: "Kỹ sư Kỹ thuật Phần mềm",
          school: "Đại học Khoa học Tự nhiên TP.HCM",
          year: "2017 - 2021",
        },
      ],
      workExperience: [
        {
          company: "E-Commerce Solution",
          position: "Frontend Developer",
          duration: "2021 - Present",
          highlights: [
            "Xây dựng giao diện thương mại điện tử với Next.js SSR / SSG tối ưu SEO.",
            "Tối ưu Core Web Vitals đạt 95+ điểm trên Google PageSpeed Insights.",
            "Viết unit test với Jest & React Testing Library đạt độ phủ 80%."
          ],
        },
      ],
    },
    analysisReport: {
      summary: "Frontend Developer có chuyên môn sâu về React/Next.js ecosystem và UI/UX performance.",
      strengths: ["Kỹ năng Next.js SSR/SEO tốt", "Tư duy viết test tự động (Jest)", "Thành thạo TypeScript"],
      weaknesses: ["Kinh nghiệm làm việc với Backend API còn ở mức cơ bản", "Chưa có kinh nghiệm deploy CDN nâng cao"],
      atsKeywordMatch: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Jest", "SEO"],
    },
    jdText: "Tuyển Frontend Developer thành thạo React, Next.js, TypeScript và tối ưu hóa hiệu năng web.",
    jdMatchReport: {
      matchPercentage: 88,
      matchedSkills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Jest"],
      missingSkills: ["CI/CD", "Webpack deep configuration"],
      fitAssessment: "Phù hợp tốt (Good Fit) cho vị trí Frontend Mid-Level.",
    },
  },
  {
    title: "Le_Hoang_C_DevOps_SRE.pdf",
    role: "DevOps Engineer",
    scores: { ats: 89, overall: 87, jdMatch: 91 },
    parsedData: {
      candidateName: "Lê Hoàng C",
      email: "le.hoangc.devops@gmail.com",
      phone: "+84 903 112 233",
      location: "Đà Nẵng, Việt Nam",
      experienceYears: 4,
      skills: ["Kubernetes", "Docker", "Terraform", "Ansible", "AWS", "GCP", "Prometheus", "Grafana", "ArgoCD", "Linux"],
      education: [
        {
          degree: "Cử nhân Mạng máy tính & Truyền thông",
          school: "Đại học Bách Khoa Đà Nẵng",
          year: "2016 - 2020",
        },
      ],
      workExperience: [
        {
          company: "Fintech Enterprise",
          position: "DevOps / SRE Engineer",
          duration: "2020 - Present",
          highlights: [
            "Quản trị cụm Kubernetes đa vùng (Multi-region EKS) với hơn 150 microservices.",
            "Tự động hóa 100% cơ sở hạ tầng qua Terraform (IaC) và GitOps qua ArgoCD.",
            "Thiết lập hệ thống giám sát cảnh báo Prometheus/Grafana giảm MTTR xuống 40%."
          ],
        },
      ],
    },
    analysisReport: {
      summary: "DevOps/SRE có nền tảng vững chắc về hạ tầng Cloud, Kubernetes và GitOps automation.",
      strengths: ["Kinh nghiệm thực chiến Kubernetes EKS & Terraform", "Xây dựng hệ thống giám sát observability hoàn chỉnh"],
      weaknesses: ["Chưa có kinh nghiệm lập trình backend sâu (Go/Python) ngoài scripting Bash/Python"],
      atsKeywordMatch: ["Kubernetes", "Terraform", "AWS", "Docker", "Prometheus", "Grafana", "CI/CD"],
    },
    jdText: "Tuyển DevOps / Site Reliability Engineer (Kubernetes, AWS, Terraform, GitOps, CI/CD).",
    jdMatchReport: {
      matchPercentage: 91,
      matchedSkills: ["Kubernetes", "AWS", "Terraform", "Docker", "Prometheus", "Grafana", "ArgoCD"],
      missingSkills: ["Golang for operator development"],
      fitAssessment: "Rất phù hợp (Strong Fit) cho vị trí DevOps/SRE.",
    },
  },
];
