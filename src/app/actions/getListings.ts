import prisma from "@/app/libs/prismadb";
import { Service } from "@prisma/client";

export interface IListingsParams {
  userId?: string;
  startDate?: string;
  endDate?: string;
  locationValue?: string;
  category?: string;
  services:  Service[]
}

export default async function getListings(
  params: IListingsParams
) {
  try {
    const {
      userId,
      locationValue,
      startDate,
      endDate,
      category,
      services
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

    if (services) {
        query.serviceValue = services;
    }

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
      }
    }

    const listings = await prisma.listing.findMany({
      where: query,
      include: {
        services: true, // Include services for each listing
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const safeListings = listings.map((listing) => ({
      ...listing,
      createdAt: listing.createdAt.toISOString(),
    }));

    return safeListings;
  } catch (error: any) {
    console.error("Error in getListings:", error);
    throw new Error("Failed to fetch listings.");
  }
}