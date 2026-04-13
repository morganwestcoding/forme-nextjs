// app/api/notifications/route.ts
import { NextResponse } from 'next/server';
import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/libs/prismadb';
import { getUserFromRequest } from '@/app/utils/mobileAuth';
import { apiErrorCode } from '@/app/utils/api';

export async function GET(request: Request) {
  try {
    const currentUser = await getUserFromRequest(request) || await getCurrentUser();

    if (!currentUser) {
      return apiErrorCode('UNAUTHORIZED');
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: currentUser.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limit to 50 most recent notifications
    });

    // Format dates as strings
    const formattedNotifications = notifications.map((notification: typeof notifications[number]) => ({
      ...notification,
      createdAt: notification.createdAt.toISOString(),
    }));

    return NextResponse.json(formattedNotifications);
  } catch (error) {
    console.error('[NOTIFICATIONS_GET]', error);
    return apiErrorCode('INTERNAL_ERROR');
  }
}
