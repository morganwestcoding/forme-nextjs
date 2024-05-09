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
      createdAt: currentUser.createdAt, // Assuming this is already a string
      updatedAt: currentUser.updatedAt, // Assuming this is already a string
      emailVerified: currentUser.emailVerified // Assuming this is already a string or null
    };
  } catch (error) {
    console.error("Error in getProfile:", error);
    return null;
  }
}
