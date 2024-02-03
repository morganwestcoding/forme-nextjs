import prisma from "@/app/libs/prismadb";
import { SafePost } from "@/app/types"; // Ensure this is updated according to your latest type definitions

interface PrismaPost {
  id: string;
  content: string;
  imageSrc?: string | null;
  location?: string | null;
  tag?: string | null;
  photo?: string | null;
  category: string;
  userId: string;
  createdAt: Date;
  user?: {
    id: string;
    image?: string;
    // Add other user fields you might need, focusing on safe items
  };
}

export interface IPostsParams {
  userId?: string;
  startDate?: string;
  endDate?: string;
  locationValue?: string;
  category?: string;
}

export default async function getPosts(params: IPostsParams): Promise<SafePost[]> {
  try {
    const { userId, locationValue, startDate, endDate, category } = params;

    let query: any = {};
    if (userId) query.userId = userId;
    if (category) query.category = category;
    if (locationValue) query.locationValue = locationValue;
    if (startDate && endDate) {
      query.createdAt = { gte: new Date(startDate), lte: new Date(endDate) };
    }

    const posts = await prisma.post.findMany({
      where: query,
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    }) as PrismaPost[]; // Cast the result to PrismaPost[] to help TypeScript understand the structure

    // Now, TypeScript knows the structure of each post, thanks to PrismaPost type
      const safePosts: SafePost[] = posts.map((post: PrismaPost): SafePost => ({
      id: post.id,
      content: post.content,
      imageSrc: post.imageSrc ?? null,
      location: post.location ?? null,
      tag: post.tag ?? null,
      photo: post.photo ?? null,
      category: post.category,
      userId: post.userId,
      createdAt: post.createdAt.toISOString(),
      // Assuming your SafePost type correctly handles the user structure
      user: post.user ? { id: post.user.id, image: post.user.image } : undefined,
    }));

    return safePosts;
  } catch (error) {
    console.error("Error in getPosts:", error);
    throw new Error("Failed to fetch posts.");
  }
}
