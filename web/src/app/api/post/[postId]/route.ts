
import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";
import { PostMention } from "@/app/types";
import { canModifyResource } from "@/app/libs/authorization";
import { apiError, apiErrorCode } from "@/app/utils/api";

export async function GET(
  request: Request,
  { params }: { params: { postId: string } }
) {
  const { postId } = params;

  if (!postId || typeof postId !== 'string') {
    return apiError("Invalid ID", 400);
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      user: true,
      mentions: true, // NEW: Include PostMention relations
      comments: {
        include: { user: true }
      }
    }
  });

  if (!post) return apiErrorCode('NOT_FOUND');

  // Process mentions from PostMention relations
  const mentions: PostMention[] = post.mentions.map((mention: typeof post.mentions[number]) => ({
    id: mention.id,
    postId: mention.postId,
    entityId: mention.entityId,
    entityType: mention.entityType as 'user' | 'listing' | 'shop',
    entityTitle: mention.entityTitle,
    entitySubtitle: mention.entitySubtitle,
    entityImage: mention.entityImage,
    createdAt: mention.createdAt.toISOString()
  }));

  return NextResponse.json({
    id: post.id,
    content: post.content,
    imageSrc: post.imageSrc,
    mediaUrl: post.mediaUrl,
    mediaType: post.mediaType,
    mediaOverlay: (post as any).mediaOverlay || null,
    thumbnailUrl: post.thumbnailUrl || null,
    location: post.location,
    tag: post.tag,
    photo: post.photo,
    category: post.category,
    postType: (post as any).postType,
    createdAt: post.createdAt.toISOString(),
    likes: post.likes || [],
    bookmarks: post.bookmarks || [],
    hiddenBy: post.hiddenBy || [],
    viewedBy: post.viewedBy || [],
    mentions: mentions.length > 0 ? mentions : null,
    user: {
      id: post.user.id,
      name: post.user.name,
      image: post.user.image,
      emailVerified: post.user.emailVerified?.toISOString() || null,
      createdAt: post.user.createdAt.toISOString(),
      updatedAt: post.user.updatedAt.toISOString(),
    },
    comments: post.comments.map((comment: typeof post.comments[number]) => ({
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
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return apiErrorCode('UNAUTHORIZED');
    }

    const postId = params.postId;
    const body = await request.json();
    const { taggedUsers, taggedListings, taggedShops } = body;

    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return apiErrorCode('POST_NOT_FOUND');
    }

    // Check if user can modify (owner or master/admin)
    if (!canModifyResource(currentUser, post.userId)) {
      return apiErrorCode('FORBIDDEN');
    }

    // Delete existing mentions for this post
    await prisma.postMention.deleteMany({
      where: { postId }
    });

    // Create new mentions
    const mentionsToCreate = [];

    // Add user tags
    if (taggedUsers && Array.isArray(taggedUsers)) {
      for (const userId of taggedUsers) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user) {
          mentionsToCreate.push({
            postId,
            entityId: userId,
            entityType: 'user',
            entityTitle: user.name || 'User',
            entitySubtitle: user.bio || '',
            entityImage: user.image || null,
          });
        }
      }
    }

    // Add listing tags
    if (taggedListings && Array.isArray(taggedListings)) {
      for (const listingId of taggedListings) {
        const listing = await prisma.listing.findUnique({ where: { id: listingId } });
        if (listing) {
          mentionsToCreate.push({
            postId,
            entityId: listingId,
            entityType: 'listing',
            entityTitle: listing.title,
            entitySubtitle: listing.category || '',
            entityImage: listing.imageSrc || null,
          });
        }
      }
    }

    // Add shop tags
    if (taggedShops && Array.isArray(taggedShops)) {
      for (const shopId of taggedShops) {
        const shop = await prisma.shop.findUnique({ where: { id: shopId } });
        if (shop) {
          mentionsToCreate.push({
            postId,
            entityId: shopId,
            entityType: 'shop',
            entityTitle: shop.name,
            entitySubtitle: shop.category || '',
            entityImage: shop.logo || null,
          });
        }
      }
    }

    // Bulk create mentions
    if (mentionsToCreate.length > 0) {
      await prisma.postMention.createMany({
        data: mentionsToCreate
      });
    }

    // Fetch updated post with mentions
    const updatedPost = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        mentions: true,
        user: true,
      }
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    return apiErrorCode('INTERNAL_ERROR');
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return apiErrorCode('UNAUTHORIZED');
    }

    const postId = params.postId;

    const post = await prisma.post.findUnique({
      where: {
        id: postId
      }
    });

    if (!post) {
      return apiErrorCode('POST_NOT_FOUND');
    }

    // Check if user can modify (owner or master/admin)
    if (!canModifyResource(currentUser, post.userId)) {
      return apiErrorCode('FORBIDDEN');
    }

    const deletedPost = await prisma.post.delete({
      where: {
        id: postId
      }
    });

    return NextResponse.json(deletedPost);
  } catch (error) {
    return apiErrorCode('INTERNAL_ERROR');
  }
}