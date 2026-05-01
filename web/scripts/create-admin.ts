/**
 * Create (or upgrade) an admin user.
 *
 * Sets role = "admin", grants verified status, and sets a known password.
 * If a user with this email already exists, the script promotes them to admin
 * and resets the password so you can log in immediately.
 *
 * Safety:
 *   - Defaults to a dry run that shows what would change.
 *   - Prints the target host + database before doing anything.
 *   - Requires --confirm to actually write.
 *
 * Usage:
 *   npx ts-node scripts/create-admin.ts            # dry run
 *   npx ts-node scripts/create-admin.ts --confirm  # actually create / upgrade
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "mewwes@gmail.com";
const ADMIN_NAME = "Admin";
const ADMIN_PASSWORD = "ForMe-Admin-2026!";

function describeTarget(): { host: string; database: string } {
  const url = process.env.DATABASE_URL || "";
  const sanitized = url.replace(/\/\/[^@]*@/, "//");
  const match = sanitized.match(/\/\/([^/?]+)\/([^?]+)/);
  return {
    host: match?.[1] ?? "(unknown)",
    database: match?.[2] ?? "(unknown)",
  };
}

async function main() {
  const args = process.argv.slice(2);
  const confirm = args.includes("--confirm");
  const { host, database } = describeTarget();

  console.log("\n┌─────────────────────────────────────────────");
  console.log("│ CREATE ADMIN USER");
  console.log("├─────────────────────────────────────────────");
  console.log(`│ host:     ${host}`);
  console.log(`│ database: ${database}`);
  console.log(`│ email:    ${ADMIN_EMAIL}`);
  console.log(`│ role:     admin`);
  console.log(`│ mode:     ${confirm ? "WRITE (live)" : "DRY RUN"}`);
  console.log("└─────────────────────────────────────────────\n");

  const existing = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
    select: { id: true, name: true, role: true, userType: true },
  });

  if (existing) {
    console.log(`Found existing user (id ${existing.id}):`);
    console.log(`  name:     ${existing.name ?? "(unset)"}`);
    console.log(`  role:     ${existing.role ?? "user"}`);
    console.log(`  userType: ${existing.userType ?? "(unset)"}\n`);
    console.log("Action: promote to admin, clear userType, reset password.\n");
  } else {
    console.log("No existing user — will create a fresh admin.\n");
  }

  if (!confirm) {
    console.log("Dry run complete. Pass --confirm to actually write.\n");
    return;
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const now = new Date();

  const user = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      name: existing?.name ?? ADMIN_NAME,
      role: "admin",
      userType: null,
      hashedPassword,
      emailVerified: now,
      verificationStatus: "verified",
      verifiedAt: now,
      isSubscribed: true,
      subscriptionTier: "Platinum",
      subscriptionStatus: "active",
      subscriptionStartDate: now,
    },
    create: {
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      role: "admin",
      userType: null,
      hashedPassword,
      bio: "",
      emailVerified: now,
      verificationStatus: "verified",
      verifiedAt: now,
      isSubscribed: true,
      subscriptionTier: "Platinum",
      subscriptionStatus: "active",
      subscriptionStartDate: now,
    },
    select: { id: true, email: true, name: true, role: true, userType: true },
  });

  console.log("─────────────────────────────────────────────");
  console.log("Done.");
  console.log(`  id:       ${user.id}`);
  console.log(`  email:    ${user.email}`);
  console.log(`  name:     ${user.name}`);
  console.log(`  role:     ${user.role}`);
  console.log(`  userType: ${user.userType ?? "(unset)"}`);
  console.log("─────────────────────────────────────────────\n");
  console.log(`Login password: ${ADMIN_PASSWORD}`);
  console.log("Change it after first login if you want.\n");
}

main()
  .catch((err) => {
    console.error("Create-admin failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
