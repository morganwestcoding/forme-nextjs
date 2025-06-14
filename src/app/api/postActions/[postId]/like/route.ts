// app/api/postActions/[postId]/like/route.ts

import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(
  request: Request,
  { params }: { params: { postId: string } }
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) return NextResponse.error();

  const { postId } = params;

  if (!postId || typeof postId !== "string") {
    throw new Error("Invalid ID");
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) throw new Error("Post not found");

  let updatedLikes = [...(post.likes || [])];
  const isLiking = !updatedLikes.includes(currentUser.id);

  if (isLiking) {
    updatedLikes.push(currentUser.id);
  } else {
    updatedLikes = updatedLikes.filter(id => id !== currentUser.id);
  }

  const updatedPost = await prisma.post.update({
    where: { id: postId },
    data: { likes: updatedLikes },
  });

  return NextResponse.json({ likes: updatedPost.likes });
}
