import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";
import { getUserFromRequest } from "@/app/utils/mobileAuth";
import { apiErrorCode } from '@/app/utils/api';

export async function GET(request: Request) {
  try {
    const currentUser = await getUserFromRequest(request) || await getCurrentUser();
    if (!currentUser) {
      return apiErrorCode('UNAUTHORIZED');
    }

    const favoriteIds = (currentUser as any).favoriteIds || [];
    if (favoriteIds.length === 0) {
      return NextResponse.json({ listings: [], workers: [], shops: [], posts: [] });
    }

    // Filter for valid MongoDB ObjectIds (24 hex characters) for employee lookup
    const employeeIds = favoriteIds.filter((id: string) =>
      id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)
    );

    const [listings, workers, shops, posts] = await Promise.all([
      prisma.listing
        .findMany({
          where: { id: { in: favoriteIds } },
          include: {
            services: true,
            employees: { include: { user: true } },
            storeHours: true,
          },
        })
        .catch(() => []),
      employeeIds.length > 0
        ? prisma.employee
            .findMany({
              where: { id: { in: employeeIds } },
              include: {
                user: {
                  select: { id: true, name: true, image: true, imageSrc: true, backgroundImage: true },
                },
                listing: {
                  select: {
                    id: true,
                    title: true,
                    category: true,
                    location: true,
                    imageSrc: true,
                    rating: true,
                    ratingCount: true,
                    services: {
                      select: { id: true, serviceName: true, price: true, category: true },
                    },
                  },
                },
              },
              orderBy: { fullName: 'asc' },
            })
            .catch(() => [])
        : Promise.resolve([]),
      prisma.shop
        .findMany({
          where: { id: { in: favoriteIds } },
          include: {
            user: { select: { id: true, name: true, image: true } },
            products: {
              select: { id: true, name: true, mainImage: true, price: true },
              take: 3,
            },
            _count: { select: { products: true } },
          },
          orderBy: { createdAt: 'desc' },
        })
        .catch(() => []),
      prisma.post
        .findMany({
          where: { id: { in: favoriteIds } },
          include: {
            user: true,
            comments: {
              include: {
                user: { select: { id: true, name: true, image: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        })
        .catch(() => []),
    ]);

    return NextResponse.json({
      listings: listings.map((l: any) => ({
        ...l,
        createdAt: l.createdAt?.toISOString(),
        favoriteIds: favoriteIds,
        services: l.services.map((s: any) => ({
          id: s.id,
          serviceName: s.serviceName,
          price: s.price,
          category: s.category,
        })),
        employees: l.employees.map((e: any) => ({
          id: e.id,
          fullName: e.fullName,
          jobTitle: e.jobTitle || null,
          listingId: e.listingId,
          userId: e.userId,
          serviceIds: e.serviceIds,
          isActive: e.isActive,
          isIndependent: e.isIndependent,
          createdAt: e.createdAt?.toISOString(),
          listingTitle: l.title,
          listingCategory: l.category,
          user: {
            id: e.user.id,
            name: e.user.name,
            image: e.user.image,
            imageSrc: e.user.imageSrc,
          },
        })),
        storeHours: l.storeHours.map((h: any) => ({
          dayOfWeek: h.dayOfWeek,
          openTime: h.openTime,
          closeTime: h.closeTime,
          isClosed: h.isClosed,
        })),
        galleryImages: l.galleryImages || [],
        phoneNumber: l.phoneNumber || null,
        website: l.website || null,
        address: l.address || null,
        zipCode: l.zipCode || null,
        city: l.location?.split(',')[0]?.trim() || null,
        state: l.location?.split(',')[1]?.trim() || null,
        rating: l.rating ?? null,
        ratingCount: l.ratingCount ?? 0,
      })),
      workers: workers.map((w: any) => ({
        id: w.id,
        fullName: w.fullName,
        jobTitle: w.jobTitle,
        listingId: w.listingId,
        userId: w.userId,
        serviceIds: w.serviceIds,
        isActive: w.isActive,
        isIndependent: w.isIndependent,
        createdAt: w.createdAt?.toISOString(),
        listingTitle: w.listing.title,
        listingCategory: w.listing.category,
        listing: {
          id: w.listing.id,
          title: w.listing.title,
          category: w.listing.category,
          location: w.listing.location ?? null,
          imageSrc: w.listing.imageSrc ?? null,
          rating: w.listing.rating ?? null,
          ratingCount: w.listing.ratingCount ?? 0,
          services: (w.listing.services || []).map((s: any) => ({
            id: s.id,
            serviceName: s.serviceName,
            price: s.price,
            category: s.category,
          })),
        },
        user: {
          id: w.user.id,
          name: w.user.name,
          image: w.user.image,
          imageSrc: w.user.imageSrc,
          backgroundImage: w.user.backgroundImage,
        },
      })),
      shops: shops.map((s: any) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        logo: s.logo,
        coverImage: s.coverImage || null,
        location: s.location || null,
        address: s.address || null,
        zipCode: s.zipCode || null,
        isOnlineOnly: s.isOnlineOnly || false,
        userId: s.userId,
        storeUrl: s.storeUrl || null,
        galleryImages: s.galleryImages || [],
        createdAt: s.createdAt?.toISOString(),
        updatedAt: s.updatedAt?.toISOString(),
        isVerified: s.isVerified,
        shopEnabled: s.shopEnabled,
        featuredProducts: s.featuredProducts || [],
        followers: s.followers || [],
        listingId: s.listingId || null,
        category: s.category || undefined,
        user: {
          id: s.user.id,
          name: s.user.name,
          image: s.user.image,
        },
        products: s.products.map((p: any) => ({
          name: p.name,
          image: p.mainImage,
          price: p.price,
        })),
        productCount: s._count.products,
        followerCount: s.followers?.length || 0,
        featuredProductItems: s.products.slice(0, 3).map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: p.mainImage,
        })),
      })),
      posts: posts.map((p: any) => ({
        id: p.id,
        content: p.content,
        imageSrc: p.imageSrc || null,
        beforeImageSrc: p.beforeImageSrc || null,
        location: p.location || null,
        tag: p.tag || null,
        postType: p.postType || undefined,
        photo: p.photo || null,
        category: p.category || 'General',
        userId: p.userId,
        createdAt: p.createdAt?.toISOString(),
        mediaUrl: p.mediaUrl || null,
        mediaType: p.mediaType ?? null,
        mediaOverlay: p.mediaOverlay ?? null,
        likes: p.likes || [],
        bookmarks: p.bookmarks || [],
        hiddenBy: p.hiddenBy || [],
        viewedBy: p.viewedBy || [],
        user: p.user
          ? {
              ...p.user,
              createdAt: p.user.createdAt?.toISOString(),
              updatedAt: p.user.updatedAt?.toISOString(),
              emailVerified: p.user.emailVerified?.toISOString() || null,
              bio: p.user.bio || "No Bio Provided Yet..",
              imageSrc: p.user.imageSrc || null,
              backgroundImage: p.user.backgroundImage || null,
              licensingImage: p.user.licensingImage || null,
              verificationStatus: p.user.verificationStatus || null,
              verifiedAt: p.user.verifiedAt || null,
              verificationRejectedAt: p.user.verificationRejectedAt || null,
              rejectionReason: p.user.rejectionReason || null,
              location: p.user.location || null,
              galleryImages: p.user.galleryImages || [],
              isSubscribed: p.user.isSubscribed || false,
              subscriptionStartDate: p.user.subscriptionStartDate || null,
              subscriptionEndDate: p.user.subscriptionEndDate || null,
              subscriptionTier: p.user.subscriptionTier || null,
              stripeCustomerId: p.user.stripeCustomerId || null,
              stripeSubscriptionId: p.user.stripeSubscriptionId || null,
              subscriptionPriceId: p.user.subscriptionPriceId || null,
              subscriptionStatus: p.user.subscriptionStatus || null,
              subscriptionBillingInterval: p.user.subscriptionBillingInterval || null,
              currentPeriodEnd: p.user.currentPeriodEnd || null,
              following: p.user.following || [],
              followers: p.user.followers || [],
              conversationIds: p.user.conversationIds || [],
              favoriteIds: p.user.favoriteIds || [],
              managedListings: p.user.managedListings || [],
              role: p.user.role,
              jobTitle: p.user.jobTitle || null,
              stripeConnectAccountId: p.user.stripeConnectAccountId || null,
              stripeConnectOnboardingComplete: p.user.stripeConnectOnboardingComplete || false,
              stripeConnectDetailsSubmitted: p.user.stripeConnectDetailsSubmitted || false,
              stripeConnectChargesEnabled: p.user.stripeConnectChargesEnabled || false,
              stripeConnectPayoutsEnabled: p.user.stripeConnectPayoutsEnabled || false,
              stripeConnectOnboardedAt: p.user.stripeConnectOnboardedAt || null,
              emailNotifications: p.user.emailNotifications ?? true,
              emailMarketing: p.user.emailMarketing ?? true,
            }
          : null,
        comments: (p.comments || []).map((c: any) => ({
          id: c.id,
          content: c.content,
          userId: c.userId,
          postId: c.postId,
          createdAt: c.createdAt?.toISOString(),
          user: {
            id: c.user.id,
            name: c.user.name,
            image: c.user.image,
          },
        })),
      })),
    });
  } catch (error) {
    return apiErrorCode('INTERNAL_ERROR');
  }
}
