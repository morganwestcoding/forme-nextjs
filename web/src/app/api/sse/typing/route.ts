// app/api/sse/typing/route.ts
import { NextResponse } from 'next/server';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { getUserFromRequest } from '@/app/utils/mobileAuth';
import { emitToMany } from '@/app/libs/eventEmitter';
import { apiErrorCode } from '@/app/utils/api';
import prisma from '@/app/libs/prismadb';

export async function POST(request: Request) {
  try {
    const currentUser =
      (await getUserFromRequest(request)) || (await getCurrentUser());
    if (!currentUser) return apiErrorCode('UNAUTHORIZED');

    const { conversationId } = await request.json();
    if (!conversationId) return NextResponse.json({ ok: true });

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { userIds: true },
    });

    if (!conversation) return NextResponse.json({ ok: true });

    const otherUserIds = conversation.userIds.filter(
      (id: string) => id !== currentUser.id
    );

    emitToMany(otherUserIds, {
      type: 'TYPING',
      payload: {
        conversationId,
        userId: currentUser.id,
        userName: currentUser.name,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return apiErrorCode('INTERNAL_ERROR');
  }
}
