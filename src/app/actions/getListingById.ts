import prisma from "@/app/libs/prismadb";
import { SafeService, SafeUser } from "@/app/types";

interface IParams {
  listingId?: string;
}

export default async function getListingById(
  params: IParams) {
  try {
    const { listingId } = params;

    const listing = await prisma.listing.findUnique({
      where: {
        id: listingId,
      },
      include: {
        user: true,
        services: true, // Include services here
      }
    });

    if (!listing) {
      return null;
    }

    return {
      ...listing,
      createdAt: listing.createdAt.toISOString(), // Convert to string if necessary
      user: {
        ...listing.user,
        createdAt: listing.user.createdAt.toISOString(),
        updatedAt: listing.user.updatedAt.toISOString(),
        emailVerified:
         listing.user.emailVerified?.toISOString() || null,
      },
    };
  } catch (error: any) {
    throw new Error(error);
  }
}



