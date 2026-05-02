/**
 * Set a known password on the three seeded worker accounts so they can log in
 * via the credentials provider.
 *
 * Usage:
 *   npx ts-node scripts/set-worker-passwords.ts            # dry run
 *   npx ts-node scripts/set-worker-passwords.ts --confirm  # actually write
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PASSWORD = "Worker-Demo-2026!";
const EMAILS = [
  "jordan.riley@example.com",
  "maya.vega@example.com",
  "kai.chen@example.com",
];

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
  console.log("│ SET WORKER PASSWORDS");
  console.log("├─────────────────────────────────────────────");
  console.log(`│ host:     ${host}`);
  console.log(`│ database: ${database}`);
  console.log(`│ mode:     ${confirm ? "WRITE (live)" : "DRY RUN"}`);
  console.log("└─────────────────────────────────────────────\n");

  for (const email of EMAILS) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, hashedPassword: true },
    });
    if (!user) {
      console.log(`✗ ${email} — not found, skipping`);
      continue;
    }
    const had = Boolean(user.hashedPassword);
    console.log(`▸ ${user.name} (${email})  ${had ? "[password exists, will overwrite]" : "[no password yet]"}`);
  }

  if (!confirm) {
    console.log("\nDry run complete. Pass --confirm to actually write.\n");
    return;
  }

  const hashed = await bcrypt.hash(PASSWORD, 12);

  for (const email of EMAILS) {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (!user) continue;
    await prisma.user.update({
      where: { id: user.id },
      data: { hashedPassword: hashed, emailVerified: new Date() },
    });
    console.log(`✓ ${email}`);
  }

  console.log("\n─────────────────────────────────────────────");
  console.log(`Password set on all workers: ${PASSWORD}`);
  console.log("─────────────────────────────────────────────\n");
}

main()
  .catch((err) => {
    console.error("Set-worker-passwords failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
