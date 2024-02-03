import prisma from "@/app/libs/prismadb";
import { SafeService, SafeListing } from "@/app/types";

interface PrismaListing {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  category: string;
  locationValue: string;
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
}

export interface IListingsParams {
  userId?: string;
  startDate?: string;
  endDate?: string;
  locationValue?: string;
  category?: string;
}

export default async function getListings(params: IListingsParams): Promise<SafeListing[]> {
  try {
    const {
      userId,
      locationValue,
      startDate,
      endDate,
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
      query.locationValue = locationValue;
    }

    // Implement logic for startDate and endDate if needed

    const listings = await prisma.listing.findMany({
      where: query,
      include: {
        user: true, // Including user details
        services: true, // Including services
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform listings to SafeListing[] including all necessary properties
    const safeListings: SafeListing[] = listings.map((listing: PrismaListing): SafeListing => ({
      id: listing.id,
      title: listing.title,
      description: listing.description,
      imageSrc: listing.imageSrc,
      category: listing.category,
      locationValue: listing.locationValue,
      userId: listing.userId, // Assuming this is directly available; adjust according to your data model
      createdAt: listing.createdAt.toISOString(),
      services: listing.services.map((service: SafeService) => ({ 
        id: service.id,
        serviceName: service.serviceName,
        price: service.price,
        category: service.category,
        // Add other service fields as necessary based on SafeService definition
      })),
    }));

    

    return safeListings;
  } catch (error: any) {
    console.error("Error in getListings:", error.message);
    throw new Error("Failed to fetch listings.");
  }
}
