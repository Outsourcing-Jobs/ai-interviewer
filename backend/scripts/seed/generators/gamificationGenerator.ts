/**
 * @file scripts/seed/generators/gamificationGenerator.ts
 * @description Generates Gamification records aligned 1:1 with users and achievements
 */

import { Gamification, IGamification } from "../../../models/Gamification.js";
import { IUser } from "../../../models/User.js";
import { ACHIEVEMENTS } from "../../../config/achievements.js";
import { getRandomInt, getRandomItem } from "../utils/random.js";

const ALL_ACHIEVEMENT_KEYS = Object.keys(ACHIEVEMENTS) as (keyof typeof ACHIEVEMENTS)[];

export async function generateGamificationRecords(users: IUser[]): Promise<IGamification[]> {
  const gamificationDocs = [];

  for (const user of users) {
    const badges: { badgeId: string; earnedAt: Date }[] = [];
    const achievementsList: { achievementId: string; progress: number; isCompleted: boolean; completedAt?: Date }[] = [];

    // Always give first interview badge if user has xp > 200
    if (user.xp >= 200) {
      badges.push({
        badgeId: ACHIEVEMENTS.FIRST_INTERVIEW.id,
        earnedAt: new Date(Date.now() - getRandomInt(10, 60) * 24 * 60 * 60 * 1000),
      });
    }

    if (user.streakDays >= 3) {
      badges.push({
        badgeId: ACHIEVEMENTS.STREAK_3.id,
        earnedAt: new Date(Date.now() - getRandomInt(3, 20) * 24 * 60 * 60 * 1000),
      });
    }

    if (user.streakDays >= 7) {
      badges.push({
        badgeId: ACHIEVEMENTS.STREAK_7.id,
        earnedAt: new Date(Date.now() - getRandomInt(1, 10) * 24 * 60 * 60 * 1000),
      });
    }

    if (user.currentLevel >= 10) {
      badges.push({
        badgeId: ACHIEVEMENTS.PERFECT_SCORE.id,
        earnedAt: new Date(Date.now() - getRandomInt(5, 30) * 24 * 60 * 60 * 1000),
      });
      badges.push({
        badgeId: ACHIEVEMENTS.SILVER_TONGUE.id,
        earnedAt: new Date(Date.now() - getRandomInt(2, 15) * 24 * 60 * 60 * 1000),
      });
    }

    if (user.currentLevel >= 20) {
      badges.push({
        badgeId: ACHIEVEMENTS.SYSTEM_DESIGNER.id,
        earnedAt: new Date(Date.now() - getRandomInt(5, 45) * 24 * 60 * 60 * 1000),
      });
      badges.push({
        badgeId: ACHIEVEMENTS.FULL_STACK_VISIONARY.id,
        earnedAt: new Date(Date.now() - getRandomInt(1, 20) * 24 * 60 * 60 * 1000),
      });
    }

    // Populate tracking for achievements
    for (const key of ALL_ACHIEVEMENT_KEYS) {
      const def = ACHIEVEMENTS[key];
      const hasBadge = badges.some((b) => b.badgeId === def.id);
      achievementsList.push({
        achievementId: def.id,
        progress: hasBadge ? def.target : Math.min(def.target, getRandomInt(0, def.target)),
        isCompleted: hasBadge,
        completedAt: hasBadge ? new Date(Date.now() - getRandomInt(1, 30) * 24 * 60 * 60 * 1000) : undefined,
      });
    }

    gamificationDocs.push({
      user: user._id,
      currentStreak: user.streakDays,
      longestStreak: Math.max(user.streakDays, user.streakDays + getRandomInt(0, 15)),
      lastActivityDate: user.lastActiveDate || new Date(),
      xp: user.xp,
      level: user.currentLevel,
      badges,
      achievements: achievementsList,
      leaderboardOptIn: true,
    });
  }

  const inserted = await Gamification.insertMany(gamificationDocs);
  return inserted as unknown as IGamification[];
}
