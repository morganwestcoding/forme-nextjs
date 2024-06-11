import prisma from "@/app/libs/prismadb";

export interface IListingsParams {
  userId?: string;
  locationValue?: string; 
  category?: string;
}

export default async function getListings(params: IListingsParams) { 
    const {
    userId,
    locationValue,
    category,
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
   
    try {
    const listings = await prisma.listing.findMany({
      where: query,
      include: {// Including user details
        services: true, // Including services
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform listings to SafeListing[] including all necessary properties
    return listings.map(listing => ({
      ...listing,
      createdAt: listing.createdAt.toISOString(),
      }));
 
  } catch (error: any) {
    console.error("Error in getListings:", error.message);
    throw new Error("Failed to fetch listings.");
  }
}
