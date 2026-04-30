/**
 * Diagnostic for reservation payment/refund status distribution.
 *
 * When Total Reservations > 0 but Total Revenue = $0 in the analytics tile,
 * the reservations exist but don't have paymentStatus='completed' (or are
 * refunded). This script tells you which case it actually is.
 *
 * Usage:
 *   npx ts-node scripts/diagnose-reservation-payments.ts
 *   npx ts-node scripts/diagnose-reservation-payments.ts --user=<userId>
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const userArg = process.argv.find((a) => a.startsWith("--user="));
const userId = userArg ? userArg.slice("--user=".length) : null;

function tally<T>(rows: T[], pick: (r: T) => string | null | undefined) {
  const map = new Map<string, number>();
  for (const r of rows) {
    const key = pick(r) ?? "<null>";
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
}

async function main() {
  const where = userId
    ? {
        OR: [
          { listing: { userId } },
          { employee: { userId } },
        ],
      }
    : {};

  const reservations = await prisma.reservation.findMany({
    where,
    select: {
      id: true,
      paymentStatus: true,
      refundStatus: true,
      paymentIntentId: true,
      status: true,
      totalPrice: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const scope = userId ? `for user ${userId}` : "across all users";
  console.log(`\nFound ${reservations.length} reservations ${scope}.\n`);
  if (!reservations.length) return;

  console.log("paymentStatus distribution:");
  for (const [k, v] of tally(reservations, (r) => r.paymentStatus)) {
    console.log(`  ${k.padEnd(20)} ${v}`);
  }

  console.log("\nrefundStatus distribution:");
  for (const [k, v] of tally(reservations, (r) => r.refundStatus)) {
    console.log(`  ${k.padEnd(20)} ${v}`);
  }

  console.log("\nstatus distribution:");
  for (const [k, v] of tally(reservations, (r) => r.status)) {
    console.log(`  ${k.padEnd(20)} ${v}`);
  }

  // "Stuck" rows — went through Stripe (have paymentIntentId) but their
  // paymentStatus never got promoted past 'pending'. Prime backfill targets.
  const stuck = reservations.filter(
    (r) => !!r.paymentIntentId && r.paymentStatus !== "completed"
  );
  console.log(
    `\nStuck (has paymentIntentId, paymentStatus != 'completed'): ${stuck.length}`
  );

  // No paymentIntentId — never went through Stripe. Likely legacy/seed data
  // or created via the unused POST /api/reservations endpoint.
  const noIntent = reservations.filter((r) => !r.paymentIntentId);
  console.log(
    `No paymentIntentId (legacy / non-Stripe path):           ${noIntent.length}`
  );

  // Sample of recent rows so the user can eyeball them.
  console.log("\nMost recent 10:");
  console.log(
    reservations.slice(0, 10).map((r) => ({
      id: r.id,
      paymentStatus: r.paymentStatus,
      refundStatus: r.refundStatus,
      hasPaymentIntent: !!r.paymentIntentId,
      status: r.status,
      totalPrice: r.totalPrice,
      createdAt: r.createdAt.toISOString(),
    }))
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
