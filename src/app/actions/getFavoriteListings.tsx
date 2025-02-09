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
        storeHours: true,
      },
    });

    const safeFavorites = favorites.map((favorite) => ({
      ...favorite,
      createdAt: favorite.createdAt.toISOString(),
      favoriteIds: currentUser?.favoriteIds || [], // Add this line
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
      storeHours: favorite.storeHours.map(hours => ({
        dayOfWeek: hours.dayOfWeek,
        openTime: hours.openTime,
        closeTime: hours.closeTime,
        isClosed: hours.isClosed
      })),
      galleryImages: favorite.galleryImages || [],
      phoneNumber: favorite.phoneNumber || null,
      website: favorite.website || null,
      address: favorite.address || null,
      zipCode: favorite.zipCode || null,
      city: favorite.location?.split(',')[0]?.trim() || null,  // Add this
      state: favorite.location?.split(',')[1]?.trim() || null  // Add this
    }));

    console.log('Safe favorites:', safeFavorites);
    return safeFavorites;
  } catch (error: any) {
    console.error("Error fetching favorite listings:", error.message);
    throw new Error("Failed to fetch favorite listings");
  }
}