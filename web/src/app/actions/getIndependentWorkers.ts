import prisma from "@/app/libs/prismadb";
import { SafeEmployee } from "@/app/types";

// Returns all active independent providers as SafeEmployee[].
// Independents live on hidden "shell" listings (one per independent) which the
// rest of the app filters out of public lists. To still surface the *worker*
// (without exposing the shell), this action joins through the shell strictly
// to read the Employee + User fields, then blanks out the shell's title and
// category before returning so no shell data leaks client-side.
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
      },
    });

    return employees
      .filter((e) => e.user)
      .map((e) => ({
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
      }));
  } catch {
    return [];
  }
}
