import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

// Slim endpoint optimized for the /maps page.
// Returns two parallel arrays:
//   - `listings` — real businesses (storefronts) that customers browse.
//   - `workers`  — independent providers, surfaced as their own pins. They live
//     on a hidden shell listing internally (which holds the geocode), but the
//     shell is NEVER shown to clients — only the worker themselves is.
// Filters out anything without geocoded coordinates so the client never has to handle nulls.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  // Optional viewport bounds: ?bbox=minLng,minLat,maxLng,maxLat
  const bbox = searchParams.get('bbox');

  const baseGeo: any = {
    academyId: { isSet: false },
    lat: { not: null },
    lng: { not: null },
  };
  if (bbox) {
    const parts = bbox.split(',').map(Number);
    if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
      const [minLng, minLat, maxLng, maxLat] = parts;
      baseGeo.lat = { gte: minLat, lte: maxLat };
      baseGeo.lng = { gte: minLng, lte: maxLng };
    }
  }

  // Storefront listings — exclude any shell that anchors an independent provider.
  const listingWhere: any = {
    ...baseGeo,
    employees: { none: { isIndependent: true } },
  };
  if (category) listingWhere.category = category;

  // Shell listings that DO anchor an independent. We pull their geocode + the
  // independent employee/user, but we never expose the shell itself.
  const workerListingWhere: any = {
    ...baseGeo,
    employees: { some: { isIndependent: true, isActive: true } },
  };

  try {
    const [listings, workerListings] = await Promise.all([
      prisma.listing.findMany({
        where: listingWhere,
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
      }),
      prisma.listing.findMany({
        where: workerListingWhere,
        select: {
          location: true,
          address: true,
          lat: true,
          lng: true,
          rating: true,
          ratingCount: true,
          employees: {
            where: { isIndependent: true, isActive: true },
            select: {
              id: true,
              fullName: true,
              jobTitle: true,
              userId: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  imageSrc: true,
                  jobTitle: true,
                },
              },
            },
          },
        },
      }),
    ]);

    // Flatten employee shape so the client doesn't have to know about user.image vs imageSrc.
    const shapedListings = listings.map((l: any) => ({
      ...l,
      employees: (l.employees || []).map((e: any) => ({
        id: e.id,
        fullName: e.fullName,
        jobTitle: e.jobTitle,
        image: e.user?.imageSrc || e.user?.image || null,
      })),
    }));

    // Each shell can have multiple independents in theory; flatten into one
    // worker row per employee, carrying the shell's geocode.
    const workers = workerListings.flatMap((l: any) =>
      (l.employees || []).map((e: any) => ({
        id: e.id,
        userId: e.userId,
        fullName: e.fullName || e.user?.name || 'Independent',
        jobTitle: e.jobTitle || e.user?.jobTitle || null,
        image: e.user?.imageSrc || e.user?.image || null,
        location: l.address || l.location || '',
        lat: l.lat,
        lng: l.lng,
        rating: l.rating ?? null,
        ratingCount: l.ratingCount ?? 0,
      }))
    );

    // Category filter applies to listings via Prisma above; for workers we apply
    // it post-query against jobTitle since they have no listing category.
    const filteredWorkers = category
      ? workers.filter((w) => (w.jobTitle || '').toLowerCase() === category.toLowerCase())
      : workers;

    return NextResponse.json({ listings: shapedListings, workers: filteredWorkers });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch map listings' }, { status: 500 });
  }
}
