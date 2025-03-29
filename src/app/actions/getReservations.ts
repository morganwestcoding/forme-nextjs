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
            services: true,
            employees: true,
            storeHours: true
          },
        },
        user: true
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const safeReservations = reservations.map((reservation): SafeReservation => ({
      id: reservation.id,
      userId: reservation.userId,
      listingId: reservation.listingId,
      employeeId: reservation.employeeId,
      serviceId: reservation.serviceId,
      serviceName: reservation.serviceName,
      date: reservation.date,
      time: reservation.time,
      note: reservation.note,
      totalPrice: reservation.totalPrice,
      status: reservation.status,
      createdAt: reservation.createdAt.toISOString(),
      // Add the payment-related fields
      paymentIntentId: reservation.paymentIntentId,
      paymentStatus: reservation.paymentStatus,
      listing: {
        id: reservation.listing.id,
        title: reservation.listing.title,
        description: reservation.listing.description,
        imageSrc: reservation.listing.imageSrc,
        category: reservation.listing.category,
        location: reservation.listing.location,
        userId: reservation.listing.userId,
        createdAt: reservation.listing.createdAt.toISOString(),
        services: reservation.listing.services.map(service => ({
          id: service.id,
          serviceName: service.serviceName,
          price: service.price,
          category: service.category
        })),
        phoneNumber: reservation.listing.phoneNumber,
        website: reservation.listing.website,
        address: reservation.listing.address,
        zipCode: reservation.listing.zipCode,
        galleryImages: reservation.listing.galleryImages,
        employees: reservation.listing.employees.map(employee => ({
          id: employee.id,
          fullName: employee.fullName
        })),
        storeHours: reservation.listing.storeHours
      },
      user: {
        ...reservation.user,
        createdAt: reservation.user.createdAt.toISOString(),
        updatedAt: reservation.user.updatedAt.toISOString(),
        emailVerified: reservation.user.emailVerified?.toISOString() || null,
      }
    }));

    return safeReservations;
  } catch (error: any) {
    throw new Error(`Failed to fetch reservations: ${error.message}`);
  }
}