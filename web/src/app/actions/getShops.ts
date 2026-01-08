// app/actions/getShops.ts
import prisma from "@/app/libs/prismadb";
import { SafeShop } from "@/app/types";

export interface IShopsParams {
  userId?: string;
  locationValue?: string;
  category?: string;
  state?: string;
  city?: string;
  order?: "asc" | "desc";
  hasProducts?: boolean;
  isVerified?: boolean;

  // extras for paging/sorting on the page
  limit?: number;
  sort?: "newest" | "popular";
}

function toSafeShop(shop: any): SafeShop {
  return {
    id: shop.id,
    name: shop.name ?? "",
    description: shop.description ?? "", // SafeShop requires string
    logo: shop.logo ?? "/images/placeholder.jpg", // SafeShop requires string
    coverImage: shop.coverImage ?? null,
    location: shop.location ?? null,
    address: shop.address ?? null,
    zipCode: shop.zipCode ?? null,
    isOnlineOnly: shop.isOnlineOnly ?? false,

    userId: shop.userId,
    storeUrl: shop.storeUrl ?? null,
    galleryImages: Array.isArray(shop.galleryImages) ? shop.galleryImages : [],

    createdAt: shop.createdAt.toISOString(),
    updatedAt: shop.updatedAt.toISOString(),

    isVerified: shop.isVerified ?? false,
    shopEnabled: shop.shopEnabled ?? true,

    featuredProducts: Array.isArray(shop.featuredProducts) ? shop.featuredProducts : [],
    followers: Array.isArray(shop.followers) ? shop.followers : [],
    listingId: shop.listingId ?? null,

    // IMPORTANT: SafeShop wants `string | undefined`, not null
    category: shop.category ?? undefined,

    user: {
      id: shop.user.id,
      name: shop.user.name,
      image: shop.user.image,
    },

    // Optional summary props for UI cards; SafeShop marks `products?`
    products: (shop.products ?? []).map((p: any) => ({
      name: p.name,
      image: p.mainImage ?? "/images/placeholder.jpg",
      price: p.price,
    })),
    productCount: (shop.products ?? []).length,
    followerCount: Array.isArray(shop.followers) ? shop.followers.length : 0,

    // Optional: quick featured items list if you flag products in your schema
    featuredProductItems: (shop.products ?? [])
      .filter((p: any) => p.isFeatured === true)
      .slice(0, 4)
      .map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.mainImage ?? "/images/placeholder.jpg",
      })),
  };
}

export default async function getShops(params: IShopsParams): Promise<SafeShop[]> {
  try {
    const {
      userId,
      locationValue,
      category,
      state,
      city,
      order,
      hasProducts,
      isVerified,
      limit,
      sort,
    } = params;

    const where: any = {};
    if (userId) where.userId = userId;
    if (category) where.category = category;
    if (isVerified !== undefined) where.isVerified = isVerified;

    if (locationValue) {
      where.location = locationValue;
    }
    if (state || city) {
      where.location = { contains: state || city, mode: "insensitive" };
    }

    const orderBy =
      sort === "newest"
        ? { createdAt: "desc" as const }
        : order
        ? { createdAt: order }
        : { createdAt: "desc" as const };

    const shopsRaw = await prisma.shop.findMany({
      where,
      include: {
        user: true,
        products: {
          include: { category: true },
        },
      },
      orderBy,
      take: typeof limit === "number" ? Math.max(0, limit) : undefined,
    });

    const filtered = hasProducts
      ? shopsRaw.filter((s) => (s.products?.length ?? 0) > 0)
      : shopsRaw;

    return filtered.map(toSafeShop);
  } catch (error: any) {
    console.error("Error in getShops:", error);
    throw new Error(`Failed to fetch shops: ${error.message}`);
  }
}
