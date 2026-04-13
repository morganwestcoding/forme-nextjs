// app/api/postActions/[postId]/like/route.ts

import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { getUserFromRequest } from "@/app/utils/mobileAuth";
import { apiErrorCode } from '@/app/utils/api';

export async function POST(
  request: Request,
  { params }: { params: { postId: string } }
) {
  const currentUser = await getUserFromRequest(request) || await getCurrentUser();

  if (!currentUser) return apiErrorCode('UNAUTHORIZED');

  const { postId } = params;

  if (!postId || typeof postId !== "string") {
    throw new Error("Invalid ID");
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) throw new Error("Post not found");

  let updatedLikes = [...(post.likes || [])];
  const isLiking = !updatedLikes.includes(currentUser.id);

  if (isLiking) {
    updatedLikes.push(currentUser.id);
  } else {
    updatedLikes = updatedLikes.filter((id: string) => id !== currentUser.id);
  }

  const updatedPost = await prisma.post.update({
    where: { id: postId },
    data: { likes: updatedLikes },
  });

  // Notify post author on like (not on unlike, not on own post)
  if (isLiking && post.userId !== currentUser.id) {
    prisma.notification.create({
      data: {
        type: 'POST_LIKED',
        content: `${currentUser.name || 'Someone'} liked your post`,
        userId: post.userId,
      },
    }).catch(() => {}); // fire-and-forget
  }

  return NextResponse.json({ likes: updatedPost.likes });
}
