/**
 * Backfill paymentStatus='completed' for reservations that have a Stripe
 * paymentIntentId but never had paymentStatus promoted past 'pending'/null.
 *
 * Targets only rows where paymentIntentId is set AND paymentStatus is in
 * ('pending', null). Anything in dispute_lost or already 'completed' is left
 * alone.
 *
 * Usage:
 *   npx ts-node scripts/backfill-reservation-payment-status.ts --dry
 *   npx ts-node scripts/backfill-reservation-payment-status.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const DRY = process.argv.includes("--dry");

async function main() {
  const candidates = await prisma.reservation.findMany({
    where: {
      paymentIntentId: { not: null },
      OR: [{ paymentStatus: "pending" }, { paymentStatus: null }],
    },
    select: {
      id: true,
      paymentStatus: true,
      paymentIntentId: true,
      totalPrice: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  console.log(`Found ${candidates.length} candidates to backfill.`);
  if (!candidates.length) return;

  if (DRY) {
    console.log("Dry run — first 10 planned updates:");
    console.log(candidates.slice(0, 10));
    return;
  }

  let applied = 0;
  for (const r of candidates) {
    await prisma.reservation.update({
      where: { id: r.id },
      data: { paymentStatus: "completed" },
    });
    applied++;
  }
  console.log(`Applied ${applied} updates.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
