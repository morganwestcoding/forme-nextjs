// app/api/post/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { MediaType } from "@/app/types";

export async function POST(request: Request) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const {
        content,
        imageSrc,
        mediaUrl,
        mediaType,
        mediaOverlay,
        location,
        tag,
        category,
        postType,
        mentions = [] // NEW: Handle mentions/tags
    } = body;

    console.log("Received fields in POST request:", {
        content,
        imageSrc,
        mediaUrl,
        mediaType,
        mediaOverlay,
        location,
        tag,
        category,
        postType,
        mentions
    });

    // Check if content exists (allow empty content for Reels)
    if (content === undefined || content === null) {
        return new Response("Missing required field: content", { status: 400 });
    }

    // Use empty string if no category or if category is "All" or "Default"
    const finalCategory = category && category !== "All" && category !== "Default" 
        ? category 
        : "";

    // Validate mediaType if provided
    if (mediaType && !['image', 'video', 'gif'].includes(mediaType)) {
        return new Response(
            "Invalid media type. Must be 'image', 'video', or 'gif'", 
            { status: 400 }
        );
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
            return new Response("Invalid mentions format", { status: 400 });
        }
    }

    try {
        // Create the post first
        const post = await prisma.post.create({
            data: {
                content,
                imageSrc,
                mediaUrl,
                mediaType,
                mediaOverlay: mediaOverlay || undefined,
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
        console.error("Error creating post:", error);
        return new Response("Internal Server Error", { status: 500 });
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
            filteredPosts = filteredPosts.filter(post => !post.hiddenBy?.includes(currentUser.id));
            
            if (filter === 'following') {
                filteredPosts = filteredPosts.filter(post => 
                    currentUser.following.includes(post.userId) ||
                    post.userId === currentUser.id
                );
            }
        }

        return NextResponse.json(filteredPosts);
    } catch (error) {
        console.error("Error fetching posts:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}