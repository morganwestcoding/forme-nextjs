import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { content, postId } = body;

    const comment = await prisma.comment.create({
      data: {
        content,
        userId: currentUser.id,
        postId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        }
      }
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
      }
    };

    return NextResponse.json(safeComment);
  } catch (error) {
    console.error("Error in POST comment:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}