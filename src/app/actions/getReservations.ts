import prisma from "@/app/libs/prismadb";
import { SafeReservation } from "@/app/types";

interface IParams {
  listingId?: string;
  userId?: string;
  authorId?: string;
}

export default async function getReservations(params: IParams) {
  try {
    const { listingId, userId, authorId } = params;

    console.log('Fetching reservations with params:', params); // Debug log

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

    console.log('Query constructed:', query); // Debug log

    const reservations = await prisma.reservation.findMany({
      where: query,
      include: {
        listing: {
          include: {
            services: true,
            employees: true,
            user: true
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('Raw reservations found:', reservations.length); // Debug log

    if (!reservations) {
      console.log('No reservations found');
      return [];
    }

    const safeReservations: SafeReservation[] = reservations.map(
      (reservation) => {
        // Add null checks
        if (!reservation) {
          console.log('Found null reservation');
          return null;
        }

        try {
          return {
            id: reservation.id,
            userId: reservation.userId,
            listingId: reservation.listingId,
            date: reservation.date,
            time: reservation.time,
            note: reservation.note ?? '',
            totalPrice: reservation.totalPrice,
            createdAt: reservation.createdAt.toISOString(),
            listing: reservation.listing ? {
              ...reservation.listing,
              createdAt: reservation.listing.createdAt.toISOString(),
              services: reservation.listing.services?.map(service => ({
                id: service.id,
                serviceName: service.serviceName,
                price: service.price,
                category: service.category
              })) || [],
              employees: reservation.listing.employees?.map(employee => ({
                id: employee.id,
                fullName: employee.fullName
              })) || [],
              user: reservation.listing.user ? {
                ...reservation.listing.user,
                createdAt: reservation.listing.user.createdAt.toISOString(),
                updatedAt: reservation.listing.user.updatedAt.toISOString(),
                emailVerified: 
                  reservation.listing.user.emailVerified?.toISOString() || null,
              } : null
            } : null,
          };
        } catch (error) {
          console.error('Error processing reservation:', reservation.id, error);
          return null;
        }
      }
    ).filter(Boolean) as SafeReservation[]; // Filter out any null values

    console.log('Processed safe reservations:', safeReservations.length); // Debug log
    return safeReservations;

  } catch (error: any) {
    console.error('getReservations error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });

    if (error.code === 'P2003') {
      throw new Error('Related listing or user not found');
    }
    if (error.code === 'P2025') {
      throw new Error('Record not found');
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to fetch reservations: ${error.message}`);
  }
}