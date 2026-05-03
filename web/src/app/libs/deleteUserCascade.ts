import prisma from "@/app/libs/prismadb";

export type DeleteUserCascadeResult = {
  userId: string;
  reservations: number;
  employees: number;
  payAgreements: number;
  payPeriods: number;
  payouts: number;
  listings: number;
  posts: number;
  comments: number;
  notifications: number;
  accounts: number;
  shops: number;
  clientRecords: number;
  messages: number;
  reviews: number;
  postMentions: number;
  conversations: number;
  disputes: number;
};

// Pull a user id (stored as ObjectId in MongoDB) out of an array field on every
// document of a collection. One Mongo command, no read-modify-write loop.
async function pullObjectIdFromCollection(
  collection: string,
  field: string,
  userId: string
) {
  await prisma.$runCommandRaw({
    update: collection,
    updates: [
      {
        q: { [field]: { $oid: userId } },
        u: { $pull: { [field]: { $oid: userId } } },
        multi: true,
      },
    ],
  });
}

// Same as above, but for fields stored as plain strings (no @db.ObjectId).
async function pullStringFromCollection(
  collection: string,
  field: string,
  value: string
) {
  await prisma.$runCommandRaw({
    update: collection,
    updates: [
      {
        q: { [field]: value },
        u: { $pull: { [field]: value } },
        multi: true,
      },
    ],
  });
}

/**
 * Delete a user and every dependent record that points at them.
 *
 * MongoDB + Prisma's `onDelete: Cascade` is emulated at the application layer
 * and has been observed to leave orphans across the worker/payout chain, so we
 * walk dependents explicitly in dependency order. Also scrubs the user id from
 * array fields (followers, likes, conversation participants, etc.) on other
 * documents so they don't carry dangling references.
 *
 * Caller is responsible for authorization. Refuses to delete master users.
 */
