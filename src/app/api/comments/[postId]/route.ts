// app/api/comments/[postId]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

// app/api/comments/[postId]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const comments = await prisma.comment.findMany({
      where: {
        postId: params.postId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const safeComments = comments.map(comment => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      userId: comment.userId,
      postId: comment.postId,
      user: {
        id: comment.user.id,
        name: comment.user.name,
        image: comment.user.image
      }
    }));

    return NextResponse.json(safeComments);
  } catch (error) {
    console.error("Error in GET comments:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}