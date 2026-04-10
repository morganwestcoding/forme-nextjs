/**
 * Seeds the 4 partner academies (previously hardcoded in LicensingClient.tsx)
 * and creates a corresponding Listing for each so students can be linked as Employees.
 *
 * Idempotent: re-running will update existing academies (matched by name) instead of duplicating.
 *
 * Usage: npx ts-node scripts/seed-academies.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ACADEMIES = [
  {
    name: 'Beauty Pro Academy',
    description: 'Licensed cosmetology and esthetician programs',
    courses: ['Cosmetology License', 'Esthetician Certification', 'Nail Technician'],
    duration: '6-12 months',
    priceLabel: 'From $3,500',
    rating: 4.8,
    // Default split: students get 0%, academy keeps 100%. Academy admins can override.
    defaultPayType: 'commission',
    defaultSplitPercent: 0,
    listingCategory: 'Beauty',
  },
  {
    name: 'Wellness Institute',
    description: 'Massage therapy and holistic wellness certifications',
    courses: ['Licensed Massage Therapist', 'Reiki Master', 'Aromatherapy'],
    duration: '3-9 months',
    priceLabel: 'From $2,800',
    rating: 4.9,
    defaultPayType: 'commission',
    defaultSplitPercent: 0,
    listingCategory: 'Wellness',
  },
  {
    name: 'Fitness Certification Hub',
    description: 'Personal training and fitness specialist programs',
    courses: ['CPT Certification', 'Nutrition Coach', 'Yoga Instructor'],
    duration: '2-6 months',
    priceLabel: 'From $1,200',
    rating: 4.7,
    defaultPayType: 'commission',
    defaultSplitPercent: 0,
    listingCategory: 'Fitness',
  },
  {
    name: 'Medical Aesthetics School',
    description: 'Advanced aesthetic and medical spa training',
    courses: ['Laser Technician', 'Microblading', 'Botox Certification'],
    duration: '1-4 months',
    priceLabel: 'From $1,800',
    rating: 4.9,
    defaultPayType: 'commission',
    defaultSplitPercent: 0,
    listingCategory: 'Medical Aesthetics',
  },
];

async function seedAcademies() {
  // We need an owner User for each academy Listing (Listing.userId is required).
  // Use the first master/admin user; fall back to the first user.
  const owner =
    (await prisma.user.findFirst({ where: { role: 'master' } })) ||
    (await prisma.user.findFirst({ where: { role: 'admin' } })) ||
    (await prisma.user.findFirst());

  if (!owner) {
    console.error(
      'No users found in DB. Create at least one user (preferably master) before seeding academies.'
    );
    process.exit(1);
  }

  console.log(`Using owner user: ${owner.email || owner.id} for academy listings\n`);

  for (const a of ACADEMIES) {
    // Find existing academy by name (no unique constraint, so use findFirst)
    const existing = await prisma.academy.findFirst({ where: { name: a.name } });

    const academy = existing
      ? await prisma.academy.update({
          where: { id: existing.id },
          data: {
            description: a.description,
            courses: a.courses,
            duration: a.duration,
            priceLabel: a.priceLabel,
            rating: a.rating,
            defaultPayType: a.defaultPayType,
            defaultSplitPercent: a.defaultSplitPercent,
          },
        })
      : await prisma.academy.create({
          data: {
            name: a.name,
            description: a.description,
            courses: a.courses,
            duration: a.duration,
            priceLabel: a.priceLabel,
            rating: a.rating,
            defaultPayType: a.defaultPayType,
            defaultSplitPercent: a.defaultSplitPercent,
          },
        });

    // Ensure each academy owns at least one Listing (students will be Employees of this listing).
    const existingListing = await prisma.listing.findFirst({
      where: { academyId: academy.id },
    });

    if (!existingListing) {
      const listing = await prisma.listing.create({
        data: {
          title: a.name,
          description: a.description ?? '',
          imageSrc: '',
          category: a.listingCategory,
          userId: owner.id,
          academyId: academy.id,
        },
      });
      console.log(`  ✓ ${a.name} (academy ${academy.id}) → listing ${listing.id}`);
    } else {
      console.log(`  • ${a.name} (academy ${academy.id}) → listing ${existingListing.id} [exists]`);
    }
  }

  console.log('\nSeed complete.');
}

seedAcademies()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