export async function deleteUserCascade(
  userId: string
): Promise<DeleteUserCascadeResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });
  if (!user) {
    throw new Error(`User ${userId} not found`);
  }
  if (user.role === "master") {
    throw new Error(`Refusing to delete master user ${userId}`);
  }

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
  const postIds = posts.map((p) => p.id);

  const [reservationsAsEmployee, reservationsOnOwnedListings, employeesOnOwnedListings] =
    await Promise.all([
      employeeIds.length
        ? prisma.reservation.findMany({
            where: { employeeId: { in: employeeIds } },
            select: { id: true },
          })
        : Promise.resolve([]),
      listingIds.length
        ? prisma.reservation.findMany({
            where: { listingId: { in: listingIds } },
            select: { id: true },
          })
        : Promise.resolve([]),
      listingIds.length
        ? prisma.employee.findMany({
            where: { listingId: { in: listingIds } },
            select: { id: true },
          })
        : Promise.resolve([]),
    ]);

  const allReservationIds = Array.from(
    new Set([
      ...reservationsAsCustomer.map((r) => r.id),
      ...reservationsAsEmployee.map((r) => r.id),
      ...reservationsOnOwnedListings.map((r) => r.id),
    ])
  );
  const allEmployeeIds = Array.from(
    new Set([...employeeIds, ...employeesOnOwnedListings.map((e) => e.id)])
  );

  // 1. Reservations (reference user, listing, employee)
  if (allReservationIds.length) {
    await prisma.reservation.deleteMany({ where: { id: { in: allReservationIds } } });
  }

  // 2. Pay chain — must be removed before the employee rows they reference.
  let payAgreements = 0;
  let payPeriods = 0;
  let payouts = 0;
  if (allEmployeeIds.length) {
    const [pa, pp, po] = await Promise.all([
      prisma.payAgreement.deleteMany({ where: { employeeId: { in: allEmployeeIds } } }),
      prisma.payPeriod.deleteMany({ where: { employeeId: { in: allEmployeeIds } } }),
      prisma.payout.deleteMany({ where: { employeeId: { in: allEmployeeIds } } }),
    ]);
    payAgreements = pa.count;
    payPeriods = pp.count;
    payouts = po.count;

    await prisma.employee.deleteMany({ where: { id: { in: allEmployeeIds } } });
  }

  // 3. Listings owned by user (children already cleaned above; cascade handles
  //    Service / StoreHours and SetNull on Shop.listingId).
  if (listingIds.length) {
    await prisma.listing.deleteMany({ where: { id: { in: listingIds } } });
  }

  // 4. Posts and their dependents (PostMention cascades; Comments cascade).
  if (postIds.length) {
    await prisma.post.deleteMany({ where: { id: { in: postIds } } });
  }

  // 5. PostMentions that point AT this user (entityType="user").
  const postMentionsTargeting = await prisma.postMention.deleteMany({
    where: { entityType: "user", entityId: userId },
  });

  // 6. Reviews authored by the user OR targeting them.
  const reviewsDeleted = await prisma.review.deleteMany({
    where: {
      OR: [{ userId }, { targetType: "user", targetUserId: userId }],
    },
  });

  // 7. Other direct-user attachments.
  const [
    commentsDel,
    notificationsDel,
    accountsDel,
    shopsDel,
    clientRecordsDel,
    messagesDel,
  ] = await Promise.all([
    prisma.comment.deleteMany({ where: { userId } }),
    // Wipe both directions: notifications received BY this user and
    // notifications about this user (sent to others as the actor) — otherwise
    // other users keep seeing entries like "X liked your post" pointing at a
    // ghost. SetNull would normally handle the second case but Prisma emulates
    // it on MongoDB and has been observed to leave dangling refs.
    prisma.notification.deleteMany({
      where: { OR: [{ userId }, { relatedUserId: userId }] },
    }),
    prisma.account.deleteMany({ where: { userId } }),
    prisma.shop.deleteMany({ where: { userId } }),
    prisma.clientRecord.deleteMany({ where: { userId } }),
    prisma.message.deleteMany({ where: { senderId: userId } }),
  ]);

  // 8. Disputes — keep the row for audit, but drop the now-dangling user link.
  const disputesUpdated = await prisma.dispute.updateMany({
    where: { userId },
    data: { userId: null },
  });

  // 9. Capture every conversation that included this user BEFORE we pull them
  //    out — we need the ids to clean up any threads that end up with fewer
  //    than two members afterward (those are unreachable in any inbox).
  const userConvs = await prisma.conversation.findMany({
    where: { userIds: { has: userId } },
    select: { id: true },
  });
  const userConvIds = userConvs.map((c) => c.id);

  // 10. Scrub the user id from array fields on other documents.
  await Promise.all([
    pullObjectIdFromCollection("User", "following", userId),
    pullObjectIdFromCollection("User", "followers", userId),
    pullObjectIdFromCollection("Shop", "followers", userId),
    pullObjectIdFromCollection("Post", "likes", userId),
    pullObjectIdFromCollection("Post", "bookmarks", userId),
    pullObjectIdFromCollection("Post", "hiddenBy", userId),
    pullObjectIdFromCollection("Post", "viewedBy", userId),
    pullObjectIdFromCollection("Product", "favoritedBy", userId),
    pullObjectIdFromCollection("Conversation", "userIds", userId),
    // Listing.followers is declared as String[] without @db.ObjectId.
    pullStringFromCollection("Listing", "followers", userId),
  ]);

  // 11. Drop any thread that no longer has at least two members — a 1-on-1
  //     between the deleted user and someone else collapses to a solo thread
  //     after the pull, which would otherwise linger in the survivor's inbox
  //     with no one to talk to. Messages other participants left there go too.
  let orphanMessagesDeleted = 0;
  let orphanConversations = 0;
  if (userConvIds.length) {
    const survivors = await prisma.conversation.findMany({
      where: { id: { in: userConvIds } },
      select: { id: true, userIds: true },
    });
    const orphanIds = survivors
      .filter((c) => (c.userIds?.length ?? 0) < 2)
      .map((c) => c.id);
    if (orphanIds.length) {
      const msgs = await prisma.message.deleteMany({
        where: { conversationId: { in: orphanIds } },
      });
      orphanMessagesDeleted = msgs.count;
      const convs = await prisma.conversation.deleteMany({
        where: { id: { in: orphanIds } },
      });
      orphanConversations = convs.count;
    }
  }

  // 12. Finally, the user row itself.
  await prisma.user.delete({ where: { id: userId } });

  return {
    userId,
    reservations: allReservationIds.length,
    employees: allEmployeeIds.length,
    payAgreements,
    payPeriods,
    payouts,
    listings: listingIds.length,
    posts: postIds.length,
    comments: commentsDel.count,
    notifications: notificationsDel.count,
    accounts: accountsDel.count,
    shops: shopsDel.count,
    clientRecords: clientRecordsDel.count,
    messages: messagesDel.count + orphanMessagesDeleted,
    reviews: reviewsDeleted.count,
    postMentions: postMentionsTargeting.count,
    conversations: orphanConversations,
    disputes: disputesUpdated.count,
  };
}
