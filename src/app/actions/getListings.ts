// getListings.ts
import prisma from "@/app/libs/prismadb";

export interface IListingsParams {
  userId?: string;
  locationValue?: string;
  category?: string;
  state?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  order?: 'asc' | 'desc';
}

export default async function getListings(params: IListingsParams) {
  try {
    const {
      userId,
      locationValue,
      category,
      state,
      city,
      minPrice,
      maxPrice,
      order
    } = params;

    console.log('Params received in getListings:', params);

    let query: any = {};

    if (userId) {
      query.userId = userId;
    }

    if (category) {
      query.category = category;
    }

    if (locationValue) {
      query.location = locationValue;
    }

    // Location filtering
    if (state || city) {
      query.location = {
        contains: state || city,
        mode: 'insensitive'
      };
    }

    console.log('Query for listings:', query);

    let listings = await prisma.listing.findMany({
      where: query,
      include: {
        services: true,
        employees: true,
        storeHours: true,
        user: {
          select: {
            favoriteIds: true
          }
        }
      },
      orderBy: {
        createdAt: order === 'asc' ? 'asc' : 'desc',
      },
    });

    // Apply price filter after fetching (since we need to check services)
    if (minPrice || maxPrice) {
      listings = listings.filter(listing => {
        const listingPrices = listing.services.map(service => service.price);
        const minListingPrice = Math.min(...listingPrices);
        const maxListingPrice = Math.max(...listingPrices);

        const aboveMin = !minPrice || maxListingPrice >= minPrice;
        const belowMax = !maxPrice || minListingPrice <= maxPrice;

        return aboveMin && belowMax;
      });
    }

    console.log('Listings found:', listings.length);
    console.log('Sample listing:', listings[0]);

    const safeListings = listings.map((listing) => ({
      ...listing,
      createdAt: listing.createdAt.toISOString(),
      favoriteIds: listing.user.favoriteIds || [], // Add this line
      employees: listing.employees.map(employee => ({
        id: employee.id,
        fullName: employee.fullName
      })),
      storeHours: listing.storeHours.map(hour => ({
        dayOfWeek: hour.dayOfWeek,
        openTime: hour.openTime,
        closeTime: hour.closeTime,
        isClosed: hour.isClosed
      })),
      services: listing.services.map(service => ({
        id: service.id,
        serviceName: service.serviceName,
        price: service.price,
        category: service.category,
        listingId: service.listingId
      }))
    }));

    return safeListings;
  } catch (error: any) {
    console.error("Error in getListings:", error.message);
    throw new Error("Failed to fetch listings.");
  }
}