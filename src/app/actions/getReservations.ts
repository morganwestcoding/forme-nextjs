import prisma from "@/app/libs/prismadb";

{/*interface PrismaReservation {
  id: string;
  createdAt: Date;
  date: Date;
  time: string;
  note?: string | null; 
  userId: string; // Add this line
  totalPrice: number; // Add this line
  listingId: string;
  listing: {
    id: string;
    createdAt: Date;
    category: string;
    title: string;
    location: string | null; // Assuming these are available in your listing object
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
} */}

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

    const safeReservations = reservations.map(
      (reservation) => ({
      ...reservation,
      createdAt: reservation.createdAt.toISOString(),
      date: reservation.date,
      time: reservation.time,
      totalPrice: reservation.totalPrice,
      note: reservation.note ?? '',  // Ensure this is passed along
      listing: {
        ...reservation.listing,
        createdAt: reservation.listing.createdAt.toISOString(),
        },
    }));

    return safeReservations;
  } catch (error: any) {
    throw new Error(error);
  }
}






