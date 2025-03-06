import prisma from "@/app/libs/prismadb";
import { SafePost, SafeUser, MediaType } from '@/app/types';
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
  filter?: 'following' | 'for-you' | 'likes' | 'bookmarks';
}

export default async function getPosts(params: IPostsParams) {
  try {
    const { 
      userId, 
      locationValue, 
      startDate, 
      endDate, 
      category,
      state,
      city,
      order,
      filter = 'for-you'
    } = params;
    
    const currentUser = await getCurrentUser();

    // If filter mode requires current user but none exists, return empty array
    if ((filter === 'following' || filter === 'likes' || filter === 'bookmarks') && !currentUser) {
      return [];
    }

    let query: any = {};

    if (userId) query.userId = userId;
    if (category) query.category = category;
    if (locationValue) query.locationValue = locationValue;
    if (startDate && endDate) {
      query.createdAt = { gte: new Date(startDate), lte: new Date(endDate) };
    }

    // Location filtering
    if (state || city) {
      const locationFilters = [];
      
      if (state) {
        locationFilters.push({
          location: {
            contains: state,
            mode: 'insensitive'
          }
        });
      }
      
      if (city) {
        locationFilters.push({
          location: {
            contains: city,
            mode: 'insensitive'
          }
        });
      }
      
      if (locationFilters.length > 0) {
        query.AND = locationFilters;
      }
    }

    // Apply specific filter types
    if (filter === 'likes' && currentUser) {
      // Posts that the current user has liked
      query.likes = {
        has: currentUser.id
      };
    } else if (filter === 'bookmarks' && currentUser) {
      // Posts that the current user has bookmarked
      query.bookmarks = {
        has: currentUser.id
      };
    }

    const allPosts = await prisma.post.findMany({
      where: query,
      include: { user: true },
      orderBy: { 
        createdAt: order === 'asc' ? 'asc' : 'desc' 
      },
    });

    let filteredPosts = allPosts;

    // Apply post-query filters
    if (currentUser) {
      // First filter out hidden posts for all views
      filteredPosts = filteredPosts.filter(post => !post.hiddenBy?.includes(currentUser.id));
      
      // Then apply the following filter if selected
      if (filter === 'following') {
        // Only show posts from users the current user is following
        filteredPosts = filteredPosts.filter(post => 
          // Include posts from users the current user follows
          currentUser.following.includes(post.userId) ||
          // Also include the current user's own posts
          post.userId === currentUser.id
        );
      }
    }

    const safePosts = filteredPosts.map((post) => {
      const user = post.user;
      return {
        id: post.id,
        content: post.content,
        imageSrc: post.imageSrc,
        mediaUrl: post.mediaUrl || null,
        mediaType: (post.mediaType as MediaType) || null,
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

    return safePosts;

  } catch (error) {
    console.error("Error in getPosts:", error);
    throw new Error("Failed to fetch posts.");
  }
}