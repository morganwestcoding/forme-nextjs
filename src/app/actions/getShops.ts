// app/actions/getShops.ts
import prisma from "@/app/libs/prismadb";

export interface IShopsParams {
  userId?: string;
  locationValue?: string;
  category?: string;
  state?: string;
  city?: string;

  // existing
  order?: "asc" | "desc";
  hasProducts?: boolean;
  isVerified?: boolean;

  // NEW
  limit?: number;
  sort?: "newest" | "popular"; // 'popular' reserved; see note below
}

export default async function getShops(params: IShopsParams) {
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

    // Loose location search
    if (state || city) {
      where.location = { contains: state || city, mode: "insensitive" };
    }

    // Order mapping:
    // - sort === 'newest' => createdAt desc
    // - else use provided `order`
    // - default createdAt desc
    const orderBy =
      sort === "newest"
        ? { createdAt: "desc" as const }
        : order
        ? { createdAt: order }
        : { createdAt: "desc" as const };

    // Note: A true 'popular' sort (e.g., by followers count) would require
    // a different model/query (e.g., _count on a relation). For now it
    // falls back to `orderBy` above unless you add that structure.

    const shopsRaw = await prisma.shop.findMany({
      where,
      include: {
        user: true,
        products: {
          include: {
            category: true,
          },
        },
      },
      orderBy,
      take: typeof limit === "number" ? Math.max(0, limit) : undefined,
    });

    const shops = hasProducts
      ? shopsRaw.filter((s) => (s.products?.length ?? 0) > 0)
      : shopsRaw;

    const safeShops = shops.map((shop) => ({
      ...shop,
      createdAt: shop.createdAt.toISOString(),
      updatedAt: shop.updatedAt.toISOString(),

      category: shop.category ?? null,
      coverImage: shop.coverImage ?? null,
      logo: shop.logo ?? null,
      location: shop.location ?? null,
      address: shop.address ?? null,
      zipCode: shop.zipCode ?? null,
      storeUrl: shop.storeUrl ?? null,
      galleryImages: shop.galleryImages ?? [],
      followers: shop.followers ?? [],
      featuredProducts: shop.featuredProducts ?? [],
      listingId: shop.listingId ?? null,

      // convenience: city/state split like listing example
      city: shop.location?.split(",")[0]?.trim() || null,
      state: shop.location?.split(",")[1]?.trim() || null,

      user: {
        ...shop.user,
        createdAt: shop.user.createdAt.toISOString(),
        updatedAt: shop.user.updatedAt.toISOString(),
        emailVerified: shop.user.emailVerified
          ? shop.user.emailVerified.toISOString()
          : null,
      },

      products: (shop.products ?? []).map((p) => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        description: p.description ?? "",
        compareAtPrice: p.compareAtPrice ?? null,
        sku: p.sku ?? null,
        barcode: p.barcode ?? null,
        mainImage: p.mainImage ?? "/images/placeholder.jpg",
        galleryImages: p.galleryImages ?? [],
        favoritedBy: p.favoritedBy ?? [],
        options: p.options ?? null,
        variants: p.variants ?? null,
        reviews: p.reviews ?? null,
        weight: p.weight ?? null,
        category: p.category
          ? { id: p.category.id, name: p.category.name }
          : null,
        // attach minimal shop ref for ProductCard UX
        shop: { id: shop.id, name: shop.name },
      })),
    }));

    // console.log("Fetched shops count:", safeShops.length);
    return safeShops;
  } catch (error: any) {
    console.error("Error in getShops:", error);
    throw new Error(`Failed to fetch shops: ${error.message}`);
  }
}
