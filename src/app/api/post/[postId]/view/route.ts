import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params;

    if (!postId || typeof postId !== 'string') {
      return new NextResponse("Invalid ID", { status: 400 });
    }

    const currentUser = await getCurrentUser();
    if (!currentUser?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get current post to check if user already viewed
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { viewedBy: true }
    });

    if (!post) {
      return new NextResponse("Post not found", { status: 404 });
    }

    // Only add user if they haven't viewed yet
    if (!post.viewedBy.includes(currentUser.id)) {
      await prisma.post.update({
        where: { id: postId },
        data: {
          viewedBy: { push: currentUser.id }
        }
      });
    }

    return NextResponse.json({ viewed: true });
  } catch (error) {
    console.error("Error recording post view:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
