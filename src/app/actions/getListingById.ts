import prisma from "@/app/libs/prismadb";
import { SafeListing, SafeUser } from "@/app/types";

interface IParams {
  listingId?: string;
}

// Update return type to match what ListingClient expects
export default async function getListingById(params: IParams): Promise<(SafeListing & { user: SafeUser }) | null> {
  try {
    const { listingId } = params;

    if (!listingId) {
      return null;
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        user: true, // Include the listing owner
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
      }
    });

    if (!listing) return null;

    // Create the SafeListing part
    const safeListing: SafeListing = {
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
      favoriteIds: [], // Populate this based on your logic
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
      })),
      // Additional computed fields
      city: listing.location?.split(',')[0]?.trim() || null,
      state: listing.location?.split(',')[1]?.trim() || null,
    };

    // Create the SafeUser part
    const safeUser: SafeUser = {
      ...listing.user,
      createdAt: listing.user.createdAt.toISOString(),
      updatedAt: listing.user.updatedAt.toISOString(),
      emailVerified: listing.user.emailVerified?.toISOString() || null,
      favoriteIds: listing.user.favoriteIds || [],
      imageSrc: listing.user.imageSrc || null,
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
    };

    // Return the intersection type that ListingClient expects
    return {
      ...safeListing,
      user: safeUser
    };
  } catch (error: any) {
    console.error('Error fetching listing by ID:', error);
    return null;
  }
}