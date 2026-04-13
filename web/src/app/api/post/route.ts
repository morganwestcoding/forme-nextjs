// app/api/post/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { MediaType } from "@/app/types";
import { getUserFromRequest } from "@/app/utils/mobileAuth";
import { apiError, apiErrorCode } from "@/app/utils/api";
import { sanitizeText } from "@/app/utils/sanitize";
import { validateBody, createPostSchema } from "@/app/utils/validations";
import { createRateLimiter, getIP } from "@/app/libs/rateLimit";

const limiter = createRateLimiter("post", { limit: 10, windowSeconds: 60 });

export async function POST(request: Request) {
    const ip = getIP(request);
    const rl = limiter(ip);
    if (!rl.allowed) {
        return apiError(`Too many requests. Try again in ${rl.retryAfterSeconds}s`, 429);
    }

    const currentUser = await getUserFromRequest(request) || await getCurrentUser();
    if (!currentUser) {
        return apiErrorCode('UNAUTHORIZED');
    }

    const body = await request.json();
    const validation = validateBody(createPostSchema, body);
    if (!validation.success) {
        return apiError(validation.error, 400);
    }

    const {
        content,
        imageSrc,
        mediaUrl,
        mediaType,
        location,
        tag,
        category,
        mentions = [],
    } = validation.data;
    const { beforeImageSrc, mediaOverlay, thumbnailUrl, postType } = body;

    const sanitizedContent = sanitizeText(content);

    // Use empty string if no category or if category is "All" or "Default"
    const finalCategory = category && category !== "All" && category !== "Default" 
        ? category 
        : "";

    // Validate mediaType if provided
    if (mediaType && !['image', 'video', 'gif'].includes(mediaType)) {
        return apiError("Invalid media type. Must be 'image', 'video', or 'gif'", 400);
    }

    // Validate mentions if provided
    if (mentions && Array.isArray(mentions) && mentions.length > 0) {
        const isValidMentions = mentions.every((mention: any) => 
            mention && 
            typeof mention.id === 'string' && 
            ['user', 'listing', 'shop'].includes(mention.type) &&
            typeof mention.title === 'string'
        );
        
        if (!isValidMentions) {
            return apiError("Invalid mentions format", 400);
        }
    }

    try {
        // Create the post first
        const post = await prisma.post.create({
            data: {
                content: sanitizedContent,
                imageSrc,
                beforeImageSrc: beforeImageSrc || undefined,
                mediaUrl,
                mediaType,
                mediaOverlay: mediaOverlay || undefined,
                thumbnailUrl: thumbnailUrl || undefined,
                location,
                tag,
                category: finalCategory,
                postType,
                userId: currentUser.id,
                likes: [],
                bookmarks: [],
                hiddenBy: []
            }
        });

        // Create PostMention records if mentions exist
        if (mentions && Array.isArray(mentions) && mentions.length > 0) {
            const mentionData = mentions.map((mention: any) => ({
                postId: post.id,
                entityId: mention.id,
                entityType: mention.type,
                entityTitle: mention.title,
                entitySubtitle: mention.subtitle || null,
                entityImage: mention.image || null
            }));

            await prisma.postMention.createMany({
                data: mentionData
            });
        }

        // Fetch the complete post with relations
        const completePost = await prisma.post.findUnique({
            where: { id: post.id },
            include: {
                user: true,
                mentions: true,
                comments: {
                    include: {
                        user: true
                    }
                }
            }
        });

        return NextResponse.json(completePost);
    } catch (error) {
        return apiErrorCode('INTERNAL_ERROR');
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const category = searchParams.get('category');
        const filter = searchParams.get('filter');
        
        const currentUser = await getCurrentUser();

        if ((filter === 'following' || filter === 'likes' || filter === 'bookmarks') && !currentUser) {
            return NextResponse.json([]);
        }

        let query: any = {};

        if (userId) {
            query.userId = userId;
        }

        if (category) {
            query.category = category;
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

        const posts = await prisma.post.findMany({
            where: query,
            include: {
                user: true,
                mentions: true, // NEW: Include PostMention relations
                comments: {
                    include: {
                        user: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        let filteredPosts = posts;
        
        if (currentUser) {
            filteredPosts = filteredPosts.filter((post: typeof filteredPosts[number]) => !post.hiddenBy?.includes(currentUser.id));

            if (filter === 'following') {
                filteredPosts = filteredPosts.filter((post: typeof filteredPosts[number]) =>
                    currentUser.following.includes(post.userId) ||
                    post.userId === currentUser.id
                );
            }
        }

        return NextResponse.json(filteredPosts);
    } catch (error) {
        return apiErrorCode('INTERNAL_ERROR');
    }
}