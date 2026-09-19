/**
 * @file scripts/seed/index.ts
 * @description Master Database Seeder & Migration script for AI-Interviewer
 *
 * Usage:
 *   npx tsx scripts/seed/index.ts             # Default seed (clean old data + insert ~20 users, 80 sessions, 35 resumes)
 *   npx tsx scripts/seed/index.ts --large     # Large seed (clean old data + insert ~50 users, 250 sessions, 100 resumes)
 *   npx tsx scripts/seed/index.ts --clean     # Clean all data without seeding
 */

import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";

// Load environment variables from backend/.env
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { User } from "../../models/User.js";
import { Gamification } from "../../models/Gamification.js";
import { Session } from "../../models/Session.js";
import { Resume } from "../../models/Resume.js";
import { RefreshToken } from "../../models/RefreshToken.js";

import { generateUsers, DEFAULT_USER_PASSWORD, DEFAULT_ADMIN_PASSWORD, DEFAULT_ADMIN_EMAIL } from "./generators/userGenerator.js";
import { generateGamificationRecords } from "./generators/gamificationGenerator.js";
import { generateSessions } from "./generators/sessionGenerator.js";
import { generateResumes } from "./generators/resumeGenerator.js";

async function runSeed() {
  const startTime = Date.now();
  const args = process.argv.slice(2);
  const isCleanOnly = args.includes("--clean") || args.includes("--clean-only");
  const isLarge = args.includes("--large") || args.includes("--huge");

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("❌ ERROR: MONGO_URI environment variable is not defined in .env!");
    process.exit(1);
  }

  console.log("\n" + "=".repeat(65));
  console.log("🚀  AI-INTERVIEWER DATABASE SEEDER & MIGRATION TOOL");
  console.log("=".repeat(65));

  try {
    console.log(`\n⏳ Connecting to MongoDB at: ${mongoUri.replace(/:([^:@]+)@/, ":****@")} ...`);
    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB Connected successfully.");

    // STEP 1: ALWAYS WIPE OLD DATA FIRST (AS REQUESTED)
    console.log("\n🧹 [1/5] Wiping all existing collections (User, Gamification, Session, Resume, RefreshToken)...");
    const [delUsers, delGam, delSess, delRes, delRef] = await Promise.all([
      User.deleteMany({}),
      Gamification.deleteMany({}),
      Session.deleteMany({}),
      Resume.deleteMany({}),
      RefreshToken.deleteMany({}),
    ]);

    console.log(`   - Deleted ${delUsers.deletedCount} Users`);
    console.log(`   - Deleted ${delGam.deletedCount} Gamification records`);
    console.log(`   - Deleted ${delSess.deletedCount} Sessions`);
    console.log(`   - Deleted ${delRes.deletedCount} Resumes`);
    console.log(`   - Deleted ${delRef.deletedCount} RefreshTokens`);
    console.log("✅ Cleaned database completely.");

    if (isCleanOnly) {
      console.log("\n🎉 Database clean completed successfully (--clean mode). Exiting.");
      await mongoose.disconnect();
      process.exit(0);
    }

    // Config counts
    const userCount = isLarge ? 50 : 20;
    const sessionCount = isLarge ? 250 : 80;
    const resumeCount = isLarge ? 100 : 35;

    console.log(`\n🌱 [2/5] Seeding Users (Scale: ${isLarge ? "LARGE" : "STANDARD"} - ${userCount + 1} users)...`);
    const { admin, users, allUsers } = await generateUsers(userCount);
    console.log(`✅ Created 1 Admin (${admin.email}) and ${users.length} Candidates.`);

    console.log("\n🏆 [3/5] Seeding Gamification & Badges synchronized with Users...");
    const gamificationRecords = await generateGamificationRecords(allUsers);
    console.log(`✅ Created ${gamificationRecords.length} Gamification profiles with XP, Streaks and Badges.`);

    console.log(`\n🎙️  [4/5] Seeding Interview Sessions (~${sessionCount} sessions with questions, audio metrics, AI feedback)...`);
    const sessions = await generateSessions(allUsers, sessionCount);
    const totalQuestions = sessions.reduce((sum, s) => sum + (s.questions ? s.questions.length : 0), 0);
    console.log(`✅ Created ${sessions.length} Sessions containing ${totalQuestions} evaluated questions across companies.`);

    console.log(`\n📄 [5/5] Seeding Resumes & ATS analysis reports (~${resumeCount} resumes)...`);
    const resumes = await generateResumes(allUsers, resumeCount);
    console.log(`✅ Created ${resumes.length} Resumes with full ATS analysis and JD match reports.`);

    const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log("\n" + "=".repeat(65));
    console.log("🎉 DATABASE MIGRATION & SEEDING COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(65));
    console.log(`⏱️  Execution Time     : ${durationSec}s`);
    console.log(`👤 Total Users        : ${allUsers.length}`);
    console.log(`🏆 Gamification Recs  : ${gamificationRecords.length}`);
    console.log(`🎙️  Total Sessions     : ${sessions.length} (${totalQuestions} questions)`);
    console.log(`📄 Total Resumes      : ${resumes.length}`);
    console.log("-".repeat(65));
    console.log("🔑 SAMPLE LOGIN CREDENTIALS:");
    console.log(`  👑 Admin Account    : ${DEFAULT_ADMIN_EMAIL}`);
    console.log(`     Password         : ${DEFAULT_ADMIN_PASSWORD}`);
    console.log(`  👨‍💻 Candidate Example: ${users[0]?.email || "user1@aiinterviewer.com"}`);
    console.log(`     Password         : ${DEFAULT_USER_PASSWORD}`);
    console.log("=".repeat(65) + "\n");

  } catch (error) {
    console.error("\n❌ ERROR during database migration/seeding:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB connection closed.");
  }
}

runSeed();
