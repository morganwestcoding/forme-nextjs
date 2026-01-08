// app/api/notifications/read-all/route.ts
import { NextResponse } from 'next/server';
import getCurrentUser  from '@/app/actions/getCurrentUser';
import prisma from '@/app/libs/prismadb';

export async function PATCH() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notifications = await prisma.notification.updateMany({
      where: {
        userId: currentUser.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('[NOTIFICATIONS_READ_ALL]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}