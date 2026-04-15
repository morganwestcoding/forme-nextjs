/**
 * One-time backfill for Notification.relatedUserId and Notification.relatedListingId.
 *
 * Usage:   npx ts-node scripts/backfill-notification-relations.ts
 * Dry-run: npx ts-node scripts/backfill-notification-relations.ts --dry
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const DRY = process.argv.includes("--dry");

type Update = { id: string; relatedUserId?: string; relatedListingId?: string };

const LISTING_USER_TYPES = new Set([
  "LISTING_FOLLOW",
  "RESERVATION_CREATED",
  "NEW_RESERVATION",
  "RESERVATION_ACCEPTED",
  "RESERVATION_DECLINED",
  "RESERVATION_CANCELLED_BY_BUSINESS",
  "RESERVATION_CANCELLED_BY_USER",
  "REFUND_REQUESTED",
  "REFUND_COMPLETED",
]);

const USER_TYPES = new Set([
  "NEW_MESSAGE",
  "NEW_FOLLOWER",
  "MUTUAL_FOLLOW",
  "SHOP_FOLLOW",
  "POST_LIKED",
  "POST_COMMENTED",
  "NEW_BOOKMARK",
  "PAYOUT_REQUEST",
  "TIME_OFF_REQUEST",
]);

async function main() {
  const relevantTypes = [...LISTING_USER_TYPES, ...USER_TYPES];
  const notifications = await prisma.notification.findMany({
    where: {
      type: { in: relevantTypes },
      AND: [
        { OR: [{ relatedUserId: { isSet: false } }, { relatedUserId: null }] },
        { OR: [{ relatedListingId: { isSet: false } }, { relatedListingId: null }] },
      ],
    },
    orderBy: { createdAt: "asc" },
  });

  console.log(`Found ${notifications.length} notifications missing relations.`);

  const updates: Update[] = [];
  let skipped = 0;

  for (const n of notifications) {
    const windowMs = 15 * 60 * 1000; // ±15 minutes
    const before = new Date(n.createdAt.getTime() + windowMs);
    const after = new Date(n.createdAt.getTime() - windowMs);

    try {
      if (n.type === "NEW_MESSAGE") {
        // Find messages sent to this user near the timestamp, pick the closest.
        const convoIds = await prisma.conversation
          .findMany({ where: { userIds: { has: n.userId } }, select: { id: true } })
          .then((c) => c.map((x) => x.id));
        if (!convoIds.length) { skipped++; continue; }
        const msg = await prisma.message.findFirst({
          where: {
            conversationId: { in: convoIds },
            senderId: { not: n.userId },
            createdAt: { gte: after, lte: before },
          },
          orderBy: { createdAt: "asc" },
        });
        if (msg) updates.push({ id: n.id, relatedUserId: msg.senderId });
        else skipped++;
        continue;
      }

      if (n.type === "NEW_FOLLOWER" || n.type === "MUTUAL_FOLLOW" || n.type === "SHOP_FOLLOW") {
        // Actor name embedded in content as prefix: "<name> ..."
        const name = n.content.split(" ")[0];
        if (!name) { skipped++; continue; }
        const user = await prisma.user.findFirst({
          where: { name: { startsWith: name } },
          orderBy: { createdAt: "asc" },
        });
        if (user) updates.push({ id: n.id, relatedUserId: user.id });
        else skipped++;
        continue;
      }

      if (n.type === "POST_LIKED" || n.type === "POST_COMMENTED" || n.type === "NEW_BOOKMARK") {
        const name = n.content.split(" ")[0];
        if (!name) { skipped++; continue; }
        const user = await prisma.user.findFirst({
          where: { name: { startsWith: name }, id: { not: n.userId } },
        });
        if (user) updates.push({ id: n.id, relatedUserId: user.id });
        else skipped++;
        continue;
      }

      if (n.type === "PAYOUT_REQUEST" || n.type === "TIME_OFF_REQUEST") {
        // Employees owned by this listing-owner's listings
        const employees = await prisma.employee.findMany({
          where: { listing: { userId: n.userId } },
          select: { fullName: true, userId: true },
        });
        const match = employees.find((e) => n.content.startsWith(e.fullName));
        if (match) updates.push({ id: n.id, relatedUserId: match.userId });
        else skipped++;
        continue;
      }

      if (n.type === "LISTING_FOLLOW") {
        // Content: `... followed your listing "<title>"`
        const m = n.content.match(/followed your listing "([^"]+)"/);
        if (m) {
          const listing = await prisma.listing.findFirst({
            where: { userId: n.userId, title: m[1] },
          });
          if (listing) { updates.push({ id: n.id, relatedListingId: listing.id }); continue; }
        }
        skipped++;
        continue;
      }

      if (
        n.type === "RESERVATION_CREATED" ||
        n.type === "RESERVATION_ACCEPTED" ||
        n.type === "RESERVATION_DECLINED" ||
        n.type === "RESERVATION_CANCELLED_BY_BUSINESS" ||
        n.type === "REFUND_COMPLETED"
      ) {
        // notification.userId is the customer — find their reservation around createdAt
        const reservation = await prisma.reservation.findFirst({
          where: { userId: n.userId, createdAt: { lte: before } },
          orderBy: { createdAt: "desc" },
        });
        if (reservation) updates.push({ id: n.id, relatedListingId: reservation.listingId });
        else skipped++;
        continue;
      }

      if (
        n.type === "NEW_RESERVATION" ||
        n.type === "RESERVATION_CANCELLED_BY_USER" ||
        n.type === "REFUND_REQUESTED"
      ) {
        // notification.userId is the listing owner — find their listings' reservations near createdAt
        const listings = await prisma.listing.findMany({
          where: { userId: n.userId },
          select: { id: true },
        });
        const listingIds = listings.map((l) => l.id);
        if (!listingIds.length) { skipped++; continue; }
        const reservation = await prisma.reservation.findFirst({
          where: { listingId: { in: listingIds }, createdAt: { lte: before } },
          orderBy: { createdAt: "desc" },
        });
        if (reservation) updates.push({ id: n.id, relatedListingId: reservation.listingId });
        else skipped++;
        continue;
      }

      skipped++;
    } catch (err) {
      console.error(`Error on notification ${n.id}:`, err);
      skipped++;
    }
  }

  console.log(`Prepared ${updates.length} updates, skipped ${skipped}.`);

  if (DRY) {
    console.log("Dry run — first 10 planned updates:");
    console.log(updates.slice(0, 10));
    return;
  }

  let applied = 0;
  for (const u of updates) {
    await prisma.notification.update({
      where: { id: u.id },
      data: {
        ...(u.relatedUserId ? { relatedUserId: u.relatedUserId } : {}),
        ...(u.relatedListingId ? { relatedListingId: u.relatedListingId } : {}),
      },
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
