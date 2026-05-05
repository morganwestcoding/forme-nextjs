import prisma from "@/app/libs/prismadb";
import { SafeEmployee } from "@/app/types";

// Returns all active independent providers as SafeEmployee[].
// Independents live on hidden "shell" listings (one per independent) which the
// rest of the app filters out of public lists. To still surface the *worker*
// (without exposing the shell), this action joins through the shell strictly
// to read the Employee + User fields, then blanks out the shell's title and
// category before returning so no shell data leaks client-side.
//
// `priceRange` is derived server-side from the worker's services (min/max
// over `employee.serviceIds` if present, else all services on the shell). It's
// a presentation-only string the UI can show under the worker's name without
// having to re-fetch services per row.
export default async function getIndependentWorkers(): Promise<SafeEmployee[]> {
  try {
    const employees = await prisma.employee.findMany({
      where: { isIndependent: true, isActive: true },
      include: {
        user: {
          select: {
            id: true, name: true, image: true, imageSrc: true,
            backgroundImage: true, userType: true, jobTitle: true,
            academy: { select: { name: true } },
          },
        },
        listing: {
          select: {
            services: { select: { id: true, price: true } },
          },
        },
      },
    });

    return employees
      .filter((e) => e.user)
      .map((e) => {
        const allServices = e.listing?.services ?? [];
        const assigned = (e.serviceIds ?? []);
        const scoped = assigned.length > 0
          ? allServices.filter((s) => assigned.includes(s.id))
          : allServices;
        const prices = scoped.map((s) => s.price).filter((p) => p > 0);
        let priceRange: string | null = null;
        if (prices.length > 0) {
          const min = Math.min(...prices);
          const max = Math.max(...prices);
          priceRange = min === max ? `$${Math.round(min)}` : `$${Math.round(min)} - $${Math.round(max)}`;
        }

        return {
          id: e.id,
          fullName: e.fullName,
          jobTitle: e.jobTitle || null,
          listingId: e.listingId,
          userId: e.userId,
          serviceIds: e.serviceIds || [],
          isActive: e.isActive,
          isIndependent: true,
          createdAt: e.createdAt.toISOString(),
          listingTitle: '',
          listingCategory: '',
          rating: null,
          priceRange,
          user: {
            id: e.user!.id,
            name: e.user!.name,
            image: e.user!.image,
            imageSrc: e.user!.imageSrc,
            backgroundImage: e.user!.backgroundImage,
            userType: e.user!.userType ?? null,
            jobTitle: e.user!.jobTitle ?? null,
            academyName: e.user!.academy?.name ?? null,
          },
        };
      });
  } catch {
    return [];
  }
}
