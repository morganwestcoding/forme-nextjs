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

    const formatted = items.map((n: typeof items[number]) => ({
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
