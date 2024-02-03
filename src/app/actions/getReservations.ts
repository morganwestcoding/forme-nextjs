import prisma from "@/app/libs/prismadb";

interface PrismaReservation {
  id: string;
  createdAt: Date;
  startDate: Date;
  endDate: Date;
  listing: {
    id: string;
    createdAt: Date;
    services: Array<{
      id: string;
      serviceName: string;
      price: number;
      category: string;
    }>;
  };
}

interface IParams {
  listingId?: string;
  userId?: string;
  authorId?: string;
}

export default async function getReservations(params: IParams) {
  try {
    const { listingId, userId, authorId } = params;

    const query: any = {};
        
    if (listingId) {
      query.listingId = listingId;
    }

    if (userId) {
      query.userId = userId;
    }

    if (authorId) {
      query.listing = { userId: authorId };
    }

    const reservations = await prisma.reservation.findMany({
      where: query,
      include: {
        listing: {
          include: {
            services: true, // Include services here
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const safeReservations = reservations.map((reservation: PrismaReservation) => {
      return {
      ...reservation,
      createdAt: reservation.createdAt.toISOString(),
      startDate: reservation.startDate.toISOString(),
      endDate: reservation.endDate.toISOString(),
      listing: {
        ...reservation.listing,
        createdAt: reservation.listing.createdAt.toISOString(),
        services: reservation.listing.services.map(service => ({
          id: service.id,
          serviceName: service.serviceName,
          price: service.price,
          category: service.category,
          // Include other fields as needed
        })),
      },
    };
  });

    return safeReservations;
  } catch (error: any) {
    throw new Error(error);
  }
}




