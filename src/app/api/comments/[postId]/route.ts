// app/api/comments/[postId]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(
  request: Request,
  { params }: { params: { postId: string } }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const { content } = body;
  if (!content) {
    return new NextResponse("Missing required fields", { status: 400 });
  }

  try {
    const post = await prisma.post.findUnique({
      where: {
        id: params.postId
      },
      select: {
        userId: true,
        content: true,
        user: {
          select: {
            name: true
          }
        }
      }
    });

    if (!post) {
      return new NextResponse("Post not found", { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        userId: currentUser.id,
        postId: params.postId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Create notification for post owner if it's not their own comment
    if (post.userId !== currentUser.id) {
      await prisma.notification.create({
        data: {
          type: 'NEW_COMMENT',
          content: `${currentUser.name || 'Someone'} commented on your post: "${content.length > 30 ? content.substring(0, 30) + '...' : content}"`,
          userId: post.userId
        }
      });
    }

    const safeComment = {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      userId: comment.userId,
      postId: comment.postId,
      user: {
        id: comment.user.id,
        name: comment.user.name || null,
        image: comment.user.image || null,
      },
    };

    return NextResponse.json(safeComment);
  } catch (error) {
    console.error("Error creating comment:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}