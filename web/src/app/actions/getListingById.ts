import prisma from "@/app/libs/prismadb";
import { SafeListing, SafeUser } from "@/app/types";

interface IParams {
  listingId?: string;
}

export default async function getListingById(params: IParams): Promise<(SafeListing & { user: SafeUser }) | null> {
  try {
    const { listingId } = params;

    if (!listingId) {
      return null;
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        user: true,
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
      favoriteIds: [],
      services: listing.services.map(service => ({
        id: service.id,
        serviceName: service.serviceName,
        price: service.price,
        category: service.category,
        imageSrc: service.imageSrc,
      })),
      employees: listing.employees
        .filter(employee => employee.user)
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
          }
        })),
      storeHours: listing.storeHours.map(hour => ({
        dayOfWeek: hour.dayOfWeek,
        openTime: hour.openTime,
        closeTime: hour.closeTime,
        isClosed: hour.isClosed
      })),
      city: listing.location?.split(',')[0]?.trim() || null,
      state: listing.location?.split(',')[1]?.trim() || null,
      rating: listing.rating ?? null,
      ratingCount: listing.ratingCount ?? 0,
    };

    const safeUser: SafeUser = {
      id: listing.user.id,
      name: listing.user.name,
      email: listing.user.email,
      image: listing.user.image,
      imageSrc: listing.user.imageSrc || null,
      backgroundImage: listing.user.backgroundImage || null,
      bio: listing.user.bio || '',
      location: listing.user.location || null,
      galleryImages: listing.user.galleryImages || [],
      licensingImage: listing.user.licensingImage || null,
      verificationStatus: listing.user.verificationStatus || null,
      verifiedAt: listing.user.verifiedAt || null,
      verificationRejectedAt: listing.user.verificationRejectedAt || null,
      rejectionReason: listing.user.rejectionReason || null,
      createdAt: listing.user.createdAt.toISOString(),
      updatedAt: listing.user.updatedAt.toISOString(),
      emailVerified: listing.user.emailVerified?.toISOString() || null,
      isSubscribed: listing.user.isSubscribed,
      subscriptionStartDate: listing.user.subscriptionStartDate || null,
      subscriptionEndDate: listing.user.subscriptionEndDate || null,
      subscriptionTier: listing.user.subscriptionTier || null,
      stripeCustomerId: listing.user.stripeCustomerId || null,
      stripeSubscriptionId: listing.user.stripeSubscriptionId || null,
      subscriptionPriceId: listing.user.subscriptionPriceId || null,
      subscriptionStatus: listing.user.subscriptionStatus || null,
      subscriptionBillingInterval: listing.user.subscriptionBillingInterval || null,
      currentPeriodEnd: listing.user.currentPeriodEnd || null,
      following: listing.user.following || [],
      followers: listing.user.followers || [],
      conversationIds: listing.user.conversationIds || [],
      favoriteIds: listing.user.favoriteIds || [],
      managedListings: listing.user.managedListings || [],
      resetToken: listing.user.resetToken || null,
      resetTokenExpiry: listing.user.resetTokenExpiry || null,
      role: listing.user.role,
    };

    return {
      ...safeListing,
      user: safeUser
    };
  } catch (error: any) {
    console.error('Error fetching listing by ID:', error);
    return null;
  }
}