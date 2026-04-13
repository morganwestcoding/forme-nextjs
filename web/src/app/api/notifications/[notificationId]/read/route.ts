// app/api/notifications/[notificationId]/read/route.ts
import { NextResponse } from 'next/server';
import  getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/libs/prismadb';
import { getUserFromRequest } from '@/app/utils/mobileAuth';
import { apiError, apiErrorCode } from '@/app/utils/api';

interface IParams {
  notificationId?: string;
}

export async function PATCH(
  request: Request,
  { params }: { params: IParams }
) {
  try {
    const currentUser = await getUserFromRequest(request) || await getCurrentUser();

    if (!currentUser) {
      return apiErrorCode('UNAUTHORIZED');
    }

    const { notificationId } = params;

    if (!notificationId || typeof notificationId !== 'string') {
      return apiError('Invalid ID', 400);
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
    return apiErrorCode('INTERNAL_ERROR');
  }
}