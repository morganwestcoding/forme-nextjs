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
    
    // Step 1: Get all valid listings first to ensure we only query for reservations with existing listings
    let validListingIds: string[] = [];
    
    if (authorId) {
      const authorListings = await prisma.listing.findMany({
        where: { userId: authorId },
        select: { id: true }
      });
      validListingIds = authorListings.map(l => l.id);
    } else if (listingId) {
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        select: { id: true }
      });
      validListingIds = listing ? [listing.id] : [];
    } else {
      const allListings = await prisma.listing.findMany({
        select: { id: true }
      });
      validListingIds = allListings.map(l => l.id);
    }

    // If no valid listings found, return empty array
    if (validListingIds.length === 0) {
      return [];
    }

    // Step 2: Build the query with guaranteed valid listing IDs
    const query: any = {
      listingId: { in: validListingIds }
    };
        
    if (userId) {
      query.userId = userId;
    }

    // Step 3: Fetch reservations with the safe query
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
      paymentIntentId: reservation.paymentIntentId,
      paymentStatus: reservation.paymentStatus,
      listing: {
        id: reservation.listing.id,
        title: reservation.listing.title,
        description: reservation.listing.description,
        imageSrc: reservation.listing.imageSrc,
        category: reservation.listing.category,
        location: reservation.listing.location || null,
        userId: reservation.listing.userId,
        createdAt: reservation.listing.createdAt.toISOString(),
        services: reservation.listing.services.map(service => ({
          id: service.id,
          serviceName: service.serviceName,
          price: service.price,
          category: service.category
        })),
        phoneNumber: reservation.listing.phoneNumber || null,
        website: reservation.listing.website || null,
        address: reservation.listing.address || null,
        zipCode: reservation.listing.zipCode || null,
        galleryImages: reservation.listing.galleryImages || [],
        employees: reservation.listing.employees.map(employee => ({
          id: employee.id,
          fullName: employee.fullName
        })),
        storeHours: reservation.listing.storeHours.map(hour => ({
          dayOfWeek: hour.dayOfWeek,
          openTime: hour.openTime,
          closeTime: hour.closeTime,
          isClosed: hour.isClosed
        }))
      },
      user: {
        ...reservation.user,
        createdAt: reservation.user.createdAt.toISOString(),
        updatedAt: reservation.user.updatedAt.toISOString(),
        emailVerified: reservation.user.emailVerified?.toISOString() || null,
        resetToken: reservation.user.resetToken || null,
        resetTokenExpiry: reservation.user.resetTokenExpiry || null,
        subscriptionStartDate: reservation.user.subscriptionStartDate || null,
        subscriptionEndDate: reservation.user.subscriptionEndDate || null,
        subscriptionTier: reservation.user.subscriptionTier || null,
      }
    }));

    return safeReservations;
  } catch (error: any) {
    console.error('Error fetching reservations:', error);
    
    // As a fallback, try to get reservations without includes
    try {
      console.log('Attempting fallback query without includes...');
      const fallbackReservations = await prisma.reservation.findMany({
        where: params.userId ? { userId: params.userId } : {},
        orderBy: { createdAt: 'desc' },
      });
      
      console.log(`Found ${fallbackReservations.length} reservations without includes`);
      return []; // Return empty array for now, as we can't safely construct SafeReservation without listing data
    } catch (fallbackError) {
      console.error('Fallback query also failed:', fallbackError);
    }
    
    throw new Error(`Failed to fetch reservations: ${error.message}`);
  }
}