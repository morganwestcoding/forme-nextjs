import prisma from "@/app/libs/prismadb";

export interface IShopsParams {
  userId?: string;
  location?: string;
  verified?: boolean;
  hasProducts?: boolean;
  search?: string;
  limit?: number;
  sort?: 'newest' | 'popular' | 'products';
}

export default async function getShops(params: IShopsParams) {
  try {
    const {
      userId,
      location,
      verified = false,
      hasProducts = false,
      search,
      limit,
      sort = 'newest'
    } = params;

    // Base query
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

    // Has products filter
    if (hasProducts) {
      query.products = {
        some: {
          isPublished: true
        }
      };
    }

    // Fetch shops with relations
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
            isFeatured: true
          },
          select: {
            id: true,
            name: true,
            price: true,
            mainImage: true
          },
          take: 4
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      ...(limit ? { take: limit } : {})
    });

    // Fetch product counts separately to avoid issues with _count
    const productCounts = await Promise.all(
      shops.map(shop => 
        prisma.product.count({
          where: {
            shopId: shop.id,
            isPublished: true
          }
        })
      )
    );

    // Transform the shops with appropriate counts
    const safeShops = shops.map((shop, index) => {
      // Format featured products
      const featuredProductItems = shop.products.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.mainImage
      }));

      // Get follower count using the length of the followers array
      const followerCount = shop.followers?.length || 0;
      // Get product count from the separate query
      const productCount = productCounts[index];

      return {
        ...shop,
        createdAt: shop.createdAt.toISOString(),
        updatedAt: shop.updatedAt.toISOString(),
        // Format socials from JSON
        socials: shop.socials as Record<string, string> || {},
        productCount,
        followerCount,
        featuredProductItems,
        // User data formatting
        user: {
          id: shop.user.id,
          name: shop.user.name,
          image: shop.user.image || shop.user.imageSrc || null
        }
      };
    });

    // Manual sorting if needed
    let sortedShops = [...safeShops];
    
    if (sort === 'popular') {
      sortedShops.sort((a, b) => b.followerCount - a.followerCount);
    } else if (sort === 'products') {
      sortedShops.sort((a, b) => b.productCount - a.productCount);
    }
    
    return sortedShops;

  } catch (error: any) {
    console.error("Error in getShops:", error);
    throw new Error(`Failed to fetch shops: ${error.message}`);
  }
}