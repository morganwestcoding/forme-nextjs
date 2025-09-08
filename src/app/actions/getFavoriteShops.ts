// app/actions/getFavoriteShops.ts
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "./getCurrentUser";
import { SafeShop } from "@/app/types";

export default async function getFavoriteShops(): Promise<SafeShop[]> {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser?.favoriteIds?.length) {
      return [];
    }

    const shops = await prisma.shop.findMany({
      where: {
        id: {
          in: currentUser.favoriteIds,
        },
      },
      include: {
        user: { 
          select: { 
            id: true, 
            name: true, 
            image: true 
          } 
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const safeShops = shops.map((shop) => ({
      id: shop.id,
      name: shop.name,
      description: shop.description,
      logo: shop.logo,
      coverImage: shop.coverImage || null,
      location: shop.location || null,
      address: shop.address || null,
      zipCode: shop.zipCode || null,
      isOnlineOnly: shop.isOnlineOnly || false,
      userId: shop.userId,
      storeUrl: shop.storeUrl || null,
      galleryImages: shop.galleryImages || [],
      createdAt: shop.createdAt.toISOString(),
      updatedAt: shop.updatedAt.toISOString(),
      isVerified: shop.isVerified,
      shopEnabled: shop.shopEnabled,
      featuredProducts: shop.featuredProducts || [],
      followers: shop.followers || [],
      listingId: shop.listingId || null,
      category: shop.category || undefined,
      user: {
        id: shop.user.id,
        name: shop.user.name,
        image: shop.user.image,
      },
      // Add computed fields
      productCount: 0, // You might want to calculate this properly
      followerCount: shop.followers?.length || 0,
    }) as SafeShop);

    return safeShops;
  } catch (error: any) {
    console.error("Error fetching favorite shops:", error.message);
    return [];
  }
}