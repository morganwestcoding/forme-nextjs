import prisma from "@/app/libs/prismadb";
import { SafeListing } from "@/app/types";

export interface IListingsParams {
  userId?: string;
  guestCount?: number;
  roomCount?: number;
  bathroomCount?: number;
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
}

export default async function getListings(params: IListingsParams = {}): Promise<SafeListing[]> {
  try {
    const {
      userId,
      locationValue,
      startDate,
      endDate,
      guestCount,
      roomCount,
      bathroomCount,
      category,
      state,
      city,
      minPrice,
      maxPrice,
      order = 'desc',
      limit,
      page
    } = params;

    let query: any = {};

    if (userId) {
      query.userId = userId;
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

    if (roomCount) {
      query.roomCount = {
        gte: +roomCount
      };
    }

    if (guestCount) {
      query.guestCount = {
        gte: +guestCount
      };
    }

    if (bathroomCount) {
      query.bathroomCount = {
        gte: +bathroomCount
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
            imageSrc: true,
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

    const safeListings: SafeListing[] = filteredListings.map((listing) => ({
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
      services: listing.services.map(service => ({
        id: service.id,
        serviceName: service.serviceName,
        price: service.price,
        category: service.category,
        imageSrc: service.imageSrc,
      })),
      employees: listing.employees
        .filter(employee => employee.user) // Ensure user exists
        .map(employee => ({
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
          }
        })),
      storeHours: listing.storeHours.map(hour => ({
        dayOfWeek: hour.dayOfWeek,
        openTime: hour.openTime,
        closeTime: hour.closeTime,
        isClosed: hour.isClosed
      })),
      // Additional computed fields
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
    console.error('Error fetching listings:', error);
    return [];
  }
}