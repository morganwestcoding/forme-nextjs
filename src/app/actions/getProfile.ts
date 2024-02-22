import prisma from "@/app/libs/prismadb";
import { SafeProfile } from "@/app/types"; // Assuming you have a SafeProfile type defined
import getCurrentUser from "@/app/actions/getCurrentUser"; // Use your getCurrentUser action

export default async function getProfile(): Promise<SafeProfile | null> {
  try {
    const currentUser = await getCurrentUser();

    // If currentUser is null, it means the user is not authenticated or not found
    if (!currentUser) {
      throw new Error("User not authenticated or not found.");
    }

    const profile = await prisma.profile.findUnique({
      where: {
        userId: currentUser.id, // Use the currentUser's ID to find the profile
      },
      include: {
        user: true, // Include the user details
      },
    });

    // If no profile is found for the user, you can decide how to handle this case
    if (!profile) {
      throw new Error("Profile not found.");
    }

    // Transforming the profile to a SafeProfile format
    const safeProfile: SafeProfile = {
      id: profile.id,
      bio: profile.bio || '', // Provide a default value if bio is not available
      userId: profile.userId,
      image: profile.user.image || '/people/chicken-headshot.jpeg', // Provide a default profile image path if none exists
      name: profile.user.name || '', 
      imageSrc: profile.imageSrc || '/assets/hero-background.jpeg', // Provide a default background image path if none exists
    };

    return safeProfile;
  } catch (error) {
    console.error("Error in getProfile:", error);
    return null; // Optionally, you might return null or handle the error differently
  }
}
