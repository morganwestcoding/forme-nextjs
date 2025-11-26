import prisma from "@/app/libs/prismadb";
import getCurrentUser from "./getCurrentUser";
import { SafePost } from "@/app/types";

export default async function getFavoritePosts(): Promise<SafePost[]> {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser?.favoriteIds?.length) {
      return [];
    }

    const posts = await prisma.post.findMany({
      where: {
        id: {
          in: currentUser.favoriteIds,
        },
      },
      include: {
        user: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const safePosts = posts.map((post) => ({
      id: post.id,
      content: post.content,
      imageSrc: post.imageSrc || null,
      location: post.location || null,
      tag: post.tag || null,
      postType: (post.postType as 'ad' | 'text' | 'reel') || undefined,
      photo: post.photo || null,
      category: post.category || 'General',
      userId: post.userId,
      createdAt: post.createdAt.toISOString(),
      mediaUrl: post.mediaUrl || null,
      mediaType: post.mediaType as any,
      likes: post.likes || [],
      bookmarks: post.bookmarks || [],
      hiddenBy: post.hiddenBy || [],
      user: {
        id: post.user.id,
        name: post.user.name,
        email: post.user.email,
        image: post.user.image,
        resetToken: post.user.resetToken,
        resetTokenExpiry: post.user.resetTokenExpiry,
        createdAt: post.user.createdAt.toISOString(),
        updatedAt: post.user.updatedAt.toISOString(),
        emailVerified: post.user.emailVerified?.toISOString() || null,
        bio: post.user.bio || "No Bio Provided Yet..",
        imageSrc: post.user.imageSrc || null,
        backgroundImage: post.user.backgroundImage || null,
        licensingImage: post.user.licensingImage || null,
        verificationStatus: post.user.verificationStatus || null,
        verifiedAt: post.user.verifiedAt || null,
        verificationRejectedAt: post.user.verificationRejectedAt || null,
        rejectionReason: post.user.rejectionReason || null,
        location: post.user.location || null,
        galleryImages: post.user.galleryImages || [],
        isSubscribed: post.user.isSubscribed || false,
        subscriptionStartDate: post.user.subscriptionStartDate || null,
        subscriptionEndDate: post.user.subscriptionEndDate || null,
        subscriptionTier: post.user.subscriptionTier || null,
        stripeCustomerId: post.user.stripeCustomerId || null,
        stripeSubscriptionId: post.user.stripeSubscriptionId || null,
        subscriptionPriceId: post.user.subscriptionPriceId || null,
        subscriptionStatus: post.user.subscriptionStatus || null,
        subscriptionBillingInterval: post.user.subscriptionBillingInterval || null,
        currentPeriodEnd: post.user.currentPeriodEnd || null,
        following: post.user.following || [],
        followers: post.user.followers || [],
        conversationIds: post.user.conversationIds || [],
        favoriteIds: post.user.favoriteIds || [],
        managedListings: post.user.managedListings || [],
        role: post.user.role,
      },
      comments: post.comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        userId: comment.userId,
        postId: comment.postId,
        createdAt: comment.createdAt.toISOString(),
        user: {
          id: comment.user.id,
          name: comment.user.name,
          image: comment.user.image,
        }
      }))
    }) as SafePost);

    return safePosts;
  } catch (error: any) {
    console.error("Error fetching favorite posts:", error.message);
    return [];
  }
}