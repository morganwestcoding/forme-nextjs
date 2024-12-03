// getPosts.ts
import prisma from "@/app/libs/prismadb";
import { SafePost, SafeUser } from '@/app/types';
import getCurrentUser from "./getCurrentUser";

export interface IPostsParams {
  userId?: string;
  startDate?: string;
  endDate?: string;
  locationValue?: string;
  category?: string;
  state?: string;
  city?: string;
  order?: 'asc' | 'desc';
}

export default async function getPosts(params: IPostsParams): Promise<SafePost[]> {
  try {
    const { 
      userId, 
      locationValue, 
      startDate, 
      endDate, 
      category,
      state,
      city,
      order 
    } = params;
    
    const currentUser = await getCurrentUser();

    console.log('Starting getPosts with currentUser:', currentUser?.id);

    let query: any = {};

    if (userId) query.userId = userId;
    if (category) query.category = category;
    if (locationValue) query.locationValue = locationValue;
    if (startDate && endDate) {
      query.createdAt = { gte: new Date(startDate), lte: new Date(endDate) };
    }

    // Location filtering
    if (state || city) {
      query.location = {
        contains: state || city,
        mode: 'insensitive'
      };
    }

    const allPosts = await prisma.post.findMany({
      where: query,
      include: { user: true },
      orderBy: { 
        createdAt: order === 'asc' ? 'asc' : 'desc' 
      },
    });

    console.log('Total posts without filter:', allPosts.length);

    const filteredPosts = currentUser 
      ? allPosts.filter(post => !post.hiddenBy?.includes(currentUser.id))
      : allPosts;

    console.log('Posts after filtering:', filteredPosts.length);

    const safePosts = filteredPosts.map((post) => {
      const user = post.user;
      return {
        id: post.id,
        content: post.content,
        imageSrc: post.imageSrc,
        location: post.location,
        tag: post.tag,
        photo: post.photo,
        category: post.category,
        createdAt: post.createdAt.toISOString(),
        likes: post.likes || [],
        bookmarks: post.bookmarks || [],
        hiddenBy: post.hiddenBy || [],
        user: {
          ...user,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
          emailVerified: user.emailVerified?.toISOString() || null,
          resetTokenExpiry: user.resetTokenExpiry,
          subscriptionStartDate: user.subscriptionStartDate,
          subscriptionEndDate: user.subscriptionEndDate,
          bio: user.bio || "No Bio Provided Yet..",
          galleryImages: user.galleryImages || [],
          following: user.following || [],
          followers: user.followers || [],
          conversationIds: user.conversationIds || [],
          isSubscribed: user.isSubscribed || false
        }
      };
    });

    console.log('Final safe posts:', safePosts.length);
    return safePosts;

  } catch (error) {
    console.error("Error in getPosts:", error);
    throw new Error("Failed to fetch posts.");
  }
}