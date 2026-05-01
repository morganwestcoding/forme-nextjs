/**
 * Wipe all content from the database while preserving the Prisma schema.
 *
 * Runs deleteMany({}) across every model. Connects to whatever DATABASE_URL
 * is currently set in the environment.
 *
 * Safety:
 *   - Defaults to a dry run that only counts rows.
 *   - Prints the target host + database name before doing anything.
 *   - Requires --confirm to actually delete.
 *
 * Usage:
 *   npx ts-node scripts/wipe-content.ts            # dry run, just counts
 *   npx ts-node scripts/wipe-content.ts --confirm  # actually wipes
 *
 * To wipe a different DB (e.g. production), prefix with the URL:
 *   DATABASE_URL="mongodb+srv://..." npx ts-node scripts/wipe-content.ts --confirm
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Order: child/dependent records first, parent records last. Doesn't matter
// for correctness on Mongo (no FK constraints), but keeps the log readable.
const MODELS = [
  "comment",
  "postMention",
  "post",
  "notification",
  "message",
  "conversation",
  "review",
  "reservation",
  "service",
  "storeHours",
  "employeeAvailability",
  "timeOffRequest",
  "payout",
  "payPeriod",
  "payAgreement",
  "clientRecord",
  "employee",
  "product",
  "productCategory",
  "shop",
  "listing",
  "academy",
  "category",
  "webhookEvent",
  "dispute",
  "account",
  "user",
] as const;

function describeTarget(): { host: string; database: string } {
  const url = process.env.DATABASE_URL || "";
  // Strip credentials, then parse host + db name.
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
  console.log("│ DATABASE WIPE");
  console.log("├─────────────────────────────────────────────");
  console.log(`│ host:     ${host}`);
  console.log(`│ database: ${database}`);
  console.log(`│ mode:     ${confirm ? "DELETE (live)" : "DRY RUN (counts only)"}`);
  console.log("└─────────────────────────────────────────────\n");

  if (!confirm) {
    console.log("Pass --confirm to actually delete.\n");
  }

  let totalDeleted = 0;

  for (const model of MODELS) {
    const client = (prisma as any)[model];
    if (!client?.count || !client?.deleteMany) {
      console.warn(`  skip   ${model.padEnd(22)} (not on client)`);
      continue;
    }

    const count: number = await client.count();

    if (!confirm) {
      console.log(`  count  ${model.padEnd(22)} ${count}`);
      continue;
    }

    if (count === 0) {
      console.log(`  empty  ${model.padEnd(22)} 0`);
      continue;
    }

    const result = await client.deleteMany({});
    totalDeleted += result.count;
    console.log(`  wiped  ${model.padEnd(22)} ${result.count}`);
  }

  console.log("\n─────────────────────────────────────────────");
  if (confirm) {
    console.log(`Done. Deleted ${totalDeleted} rows across ${MODELS.length} models.`);
  } else {
    console.log("Dry run complete. No data was deleted.");
  }
  console.log("─────────────────────────────────────────────\n");
}

main()
  .catch((err) => {
    console.error("Wipe failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
