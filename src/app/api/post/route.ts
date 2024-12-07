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

    if (!content || !category) {
        return new Response(
            `Missing required fields: ${!content ? 'content' : ''} ${!category ? 'category' : ''}`, 
            { status: 400 }
        );
    }

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
                category,
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

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const category = searchParams.get('category');

        let query: any = {};

        if (userId) {
            query.userId = userId;
        }

        if (category) {
            query.category = category;
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

        return NextResponse.json(posts);
    } catch (error) {
        console.error("Error fetching posts:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}