import prisma from "@/app/libs/prismadb";

// Server-side fetch of all academies including admin-only fields
// (Stripe Connect status, default pay split). Used by /admin/academies pages.
export default async function getAcademies() {
  try {
    const academies = await prisma.academy.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { students: true, listings: true },
        },
      },
    });

    return academies.map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      contactEmail: a.contactEmail,
      website: a.website,
      logoUrl: a.logoUrl,
      defaultPayType: a.defaultPayType,
      defaultSplitPercent: a.defaultSplitPercent,
      defaultRentalAmount: a.defaultRentalAmount,
      defaultRentalFrequency: a.defaultRentalFrequency,
      stripeConnectAccountId: a.stripeConnectAccountId,
      stripeConnectOnboardingComplete: a.stripeConnectOnboardingComplete,
      stripeConnectChargesEnabled: a.stripeConnectChargesEnabled,
      stripeConnectPayoutsEnabled: a.stripeConnectPayoutsEnabled,
      studentCount: a._count.students,
      listingCount: a._count.listings,
      createdAt: a.createdAt.toISOString(),
    }));
  } catch (error) {
    return [];
  }
}

export async function getAcademyById(id: string) {
  try {
    const academy = await prisma.academy.findUnique({
      where: { id },
      include: {
        students: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            imageSrc: true,
            createdAt: true,
          },
        },
        listings: {
          take: 1,
          include: {
            services: {
              orderBy: { serviceName: "asc" },
            },
          },
        },
        _count: { select: { students: true, listings: true } },
      },
    });

    if (!academy) return null;

    // The academy's services live on its (single) backing listing.
    const academyServices = academy.listings[0]?.services ?? [];

    return {
      id: academy.id,
      name: academy.name,
      description: academy.description,
      contactEmail: academy.contactEmail,
      website: academy.website,
      logoUrl: academy.logoUrl,
      defaultPayType: academy.defaultPayType,
      defaultSplitPercent: academy.defaultSplitPercent,
      defaultRentalAmount: academy.defaultRentalAmount,
      defaultRentalFrequency: academy.defaultRentalFrequency,
      stripeConnectAccountId: academy.stripeConnectAccountId,
      stripeConnectOnboardingComplete: academy.stripeConnectOnboardingComplete,
      stripeConnectChargesEnabled: academy.stripeConnectChargesEnabled,
      stripeConnectPayoutsEnabled: academy.stripeConnectPayoutsEnabled,
      studentCount: academy._count.students,
      listingCount: academy._count.listings,
      students: academy.students.map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        image: s.image ?? s.imageSrc ?? null,
        joinedAt: s.createdAt.toISOString(),
      })),
      services: academyServices.map((svc) => ({
        id: svc.id,
        serviceName: svc.serviceName,
        price: svc.price,
        category: svc.category,
      })),
      createdAt: academy.createdAt.toISOString(),
    };
  } catch (error) {
    return null;
  }
}
