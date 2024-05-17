import prisma from "@/app/libs/prismadb";
import { SafeListing } from "@/app/types";

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
    const safeListings  = listings.map((listing) => ({
      ...listing,
      createdAt: listing.createdAt.toISOString(),
      }));

    return safeListings;
  } catch (error: any) {
    console.error("Error in getListings:", error.message);
    throw new Error("Failed to fetch listings.");
  }
}
