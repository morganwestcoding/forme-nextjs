// app/actions/getFavoriteWorkers.ts
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "./getCurrentUser";
import { SafeEmployee } from "@/app/types";

export default async function getFavoriteWorkers(): Promise<SafeEmployee[]> {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser?.favoriteIds?.length) {
      return [];
    }

    // Filter for valid MongoDB ObjectIds (24 hex characters)
    const employeeIds = currentUser.favoriteIds.filter((id: string) => 
      id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)
    );

    if (employeeIds.length === 0) {
      return [];
    }

    const workers = await prisma.employee.findMany({
      where: {
        id: {
          in: employeeIds,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            imageSrc: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
      },
      orderBy: {
        fullName: 'asc'
      }
    });

    const safeWorkers: SafeEmployee[] = workers.map((worker) => ({
      id: worker.id,
      fullName: worker.fullName,
      jobTitle: worker.jobTitle,
      listingId: worker.listingId,
      userId: worker.userId,
      serviceIds: worker.serviceIds,
      isActive: worker.isActive,
      isIndependent: worker.isIndependent,
      createdAt: worker.createdAt.toISOString(),
      listingTitle: worker.listing.title,
      listingCategory: worker.listing.category,
      user: {
        id: worker.user.id,
        name: worker.user.name,
        image: worker.user.image,
        imageSrc: worker.user.imageSrc,
      },
    }));

    return safeWorkers;
  } catch (error: any) {
    console.error("Error fetching favorite workers:", error.message);
    return [];
  }
}