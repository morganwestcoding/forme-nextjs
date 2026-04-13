import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { getUserFromRequest } from "@/app/utils/mobileAuth";
import { apiError, apiErrorCode } from "@/app/utils/api";

export async function GET(request: Request) {
  try {
    const currentUser = await getUserFromRequest(request) || await getCurrentUser();

    if (!currentUser) {
      return apiErrorCode('UNAUTHORIZED');
    }

    // Get user's own listings to find incoming reservations
    const userListings = await prisma.listing.findMany({
      where: { userId: currentUser.id },
      select: { id: true },
    });
    const userListingIds = userListings.map(l => l.id);

    // Fetch both outgoing (as customer) and incoming (as business owner)
    const reservations = await prisma.reservation.findMany({
      where: {
        OR: [
          { userId: currentUser.id },
          { listingId: { in: userListingIds } },
        ],
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            description: true,
            imageSrc: true,
            category: true,
            location: true,
            userId: true,
          }
        },
        employee: {
          select: {
            id: true,
            fullName: true,
            jobTitle: true,
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(reservations);
  } catch (error) {
    return apiErrorCode('INTERNAL_ERROR');
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getUserFromRequest(request) || await getCurrentUser();

    if (!currentUser) {
      return apiErrorCode('UNAUTHORIZED');
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
      return apiErrorCode('MISSING_FIELDS');
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
    return apiErrorCode('INTERNAL_ERROR');
  }
}