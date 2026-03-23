import prisma from "@/app/libs/prismadb";

export default async function getProductById(productId: string) {
  try {
    if (!productId || !/^[a-f\d]{24}$/i.test(productId)) {
      return null;
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: { select: { id: true, name: true } },
        shop: {
          select: {
            id: true,
            name: true,
            logo: true,
            userId: true,
            location: true,
            coverImage: true,
          },
        },
      },
    });

    if (!product) return null;

    return {
      ...product,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      description: product.description ?? "",
      compareAtPrice: product.compareAtPrice ?? null,
      sku: product.sku ?? null,
      barcode: product.barcode ?? null,
      mainImage: product.mainImage ?? "/placeholder.jpg",
      galleryImages: product.galleryImages ?? [],
      favoritedBy: product.favoritedBy ?? [],
      options: product.options ?? null,
      variants: product.variants ?? null,
      reviews: product.reviews ?? null,
      weight: product.weight ?? null,
      category: product.category
        ? { id: product.category.id, name: product.category.name }
        : null,
      shop: product.shop
        ? {
            id: product.shop.id,
            name: product.shop.name,
            logo: product.shop.logo,
            userId: product.shop.userId,
            location: product.shop.location,
            coverImage: product.shop.coverImage,
          }
        : null,
    };
  } catch (error: any) {
    console.error("getProductById failed:", error);
    return null;
  }
}
