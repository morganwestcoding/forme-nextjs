import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { apiError, apiErrorCode } from "@/app/utils/api";

export async function POST(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params;

    if (!postId || typeof postId !== 'string') {
      return apiError("Invalid ID", 400);
    }

    const currentUser = await getCurrentUser();
    if (!currentUser?.id) {
      return apiErrorCode('UNAUTHORIZED');
    }

    // Get current post to check if user already viewed
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { viewedBy: true }
    });

    if (!post) {
      return apiErrorCode('POST_NOT_FOUND');
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
    return apiErrorCode('INTERNAL_ERROR');
  }
}
