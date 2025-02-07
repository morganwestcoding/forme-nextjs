import prisma from "@/app/libs/prismadb";
import { SafeUser } from "@/app/types";
import getCurrentUser from "@/app/actions/getCurrentUser";

export default async function getProfile(): Promise<SafeUser | null> {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      throw new Error("User not authenticated or not found.");
    }

    return {
      id: currentUser.id,
      name: currentUser.name ?? null,
      email: currentUser.email ?? null,
      image: currentUser.image ?? null,
      bio: currentUser.bio || "No Bio Provided Yet..",
      imageSrc: currentUser.imageSrc || '/assets/hero-background.jpeg',
      location: currentUser.location ?? null,
      createdAt: currentUser.createdAt,
      updatedAt: currentUser.updatedAt,
      emailVerified: currentUser.emailVerified,
      galleryImages: currentUser.galleryImages || [],
      following: currentUser.following || [],
      followers: currentUser.followers || [],
      conversationIds: currentUser.conversationIds || [],
      resetToken: currentUser.resetToken ?? null,
      resetTokenExpiry: currentUser.resetTokenExpiry ?? null,
      isSubscribed: currentUser.isSubscribed ?? false,
      subscriptionStartDate: currentUser.subscriptionStartDate ?? null,
      subscriptionEndDate: currentUser.subscriptionEndDate ?? null,
      subscriptionTier: currentUser.subscriptionTier ?? null, // Add this line
    };
  } catch (error) {
    console.error("Error in getProfile:", error);
    return null;
  }
}