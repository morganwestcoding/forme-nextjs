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

    let listings = await prisma.listing.findMany({
      where: query,
      include: {
        user: true, // Include full user data
        services: true,
        employees: true,
        storeHours: true
      },
      orderBy: {
        createdAt: order === 'asc' ? 'asc' : 'desc',
      },
    });

    // Price filtering if needed
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

// getListings.ts
const safeListings = listings.map((listing) => ({
  ...listing,
  createdAt: listing.createdAt.toISOString(),
  favoriteIds: [], 
  services: listing.services.map(service => ({
    id: service.id,
    serviceName: service.serviceName,
    price: service.price,
    category: service.category
  })),
  employees: listing.employees.map(employee => ({
    id: employee.id,
    fullName: employee.fullName,
    jobTitle: employee.jobTitle || null,
    profileImage: employee.profileImage || null
  })),
  storeHours: listing.storeHours.map(hour => ({
    dayOfWeek: hour.dayOfWeek,
    openTime: hour.openTime,
    closeTime: hour.closeTime,
    isClosed: hour.isClosed
  })),
  galleryImages: listing.galleryImages || [],
  phoneNumber: listing.phoneNumber || null,
  website: listing.website || null,
  address: listing.address || null,
  zipCode: listing.zipCode || null,
  city: listing.location?.split(',')[0]?.trim() || null,
  state: listing.location?.split(',')[1]?.trim() || null
}));

    console.log('Fetched listings count:', safeListings.length);
    return safeListings;

  } catch (error: any) {
    console.error("Error in getListings:", error);
    throw new Error(`Failed to fetch listings: ${error.message}`);
  }
}