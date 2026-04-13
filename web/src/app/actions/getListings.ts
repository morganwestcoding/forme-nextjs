import prisma from "@/app/libs/prismadb";
import { SafeListing } from "@/app/types";

export interface IListingsParams {
  userId?: string;
  startDate?: string;
  endDate?: string;
  locationValue?: string;
  category?: string;
  state?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  order?: 'asc' | 'desc';
  limit?: number;
  page?: number;
  // Set true to include academy-owned listings (admin views).
  // Default false: public discovery hides academies — students aren't bookable salons.
  includeAcademy?: boolean;
}

export default async function getListings(params: IListingsParams = {}): Promise<SafeListing[]> {
  try {
    const {
      userId,
      locationValue,
      startDate,
      endDate,
      category,
      state,
      city,
      minPrice,
      maxPrice,
      order = 'desc',
      limit,
      page,
      includeAcademy = false,
    } = params;

    let query: any = {};

    if (userId) {
      query.userId = userId;
    }

    // Hide academy-owned listings from public discovery by default.
    // Academy listings exist as parents for student Employees, not as bookable salons.
    // MongoDB note: pre-existing listings have no `academyId` field at all,
    // so `{ academyId: null }` matches zero docs. Use `isSet: false` to match
    // both "field missing" and unset.
    if (!includeAcademy) {
      query.academyId = { isSet: false };
    }

    if (category && category !== 'all' && category !== 'featured') {
      query.category = category;
    }

    if (locationValue) {
      query.location = {
        contains: locationValue,
        mode: 'insensitive'
      };
    }

    if (state) {
      query.location = {
        ...query.location,
        contains: state,
        mode: 'insensitive'
      };
    }

    if (city) {
      query.location = {
        ...query.location,
        contains: city,
        mode: 'insensitive'
      };
    }

    if (startDate && endDate) {
      query.NOT = {
        reservations: {
          some: {
            OR: [
              {
                endDate: { gte: startDate },
                startDate: { lte: startDate }
              },
              {
                startDate: { lte: endDate },
                endDate: { gte: endDate }
              }
            ]
          }
        }
      };
    }

    // Price filtering through services
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.services = {
        some: {
          price: {
            ...(minPrice !== undefined && { gte: minPrice }),
            ...(maxPrice !== undefined && { lte: maxPrice })
          }
        }
      };
    }

    // Pagination
    const skip = page && limit ? (page - 1) * limit : undefined;
    const take = limit;

    const listings = await prisma.listing.findMany({
      where: query,
      include: {
        user: true, // ADD THIS: Include the listing owner
        services: {
          select: {
            id: true,
            serviceName: true,
            price: true,
            category: true,
          }
        },
        employees: {
          where: {
            isActive: true
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                imageSrc: true,
                backgroundImage: true,
                userType: true,
                academy: {
                  select: { name: true }
                }
              }
            }
          }
        },
        storeHours: {
          select: {
            dayOfWeek: true,
            openTime: true,
            closeTime: true,
            isClosed: true
          }
        }
      },
      orderBy: {
        createdAt: order
      },
      ...(skip !== undefined && { skip }),
      ...(take !== undefined && { take })
    });

    // Keep ALL listings including those with independent workers
    // The MarketClient and ProfileHead will handle display logic separately
    // - Personal listings won't show as ListingCards (filtered in UI)
    // - Independent workers WILL show as WorkerCards (extracted from employees)
    const filteredListings = listings;

    const safeListings: SafeListing[] = filteredListings.map((listing: typeof filteredListings[number]) => ({
      id: listing.id,
      title: listing.title,
      description: listing.description,
      imageSrc: listing.imageSrc,
      category: listing.category,
      location: listing.location || null,
      userId: listing.userId,
      createdAt: listing.createdAt.toISOString(),
      phoneNumber: listing.phoneNumber || null,
      website: listing.website || null,
      address: listing.address || null,
      zipCode: listing.zipCode || null,
      galleryImages: listing.galleryImages || [],
      followers: listing.followers || [],
      followerCount: listing.followers?.length || 0,
      favoriteIds: [], // This might need to be populated based on your logic
      services: listing.services.map((service: typeof listing.services[number]) => ({
        id: service.id,
        serviceName: service.serviceName,
        price: service.price,
        category: service.category,
      })),
      employees: listing.employees
        .filter((employee: typeof listing.employees[number]) => employee.user)
        .map((employee: typeof listing.employees[number]) => ({
          id: employee.id,
          fullName: employee.fullName,
          jobTitle: employee.jobTitle || null,
          listingId: employee.listingId,
          userId: employee.userId,
          serviceIds: employee.serviceIds || [],
          isActive: employee.isActive,
          isIndependent: employee.isIndependent,
          createdAt: employee.createdAt.toISOString(),
          listingTitle: listing.title,
          listingCategory: listing.category,
          user: {
            id: employee.user!.id,
            name: employee.user!.name,
            image: employee.user!.image,
            imageSrc: employee.user!.imageSrc,
            backgroundImage: employee.user!.backgroundImage,
            userType: employee.user!.userType ?? null,
            academyName: employee.user!.academy?.name ?? null,
          }
        })),
      storeHours: listing.storeHours.map((hour: typeof listing.storeHours[number]) => ({
        dayOfWeek: hour.dayOfWeek,
        openTime: hour.openTime,
        closeTime: hour.closeTime,
        isClosed: hour.isClosed
      })),
      // Rating fields
      rating: listing.rating ?? null,
      ratingCount: listing.ratingCount ?? 0,
      // Additional computed fields
      lat: listing.lat ?? null,
      lng: listing.lng ?? null,
      academyId: listing.academyId ?? null,
      city: listing.location?.split(',')[0]?.trim() || null,
      state: listing.location?.split(',')[1]?.trim() || null,
      // ADD THIS: Map the listing owner/user
      user: {
        ...listing.user,
        createdAt: listing.user.createdAt.toISOString(),
        updatedAt: listing.user.updatedAt.toISOString(),
        emailVerified: listing.user.emailVerified?.toISOString() || null,
        favoriteIds: listing.user.favoriteIds || [],
        imageSrc: listing.user.imageSrc || null,
        backgroundImage: listing.user.backgroundImage || null,
        bio: listing.user.bio || '',
        location: listing.user.location || null,
        galleryImages: listing.user.galleryImages || [],
        following: listing.user.following || [],
        followers: listing.user.followers || [],
        managedListings: listing.user.managedListings || [],
        isSubscribed: listing.user.isSubscribed,
        resetToken: listing.user.resetToken || null,
        resetTokenExpiry: listing.user.resetTokenExpiry || null,
        subscriptionStartDate: listing.user.subscriptionStartDate || null,
        subscriptionEndDate: listing.user.subscriptionEndDate || null,
        subscriptionTier: listing.user.subscriptionTier || null,
        stripeCustomerId: listing.user.stripeCustomerId || null,
        stripeSubscriptionId: listing.user.stripeSubscriptionId || null,
        subscriptionPriceId: listing.user.subscriptionPriceId || null,
        subscriptionStatus: listing.user.subscriptionStatus || null,
        subscriptionBillingInterval: listing.user.subscriptionBillingInterval || null,
        currentPeriodEnd: listing.user.currentPeriodEnd || null,
        role: listing.user.role,
      }
    }));

    return safeListings;
  } catch (error: any) {
    // Handle orphaned listings (user deleted but listing remains)
    if (error.message?.includes('Field user is required to return data, got `null`')) {
      console.warn('getListings: Found orphaned listing(s) with missing user. Cleaning up...');
      try {
        // Find and delete orphaned listings
        const allListings = await prisma.listing.findMany({ select: { id: true, userId: true } });
        for (const listing of allListings) {
          const userExists = await prisma.user.findUnique({ where: { id: listing.userId }, select: { id: true } });
          if (!userExists) {
            await prisma.listing.delete({ where: { id: listing.id } });
            console.warn(`Deleted orphaned listing ${listing.id} (user ${listing.userId} not found)`);
          }
        }
        // Retry the query
        return getListings(params);
      } catch (cleanupError) {
        console.error('Error cleaning up orphaned listings:', cleanupError);
      }
    }
    console.error('Error fetching listings:', error);
    return [];
  }
}