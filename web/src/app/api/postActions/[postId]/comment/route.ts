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
    const newComment = await prisma.comment.create({
      data: {
        content,
        user: { connect: { id: currentUser.id } },
        post: { connect: { id: postId } },
      },
    });

    return NextResponse.json(newComment);
  } catch (error) {
    console.error('Comment creation failed:', error);
    return apiErrorCode('INTERNAL_ERROR');
  }
}
