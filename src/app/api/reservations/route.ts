import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { 
      listingId,
      date,
      time,
      note,
      totalPrice,
      serviceId,
      serviceName,
      employeeId
    } = body;

    if (!listingId || !date || !time || !totalPrice || !serviceId || !serviceName || !employeeId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const reservation = await prisma.reservation.create({
      data: {
        userId: currentUser.id,
        listingId,
        date: new Date(date),
        time,
        note,
        totalPrice,
        serviceId,
        serviceName,
        employeeId,
        status: 'pending'
      },
      include: {
        listing: {
          include: {
            services: true,
            employees: true,
            storeHours: true
          }
        },
        user: true
      }
    });

    return NextResponse.json(reservation);
  } catch (error) {
    console.error('[RESERVATION_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}