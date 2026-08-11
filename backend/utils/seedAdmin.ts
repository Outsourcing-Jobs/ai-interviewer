/**
 * @file utils/seedAdmin.ts
 * @description Auto-seeds a default Admin user into MongoDB if no admin account currently exists.
 */

import { User } from "../models/User.js";
import logger from "./logger.js";

export const seedAdminUser = async (): Promise<void> => {
  try {
    const adminExists = await User.findOne({ role: "admin" });
    if (adminExists) {
      return;
    }

    const adminEmail = process.env.ADMIN_EMAIL || "admin@aiinterviewer.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "AdminPassword123!";

    // Check if account with adminEmail already exists as regular user, upgrade it
    const existingUser = await User.findOne({ email: adminEmail });
    if (existingUser) {
      existingUser.role = "admin";
      await existingUser.save();
      logger.info(`👑 Existing user ${adminEmail} upgraded to Admin role.`);
      return;
    }

    // Create brand new admin user
    await User.create({
      name: "System Admin",
      email: adminEmail,
      password: adminPassword,
      role: "admin",
      preferredRole: "System Administrator",
    });

    console.log("\n" + "*".repeat(60));
    console.log("👑 DEFAULT ADMIN ACCOUNT CREATED SUCCESSFULLY:");
    console.log(` 📧 Email   : ${adminEmail}`);
    console.log(` 🔑 Password: ${adminPassword}`);
    console.log(` 🔑 Role    : admin`);
    console.log("*".repeat(60) + "\n");

    logger.info(`Default Admin user created successfully: ${adminEmail}`);
  } catch (error) {
    logger.error("Failed to seed admin user:", error);
  }
};
