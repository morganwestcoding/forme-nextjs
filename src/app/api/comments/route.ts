import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { content, postId } = body;

    if (!content || !postId) {
        return new Response("Missing required fields", { status: 400 });
    }

    try {
        const comment = await prisma.comment.create({
            data: {
                content,
                userId: currentUser.id,
                postId,
            },
            include: {
                user: true,
            },
        });

        return NextResponse.json(comment);
    } catch (error) {
        console.error("Error creating comment:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}