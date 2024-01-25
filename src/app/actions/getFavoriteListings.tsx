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
          in: [...(currentUser.favoriteIds || [])]
        }
      },
      include: {
        services: true, // Include services here
      }
    });

    const safeFavorites = favorites.map((favorite) => ({
      ...favorite,
      createdAt: favorite.createdAt.toISOString(),
      services: favorite.services.map(service => ({
        id: service.id,
        serviceName: service.serviceName,
        price: service.price,
        category: service.category,
        // Include other fields as needed
      })),
    }));

    return safeFavorites;
} catch (error: any) {
    throw new Error(error);
  }
}




