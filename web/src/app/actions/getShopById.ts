import prisma from "@/app/libs/prismadb";

interface IParams {
  shopId?: string;   // preferred
  shopsId?: string;  // current route folder uses this
}

export default async function getShopById(params: IParams) {
  try {
    const id = params.shopId ?? params.shopsId;
    if (!id) {
      // match your listing getter pattern: return null when id missing
      return null;
    }

    const shop = await prisma.shop.findUnique({
      where: { id },
      include: {
        user: true,
        products: {
          include: { category: true }, // keep for ProductCard category.name
        },
      },
    });

    if (!shop) return null;

    return {
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
      city: shop.location?.split(",")[0]?.trim() || null,
      state: shop.location?.split(",")[1]?.trim() || null,
      user: {
        ...shop.user,
        createdAt: shop.user.createdAt.toISOString(),
        updatedAt: shop.user.updatedAt.toISOString(),
        emailVerified: shop.user.emailVerified
          ? shop.user.emailVerified.toISOString()
          : null,
        backgroundImage: shop.user.backgroundImage ?? null,
        role: shop.user.role,
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
        category: p.category ? { id: p.category.id, name: p.category.name } : null,
        shop: { id: shop.id, name: shop.name }, // for "by {shop.name}" in ProductCard
      })),
    };
  } catch (error: any) {
    // keep error useful but don’t crash on undefined id anymore
    throw new Error(`getShopById failed: ${error.message ?? String(error)}`);
  }
}
