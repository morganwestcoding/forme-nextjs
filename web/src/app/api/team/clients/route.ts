import { NextResponse } from "next/server";
import { apiError, apiErrorCode } from "@/app/utils/api";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

// GET /api/team/clients?listingId=xxx&search=xxx
export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return apiErrorCode('UNAUTHORIZED');
    }

    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get("listingId");
    const search = searchParams.get("search");

    if (!listingId) {
      return apiError("Listing ID required", 400);
    }

    // Verify the current user owns the listing
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { userId: true },
    });

    if (!listing || listing.userId !== currentUser.id) {
      return apiErrorCode('FORBIDDEN');
    }

    // Get all unique clients who have booked at this listing
    const reservations = await prisma.reservation.findMany({
      where: { listingId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            imageSrc: true,
            email: true,
            createdAt: true,
          },
        },
        employee: {
          select: { fullName: true },
        },
      },
      orderBy: { date: "desc" },
    });

    // Group reservations by client
    const clientMap = new Map<string, {
      user: typeof reservations[number]["user"];
      bookings: typeof reservations;
      totalSpent: number;
      lastVisit: Date;
      firstVisit: Date;
      visitCount: number;
    }>();

    for (const res of reservations) {
      const existing = clientMap.get(res.userId);
      if (existing) {
        existing.bookings.push(res);
        existing.totalSpent += res.totalPrice;
        existing.visitCount += 1;
        if (res.date > existing.lastVisit) existing.lastVisit = res.date;
        if (res.date < existing.firstVisit) existing.firstVisit = res.date;
      } else {
        clientMap.set(res.userId, {
          user: res.user,
          bookings: [res],
          totalSpent: res.totalPrice,
          lastVisit: res.date,
          firstVisit: res.date,
          visitCount: 1,
        });
      }
    }

    // Get client records (notes/tags)
    const clientRecords = await prisma.clientRecord.findMany({
      where: { listingId },
    });
    const recordMap = new Map(clientRecords.map((cr) => [cr.userId, cr]));

    // Build client list
    let clients = Array.from(clientMap.entries()).map(([userId, data]) => {
      const record = recordMap.get(userId);
      return {
        userId,
        name: data.user.name,
        email: data.user.email,
        image: data.user.image || data.user.imageSrc,
        totalSpent: data.totalSpent,
        visitCount: data.visitCount,
        lastVisit: data.lastVisit.toISOString(),
        firstVisit: data.firstVisit.toISOString(),
        notes: record?.notes || null,
        tags: record?.tags || [],
        recentBookings: data.bookings.slice(0, 5).map((b) => ({
          id: b.id,
          serviceName: b.serviceName,
          date: b.date.toISOString(),
          time: b.time,
          totalPrice: b.totalPrice,
          status: b.status,
          employeeName: b.employee?.fullName || null,
        })),
      };
    });

    // Apply search filter
    if (search) {
      const term = search.toLowerCase();
      clients = clients.filter(
        (c) =>
          c.name?.toLowerCase().includes(term) ||
          c.email?.toLowerCase().includes(term)
      );
    }

    // Sort by most recent visit
    clients.sort((a, b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime());

    return NextResponse.json({ clients });
  } catch (error) {
    return apiErrorCode('INTERNAL_ERROR');
  }
}

// PATCH /api/team/clients — update client notes/tags
export async function PATCH(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return apiErrorCode('UNAUTHORIZED');
    }

    const body = await request.json();
    const { listingId, clientUserId, notes, tags } = body;

    if (!listingId || !clientUserId) {
      return apiErrorCode('MISSING_FIELDS');
    }

    // Verify ownership
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { userId: true },
    });

    if (!listing || listing.userId !== currentUser.id) {
      return apiErrorCode('FORBIDDEN');
    }

    const updateData: Record<string, unknown> = {};
    if (notes !== undefined) updateData.notes = notes;
    if (tags !== undefined) updateData.tags = tags;

    const record = await prisma.clientRecord.upsert({
      where: {
        listingId_userId: { listingId, userId: clientUserId },
      },
      update: updateData,
      create: {
        listingId,
        userId: clientUserId,
        notes: notes || null,
        tags: tags || [],
      },
    });

    return NextResponse.json(record);
  } catch (error) {
    return apiErrorCode('INTERNAL_ERROR');
  }
}
