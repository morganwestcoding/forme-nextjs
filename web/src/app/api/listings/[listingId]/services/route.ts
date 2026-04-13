import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { apiError, apiErrorCode } from "@/app/utils/api";

interface IParams {
  listingId: string;
}

export async function GET(
  request: Request,
  { params }: { params: IParams }
) {
  try {
    const { listingId } = params;

    if (!listingId || typeof listingId !== "string") {
      return apiError('Listing ID is required', 400);
    }

    // Verify listing exists first
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, title: true }
    });

    if (!listing) {
      return apiErrorCode('LISTING_NOT_FOUND');
    }

    // Fetch services for this listing
    const services = await prisma.service.findMany({
      where: {
        listingId: listingId
      },
      select: {
        id: true,
        serviceName: true,
        price: true,
        category: true,
      },
      orderBy: {
        serviceName: 'asc'
      }
    });

    return NextResponse.json({ 
      services,
      listing: {
        id: listing.id,
        title: listing.title
      }
    });
  } catch (error) {
    console.error('Error fetching listing services:', error);
    return apiErrorCode('INTERNAL_ERROR');
  }
}