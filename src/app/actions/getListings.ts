import prisma from "@/app/libs/prismadb";
import { SafeService, SafeListing } from "@/app/types";

interface Listing {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  category: string;
  state: string;
  city: string;
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
  state?: string;
  city?: string;
  category?: string;
}

export default async function getListings(params: IListingsParams): Promise<SafeListing[]> {
  try {
    const {
      userId,
     state,
     city,
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

    if (state) {
      query.state = state;
    }

    if (city) {
      query.city = city;
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
    const safeListings: SafeListing[] = listings.map((listing: Listing): SafeListing => ({
      id: listing.id,
      title: listing.title,
      description: listing.description,
      imageSrc: listing.imageSrc,
      category: listing.category,
      state: listing.state,
      city: listing.city,
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
