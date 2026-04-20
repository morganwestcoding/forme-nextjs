import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

// Slim endpoint optimized for the /maps page.
// Returns only the fields needed to render markers + popups — no employees, services, or store hours.
// Filters out listings without geocoded coordinates so the client never has to handle nulls.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  // Optional viewport bounds: ?bbox=minLng,minLat,maxLng,maxLat
  const bbox = searchParams.get('bbox');

  const where: any = {
    academyId: { isSet: false },
    lat: { not: null },
    lng: { not: null },
  };
  if (category) where.category = category;

  if (bbox) {
    const parts = bbox.split(',').map(Number);
    if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
      const [minLng, minLat, maxLng, maxLat] = parts;
      where.lat = { gte: minLat, lte: maxLat };
      where.lng = { gte: minLng, lte: maxLng };
    }
  }

  try {
    const listings = await prisma.listing.findMany({
      where,
      select: {
        id: true,
        title: true,
        category: true,
        location: true,
        address: true,
        imageSrc: true,
        lat: true,
        lng: true,
        rating: true,
        ratingCount: true,
        employees: {
          where: { isActive: true },
          select: {
            id: true,
            fullName: true,
            jobTitle: true,
            user: { select: { image: true, imageSrc: true } },
          },
        },
      },
    });

    // Flatten employee shape so the client doesn't have to know about user.image vs imageSrc.
    const shaped = listings.map((l: any) => ({
      ...l,
      employees: (l.employees || []).map((e: any) => ({
        id: e.id,
        fullName: e.fullName,
        jobTitle: e.jobTitle,
        image: e.user?.imageSrc || e.user?.image || null,
      })),
    }));

    return NextResponse.json({ listings: shaped });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch map listings' }, { status: 500 });
  }
}
