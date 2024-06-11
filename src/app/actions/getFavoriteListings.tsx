import prisma from "@/app/libs/prismadb";
import getCurrentUser from "./getCurrentUser";

export default async function getFavoriteListings() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return [];
    }

    const favorites = await prisma.listing.findMany({
      where: {
        id: {
          in: [...(currentUser.favoriteIds || [])],
        },
      },
      include: {
        services: true, // Ensure services are included
      },
    });

    // Transform the fetched favorites into SafeListing[]
    const safeFavorites = favorites.map((favorite) => ({
      ...favorite,
      createdAt: favorite.createdAt.toISOString(),
      }));

    return safeFavorites;
  } catch (error: any) {
    console.error("Error fetching favorite listings:", error.message);
    throw new Error("Failed to fetch favorite listings");
  }
}
