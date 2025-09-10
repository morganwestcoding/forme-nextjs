import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

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
      return new NextResponse('Listing ID is required', { status: 400 });
    }

    // Verify listing exists first
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, title: true }
    });

    if (!listing) {
      return new NextResponse('Listing not found', { status: 404 });
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
        imageSrc: true,
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
    return new NextResponse('Internal Error', { status: 500 });
  }
}