import prisma from "@/app/libs/prismadb";

interface IParams {
  userId?: string;
}

export default async function getProfileById(params: IParams) {
  try {
    const { userId } = params;

    if (!userId) {
      return null;
    }

    // Pull only the user record — you fetch listings/posts elsewhere already
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return null;

    // Counts (server-side so the client stays clean)
    const [listingCount, postCount] = await Promise.all([
      prisma.listing.count({ where: { userId } }),
      prisma.post.count({ where: { userId } }),
    ]);

    const followerCount = (user.followers ?? []).length;
    const followingCount = (user.following ?? []).length;

    // Convenience: split "City, State"
    const city = user.location?.split(",")[0]?.trim() || null;
    const state = user.location?.split(",")[1]?.trim() || null;

    return {
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      emailVerified: user.emailVerified ? user.emailVerified.toISOString() : null,

      // null-safe fallbacks (match your listing/shop patterns)
      name: user.name ?? null,
      email: user.email ?? null,
      image: user.image || user.imageSrc || null,
      imageSrc: user.imageSrc ?? null,
      bio: user.bio ?? "No Bio Provided Yet..",
      location: user.location ?? null,
      galleryImages: user.galleryImages ?? [],
      following: user.following ?? [],
      followers: user.followers ?? [],
      conversationIds: user.conversationIds ?? [],
      resetToken: user.resetToken ?? null,
      resetTokenExpiry: user.resetTokenExpiry ?? null,
      isSubscribed: user.isSubscribed ?? false,
      subscriptionStartDate: user.subscriptionStartDate ?? null,
      subscriptionEndDate: user.subscriptionEndDate ?? null,
      subscriptionTier: user.subscriptionTier ?? null,

      // derived conveniences
      city,
      state,
      followerCount,
      followingCount,
      listingCount,
      postCount,
    };
  } catch (error: any) {
    console.error("Error in getProfileById:", error);
    throw new Error(`Failed to fetch profile: ${error.message}`);
  }
}
