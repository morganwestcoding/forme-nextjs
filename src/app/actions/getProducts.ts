// app/actions/getProducts.ts
import prisma from "@/app/libs/prismadb";
import { SafeProduct, ProductReview, ProductVariant, ProductOption } from "@/app/types";

export interface IProductsParams {
  userId?: string;
  shopId?: string;
  categoryId?: string;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  query?: string;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
  limit?: number;
  hasInventory?: boolean;
  tags?: string[];
}

export default async function getProducts(params: IProductsParams): Promise<SafeProduct[]> {
  try {
    const {
      userId,
      shopId,
      categoryId,
      featured,
      minPrice,
      maxPrice,
      query,
      sort,
      limit = 20,
      hasInventory,
      tags
    } = params;

    let whereClause: any = {
      isPublished: true
    };

    // Filter by owner
    if (userId) {
      const userShops = await prisma.shop.findMany({
        where: { userId },
        select: { id: true }
      });
      
      whereClause.shopId = {
        in: userShops.map(shop => shop.id)
      };
    }

    // Filter by shop
    if (shopId) {
      whereClause.shopId = shopId;
    }

    // Filter by category
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    // Filter by featured status
    if (featured !== undefined) {
      whereClause.isFeatured = featured;
    }

    // Filter by price range
    if (minPrice !== undefined) {
      whereClause.price = {
        ...whereClause.price,
        gte: minPrice
      };
    }

    if (maxPrice !== undefined) {
      whereClause.price = {
        ...whereClause.price,
        lte: maxPrice
      };
    }

    // Filter by search query
    if (query) {
      whereClause.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { tags: { has: query } }
      ];
    }

    // Filter by inventory
    if (hasInventory) {
      whereClause.inventory = {
        gt: 0
      };
    }

    // Filter by tags
    if (tags && tags.length > 0) {
      whereClause.tags = {
        hasSome: tags
      };
    }

    // Determine order
    let orderBy: any = {};
    
    switch (sort) {
      case 'price_asc':
        orderBy.price = 'asc';
        break;
      case 'price_desc':
        orderBy.price = 'desc';
        break;
      case 'popular':
        orderBy.favoritedBy = { _count: 'desc' };
        break;
      case 'newest':
      default:
        orderBy.createdAt = 'desc';
        break;
    }

    // Fetch products
    const products = await prisma.product.findMany({
      where: whereClause,
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
      take: limit
    });

    // Transform to safe products
    const safeProducts = products.map(product => {
      // Process JSON fields
      let processedReviews: ProductReview[] | null = null;
      if (product.reviews) {
        if (typeof product.reviews === 'string') {
          try {
            processedReviews = JSON.parse(product.reviews);
          } catch (e) {
            processedReviews = null;
          }
        } else {
          processedReviews = product.reviews as any;
        }
      }

      let processedOptions: ProductOption[] | null = null;
      if (product.options) {
        if (typeof product.options === 'string') {
          try {
            processedOptions = JSON.parse(product.options);
          } catch (e) {
            processedOptions = null;
          }
        } else {
          processedOptions = product.options as any;
        }
      }

      let processedVariants: ProductVariant[] | null = null;
      if (product.variants) {
        if (typeof product.variants === 'string') {
          try {
            processedVariants = JSON.parse(product.variants);
          } catch (e) {
            processedVariants = null;
          }
        } else {
          processedVariants = product.variants as any;
        }
      }

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        mainImage: product.mainImage,
        galleryImages: product.galleryImages,
        shopId: product.shopId,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
        sku: product.sku,
        barcode: product.barcode,
        categoryId: product.categoryId,
        category: product.category,
        tags: product.tags,
        isPublished: product.isPublished,
        isFeatured: product.isFeatured,
        inventory: product.inventory,
        lowStockThreshold: product.lowStockThreshold,
        weight: product.weight,
        shop: product.shop,
        favoritedBy: product.favoritedBy,
        reviews: processedReviews,
        options: processedOptions,
        variants: processedVariants
      } as SafeProduct;
    });

    return safeProducts;
  } catch (error: any) {
    console.error("Error in getProducts:", error);
    throw new Error(`Failed to fetch products: ${error.message}`);
  }
}