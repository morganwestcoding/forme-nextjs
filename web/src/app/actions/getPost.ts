import prisma from "@/app/libs/prismadb";
import { SafePost, SafeUser, MediaType, PostMention } from '@/app/types';
import getCurrentUser from "./getCurrentUser";

export interface IPostsParams {
  userId?: string;
  listingId?: string;
  shopId?: string;
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
      listingId,
      shopId,
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

    if ((filter === 'following' || filter === 'likes' || filter === 'bookmarks') && !currentUser) {
      return [];
    }

    let query: any = {};

    // If userId is provided, get posts created by OR tagged with this user
    if (userId) {
      query.OR = [
        { userId: userId },
        {
          mentions: {
            some: {
              entityId: userId,
              entityType: 'user'
            }
          }
        }
      ];
    }

    // If listingId is provided, get posts tagged with this listing
    if (listingId) {
      query.mentions = {
        some: {
          entityId: listingId,
          entityType: 'listing'
        }
      };
    }

    // If shopId is provided, get posts tagged with this shop
    if (shopId) {
      query.mentions = {
        some: {
          entityId: shopId,
          entityType: 'shop'
        }
      };
    }

    if (category) query.category = category;
    if (locationValue) query.locationValue = locationValue;
    if (startDate && endDate) {
      query.createdAt = { gte: new Date(startDate), lte: new Date(endDate) };
    }

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

    if (filter === 'likes' && currentUser) {
      query.likes = {
        has: currentUser.id
      };
    } else if (filter === 'bookmarks' && currentUser) {
      query.bookmarks = {
        has: currentUser.id
      };
    }

    const allPosts = await prisma.post.findMany({
      where: query,
      include: {
        user: true,
        mentions: true, // NEW: Include PostMention relations
        comments: {
          include: {
            user: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: order === 'asc' ? 'asc' : 'desc'
      },
    });

    let filteredPosts = allPosts;

    if (currentUser) {
      filteredPosts = filteredPosts.filter(post => !post.hiddenBy?.includes(currentUser.id));
      
      if (filter === 'following') {
        filteredPosts = filteredPosts.filter(post => 
          currentUser.following.includes(post.userId) ||
          post.userId === currentUser.id
        );
      }
    }

    const safePosts = filteredPosts.map((post) => {
      const user = post.user;
      
      // Process mentions from PostMention relations
      const mentions: PostMention[] = post.mentions.map((mention) => ({
        id: mention.id,
        postId: mention.postId,
        entityId: mention.entityId,
        entityType: mention.entityType as 'user' | 'listing' | 'shop',
        entityTitle: mention.entityTitle,
        entitySubtitle: mention.entitySubtitle,
        entityImage: mention.entityImage,
        createdAt: mention.createdAt.toISOString()
      }));

      return {
        id: post.id,
        content: post.content,
        imageSrc: post.imageSrc,
        mediaUrl: post.mediaUrl || null,
        mediaType: (post.mediaType as MediaType) || null,
        mediaOverlay: post.mediaOverlay as any,
        thumbnailUrl: post.thumbnailUrl || null,
        postType: (post as any).postType || 'text',
        location: post.location,
        tag: post.tag,
        photo: post.photo,
        category: post.category,
        createdAt: post.createdAt.toISOString(),
        likes: post.likes || [],
        bookmarks: post.bookmarks || [],
        hiddenBy: post.hiddenBy || [],
        viewedBy: post.viewedBy || [],
        mentions: mentions.length > 0 ? mentions : null, // NEW: Include processed mentions
        comments: post.comments.map((comment) => ({
          id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt.toISOString(),
          userId: comment.userId,
          postId: comment.postId,
          user: {
            id: comment.user.id,
            name: comment.user.name,
            image: comment.user.image,
          },
        })),
        user: {
          ...user,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
          emailVerified: user.emailVerified?.toISOString() || null,
          resetTokenExpiry: user.resetTokenExpiry,
          subscriptionStartDate: user.subscriptionStartDate,
          subscriptionEndDate: user.subscriptionEndDate,
          bio: user.bio || "No Bio Provided Yet..",
          backgroundImage: user.backgroundImage || null,
          galleryImages: user.galleryImages || [],
          following: user.following || [],
          followers: user.followers || [],
          conversationIds: user.conversationIds || [],
          isSubscribed: user.isSubscribed || false,
          role: user.role
        }
      };
    });

    return safePosts;

  } catch (error) {
    console.error("Error in getPosts:", error);
    throw new Error("Failed to fetch posts.");
  }
}