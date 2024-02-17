// Import the Request type for proper typing of the request parameter.
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

export async function POST(request: Request) {
    const body = await request.json();
    const { userId, headerImage } = body;

    if (!userId || !headerImage) {
        return new Response("Missing userId or headerImage", { status: 400 });
    }

    try {
        // Ensure the `profile` model exists in your Prisma schema and you've run `prisma generate`.
        const profile = await prisma.profile.upsert({
            where: { userId: userId },
            update: { headerImage: headerImage },
            create: { userId: userId, headerImage: headerImage },
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
