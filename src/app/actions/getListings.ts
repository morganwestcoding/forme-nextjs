import prisma from "@/app/libs/prismadb";
import { SafeService, SafeListing } from "@/app/types";

{/*interface Listing {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  category: string;
  location?: string | null;
  userId: string; // Assuming direct mapping, adjust according to your schema if needed
  createdAt: Date; // Prisma returns JavaScript Date objects for Date fields
  services: Array<{
    id: string;
    serviceName: string;
    price: number;
    category: string;
    // Add other fields from your Service model as needed
  }>;
  // Include the user if needed, with a structure similar to services
} */}

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
    const safeListings  = listings.map((listing): SafeListing => ({
      ...listing,
      createdAt: listing.createdAt.toISOString(),
      }));

    return safeListings;
  } catch (error: any) {
    console.error("Error in getListings:", error.message);
    throw new Error("Failed to fetch listings.");
  }
}
