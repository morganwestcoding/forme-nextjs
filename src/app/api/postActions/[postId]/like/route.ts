import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(
  request: Request,
  { params }: { params: { postId: string } }
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }

  const { postId } = params;

  if (!postId || typeof postId !== 'string') {
    throw new Error('Invalid ID');
  }

  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    }
  });

  if (!post) {
    throw new Error('Invalid ID');
  }

  let updatedLikes = [...(post.likes || [])];
  const isLiking = !updatedLikes.includes(currentUser.id);

  if (updatedLikes.includes(currentUser.id)) {
    updatedLikes = updatedLikes.filter((id) => id !== currentUser.id);
  } else {
    updatedLikes.push(currentUser.id);
  }

  const updatedPost = await prisma.post.update({
    where: {
      id: postId
    },
    data: {
      likes: updatedLikes
    }
  });

  // Only create notification if the user is liking (not unliking)
  if (isLiking) {
    await prisma.notification.create({
      data: {
        userId: post.userId,
        type: 'NEW_LIKE',
        content: `${currentUser.name} liked your post`
      }
    });
  }

  return NextResponse.json(updatedPost);
}