/**
 * Promote the SAMPLE_LISTINGS / SAMPLE_EMPLOYEES from DiscoverClient.tsx
 * into real DB records:
 *   - 3 worker users  (Jordan Riley, Maya Vega, Kai Chen)
 *   - 3 listings      (Lumière Studio, Ironworks Gym, Stillwater Wellness)
 *   - 3 employee records linking each worker to their listing
 *   - services + store hours for each listing
 *
 * Each worker owns their own listing (userId on the listing points at the
 * worker's user record). Idempotent on users (upsert by email) and on
 * listings (findFirst by title+ownerId, create if missing).
 *
 * Usage:
 *   npx ts-node scripts/seed-sample-workers.ts            # dry run
 *   npx ts-node scripts/seed-sample-workers.ts --confirm  # actually write
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SeedDef = {
  worker: {
    name: string;
    email: string;
    image: string;
    jobTitle: string;
  };
  listing: {
    title: string;
    description: string;
    imageSrc: string;
    category: string;
    location: string;
    address: string;
    zipCode: string;
    rating: number;
    ratingCount: number;
  };
  services: Array<{ serviceName: string; price: number; category: string; durationMinutes: number }>;
  hours: Array<{ dayOfWeek: string; openTime: string; closeTime: string; isClosed: boolean }>;
};

const SEEDS: SeedDef[] = [
  {
    worker: {
      name: "Jordan Riley",
      email: "jordan.riley@example.com",
      image: "/assets/people/worker 1.png",
      jobTitle: "Senior Stylist",
    },
    listing: {
      title: "Lumière Studio",
      description: "An intimate Brooklyn salon focused on color, lived-in cuts, and personalized consultations.",
      imageSrc: "/assets/people/listing 1.png",
      category: "Salon",
      location: "Brooklyn, NY",
      address: "120 Wythe Ave",
      zipCode: "11249",
      rating: 4.9,
      ratingCount: 142,
    },
    services: [
      { serviceName: "Cut", price: 45, category: "Salon", durationMinutes: 45 },
      { serviceName: "Color", price: 180, category: "Salon", durationMinutes: 120 },
    ],
    hours: [
      { dayOfWeek: "Sunday", openTime: "10:00", closeTime: "18:00", isClosed: false },
      { dayOfWeek: "Monday", openTime: "10:00", closeTime: "20:00", isClosed: false },
      { dayOfWeek: "Tuesday", openTime: "10:00", closeTime: "20:00", isClosed: false },
      { dayOfWeek: "Wednesday", openTime: "10:00", closeTime: "20:00", isClosed: false },
      { dayOfWeek: "Thursday", openTime: "10:00", closeTime: "20:00", isClosed: false },
      { dayOfWeek: "Friday", openTime: "10:00", closeTime: "21:00", isClosed: false },
      { dayOfWeek: "Saturday", openTime: "10:00", closeTime: "21:00", isClosed: false },
    ],
  },
  {
    worker: {
      name: "Maya Vega",
      email: "maya.vega@example.com",
      image: "/assets/people/worker 2.png",
      jobTitle: "Personal Trainer",
    },
    listing: {
      title: "Ironworks Gym",
      description: "Strength, mobility, and small-group conditioning in a no-frills Brooklyn warehouse gym.",
      imageSrc: "/assets/people/listing 2.png",
      category: "Training",
      location: "Brooklyn, NY",
      address: "85 Bogart St",
      zipCode: "11206",
      rating: 4.8,
      ratingCount: 87,
    },
    services: [
      { serviceName: "Personal Training", price: 75, category: "Training", durationMinutes: 60 },
      { serviceName: "Group Class", price: 25, category: "Training", durationMinutes: 60 },
    ],
    hours: [
      { dayOfWeek: "Sunday", openTime: "08:00", closeTime: "18:00", isClosed: false },
      { dayOfWeek: "Monday", openTime: "06:00", closeTime: "22:00", isClosed: false },
      { dayOfWeek: "Tuesday", openTime: "06:00", closeTime: "22:00", isClosed: false },
      { dayOfWeek: "Wednesday", openTime: "06:00", closeTime: "22:00", isClosed: false },
      { dayOfWeek: "Thursday", openTime: "06:00", closeTime: "22:00", isClosed: false },
      { dayOfWeek: "Friday", openTime: "06:00", closeTime: "22:00", isClosed: false },
      { dayOfWeek: "Saturday", openTime: "08:00", closeTime: "20:00", isClosed: false },
    ],
  },
  {
    worker: {
      name: "Kai Chen",
      email: "kai.chen@example.com",
      image: "/assets/people/worker 3.png",
      jobTitle: "Massage Therapist",
    },
    listing: {
      title: "Stillwater Wellness",
      description: "A quiet wellness studio offering massage, acupuncture, and recovery work in Park Slope.",
      imageSrc: "/assets/people/listing 3.png",
      category: "Wellness",
      location: "Brooklyn, NY",
      address: "320 7th Ave",
      zipCode: "11215",
      rating: 4.95,
      ratingCount: 64,
    },
    services: [
      { serviceName: "Massage", price: 110, category: "Wellness", durationMinutes: 60 },
      { serviceName: "Acupuncture", price: 95, category: "Wellness", durationMinutes: 60 },
    ],
    hours: [
      { dayOfWeek: "Sunday", openTime: "09:00", closeTime: "17:00", isClosed: false },
      { dayOfWeek: "Monday", openTime: "09:00", closeTime: "19:00", isClosed: false },
      { dayOfWeek: "Tuesday", openTime: "09:00", closeTime: "19:00", isClosed: false },
      { dayOfWeek: "Wednesday", openTime: "09:00", closeTime: "19:00", isClosed: false },
      { dayOfWeek: "Thursday", openTime: "09:00", closeTime: "19:00", isClosed: false },
      { dayOfWeek: "Friday", openTime: "09:00", closeTime: "19:00", isClosed: false },
      { dayOfWeek: "Saturday", openTime: "09:00", closeTime: "18:00", isClosed: false },
    ],
  },
];

function describeTarget(): { host: string; database: string } {
  const url = process.env.DATABASE_URL || "";
  const sanitized = url.replace(/\/\/[^@]*@/, "//");
  const match = sanitized.match(/\/\/([^/?]+)\/([^?]+)/);
  return {
    host: match?.[1] ?? "(unknown)",
    database: match?.[2] ?? "(unknown)",
  };
}

async function processSeed(seed: SeedDef, confirm: boolean) {
  const w = seed.worker;
  const l = seed.listing;

  const existingUser = await prisma.user.findUnique({
    where: { email: w.email },
    select: { id: true, name: true },
  });

  console.log(`▸ ${w.name}  →  ${l.title}`);
  console.log(`  worker:  ${existingUser ? `exists (${existingUser.id})` : "will create"}`);

  if (!confirm) {
    const probableOwnerId = existingUser?.id ?? "(new)";
    const existingListing = existingUser
      ? await prisma.listing.findFirst({
          where: { title: l.title, userId: existingUser.id },
          select: { id: true },
        })
      : null;
    console.log(`  listing: ${existingListing ? `exists (${existingListing.id})` : "will create"}`);
    console.log(`  owner:   ${probableOwnerId}\n`);
    return;
  }

  const user = await prisma.user.upsert({
    where: { email: w.email },
    update: {
      name: w.name,
      image: w.image,
      imageSrc: w.image,
      jobTitle: w.jobTitle,
      userType: "individual",
    },
    create: {
      email: w.email,
      name: w.name,
      image: w.image,
      imageSrc: w.image,
      jobTitle: w.jobTitle,
      userType: "individual",
      bio: "",
    },
    select: { id: true },
  });

  const existingListing = await prisma.listing.findFirst({
    where: { title: l.title, userId: user.id },
    select: { id: true },
  });

  let listingId: string;
  if (existingListing) {
    listingId = existingListing.id;
    console.log(`  listing: reusing existing (${listingId})`);
  } else {
    const created = await prisma.listing.create({
      data: {
        title: l.title,
        description: l.description,
        imageSrc: l.imageSrc,
        category: l.category,
        location: l.location,
        address: l.address,
        zipCode: l.zipCode,
        rating: l.rating,
        ratingCount: l.ratingCount,
        userId: user.id,
        services: {
          create: seed.services.map((s) => ({
            serviceName: s.serviceName,
            price: s.price,
            category: s.category,
            durationMinutes: s.durationMinutes,
          })),
        },
        storeHours: {
          create: seed.hours.map((h) => ({
            dayOfWeek: h.dayOfWeek,
            openTime: h.openTime,
            closeTime: h.closeTime,
            isClosed: h.isClosed,
          })),
        },
      },
      select: { id: true },
    });
    listingId = created.id;
    console.log(`  listing: created (${listingId})`);
  }

  const employee = await prisma.employee.upsert({
    where: { userId_listingId: { userId: user.id, listingId } },
    update: {
      fullName: w.name,
      jobTitle: w.jobTitle,
      isActive: true,
    },
    create: {
      fullName: w.name,
      jobTitle: w.jobTitle,
      userId: user.id,
      listingId,
      isActive: true,
      isIndependent: false,
      teamRole: "owner",
    },
    select: { id: true },
  });
  console.log(`  employee: ${employee.id}\n`);
}

async function main() {
  const args = process.argv.slice(2);
  const confirm = args.includes("--confirm");
  const { host, database } = describeTarget();

  console.log("\n┌─────────────────────────────────────────────");
  console.log("│ SEED SAMPLE WORKERS + LISTINGS");
  console.log("├─────────────────────────────────────────────");
  console.log(`│ host:     ${host}`);
  console.log(`│ database: ${database}`);
  console.log(`│ mode:     ${confirm ? "WRITE (live)" : "DRY RUN"}`);
  console.log("└─────────────────────────────────────────────\n");

  for (const seed of SEEDS) {
    await processSeed(seed, confirm);
  }

  if (!confirm) {
    console.log("Dry run complete. Pass --confirm to actually write.\n");
  } else {
    console.log("─────────────────────────────────────────────");
    console.log("Done.\n");
  }
}

main()
  .catch((err) => {
    console.error("Seed-sample-workers failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
