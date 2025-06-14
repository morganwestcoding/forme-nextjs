// app/api/post/[postId]/route.ts

import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

export async function GET(
  request: Request,
  { params }: { params: { postId: string } }
) {
  const { postId } = params;

  if (!postId || typeof postId !== 'string') {
    return new NextResponse("Invalid ID", { status: 400 });
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      user: true,
      comments: {
        include: { user: true }
      }
    }
  });

  if (!post) return new NextResponse("Not found", { status: 404 });

  return NextResponse.json({
    id: post.id,
    content: post.content,
    imageSrc: post.imageSrc,
    mediaUrl: post.mediaUrl,
    mediaType: post.mediaType,
    location: post.location,
    tag: post.tag,
    photo: post.photo,
    category: post.category,
    createdAt: post.createdAt.toISOString(),
    likes: post.likes || [],
    bookmarks: post.bookmarks || [],
    hiddenBy: post.hiddenBy || [],
    user: {
      id: post.user.id,
      name: post.user.name,
      image: post.user.image,
      emailVerified: post.user.emailVerified?.toISOString() || null,
      createdAt: post.user.createdAt.toISOString(),
      updatedAt: post.user.updatedAt.toISOString(),
    },
    comments: post.comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      userId: comment.userId,
      postId: comment.postId,
      user: {
        id: comment.user.id,
        name: comment.user.name,
        image: comment.user.image,
      },
    })),
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const postId = params.postId;

    const post = await prisma.post.findUnique({
      where: {
        id: postId
      }
    });

    if (!post) {
      return new NextResponse("Post not found", { status: 404 });
    }

    if (post.userId !== currentUser.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const deletedPost = await prisma.post.delete({
      where: {
        id: postId
      }
    });

    return NextResponse.json(deletedPost);
  } catch (error) {
    console.error("Error in DELETE /api/posts/[postId]:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
