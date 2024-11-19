import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

export async function POST(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const postId = params.postId;
    
    // Find the post
    const post = await prisma.post.findUnique({
      where: {
        id: postId
      }
    });

    if (!post) {
      return new NextResponse("Post not found", { status: 404 });
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
    console.error("Error in POST /api/postActions/[postId]/hide:", error);
    return new NextResponse("Internal Error", { status: 500 });
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
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const postId = params.postId;
    
    // Find the post
    const post = await prisma.post.findUnique({
      where: {
        id: postId
      }
    });

    if (!post) {
      return new NextResponse("Post not found", { status: 404 });
    }

    // Update the post to remove the current user from hiddenBy array
    const updatedPost = await prisma.post.update({
      where: {
        id: postId
      },
      data: {
        hiddenBy: {
          set: post.hiddenBy.filter(id => id !== currentUser.id)
        }
      }
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Error in DELETE /api/postActions/[postId]/hide:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}