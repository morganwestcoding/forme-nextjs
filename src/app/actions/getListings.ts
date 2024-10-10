import prisma from "@/app/libs/prismadb";

export interface IListingsParams {
  userId?: string;
  locationValue?: string; 
  category?: string;
}

export default async function getListings(
  params: IListingsParams
) {
  try {
    const {
      userId,
      locationValue,
      category,
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
   
    console.log('Query for listings:', query);

    const listings = await prisma.listing.findMany({
      where: query,
      include: {
        services: true, 
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('Listings found:', listings.length);
    console.log('Sample listing:', listings[0]);

    const safeListings = listings.map((listing) => ({
      ...listing,
      createdAt: listing.createdAt.toISOString(),
    }));
 
    return safeListings;
  } catch (error: any) {
    console.error("Error in getListings:", error.message);
    throw new Error("Failed to fetch listings.");
  }
}