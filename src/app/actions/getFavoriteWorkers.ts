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
      orderBy: {
        fullName: 'asc'
      }
    });

    const safeWorkers = workers.map((worker) => ({
      id: worker.id,
      fullName: worker.fullName,
      jobTitle: worker.jobTitle || null,
      profileImage: worker.profileImage || null,
    }) as SafeEmployee);

    return safeWorkers;
  } catch (error: any) {
    console.error("Error fetching favorite workers:", error.message);
    return [];
  }
}