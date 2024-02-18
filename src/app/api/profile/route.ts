// Import the Request type for proper typing of the request parameter.
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

export async function POST(request: Request) {
    const body = await request.json();
    const { userId, userImage, imageSrc } = body;

    if (!userId || (!userImage && !imageSrc)) {
        return new Response("Missing userId , imageSrc or userImage", { status: 400 });
    }

    try {
        
        const profile = await prisma.profile.upsert({
            where: { userId: userId },
            update: { 
                userImage: userImage,
                imageSrc: imageSrc 
            },
            create: {
                userId: userId,
                userImage: userImage,
                imageSrc: imageSrc },
        });

        await prisma.user.update({
            where: { id: userId },
            data: { profileId: profile.id },
        });

        // Use NextResponse for consistency with other route examples you've provided.
        return new Response(JSON.stringify(profile), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.error("Error updating profile header image:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
