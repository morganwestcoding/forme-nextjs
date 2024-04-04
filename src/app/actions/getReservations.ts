import prisma from "@/app/libs/prismadb";

interface PrismaReservation {
  id: string;
  createdAt: Date;
  startDate: Date;
  userId: string; // Add this line
  totalPrice: number; // Add this line
  endDate: Date;
  listingId: string;
  listing: {
    id: string;
    createdAt: Date;
    category: string;
    state: string;
    city: string;
    title: string, // Assuming these are available in your listing object
    description: string,
    imageSrc: string,
    userId: string,
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

    const safeReservations = reservations.map((reservation: PrismaReservation) => ({
      id: reservation.id,
      createdAt: reservation.createdAt.toISOString(),
      startDate: reservation.startDate.toISOString(),
      endDate: reservation.endDate.toISOString(),
      userId: reservation.userId, // Ensure this is passed along
      totalPrice: reservation.totalPrice,
      listingId: reservation.listingId, // Ensure this is passed along
      listing: {
        id: reservation.listing.id,
        createdAt: reservation.listing.createdAt.toISOString(),
        category: reservation.listing.category,
        state: reservation.listing.state,
        city: reservation.listing.city,
        title: reservation.listing.title, // Assuming these are available in your listing object
        description: reservation.listing.description,
        imageSrc: reservation.listing.imageSrc,
        userId: reservation.listing.userId,
        services: reservation.listing.services.map(service => ({
          id: service.id,
          serviceName: service.serviceName,
          price: service.price,
          category: service.category,
        })),
      },
    }));

    return safeReservations;
  } catch (error: any) {
    throw new Error(error);
  }
}






