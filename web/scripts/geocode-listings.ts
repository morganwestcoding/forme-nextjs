/**
 * One-time script to geocode existing listings that don't have lat/lng.
 * Run with: npx ts-node --compiler-options '{"module":"commonjs"}' scripts/geocode-listings.ts
 * Or: npx tsx scripts/geocode-listings.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

async function geocode(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_TOKEN}&limit=1`
    );
    const data = await res.json();
    if (data.features?.length) {
      const [lng, lat] = data.features[0].center;
      return { lat, lng };
    }
  } catch (e) {
    console.error(`  Failed to geocode "${address}":`, e);
  }
  return null;
}

async function main() {
  if (!MAPBOX_TOKEN) {
    console.error('Missing NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN env var');
    process.exit(1);
  }

  const listings = await prisma.listing.findMany({
    where: {
      OR: [{ lat: null }, { lng: null }],
    },
    select: { id: true, address: true, location: true },
  });

  console.log(`Found ${listings.length} listings without coordinates.\n`);

  // Dedupe locations
  const locationMap = new Map<string, { lat: number; lng: number }>();
  const uniqueLocations = Array.from(new Set(
    listings.map(l => l.address || l.location).filter(Boolean) as string[]
  ));

  console.log(`Geocoding ${uniqueLocations.length} unique locations...`);
  for (const loc of uniqueLocations) {
    if (locationMap.has(loc)) continue;
    const coords = await geocode(loc);
    if (coords) {
      locationMap.set(loc, coords);
      console.log(`  ✓ "${loc}" → ${coords.lat}, ${coords.lng}`);
    } else {
      console.log(`  ✗ "${loc}" — no result`);
    }
    // Rate limit: ~5 req/sec
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\nUpdating listings...`);
  let updated = 0;
  for (const listing of listings) {
    const loc = listing.address || listing.location;
    if (!loc) continue;
    const coords = locationMap.get(loc);
    if (!coords) continue;

    await prisma.listing.update({
      where: { id: listing.id },
      data: { lat: coords.lat, lng: coords.lng },
    });
    updated++;
  }

  console.log(`\nDone. Updated ${updated}/${listings.length} listings.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
