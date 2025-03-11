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
        location, 
        tag, 
        category 
    } = body;

    console.log("Received fields in POST request:", { 
        content, 
        imageSrc, 
        mediaUrl, 
        mediaType, 
        location, 
        tag, 
        category 
    });

    // Check if content exists
    if (!content) {
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

    try {
        const post = await prisma.post.create({
            data: {
                content,
                imageSrc,
                mediaUrl,
                mediaType,
                location,
                tag,
                category: finalCategory,
                userId: currentUser.id,
                likes: [],
                bookmarks: [],
                hiddenBy: []
            },
            include: {
                user: true
            }
        });

        return NextResponse.json(post);
    } catch (error) {
        console.error("Error creating post:", error);
        console.error("Detailed error information:", error);
        return new Response("Internal Server Error", { status: 500 });
    } 
}

// Rest of your GET function and other exports remain unchanged
export async function GET(request: Request) {
    // Your existing GET implementation
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const category = searchParams.get('category');
        // Add filter parameter
        const filter = searchParams.get('filter');
        
        // Get current user for personalized filters
        const currentUser = await getCurrentUser();

        // If filter requires current user but none exists, return empty array
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

        const posts = await prisma.post.findMany({
            where: query,
            include: {
                user: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        let filteredPosts = posts;
        
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

        return NextResponse.json(filteredPosts);
    } catch (error) {
        console.error("Error fetching posts:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}