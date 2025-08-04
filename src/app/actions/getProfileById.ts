import prisma from "@/app/libs/prismadb";

interface IParams {
  shopId?: string;
}

export default async function getShopById(params: IParams) {
  try {
    const { shopId } = params;

    if (!shopId) {
      return null;
    }

    const shop = await prisma.shop.findUnique({
      where: {
        id: shopId,
      },
      include: {
        user: true,
        products: {
          where: {
            isFeatured: true,
            isPublished: true
          },
          take: 4,
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            category: true
          }
        },
        listing: true
      }
    });

    if (!shop) {
      return null;
    }

    // Count the followers
    const followerCount = shop.followers.length;
    
    // Count total products
    const productCount = await prisma.product.count({
      where: {
        shopId: shop.id,
        isPublished: true
      }
    });

    // Format featured products for display
    const featuredProductItems = shop.products.map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.mainImage
    }));

    return {
      ...shop,
      createdAt: shop.createdAt.toISOString(),
      updatedAt: shop.updatedAt.toISOString(),
      productCount,
      followerCount,
      featuredProductItems,
  
      user: {
        id: shop.user.id,
        name: shop.user.name,
        image: shop.user.image || shop.user.imageSrc || null
      }
    };
    
  } catch (error: any) {
    console.error("Error in getShopById:", error);
    throw new Error(`Failed to fetch shop: ${error.message}`);
  }
}