/**
 * @file scripts/seed/data/companiesData.ts
 * @description List of tech companies, roles, levels and tracks for interview simulation
 */

export interface CompanyTrack {
  company: string;
  tracks: string[];
}

export const COMPANIES_DATA: CompanyTrack[] = [
  {
    company: "Google",
    tracks: [
      "Software Engineer - Frontend",
      "Software Engineer - Backend & Systems",
      "Site Reliability Engineer (SRE)",
      "Machine Learning Engineer",
      "Engineering Manager"
    ],
  },
  {
    company: "Meta",
    tracks: [
      "Product Frontend Engineer",
      "Infrastructure & Distributed Systems",
      "Production Engineer (DevOps)",
      "AI Research & Applied AI"
    ],
  },
  {
    company: "Amazon",
    tracks: [
      "Software Development Engineer (SDE I)",
      "Software Development Engineer (SDE II)",
      "AWS Cloud Solutions Architect",
      "Data Engineer"
    ],
  },
  {
    company: "Shopee",
    tracks: [
      "Backend Engineer (Go/Java)",
      "Frontend Engineer (React/Vue)",
      "High-Concurrency Architect",
      "QA Automation Engineer"
    ],
  },
  {
    company: "Grab",
    tracks: [
      "Backend Engineer - Payments & FinTech",
      "Full Stack Engineer - Merchant Platform",
      "Mobile Engineer (iOS/Android/Flutter)",
      "Data Platform Engineer"
    ],
  },
  {
    company: "VNG",
    tracks: [
      "ZaloPay Backend Engineer",
      "Game Platform Developer",
      "Cloud Infrastructure Engineer",
      "AI Application Developer"
    ],
  },
  {
    company: "Viettel",
    tracks: [
      "Viettel High Tech - Embedded & Cloud",
      "Viettel Digital - Fintech Backend",
      "Cyber Security Specialist",
      "Senior Full Stack Engineer"
    ],
  },
  {
    company: "FPT Software",
    tracks: [
      "Global Delivery Solution Architect",
      "Senior Java / Spring Cloud Engineer",
      "DevOps / SRE Lead",
      "React/Node Full Stack Specialist"
    ],
  },
  {
    company: "Tiki",
    tracks: [
      "E-commerce Platform Engineer",
      "Supply Chain Backend Developer",
      "Search & Recommendation Engineer"
    ],
  },
];

export const ROLES_LIST = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "DevOps Engineer",
  "AI/ML Engineer",
  "Mobile Developer",
  "System Architect",
];

export const LEVELS_LIST = ["Junior", "Mid-Level", "Senior", "Lead", "Staff"];
