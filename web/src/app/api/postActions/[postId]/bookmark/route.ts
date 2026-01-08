// app/api/postActions/[postId]/bookmark/route.ts

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

  let updatedBookmarks = [...(post.bookmarks || [])];
  const isBookmarking = !updatedBookmarks.includes(currentUser.id);

  if (updatedBookmarks.includes(currentUser.id)) {
    updatedBookmarks = updatedBookmarks.filter((id) => id !== currentUser.id);
  } else {
    updatedBookmarks.push(currentUser.id);
  }

  const updatedPost = await prisma.post.update({
    where: {
      id: postId
    },
    data: {
      bookmarks: updatedBookmarks
    }
  });

  // Only create notification when someone bookmarks (not when they remove bookmark)
  if (isBookmarking) {
    await prisma.notification.create({
      data: {
        userId: post.userId,
        type: 'NEW_BOOKMARK',
        content: `${currentUser.name} bookmarked your post`
      }
    });
  }

  return NextResponse.json(updatedPost);
}