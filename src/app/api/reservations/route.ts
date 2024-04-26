import { NextResponse } from "next/server";

import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(
  request: Request, 
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }

  const body = await request.json();
  const { 
    listingId,
    date,
    time,
    note,
    totalPrice
   } = body;

   if (!listingId || !date || !time || !totalPrice) {
    return NextResponse.error();
  }

  const listingAndReservation = await prisma.listing.update({
    where: {
      id: listingId
    },
    data: {
      reservations: {
        create: {
          userId: currentUser.id,
          date: new Date(date),
          time,
          note,
          totalPrice,
        }
      }
    }
  });

  return NextResponse.json(listingAndReservation);
}