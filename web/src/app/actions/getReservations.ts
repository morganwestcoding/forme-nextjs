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

    // Step 1: Decide which reservations belong to this caller.
    //
    // For `authorId` (incoming-bookings view) we now combine TWO sources so
    // employees — including students at academy-owned listings — can see the
    // bookings made for THEM personally:
    //
    //   a) reservations on listings I own (existing behavior — salon owners)
    //   b) reservations whose employeeId belongs to one of my Employee rows
    //      (new — covers students + regular workers)
    //
    // For `listingId` we stay listing-scoped. For neither we return everything.
    let query: any = {};

    if (authorId) {
      const [authorListings, myEmployeeRows] = await Promise.all([
        prisma.listing.findMany({
          where: { userId: authorId },
          select: { id: true },
        }),
        prisma.employee.findMany({
          where: { userId: authorId, isActive: true },
          select: { id: true },
        }),
      ]);

      const ownedListingIds = authorListings.map((l) => l.id);
      const myEmployeeIds = myEmployeeRows.map((e) => e.id);

      if (ownedListingIds.length === 0 && myEmployeeIds.length === 0) {
        return [];
      }

      const orClauses: any[] = [];
      if (ownedListingIds.length > 0) {
        orClauses.push({ listingId: { in: ownedListingIds } });
      }
      if (myEmployeeIds.length > 0) {
        orClauses.push({ employeeId: { in: myEmployeeIds } });
      }
      query.OR = orClauses;
    } else if (listingId) {
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        select: { id: true },
      });
      if (!listing) return [];
      query.listingId = listing.id;
    }
    // else: no scope filter — match all (used by debug/admin paths)

    if (userId) {
      query.userId = userId;
    }

    // Step 3: Fetch reservations with the safe query - FIXED: Include user data for employees
    const reservations = await prisma.reservation.findMany({
      where: query,
      include: {
        listing: {
          include: {
            services: true,
            employees: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                    imageSrc: true,
                  }
                }
              }
            },
            storeHours: true
          },
        },
        user: true
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const safeReservations = reservations.map((reservation: typeof reservations[number]): SafeReservation => ({
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
      refundStatus: reservation.refundStatus,
      refundAmount: reservation.refundAmount,
      refundReason: reservation.refundReason,
      refundId: reservation.refundId,
      refundedAt: reservation.refundedAt,
      listing: {
        id: reservation.listing.id,
        title: reservation.listing.title,
        description: reservation.listing.description,
        imageSrc: reservation.listing.imageSrc,
        category: reservation.listing.category,
        location: reservation.listing.location || null,
        userId: reservation.listing.userId,
        createdAt: reservation.listing.createdAt.toISOString(),
        services: reservation.listing.services.map((service: typeof reservation.listing.services[number]) => ({
          id: service.id,
          serviceName: service.serviceName,
          price: service.price,
          category: service.category,
        })),
        phoneNumber: reservation.listing.phoneNumber || null,
        website: reservation.listing.website || null,
        address: reservation.listing.address || null,
        zipCode: reservation.listing.zipCode || null,
        galleryImages: reservation.listing.galleryImages || [],
        // FIXED: Now properly includes user data since we fetch it in the query
        employees: reservation.listing.employees
          .filter((employee: typeof reservation.listing.employees[number]) => employee.user)
          .map((employee: typeof reservation.listing.employees[number]) => ({
            id: employee.id,
            fullName: employee.fullName,
            jobTitle: employee.jobTitle || null,
            listingId: employee.listingId,
            userId: employee.userId,
            serviceIds: employee.serviceIds || [],
            isActive: employee.isActive,
            isIndependent: employee.isIndependent,
            createdAt: employee.createdAt.toISOString(),
            listingTitle: reservation.listing.title,
            listingCategory: reservation.listing.category,
            user: {
              id: employee.user!.id,
              name: employee.user!.name,
              image: employee.user!.image,
              imageSrc: employee.user!.imageSrc,
            }
          })),
        storeHours: reservation.listing.storeHours.map((hour: typeof reservation.listing.storeHours[number]) => ({
          dayOfWeek: hour.dayOfWeek,
          openTime: hour.openTime,
          closeTime: hour.closeTime,
          isClosed: hour.isClosed
        }))
      },
      user: {
        id: reservation.user.id,
        name: reservation.user.name,
        email: reservation.user.email,
        image: reservation.user.image,
        imageSrc: reservation.user.imageSrc || null,
        backgroundImage: reservation.user.backgroundImage || null,
        bio: reservation.user.bio || "No Bio Provided Yet..",
        location: reservation.user.location || null,
        jobTitle: reservation.user.jobTitle || null,
        galleryImages: reservation.user.galleryImages || [],
        licensingImage: reservation.user.licensingImage || null,
        verificationStatus: reservation.user.verificationStatus || null,
        verifiedAt: reservation.user.verifiedAt || null,
        verificationRejectedAt: reservation.user.verificationRejectedAt || null,
        rejectionReason: reservation.user.rejectionReason || null,
        createdAt: reservation.user.createdAt.toISOString(),
        updatedAt: reservation.user.updatedAt.toISOString(),
        emailVerified: reservation.user.emailVerified?.toISOString() || null,
        isSubscribed: reservation.user.isSubscribed || false,
        subscriptionStartDate: reservation.user.subscriptionStartDate || null,
        subscriptionEndDate: reservation.user.subscriptionEndDate || null,
        subscriptionTier: reservation.user.subscriptionTier || null,
        stripeCustomerId: reservation.user.stripeCustomerId || null,
        stripeSubscriptionId: reservation.user.stripeSubscriptionId || null,
        subscriptionPriceId: reservation.user.subscriptionPriceId || null,
        subscriptionStatus: reservation.user.subscriptionStatus || null,
        subscriptionBillingInterval: reservation.user.subscriptionBillingInterval || null,
        currentPeriodEnd: reservation.user.currentPeriodEnd || null,
        following: reservation.user.following || [],
        followers: reservation.user.followers || [],
        conversationIds: reservation.user.conversationIds || [],
        favoriteIds: reservation.user.favoriteIds || [],
        managedListings: reservation.user.managedListings || [],
        resetToken: reservation.user.resetToken || null,
        resetTokenExpiry: reservation.user.resetTokenExpiry || null,
        role: reservation.user.role,
        stripeConnectAccountId: reservation.user.stripeConnectAccountId || null,
        stripeConnectOnboardingComplete: reservation.user.stripeConnectOnboardingComplete || false,
        stripeConnectDetailsSubmitted: reservation.user.stripeConnectDetailsSubmitted || false,
        stripeConnectChargesEnabled: reservation.user.stripeConnectChargesEnabled || false,
        stripeConnectPayoutsEnabled: reservation.user.stripeConnectPayoutsEnabled || false,
        stripeConnectOnboardedAt: reservation.user.stripeConnectOnboardedAt || null,
        emailNotifications: reservation.user.emailNotifications ?? true,
        emailMarketing: reservation.user.emailMarketing ?? true,
      }
    }));

    return safeReservations;
  } catch (error: any) {
    // As a fallback, try to get reservations without includes
    try {
      await prisma.reservation.findMany({
        where: params.userId ? { userId: params.userId } : {},
        orderBy: { createdAt: 'desc' },
      });

      return []; // Return empty array for now, as we can't safely construct SafeReservation without listing data
    } catch (fallbackError) {
      // silently handled
    }

    throw new Error(`Failed to fetch reservations: ${error.message}`);
  }
}