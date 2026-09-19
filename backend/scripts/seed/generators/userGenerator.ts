/**
 * @file scripts/seed/generators/userGenerator.ts
 * @description Generates users with pre-hashed passwords and realistic profiles
 */

import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { User, IUser } from "../../../models/User.js";
import { getRandomInt, getRandomItem } from "../utils/random.js";
import { ROLES_LIST } from "../data/companiesData.js";

export const DEFAULT_USER_PASSWORD = "UserPassword123!";
export const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "AdminPassword123!";
export const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@aiinterviewer.com";

const FIRST_NAMES = ["Nguyen", "Tran", "Le", "Pham", "Hoang", "Vu", "Dang", "Bui", "Do", "Ngo", "Duong", "Ly"];
const MIDDLE_NAMES = ["Van", "Thi", "Dinh", "Hoang", "Huu", "Quoc", "Minh", "Thanh", "Duc", "Ngoc"];
const LAST_NAMES = ["An", "Binh", "Cuong", "Dung", "Em", "Giang", "Huy", "Khoa", "Linh", "Nam", "Phong", "Quang", "Son", "Tu", "Viet"];

export interface SeededUserResult {
  admin: IUser;
  users: IUser[];
  allUsers: IUser[];
}

export async function generateUsers(userCount: number = 20): Promise<SeededUserResult> {
  // Pre-hash passwords to dramatically speed up seeding and avoid timing overhead
  const salt = await bcrypt.genSalt(10);
  const hashedUserPassword = await bcrypt.hash(DEFAULT_USER_PASSWORD, salt);
  const hashedAdminPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, salt);

  const rawDocs: any[] = [];

  // 1. Admin doc
  rawDocs.push({
    _id: new mongoose.Types.ObjectId(),
    name: "System Admin",
    email: DEFAULT_ADMIN_EMAIL,
    password: hashedAdminPassword,
    role: "admin",
    preferredRole: "System Architect",
    xp: 12500,
    currentLevel: 25,
    streakDays: 45,
    lastActiveDate: new Date(),
  });

  // 2. Candidate docs
  const usedEmails = new Set<string>([DEFAULT_ADMIN_EMAIL]);

  for (let i = 1; i <= userCount; i++) {
    const fn = getRandomItem(FIRST_NAMES);
    const mn = getRandomItem(MIDDLE_NAMES);
    const ln = getRandomItem(LAST_NAMES);
    const fullName = `${fn} ${mn} ${ln}`;
    
    let email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@aiinterviewer.com`;
    if (usedEmails.has(email)) {
      email = `${fn.toLowerCase()}.${ln.toLowerCase()}.${getRandomInt(100, 999)}@aiinterviewer.com`;
    }
    usedEmails.add(email);

    const xp = getRandomInt(200, 8500);
    const level = Math.max(1, Math.floor(Math.pow(xp / 300, 2 / 3)) + 1);
    const streakDays = getRandomInt(0, 30);

    rawDocs.push({
      _id: new mongoose.Types.ObjectId(),
      name: fullName,
      email,
      password: hashedUserPassword,
      role: "user",
      preferredRole: getRandomItem(ROLES_LIST),
      xp,
      currentLevel: level,
      streakDays,
      lastActiveDate: new Date(Date.now() - getRandomInt(0, 7) * 24 * 60 * 60 * 1000),
    });
  }

  // Insert all docs directly via insertMany to bypass pre-save hooks on already-hashed passwords
  const inserted = await User.insertMany(rawDocs);
  const admin = inserted[0] as unknown as IUser;
  const users = inserted.slice(1) as unknown as IUser[];

  return {
    admin,
    users,
    allUsers: inserted as unknown as IUser[],
  };
}
