// app/api/reservations/count/route.ts
import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.error();
    }

    // Get all listings owned by the current user
    const userListings = await prisma.listing.findMany({
      where: {
        userId: currentUser.id
      },
      select: {
        id: true
      }
    });

    const listingIds = userListings.map(listing => listing.id);
    
    const reservationCount = await prisma.reservation.count({
      where: {
        listingId: {
          in: listingIds
        },
        status: 'pending' // Only count pending reservations
      }
    });

    return NextResponse.json(reservationCount);
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}