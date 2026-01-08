// app/api/notifications/route.ts
import { NextResponse } from 'next/server';
import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/libs/prismadb';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    const formattedNotifications = notifications.map(notification => ({
      ...notification,
      createdAt: notification.createdAt.toISOString(),
    }));

    return NextResponse.json(formattedNotifications);
  } catch (error) {
    console.error('[NOTIFICATIONS_GET]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
