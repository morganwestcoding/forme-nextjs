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
        services: {
          select: {
            id: true,
            serviceName: true,
            price: true,
            category: true,
            imageSrc: true
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

    const safeListings: SafeListing[] = listings.map((listing) => ({
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
        imageSrc: service.imageSrc || null
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
          createdAt: employee.createdAt.toISOString(),
          listingTitle: listing.title,
          listingCategory: listing.category,
          user: {
            id: employee.user!.id,
            name: employee.user!.name,
            image: employee.user!.image,
            imageSrc: employee.user!.imageSrc,
          }
        })),
      storeHours: listing.storeHours.map(hour => ({
        dayOfWeek: hour.dayOfWeek,
        openTime: hour.openTime,
        closeTime: hour.closeTime,
        isClosed: hour.isClosed
      }))
    }));

    return safeListings;
  } catch (error: any) {
    console.error('Error fetching listings:', error);
    return [];
  }
}