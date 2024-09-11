// app/api/comments/[postId]/route.ts

import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function GET(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const comments = await prisma.comment.findMany({
      where: {
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    const safeComments = comments.map((comment) => ({
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
    }));

    return NextResponse.json(safeComments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

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