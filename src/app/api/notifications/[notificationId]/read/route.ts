// app/api/notifications/[notificationId]/read/route.ts
import { NextResponse } from 'next/server';
import  getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/libs/prismadb';

interface IParams {
  notificationId?: string;
}

export async function PATCH(
  request: Request,
  { params }: { params: IParams }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { notificationId } = params;

    if (!notificationId || typeof notificationId !== 'string') {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const notification = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId: currentUser.id, // Ensure user can only update their own notifications
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error('[NOTIFICATION_READ]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}