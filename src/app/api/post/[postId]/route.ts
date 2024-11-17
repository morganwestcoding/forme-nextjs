// app/api/posts/[postId]/route.ts

import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

export async function DELETE(
  request: Request,
  { params }: { params: { postId: string } }
) {
console.log('Delete request received with params:', params); 
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const postId = params.postId;
    console.log("Attempting to delete post with ID:", postId);

    const post = await prisma.post.findUnique({
      where: {
        id: postId
      }
    });

    if (!post) {
      console.log("Post not found:", postId);
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

    console.log("Post deleted successfully:", deletedPost);
    return NextResponse.json(deletedPost);
  } catch (error) {
    console.error("Error in DELETE /api/posts/[postId]:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}