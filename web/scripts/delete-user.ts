/**
 * Safely delete a user and every dependent record that points at them.
 *
 * Prisma Studio's UI delete leaves orphans because it doesn't always honor
 * `onDelete: Cascade` for all relations (especially across the worker/payout
 * chain). This script does the cleanup explicitly in dependency order.
 *
 * Usage:   npx ts-node scripts/delete-user.ts <email>
 * Example: npx ts-node scripts/delete-user.ts student1@gmail.com
 *
 * Dry-run: pass --dry to see what WOULD be deleted without touching anything.
 *   npx ts-node scripts/delete-user.ts student1@gmail.com --dry
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function deleteUser(email: string, dryRun: boolean) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, role: true, userType: true },
  });

  if (!user) {
    console.error(`No user found with email "${email}"`);
    process.exit(1);
  }

  if (user.role === "master") {
    console.error(`Refusing to delete master user "${email}". Demote them first.`);
    process.exit(1);
  }

  console.log(`\nTarget: ${user.name ?? "(no name)"} <${user.email}>`);
  console.log(`  id:       ${user.id}`);
  console.log(`  role:     ${user.role ?? "user"}`);
  console.log(`  userType: ${user.userType ?? "(unset)"}`);

  // Gather everything that references this user, directly or transitively.
  const userId = user.id;

  const [
    employees,
    listings,
    reservationsAsCustomer,
    posts,
    comments,
    notifications,
    accounts,
    shops,
    clientRecords,
    messages,
  ] = await Promise.all([
    prisma.employee.findMany({ where: { userId }, select: { id: true } }),
    prisma.listing.findMany({ where: { userId }, select: { id: true } }),
    prisma.reservation.findMany({ where: { userId }, select: { id: true } }),
    prisma.post.findMany({ where: { userId }, select: { id: true } }),
    prisma.comment.findMany({ where: { userId }, select: { id: true } }),
    prisma.notification.findMany({ where: { userId }, select: { id: true } }),
    prisma.account.findMany({ where: { userId }, select: { id: true } }),
    prisma.shop.findMany({ where: { userId }, select: { id: true } }),
    prisma.clientRecord.findMany({ where: { userId }, select: { id: true } }),
    prisma.message.findMany({ where: { senderId: userId }, select: { id: true } }),
  ]);

  const employeeIds = employees.map((e) => e.id);
  const listingIds = listings.map((l) => l.id);

  // Reservations made FOR this user (they were the booked employee)
  const reservationsAsEmployee = employeeIds.length
    ? await prisma.reservation.findMany({
        where: { employeeId: { in: employeeIds } },
        select: { id: true },
      })
    : [];

  // PayAgreements / PayPeriods / Payouts attached to those employee rows
  const [payAgreements, payPeriods, payouts] = await Promise.all([
    employeeIds.length
      ? prisma.payAgreement.findMany({ where: { employeeId: { in: employeeIds } }, select: { id: true } })
      : Promise.resolve([]),
    employeeIds.length
      ? prisma.payPeriod.findMany({ where: { employeeId: { in: employeeIds } }, select: { id: true } })
      : Promise.resolve([]),
    employeeIds.length
      ? prisma.payout.findMany({ where: { employeeId: { in: employeeIds } }, select: { id: true } })
      : Promise.resolve([]),
  ]);

  // Reservations + employees on listings this user owns
  const reservationsOnOwnedListings = listingIds.length
    ? await prisma.reservation.findMany({
        where: { listingId: { in: listingIds } },
        select: { id: true },
      })
    : [];
  const employeesOnOwnedListings = listingIds.length
    ? await prisma.employee.findMany({
        where: { listingId: { in: listingIds } },
        select: { id: true },
      })
    : [];

  console.log(`\nWill delete:`);
  console.log(`  ${reservationsAsCustomer.length} reservations made as customer`);
  console.log(`  ${reservationsAsEmployee.length} reservations made FOR this user (as worker)`);
  console.log(`  ${reservationsOnOwnedListings.length} reservations on listings this user owns`);
  console.log(`  ${employees.length} employee rows`);
  console.log(`  ${employeesOnOwnedListings.length} employees on listings this user owns`);
  console.log(`  ${payAgreements.length} PayAgreements`);
  console.log(`  ${payPeriods.length} PayPeriods`);
  console.log(`  ${payouts.length} Payouts`);
  console.log(`  ${listings.length} listings owned by this user`);
  console.log(`  ${posts.length} posts`);
  console.log(`  ${comments.length} comments`);
  console.log(`  ${notifications.length} notifications`);
  console.log(`  ${accounts.length} OAuth accounts`);
  console.log(`  ${shops.length} shops`);
  console.log(`  ${clientRecords.length} client records`);
  console.log(`  ${messages.length} messages sent`);
  console.log(`  + the User row itself`);

  if (dryRun) {
    console.log(`\n[dry-run] No changes made. Re-run without --dry to actually delete.`);
    return;
  }

  // Delete in dependency order — children before parents.
  // Reservations first (they reference employees + listings + user)
  const allReservationIds = Array.from(
    new Set([
      ...reservationsAsCustomer.map((r) => r.id),
      ...reservationsAsEmployee.map((r) => r.id),
      ...reservationsOnOwnedListings.map((r) => r.id),
    ])
  );
  if (allReservationIds.length) {
    await prisma.reservation.deleteMany({ where: { id: { in: allReservationIds } } });
    console.log(`✓ Deleted ${allReservationIds.length} reservations`);
  }

  // Payout chain — must delete before the employee rows they reference
  const allEmployeeIds = Array.from(new Set([...employeeIds, ...employeesOnOwnedListings.map((e) => e.id)]));
  if (allEmployeeIds.length) {
    const payAgrDel = await prisma.payAgreement.deleteMany({
      where: { employeeId: { in: allEmployeeIds } },
    });
    const payPeriodDel = await prisma.payPeriod.deleteMany({
      where: { employeeId: { in: allEmployeeIds } },
    });
    const payoutDel = await prisma.payout.deleteMany({
      where: { employeeId: { in: allEmployeeIds } },
    });
    console.log(
      `✓ Deleted ${payAgrDel.count} PayAgreements, ${payPeriodDel.count} PayPeriods, ${payoutDel.count} Payouts`
    );

    const empDel = await prisma.employee.deleteMany({ where: { id: { in: allEmployeeIds } } });
    console.log(`✓ Deleted ${empDel.count} employees`);
  }

  // Listings owned by this user (already cleaned of dependents above)
  if (listingIds.length) {
    await prisma.listing.deleteMany({ where: { id: { in: listingIds } } });
    console.log(`✓ Deleted ${listingIds.length} listings`);
  }

  // Other user-attached records
  if (posts.length) {
    await prisma.post.deleteMany({ where: { userId } });
    console.log(`✓ Deleted ${posts.length} posts`);
  }
  if (comments.length) {
    await prisma.comment.deleteMany({ where: { userId } });
    console.log(`✓ Deleted ${comments.length} comments`);
  }
  if (notifications.length) {
    await prisma.notification.deleteMany({ where: { userId } });
    console.log(`✓ Deleted ${notifications.length} notifications`);
  }
  if (accounts.length) {
    await prisma.account.deleteMany({ where: { userId } });
    console.log(`✓ Deleted ${accounts.length} OAuth accounts`);
  }
  if (shops.length) {
    await prisma.shop.deleteMany({ where: { userId } });
    console.log(`✓ Deleted ${shops.length} shops`);
  }
  if (clientRecords.length) {
    await prisma.clientRecord.deleteMany({ where: { userId } });
    console.log(`✓ Deleted ${clientRecords.length} client records`);
  }
  if (messages.length) {
    await prisma.message.deleteMany({ where: { senderId: userId } });
    console.log(`✓ Deleted ${messages.length} messages`);
  }

  // Finally, the user row.
  await prisma.user.delete({ where: { id: userId } });
  console.log(`✓ Deleted user ${user.email}`);
  console.log(`\nDone.`);
}

const args = process.argv.slice(2);
const email = args.find((a) => !a.startsWith("--"));
const dryRun = args.includes("--dry");

if (!email) {
  console.error("Usage: npx ts-node scripts/delete-user.ts <email> [--dry]");
  process.exit(1);
}

deleteUser(email, dryRun)
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
