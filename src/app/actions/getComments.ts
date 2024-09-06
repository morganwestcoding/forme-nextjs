import prisma from "@/app/libs/prismadb";
import { SafeComment } from "@/app/types";

export default async function getComments(postId: string): Promise<SafeComment[]> {
  console.log(`Fetching comments for post: ${postId}`);
  try {
    const comments = await prisma.comment.findMany({
      where: {
        postId: postId,
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`Raw comments from database:`, JSON.stringify(comments, null, 2));

    if (comments.length === 0) {
      console.log(`No comments found for post ${postId}`);
    }

    const safeComments: SafeComment[] = comments.map((comment) => ({
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

    console.log('Processed safe comments:', JSON.stringify(safeComments, null, 2));
    return safeComments;
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
}