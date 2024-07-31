import prisma from "@/app/libs/prismadb";
import { SafeUser } from "@/app/types";

interface IParams {
  userId?: string;
}

export default async function getProfileById(params: IParams): Promise<SafeUser | null> {
  const { userId } = params;

  if (!userId) {
    console.error("No user ID provided for getProfileById");
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.error("User not found with ID:", userId);
      return null;
    }

    return {
      id: user.id,
      name: user.name ?? null,
      email: user.email ?? null,
      image: user.image ?? null,
      bio: user.bio || "No Bio Provided Yet..",
      imageSrc: user.imageSrc || '/assets/hero-background.jpeg',
      location: user.location ?? null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      emailVerified: user.emailVerified ? user.emailVerified.toISOString() : null,
      galleryImages: user.galleryImages || [],
    };
  } catch (error) {
    console.error("Error fetching user profile by ID:", error);
    return null;
  }
}
