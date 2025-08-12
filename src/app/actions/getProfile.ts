import prisma from "@/app/libs/prismadb";

export interface IProfilesParams {
  name?: string;
  locationValue?: string;   // exact match for "City, State" if you use it
  city?: string;            // loose contains match
  state?: string;           // loose contains match
  isSubscribed?: boolean;   // optional filter
  order?: "asc" | "desc";   // createdAt
}

export default async function getProfiles(params: IProfilesParams) {
  try {
    const { name, locationValue, city, state, isSubscribed, order } = params;

    const where: any = {};

    if (typeof isSubscribed !== "undefined") where.isSubscribed = isSubscribed;

    if (name) {
      where.name = { contains: name, mode: "insensitive" };
    }

    if (locationValue) {
      where.location = locationValue;
    }

    if (city || state) {
      where.location = { contains: city || state, mode: "insensitive" };
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: order === "asc" ? "asc" : "desc" },
    });

    const safeProfiles = users.map((u) => {
      const followerCount = (u.followers ?? []).length;
      const followingCount = (u.following ?? []).length;

      return {
        ...u,
        createdAt: u.createdAt.toISOString(),
        updatedAt: u.updatedAt.toISOString(),
        emailVerified: u.emailVerified ? u.emailVerified.toISOString() : null,

        name: u.name ?? null,
        email: u.email ?? null,
        image: u.image || u.imageSrc || null,
        imageSrc: u.imageSrc ?? null,
        bio: u.bio ?? "No Bio Provided Yet..",
        location: u.location ?? null,
        galleryImages: u.galleryImages ?? [],
        following: u.following ?? [],
        followers: u.followers ?? [],
        conversationIds: u.conversationIds ?? [],
        resetToken: u.resetToken ?? null,
        resetTokenExpiry: u.resetTokenExpiry ?? null,
        isSubscribed: u.isSubscribed ?? false,
        subscriptionStartDate: u.subscriptionStartDate ?? null,
        subscriptionEndDate: u.subscriptionEndDate ?? null,
        subscriptionTier: u.subscriptionTier ?? null,

        city: u.location?.split(",")[0]?.trim() || null,
        state: u.location?.split(",")[1]?.trim() || null,

        followerCount,
        followingCount,
      };
    });

    console.log("Fetched profiles count:", safeProfiles.length);
    return safeProfiles;
  } catch (error: any) {
    console.error("Error in getProfiles:", error);
    throw new Error(`Failed to fetch profiles: ${error.message}`);
  }
}
