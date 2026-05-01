/**
 * Export all DemoRequest rows as CSV to stdout.
 *
 * Usage:
 *   npx ts-node scripts/export-demo-requests.ts > demo-requests.csv
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

async function main() {
  const rows = await prisma.demoRequest.findMany({
    orderBy: { createdAt: "asc" },
  });

  const headers = ["name", "email", "createdAt", "source", "isActive", "id"];
  const lines = [headers.join(",")];
  for (const r of rows) {
    lines.push(
      [
        csvEscape(r.name),
        csvEscape(r.email),
        csvEscape(r.createdAt.toISOString()),
        csvEscape(r.source),
        csvEscape(r.isActive),
        csvEscape(r.id),
      ].join(","),
    );
  }
  process.stdout.write(lines.join("\n") + "\n");
  process.stderr.write(`\nExported ${rows.length} demo request rows\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
