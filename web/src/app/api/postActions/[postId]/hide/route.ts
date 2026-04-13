import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";
import { apiErrorCode } from "@/app/utils/api";

export async function POST(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return apiErrorCode('UNAUTHORIZED');
    }

    const postId = params.postId;

    // Find the post
    const post = await prisma.post.findUnique({
      where: {
        id: postId
      }
    });

    if (!post) {
      return apiErrorCode('POST_NOT_FOUND');
    }

    // Update the post to add the current user to hiddenBy array
    const updatedPost = await prisma.post.update({
      where: {
        id: postId
      },
      data: {
        hiddenBy: {
          push: currentUser.id
        }
      }
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    return apiErrorCode('INTERNAL_ERROR');
  }
}

// Optional: Add an endpoint to unhide posts
export async function DELETE(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return apiErrorCode('UNAUTHORIZED');
    }

    const postId = params.postId;

    // Find the post
    const post = await prisma.post.findUnique({
      where: {
        id: postId
      }
    });

    if (!post) {
      return apiErrorCode('POST_NOT_FOUND');
    }

    // Update the post to remove the current user from hiddenBy array
    const updatedPost = await prisma.post.update({
      where: {
        id: postId
      },
      data: {
        hiddenBy: {
          set: post.hiddenBy.filter((id: string) => id !== currentUser.id)
        }
      }
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    return apiErrorCode('INTERNAL_ERROR');
  }
}