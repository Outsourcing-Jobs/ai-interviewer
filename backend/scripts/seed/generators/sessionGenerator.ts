/**
 * @file scripts/seed/generators/sessionGenerator.ts
 * @description Generates interview sessions with realistic time-series distribution and embedded questions
 */

import mongoose from "mongoose";
import { Session, ISession } from "../../../models/Session.js";
import { IUser } from "../../../models/User.js";
import { QUESTIONS_BANK } from "../data/questionsBank.js";
import { COMPANIES_DATA, LEVELS_LIST } from "../data/companiesData.js";
import { EVALUATION_FEEDBACKS, VIETNAMESE_FILLER_WORDS } from "../data/feedbackTemplates.js";
import { getRandomInt, getRandomItem, getRandomItems, getRandomPastDate, getEndDate } from "../utils/random.js";

function getAIEvaluation(score: number): string {
  const match = EVALUATION_FEEDBACKS.find((e) => score >= e.minScore && score <= e.maxScore);
  if (match) {
    return getRandomItem(match.feedbacks);
  }
  return "Ứng viên trả lời đạt yêu cầu cơ bản.";
}

export async function generateSessions(
  users: IUser[],
  totalSessions: number = 60
): Promise<ISession[]> {
  const sessionDocs: any[] = [];

  for (let i = 0; i < totalSessions; i++) {
    const user = getRandomItem(users);
    const companyInfo = getRandomItem(COMPANIES_DATA);
    const company = companyInfo.company;
    const companyTrack = getRandomItem(companyInfo.tracks);
    const level = getRandomItem(LEVELS_LIST);
    const role = user.preferredRole || "Full Stack Developer";

    const interviewTypes: ("oral-only" | "coding-mix" | "company-specific")[] = [
      "oral-only",
      "coding-mix",
      "company-specific",
    ];
    const interviewType = getRandomItem(interviewTypes);

    // 80% completed, 10% in-progress, 5% pending, 5% failed
    const statusRoll = Math.random();
    let status: "pending" | "in-progress" | "completed" | "cancelled" | "failed" = "completed";
    if (statusRoll < 0.05) status = "pending";
    else if (statusRoll < 0.15) status = "in-progress";
    else if (statusRoll < 0.20) status = "failed";

    const startTime = getRandomPastDate(90);
    const endTime = status === "completed" ? getEndDate(startTime, getRandomInt(25, 55)) : null;

    // Pick 3 to 6 questions for this session
    const questionCount = getRandomInt(3, 6);
    const pickedQuestions = getRandomItems(QUESTIONS_BANK, questionCount);

    let totalTech = 0;
    let totalConf = 0;
    let evaluatedCount = 0;

    const questions = pickedQuestions.map((qTemplate, idx) => {
      const isEvaluated = status === "completed" || (status === "in-progress" && idx === 0);
      const isSubmitted = isEvaluated || status === "in-progress";

      const techScore = isEvaluated ? getRandomInt(50, 98) : 0;
      const confScore = isEvaluated ? getRandomInt(55, 95) : 0;

      if (isEvaluated) {
        totalTech += techScore;
        totalConf += confScore;
        evaluatedCount++;
      }

      const userAnswer = qTemplate.sampleUserAnswers ? getRandomItem(qTemplate.sampleUserAnswers) : "Dạ em xin trả lời...";
      const submittedCode = qTemplate.sampleCodes ? getRandomItem(qTemplate.sampleCodes) : "";
      const submittedDiagram = qTemplate.sampleDiagrams ? getRandomItem(qTemplate.sampleDiagrams) : "";

      const fillerWords = getRandomItems(VIETNAMESE_FILLER_WORDS, getRandomInt(1, 3));
      const totalFillerCount = fillerWords.reduce((sum, item) => sum + item.count, 0);
      const speakingPaceWpm = getRandomInt(120, 160);
      let paceRating = "Optimal";
      if (speakingPaceWpm < 130) paceRating = "Slow";
      else if (speakingPaceWpm > 150) paceRating = "Fast";

      return {
        questionText: qTemplate.questionText,
        questionType: qTemplate.questionType,
        idealAnswer: qTemplate.idealAnswer,
        userAnswerText: isSubmitted ? userAnswer : "",
        userSubmittedCode: isSubmitted ? submittedCode : "",
        userSubmittedDiagram: isSubmitted ? submittedDiagram : "",
        diagramImageUrl: submittedDiagram ? "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600" : "",
        isSubmitted,
        isEvaluated,
        technicalScore: techScore,
        confidenceScore: confScore,
        aiFeedback: isEvaluated ? getAIEvaluation(techScore) : "",
        speechMetrics: isEvaluated
          ? {
              fillerWordCount: totalFillerCount,
              fillerWords,
              speakingPaceWpm,
              paceRating,
              totalPauseDurationMs: getRandomInt(800, 3500),
              pauseCount: getRandomInt(1, 5),
              clarityScore: getRandomInt(75, 98),
            }
          : {
              fillerWordCount: 0,
              fillerWords: [],
              speakingPaceWpm: 0,
              paceRating: "Unknown",
              totalPauseDurationMs: 0,
              pauseCount: 0,
              clarityScore: 0,
            },
        isFollowUp: idx > 0 && Math.random() < 0.25,
        parentQuestionIndex: idx > 0 ? 0 : undefined,
        createdAt: startTime,
        updatedAt: endTime || startTime,
      };
    });

    const avgTech = evaluatedCount > 0 ? Math.round(totalTech / evaluatedCount) : 0;
    const avgConf = evaluatedCount > 0 ? Math.round(totalConf / evaluatedCount) : 0;
    const overallScore = evaluatedCount > 0 ? Math.round((avgTech + avgConf) / 2) : 0;

    sessionDocs.push({
      _id: new mongoose.Types.ObjectId(),
      user: user._id,
      role,
      level,
      interviewType,
      company: interviewType === "company-specific" ? company : (Math.random() < 0.5 ? company : undefined),
      companyTrack: interviewType === "company-specific" ? companyTrack : undefined,
      status,
      overallScore,
      metrics: {
        avgTechnical: avgTech,
        avgConfidence: avgConf,
      },
      language: "vi",
      voiceMode: "voice",
      questions,
      startTime,
      endTime,
      createdAt: startTime,
      updatedAt: endTime || startTime,
    });
  }

  const inserted = await Session.insertMany(sessionDocs);
  return inserted as unknown as ISession[];
}
