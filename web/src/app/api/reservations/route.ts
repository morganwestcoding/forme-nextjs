import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { getUserFromRequest } from "@/app/utils/mobileAuth";
import { apiError, apiErrorCode } from "@/app/utils/api";
import { createRateLimiter, getIP } from "@/app/libs/rateLimit";

const reservationLimiter = createRateLimiter("reservations", { limit: 10, windowSeconds: 60 });

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

    // Also find employee rows linked to this user (for incoming view)
    const myEmployeeRows = await prisma.employee.findMany({
      where: { userId: currentUser.id, isActive: true },
      select: { id: true },
    });
    const myEmployeeIds = myEmployeeRows.map(e => e.id);

    // Build OR clauses for outgoing + incoming (own listings + assigned employee)
    const orClauses: any[] = [
      { userId: currentUser.id },
    ];
    if (userListingIds.length > 0) {
      orClauses.push({ listingId: { in: userListingIds } });
    }
    if (myEmployeeIds.length > 0) {
      orClauses.push({ employeeId: { in: myEmployeeIds } });
    }

    // Fetch reservations with full listing data needed by the client
    const reservations = await prisma.reservation.findMany({
      where: { OR: orClauses },
      include: {
        listing: {
          include: {
            services: true,
            employees: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                    imageSrc: true,
                  }
                }
              }
            },
            storeHours: true,
          },
        },
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Split into outgoing (user made) vs incoming (on user's listings or assigned to user's employee)
    const incomingListingIds = new Set(userListingIds);
    const incomingEmployeeIds = new Set(myEmployeeIds);

    const outgoing: typeof reservations = [];
    const incoming: typeof reservations = [];

    for (const r of reservations) {
      if (r.userId === currentUser.id) {
        outgoing.push(r);
      }
      if (incomingListingIds.has(r.listingId) || (r.employeeId && incomingEmployeeIds.has(r.employeeId))) {
        incoming.push(r);
      }
    }

    return NextResponse.json({ outgoing, incoming });
  } catch (error) {
    return apiErrorCode('INTERNAL_ERROR');
  }
}

export async function POST(request: Request) {
  const ip = getIP(request);
  const rl = reservationLimiter(ip);
  if (!rl.allowed) {
    return apiError(`Too many requests. Try again in ${rl.retryAfterSeconds}s`, 429);
  }

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
      serviceIds: rawServiceIds,
      serviceName,
      employeeId,
      tipAmount: rawTipAmount,
      subtotal: rawSubtotal,
    } = body;

    if (!listingId || !date || !time || !totalPrice || !serviceId || !serviceName || !employeeId) {
      return apiErrorCode('MISSING_FIELDS');
    }

    const serviceIds: string[] = Array.isArray(rawServiceIds) && rawServiceIds.length > 0
      ? rawServiceIds.map((id: any) => String(id)).filter(Boolean)
      : [serviceId];
    const tipAmount = Math.max(0, Math.round(Number(rawTipAmount) || 0));
    const subtotal = typeof rawSubtotal === 'number'
      ? rawSubtotal
      : Math.max(0, totalPrice - tipAmount);

    const reservation = await prisma.reservation.create({
      data: {
        userId: currentUser.id,
        listingId,
        date: new Date(date),
        time,
        note,
        totalPrice,
        subtotal,
        tipAmount,
        serviceId,
        serviceIds,
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