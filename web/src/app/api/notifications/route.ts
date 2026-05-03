// app/api/notifications/route.ts
import { NextResponse } from 'next/server';
import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/libs/prismadb';
import { getUserFromRequest } from '@/app/utils/mobileAuth';
import { apiError, apiErrorCode } from '@/app/utils/api';

export async function GET(request: Request) {
  try {
    const currentUser = await getUserFromRequest(request) || await getCurrentUser();

    if (!currentUser) {
      return apiErrorCode('UNAUTHORIZED');
    }

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);

    const notifications = await prisma.notification.findMany({
      where: { userId: currentUser.id },
      orderBy: { createdAt: 'desc' },
      take: limit + 1, // fetch one extra to detect hasMore
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        relatedUser: { select: { id: true, name: true, image: true } },
        relatedListing: { select: { id: true, title: true, imageSrc: true } },
      },
    });

    const hasMore = notifications.length > limit;
    const items = hasMore ? notifications.slice(0, limit) : notifications;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    // Filter out notifications whose actor user is gone. Prisma's emulated
    // SetNull on MongoDB nulls relatedUserId when the actor is deleted, so
    // checking relatedUserId alone isn't enough — we key off the type. For
    // any notification type that semantically requires an actor (e.g.
    // "X started following you"), a missing relatedUser join means the
    // entry is a ghost. The content string was baked in at creation time
    // and would still render the deleted user's name. Hide and clean up.
    const ACTOR_REQUIRED_TYPES = new Set([
      'NEW_FOLLOWER',
      'MUTUAL_FOLLOW',
      'SHOP_FOLLOW',
      'LISTING_FOLLOW',
      'NEW_MESSAGE',
      'POST_LIKED',
      'NEW_BOOKMARK',
      'POST_COMMENTED',
    ]);
    const isOrphan = (n: typeof items[number]) =>
      ACTOR_REQUIRED_TYPES.has(n.type) && !n.relatedUser;
    const orphanIds = items.filter(isOrphan).map((n) => n.id);
    const visible = orphanIds.length ? items.filter((n) => !isOrphan(n)) : items;
    if (orphanIds.length) {
      prisma.notification
        .deleteMany({ where: { id: { in: orphanIds } } })
        .catch(() => {});
    }

    const formatted = visible.map((n: typeof visible[number]) => ({
      ...n,
      createdAt: n.createdAt.toISOString(),
    }));

    return NextResponse.json({
      notifications: formatted,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    return apiErrorCode('INTERNAL_ERROR');
  }
}

export async function DELETE(request: Request) {
  try {
    const currentUser = await getUserFromRequest(request) || await getCurrentUser();
    if (!currentUser) {
      return apiErrorCode('UNAUTHORIZED');
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Delete a single notification
      await prisma.notification.deleteMany({
        where: { id, userId: currentUser.id },
      });
    } else {
      // Delete all read notifications
      await prisma.notification.deleteMany({
        where: { userId: currentUser.id, isRead: true },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiErrorCode('INTERNAL_ERROR');
  }
}
