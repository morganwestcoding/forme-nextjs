import prisma from "@/app/libs/prismadb";

export interface IShopProductsParams {
  shopId?: string;
  categoryId?: string;
  featured?: boolean;
  published?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'date' | 'name';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  search?: string;
}

export default async function getShopProducts(params: IShopProductsParams) {
  try {
    const {
      shopId,
      categoryId,
      featured = false,
      published = true,
      minPrice,
      maxPrice,
      sortBy = 'date',
      sortOrder = 'desc',
      limit,
      search
    } = params;

    // Base query
    let query: any = {
      isPublished: published
    };

    // Shop ID filter
    if (shopId) {
      query.shopId = shopId;
    }

    // Category filter
    if (categoryId) {
      query.categoryId = categoryId;
    }

    // Featured products
    if (featured) {
      query.isFeatured = true;
    }

    // Price filter
    if (minPrice !== undefined) {
      query.price = {
        ...query.price,
        gte: minPrice
      };
    }
    
    if (maxPrice !== undefined) {
      query.price = {
        ...query.price,
        lte: maxPrice
      };
    }

    // Search filter
    if (search) {
      query.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } }
      ];
    }

    // Determine sort order
    const orderBy: any = {};
    
    if (sortBy === 'price') {
      orderBy.price = sortOrder;
    } else if (sortBy === 'name') {
      orderBy.name = sortOrder;
    } else {
      // Default date sorting
      orderBy.createdAt = sortOrder;
    }

    // Fetch products with relations
    const products = await prisma.product.findMany({
      where: query,
      include: {
        category: true,
        shop: {
          select: {
            id: true,
            name: true,
            logo: true
          }
        }
      },
      orderBy,
      ...(limit ? { take: limit } : {})
    });

    // Transform to safe products
    const safeProducts = products.map(product => ({
      ...product,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      // Parse JSON fields
      options: product.options as any,
      variants: product.variants as any,
      reviews: product.reviews as any,
      // Ensure consistency with our types
      favoritedBy: product.favoritedBy || [],
      galleryImages: product.galleryImages || [],
      tags: product.tags || [],
      category: {
        id: product.category.id,
        name: product.category.name
      },
      shop: {
        id: product.shop.id,
        name: product.shop.name,
        logo: product.shop.logo
      }
    }));

    return safeProducts;
  } catch (error: any) {
    console.error("Error in getShopProducts:", error);
    throw new Error(`Failed to fetch products: ${error.message}`);
  }
}