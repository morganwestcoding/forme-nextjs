import prisma from "@/app/libs/prismadb";
import { SafePost, SafeUser } from "@/app/types";

interface IPostsParams {
  userId?: string;
  startDate?: string;
  endDate?: string;
  locationValue?: string;
  category?: string;
}

// Function to transform user data into SafeUser
function transformUser(user: any): SafeUser {
  return {
    id: user.id,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    emailVerified: user.emailVerified ? user.emailVerified.toISOString() : null,
    name: user.name,
    email: user.email,
    image: user.image, // Ensure the image is included
    favoriteIds: user.favoriteIds, // Include favoriteIds if necessary
  };
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
    });

    // Transform each post to the SafePost structure
    const safePosts: SafePost[] = posts.map(post => ({
      id: post.id,
      content: post.content,
      imageSrc: post.imageSrc ?? null,
      location: post.location ?? null,
      tag: post.tag ?? null,
      photo: post.photo ?? null,
      category: post.category,
      userId: post.userId,
      createdAt: post.createdAt.toISOString(),
      user: post.user ? transformUser(post.user) : undefined, // Transform user data into SafeUser
    }));

    return safePosts;
  } catch (error) {
    console.error("Error in getPosts:", error);
    throw new Error("Failed to fetch posts.");
  }
}

