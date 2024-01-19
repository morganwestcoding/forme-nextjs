import prisma from "@/app/libs/prismadb";
import { Service } from "@prisma/client";

export interface IListingsParams {
  userId?: string;
  startDate?: string;
  endDate?: string;
  locationValue?: string;
  category?: string;
  services?: string[];  // Assuming services is an array of service IDs
}

export default async function getListings(params: IListingsParams) {
  try {
    const { userId, locationValue, startDate, endDate, category, services } = params;
    let query: any = {};

    if (userId) query.userId = userId;
    if (category) query.category = category;
    if (locationValue) query.locationValue = locationValue;

    if (services && services.length > 0) {
      // Adjust this query to match your schema, especially if the relationship is more complex
      query.services = { some: { id: { in: services } } };
    }

    // Date range filtering logic
    if (startDate && endDate) {
      query.NOT = {
        reservations: {
          some: {
            OR: [
              {
                endDate: { gte: startDate },
                startDate: { lte: startDate }
              },
              {
                startDate: { lte: endDate },
                endDate: { gte: endDate }
              }
            ]
          }
        }
      };
    }

    const listings = await prisma.listing.findMany({
      where: query,
      include: { services: true },
      orderBy: { createdAt: 'desc' }
    });

    return listings.map(listing => ({
      ...listing,
      createdAt: listing.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("Error in getListings:", error);
    throw new Error("Failed to fetch listings.");
  }
}