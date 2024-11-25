import prisma from "@/app/libs/prismadb";
import { SafePost, SafeUser } from '@/app/types';
import getCurrentUser from "./getCurrentUser";

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
    const currentUser = await getCurrentUser();

    console.log('Starting getPosts with currentUser:', currentUser?.id);

    let query: any = {};

    if (userId) query.userId = userId;
    if (category) query.category = category;
    if (locationValue) query.locationValue = locationValue;
    if (startDate && endDate) {
      query.createdAt = { gte: new Date(startDate), lte: new Date(endDate) };
    }

    const allPosts = await prisma.post.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });

    console.log('Total posts without filter:', allPosts.length);

    const filteredPosts = currentUser 
      ? allPosts.filter(post => !post.hiddenBy?.includes(currentUser.id))
      : allPosts;

    console.log('Posts after filtering:', filteredPosts.length);

    const safePosts: SafePost[] = filteredPosts.map((post) => ({
      ...post,
      createdAt: post.createdAt.toISOString(),
      likes: post.likes || [],
      bookmarks: post.bookmarks || [],
      hiddenBy: post.hiddenBy || [], 
      user: {
        id: post.user?.id || 'default-id',
        image: post.user?.image || '/default-profile.jpg',
        name: post.user?.name || 'Anonymous',
        email: post.user?.email ?? null,
        bio: post.user?.bio || "No Bio Provided Yet..",
        location: post.user?.location ?? null,
        imageSrc: post.user?.imageSrc || '/assets/hero-background.jpeg',
        createdAt: post.user?.createdAt.toISOString() || new Date().toISOString(),
        updatedAt: post.user?.updatedAt.toISOString() || new Date().toISOString(),
        emailVerified: post.user?.emailVerified ? post.user.emailVerified.toISOString() : null,
        galleryImages: post.user?.galleryImages || [],
        following: post.user?.following || [],
        followers: post.user?.followers || [],
        conversationIds: post.user?.conversationIds || [],
      },
    }));

    console.log('Final safe posts:', safePosts.length);
    return safePosts;

  } catch (error) {
    console.error("Error in getPosts:", error);
    throw new Error("Failed to fetch posts.");
  }
}