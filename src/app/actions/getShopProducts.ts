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
        category: {
          select: {
            id: true,
            name: true
          }
        },
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

    // Transform to SafeProduct format
    const safeProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      compareAtPrice: product.compareAtPrice ?? undefined,
      mainImage: product.mainImage,
      galleryImages: product.galleryImages || [],
      shopId: product.shopId,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      sku: product.sku ?? undefined,
      barcode: product.barcode ?? undefined,
      categoryId: product.categoryId,
      category: {
        id: product.category.id,
        name: product.category.name
      },
      tags: product.tags || [],
      isPublished: product.isPublished,
      isFeatured: product.isFeatured,
      inventory: product.inventory,
      lowStockThreshold: product.lowStockThreshold,
      weight: product.weight ?? undefined,
      shop: {
        id: product.shop.id,
        name: product.shop.name,
        logo: product.shop.logo
      },
      favoritedBy: product.favoritedBy || [],
      reviews: product.reviews ? (product.reviews as any) : undefined,
      options: product.options ? (product.options as any) : undefined,
      variants: product.variants ? (product.variants as any) : undefined,
    }));

    return safeProducts;
  } catch (error: any) {
    console.error("Error in getShopProducts:", error);
    throw new Error(`Failed to fetch products: ${error.message}`);
  }
}