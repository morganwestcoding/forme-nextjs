// app/actions/getShops.ts
import prisma from "@/app/libs/prismadb";
import { SafeShop } from "@/app/types";

export interface IShopsParams {
  userId?: string;
  verified?: boolean;
  query?: string;
  sort?: 'newest' | 'popular';
  limit?: number;
  hasProducts?: boolean;
  location?: string;
}

export default async function getShops(params: IShopsParams): Promise<SafeShop[]> {
  try {
    const {
      userId,
      verified,
      query,
      sort,
      limit = 20,
      hasProducts,
      location
    } = params;

    let whereClause: any = {
      shopEnabled: true
    };

    // Filter by user
    if (userId) {
      whereClause.userId = userId;
    }

    // Filter by verification status
    if (verified !== undefined) {
      whereClause.isVerified = verified;
    }

    // Filter by search query
    if (query) {
      whereClause.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ];
    }

    // Filter by location
    if (location) {
      whereClause.location = {
        contains: location,
        mode: 'insensitive'
      };
    }

    // Include shops with products only
    if (hasProducts) {
      whereClause.products = {
        some: {}
      };
    }

    // Determine order
    let orderBy: any = {};
    
    switch (sort) {
      case 'popular':
        orderBy = {
          followers: {
            _count: 'desc'
          }
        };
        break;
      case 'newest':
      default:
        orderBy = {
          createdAt: 'desc'
        };
        break;
    }

    // Fetch shops
    const shops = await prisma.shop.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        products: {
          where: {
            isPublished: true,
            isFeatured: true
          },
          take: 3,
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            id: true,
            name: true,
            price: true,
            mainImage: true
          }
        },
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy,
      take: limit
    });

    // Calculate follower count and transform data
    const safeShops = shops.map(shop => {
      // Process socials JSON data if needed
      let processedSocials: any = null;
      if (shop.socials) {
        if (typeof shop.socials === 'string') {
          try {
            processedSocials = JSON.parse(shop.socials);
          } catch (e) {
            processedSocials = null;
          }
        } else {
          processedSocials = shop.socials;
        }
      }

      return {
        id: shop.id,
        name: shop.name,
        description: shop.description,
        logo: shop.logo,
        coverImage: shop.coverImage,
        location: shop.location,
        userId: shop.userId,
        storeUrl: shop.storeUrl,
        socials: processedSocials,
        galleryImages: shop.galleryImages,
        createdAt: shop.createdAt.toISOString(),
        updatedAt: shop.updatedAt.toISOString(),
        isVerified: shop.isVerified,
        shopEnabled: shop.shopEnabled,
        featuredProducts: shop.featuredProducts,
        followers: shop.followers,
        listingId: shop.listingId,
        user: shop.user,
        productCount: shop._count.products,
        followerCount: shop.followers.length,
        featuredProductItems: shop.products.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: p.mainImage
        }))
      } as SafeShop;
    });

    return safeShops;
  } catch (error: any) {
    console.error("Error in getShops:", error);
    throw new Error(`Failed to fetch shops: ${error.message}`);
  }
}