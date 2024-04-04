import prisma from "@/app/libs/prismadb";
import getCurrentUser from "./getCurrentUser";
import { SafeListing, SafeService } from "@/app/types";

interface RawListing {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  createdAt: Date; // Assuming `createdAt` is a Date object in Prisma model
  category: string;
  state: string;
  city: string;
  userId: string; // Assuming there's a direct relation to a User model
  services: Array<{
    id: string;
    serviceName: string;
    price: number;
    category: string;
    // Include other fields from your Service model as necessary
  }>;
}


export default async function getFavoriteListings(): Promise<SafeListing[]> {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return [];
    }

    const favorites = await prisma.listing.findMany({
      where: {
        id: {
          in: currentUser.favoriteIds || [],
        },
      },
      include: {
        services: true, // Ensure services are included
      },
    });

    // Transform the fetched favorites into SafeListing[]
    const safeFavorites: SafeListing[] = favorites.map((favorite: RawListing) => ({
      ...favorite,
      createdAt: favorite.createdAt.toISOString(), // Transform createdAt into a string
      services: favorite.services.map((service): SafeService => ({
        id: service.id,
        serviceName: service.serviceName,
        price: service.price,
        category: service.category,
        // Map other necessary fields for SafeService
      })),
    }));

    return safeFavorites;
  } catch (error: any) {
    console.error("Error fetching favorite listings:", error.message);
    throw new Error("Failed to fetch favorite listings");
  }
}
