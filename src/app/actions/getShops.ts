// app/actions/getShops.ts
import prisma from "@/app/libs/prismadb";
import { SafeShop } from "@/app/types";

export interface IShopsParams {
  userId?: string;
  location?: string;
  verified?: boolean;
  hasProducts?: boolean;
  search?: string;
  limit?: number;
  sort?: 'newest' | 'products';
  category?: string;
  featured?: boolean;
}

export default async function getShops(params: IShopsParams): Promise<SafeShop[]> {
  try {
    const {
      userId,
      location,
      verified,
      hasProducts,
      search,
      limit,
      sort = 'newest',
      category,
      featured
    } = params;

    // Build query filters
    let query: any = {
      shopEnabled: true
    };

    // User filter
    if (userId) {
      query.userId = userId;
    }

    // Location filter
    if (location) {
      query.location = {
        contains: location,
        mode: 'insensitive'
      };
    }

    // Verification filter
    if (verified) {
      query.isVerified = true;
    }

    // Search filter
    if (search) {
      query.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Product existence filter
    if (hasProducts) {
      query.products = {
        some: {
          isPublished: true
        }
      };
    }

    // Category filter - can now filter by shop category directly
    if (category) {
      query.category = {
        equals: category,
        mode: 'insensitive'
      };
    }

    // Featured shops filter
    if (featured) {
      // Define your criteria for featured shops - for example:
      query.isVerified = true;
      // Could also check for minimum number of products
    }

    // Determine ordering based on sort parameter
    let orderBy = {};
    switch (sort) {
      case 'products':
        // We'll sort post-query for product count
        orderBy = { createdAt: 'desc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    // Fetch shops with related data
    const shops = await prisma.shop.findMany({
      where: query,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            imageSrc: true
          }
        },
        products: {
          where: {
            isPublished: true,
            ...(featured ? { isFeatured: true } : {})
          },
          select: {
            id: true,
            name: true,
            price: true,
            mainImage: true
          },
          take: 4 // Get up to 4 featured products per shop
        },
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy,
      ...(limit ? { take: limit } : {})
    });

    // Process the shops data to match the SafeShop type
    const safeShops = shops.map(shop => {
      // Format featured products for display
      const featuredProductItems = shop.products.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.mainImage
      }));

      // Convert null to undefined where needed to match SafeShop type
      return {
        id: shop.id,
        name: shop.name,
        description: shop.description,
        category: shop.category || undefined, // Convert null to undefined
        logo: shop.logo,
        coverImage: shop.coverImage || undefined,
        location: shop.location || undefined,
        address: shop.address || undefined,
        zipCode: shop.zipCode || undefined,
        isOnlineOnly: shop.isOnlineOnly || false,
        coordinates: shop.coordinates as { lat: number; lng: number } | null,
        userId: shop.userId,
        storeUrl: shop.storeUrl || undefined,
        socials: shop.socials as {
          instagram?: string;
          facebook?: string;
          twitter?: string;
          tiktok?: string;
          youtube?: string;
          [key: string]: string | undefined;
        } | null,
        galleryImages: shop.galleryImages,
        createdAt: shop.createdAt.toISOString(),
        updatedAt: shop.updatedAt.toISOString(),
        isVerified: shop.isVerified,
        shopEnabled: shop.shopEnabled,
        featuredProducts: shop.featuredProducts,
        followers: shop.followers,
        listingId: shop.listingId || undefined,
        user: {
          id: shop.user.id,
          name: shop.user.name,
          image: shop.user.image || shop.user.imageSrc || null
        },
        // Add calculated fields
        productCount: shop._count.products,
        followerCount: shop.followers.length,
        featuredProductItems
      } as SafeShop; // Use type assertion to ensure it matches SafeShop
    });

    // Apply post-query sorting for criteria that can't be sorted in Prisma directly
    if (sort === 'products') {
      safeShops.sort((a, b) => (b.productCount || 0) - (a.productCount || 0));
    }

    return safeShops;
  } catch (error: any) {
    console.error("Error in getShops:", error);
    throw new Error(`Failed to fetch shops: ${error.message}`);
  }
}