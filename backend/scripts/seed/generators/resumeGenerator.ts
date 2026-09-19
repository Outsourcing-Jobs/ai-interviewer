/**
 * @file scripts/seed/generators/resumeGenerator.ts
 * @description Generates Resume records with parsed ATS reports and JD matching data
 */

import mongoose from "mongoose";
import { Resume, IResume } from "../../../models/Resume.js";
import { IUser } from "../../../models/User.js";
import { RESUME_TEMPLATES } from "../data/resumeTemplates.js";
import { getRandomInt, getRandomItem, getRandomPastDate } from "../utils/random.js";

export async function generateResumes(
  users: IUser[],
  totalResumes: number = 30
): Promise<IResume[]> {
  const resumeDocs: any[] = [];

  for (let i = 0; i < totalResumes; i++) {
    const user = getRandomItem(users);
    const template = getRandomItem(RESUME_TEMPLATES);
    const uniqueSuffix = `${Date.now()}_${getRandomInt(1000, 9999)}`;
    const storedFilename = `resume_${user._id}_${uniqueSuffix}.pdf`;
    const createdAt = getRandomPastDate(60);

    const statusList: ("completed" | "parsed" | "analyzing")[] = ["completed", "completed", "completed", "parsed"];
    const status = getRandomItem(statusList);

    resumeDocs.push({
      _id: new mongoose.Types.ObjectId(),
      user: user._id,
      originalFilename: template.title,
      storedFilename,
      fileType: "pdf",
      fileSize: getRandomInt(150000, 850000),
      filePath: `uploads/resumes/${storedFilename}`,
      status,
      jobId: `job_${uniqueSuffix}`,
      parsedData: template.parsedData,
      analysisReport: status === "completed" ? template.analysisReport : {},
      jdText: template.jdText,
      jdMatchReport: status === "completed" ? template.jdMatchReport : {},
      scores: status === "completed" ? template.scores : { ats: 0, overall: 0, jdMatch: 0 },
      createdAt,
      updatedAt: createdAt,
    });
  }

  const inserted = await Resume.insertMany(resumeDocs);
  return inserted as unknown as IResume[];
}
