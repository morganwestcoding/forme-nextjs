import prisma from "@/app/libs/prismadb";

export interface ProviderService {
  id: string;
  serviceName: string;
  price: number;
  category: string;
  imageSrc: string | null;

  // Where this service lives — used by the booking link.
  listingId: string;
  listingTitle: string;

  // The Employee row that authorizes this user to perform the service.
  // Required so the booking flow can prefill the right employee.
  employeeId: string;
}

// Returns every service a given user can perform, regardless of whether they
// own the listing or are an Employee on someone else's. Mirrors the logic the
// reservation flow uses to figure out who can take a booking.
//
// Order of precedence:
//   1. Listings the user owns (their personal listing as an individual provider).
//      All services on those listings count.
//   2. Listings where the user is an active Employee. Only services in
//      `employee.serviceIds` count — empty array means "no assigned services"
//      and we fall back to all services on that listing (legacy behavior).
//
// We dedupe by Service.id so a user who is both owner and employee on the same
// listing doesn't see duplicates.
export default async function getServicesByUserId(userId: string): Promise<ProviderService[]> {
  if (!userId) return [];

  try {
    const employees = await prisma.employee.findMany({
      where: { userId, isActive: true },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            services: {
              select: {
                id: true,
                serviceName: true,
                price: true,
                category: true,
                imageSrc: true,
              },
            },
          },
        },
      },
    });

    const seen = new Set<string>();
    const out: ProviderService[] = [];

    for (const emp of employees) {
      if (!emp.listing) continue;
      const assignedIds = emp.serviceIds ?? [];
      const services = assignedIds.length > 0
        ? emp.listing.services.filter((s) => assignedIds.includes(s.id))
        : emp.listing.services;

      for (const s of services) {
        if (seen.has(s.id)) continue;
        seen.add(s.id);
        out.push({
          id: s.id,
          serviceName: s.serviceName,
          price: s.price,
          category: s.category,
          imageSrc: s.imageSrc ?? null,
          listingId: emp.listing.id,
          listingTitle: emp.listing.title,
          employeeId: emp.id,
        });
      }
    }

    return out;
  } catch (error) {
    console.error("getServicesByUserId error:", error);
    return [];
  }
}
