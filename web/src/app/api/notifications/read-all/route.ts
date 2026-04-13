// app/api/notifications/read-all/route.ts
import { NextResponse } from 'next/server';
import getCurrentUser  from '@/app/actions/getCurrentUser';
import prisma from '@/app/libs/prismadb';
import { getUserFromRequest } from '@/app/utils/mobileAuth';
import { apiErrorCode } from '@/app/utils/api';

export async function PATCH(request: Request) {
  try {
    const currentUser = await getUserFromRequest(request) || await getCurrentUser();

    if (!currentUser) {
      return apiErrorCode('UNAUTHORIZED');
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
    return apiErrorCode('INTERNAL_ERROR');
  }
}