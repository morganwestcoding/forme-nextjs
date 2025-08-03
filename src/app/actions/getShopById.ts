import prisma from "@/app/libs/prismadb";

interface IParams {
  shopId?: string;
}

export default async function getShopById(params: IParams) {
  try {
    const { shopId } = params;

    const shop = await prisma.shop.findUnique({
      where: {
        id: shopId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            imageSrc: true,
            createdAt: true,
            updatedAt: true,
            emailVerified: true,
            bio: true,
            location: true,
            galleryImages: true,
            following: true,
            followers: true,
            conversationIds: true,
            isSubscribed: true,
            resetToken: true,
            resetTokenExpiry: true,
            subscriptionStartDate: true,
            subscriptionEndDate: true,
            subscriptionTier: true
          }
        },
        _count: {
          select: {
            products: true
          }
        }
      }
    });

    if (!shop) {
      return null;
    }

    return {
      ...shop,
      createdAt: shop.createdAt.toISOString(),
      updatedAt: shop.updatedAt.toISOString(),
      category: shop.category || undefined, // Keep as undefined for SafeShop
      coverImage: shop.coverImage || undefined,
      location: shop.location || undefined,
      address: shop.address || undefined,
      zipCode: shop.zipCode || undefined,
      storeUrl: shop.storeUrl || undefined,
      listingId: shop.listingId || undefined,
      galleryImages: shop.galleryImages || [],
      // Add calculated fields
      productCount: shop._count.products,
      followerCount: shop.followers.length,
      user: {
        id: shop.user.id,
        name: shop.user.name,
        email: shop.user.email,
        image: shop.user.image || shop.user.imageSrc || null,
        imageSrc: shop.user.imageSrc || null,
        bio: shop.user.bio,
        location: shop.user.location || null,
        galleryImages: shop.user.galleryImages || [],
        following: shop.user.following || [],
        followers: shop.user.followers || [],
        conversationIds: shop.user.conversationIds || [],
        isSubscribed: shop.user.isSubscribed,
        resetToken: shop.user.resetToken || null,
        resetTokenExpiry: shop.user.resetTokenExpiry || null,
        subscriptionStartDate: shop.user.subscriptionStartDate || null,
        subscriptionEndDate: shop.user.subscriptionEndDate || null,
        subscriptionTier: shop.user.subscriptionTier || null,
        createdAt: shop.user.createdAt.toISOString(),
        updatedAt: shop.user.updatedAt.toISOString(),
        emailVerified: shop.user.emailVerified?.toISOString() || null,
      }
    };
    
  } catch (error: any) {
    throw new Error(error);
  }
}