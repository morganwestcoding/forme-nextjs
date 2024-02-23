import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {
    // Get current user and validate
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { image, imageSrc, bio } = body;

    try {
        // Update the user's profile image if provided
        if (image) {
            await prisma.user.update({
                where: { id: currentUser.id },
                data: { image: image },
            });
        }

        // Update or create the profile with imageSrc if provided
        let profileUpdateData = { 
            ...imageSrc && { imageSrc: imageSrc }, // Conditionally add imageSrc if it's provided
            ...bio && { bio: bio } // Conditionally add bio if it's provided
        };

        await prisma.profile.upsert({
            where: { userId: currentUser.id },
            update: profileUpdateData,
            create: {
                userId: currentUser.id,
                ...profileUpdateData,
            },
        });

        // Assuming you want to return the updated profile information
        const updatedProfile = await prisma.profile.findUnique({
            where: { userId: currentUser.id },
            include: {
                user: true, // Include user to fetch the possibly updated image
            },
        });

        if (!updatedProfile) {
            return new Response("Profile update failed", { status: 404 });
        }

        // Constructing a response object with the updated information
        const responsePayload = {
            profile: {
                id: updatedProfile.id,
                bio: updatedProfile.bio,
                imageSrc: updatedProfile.imageSrc,
                userId: updatedProfile.userId,
                name: updatedProfile.user.name,
                image: updatedProfile.user.image,
                createdAt: updatedProfile.user.createdAt.toISOString(), 
            },
        };

        return new Response(JSON.stringify(responsePayload), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
