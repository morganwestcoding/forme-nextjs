// app/api/postActions/[postId]/comment/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { getUserFromRequest } from '@/app/utils/mobileAuth';
import { apiError, apiErrorCode } from '@/app/utils/api';

interface IParams {
  postId?: string;
}

export async function POST(request: Request, { params }: { params: IParams }) {
  const currentUser = await getUserFromRequest(request) || await getCurrentUser();

  if (!currentUser || !currentUser.id) {
    return apiErrorCode('UNAUTHORIZED');
  }

  const { postId } = params;
  const body = await request.json();
  const { content } = body;

  if (!content || typeof content !== 'string' || !postId) {
    return apiError('Invalid input', 400);
  }

  try {
    const [newComment, post] = await Promise.all([
      prisma.comment.create({
        data: {
          content,
          user: { connect: { id: currentUser.id } },
          post: { connect: { id: postId } },
        },
      }),
      prisma.post.findUnique({ where: { id: postId }, select: { userId: true } }),
    ]);

    // Notify post author (not on own post)
    if (post && post.userId !== currentUser.id) {
      prisma.notification.create({
        data: {
          type: 'POST_COMMENTED',
          content: `${currentUser.name || 'Someone'} commented on your post`,
          userId: post.userId,
        },
      }).catch(() => {}); // fire-and-forget
    }

    return NextResponse.json(newComment);
  } catch (error) {
    return apiErrorCode('INTERNAL_ERROR');
  }
}
