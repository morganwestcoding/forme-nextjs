import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {

    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { content, imageSrc, location, tag, category } = body;
    console.log("Received fields in POST request:", { content, imageSrc, location, tag, category }); // Log here
   

    console.log("Received fields:", { content, imageSrc, location, tag, category});

    if (!content || !category) {
        return new Response(`Missing required fields: ${!content ? 'content' : ''} ${!category ? 'category' : ''}`, { status: 400 });
    }

    try {
        const post = await prisma.post.create({
            data: {
                content,
                imageSrc,
                location,
                tag,
                category,
                userId: currentUser.id,
            
            },
        });

        return NextResponse.json(post);
    } catch (error) {
        console.error("Error creating post:", error);
        console.error("Detailed error information:", error);
        return new Response("Internal Server Error", { status: 500 });
    } 
}
