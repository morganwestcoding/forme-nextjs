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
        services: true,
        employees: true,
      },
    });

    const safeFavorites = favorites.map((favorite) => ({
      ...favorite,
      createdAt: favorite.createdAt.toISOString(),
      services: favorite.services.map(service => ({
        id: service.id,
        serviceName: service.serviceName,
        price: service.price,
        category: service.category
      })),
      employees: favorite.employees.map(employee => ({
        id: employee.id,
        fullName: employee.fullName
      })),
      galleryImages: favorite.galleryImages || [],
      phoneNumber: favorite.phoneNumber || null,
      website: favorite.website || null,
      address: favorite.address || null,
      zipCode: favorite.zipCode || null
    }));

    return safeFavorites;
  } catch (error: any) {
    console.error("Error fetching favorite listings:", error.message);
    throw new Error("Failed to fetch favorite listings");
  }
}