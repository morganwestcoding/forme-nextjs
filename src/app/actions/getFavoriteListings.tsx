import prisma from "@/app/libs/prismadb";
import getCurrentUser from "./getCurrentUser";
import { SafeListing } from "@/app/types";

export default async function getFavoriteListings(): Promise<SafeListing[]> {
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

    const safeFavorites: SafeListing[] = favorites.map(favorite => ({
      ...favorite,
      createdAt: favorite.createdAt.toISOString(), // Convert createdAt to string
      services: favorite.services.map(service => ({
        id: service.id,
        serviceName: service.serviceName,
        price: service.price,
        category: service.category,
        // Note: If there are additional fields in Service you need to transform or include, do so here
      })),
    }));

    return safeFavorites;
} catch (error: any) {
    throw new Error(error);
  }
}




