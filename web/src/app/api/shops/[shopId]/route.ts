import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { apiError, apiErrorCode } from "@/app/utils/api";

export async function PUT(
  request: Request,
  { params }: { params: { shopId: string } }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return apiErrorCode('UNAUTHORIZED');

  const { shopId } = params;

  const shop = await prisma.shop.findUnique({ where: { id: shopId } });
  if (!shop) return apiError("Shop not found", 404);

  const isOwner = shop.userId === currentUser.id;
  const isAdmin = currentUser.role === "admin" || currentUser.role === "master";
  if (!isOwner && !isAdmin) return apiErrorCode('FORBIDDEN');

  const body = await request.json();
  const {
    name,
    description,
    category,
    logo,
    coverImage,
    location,
    address,
    zipCode,
    isOnlineOnly,
    storeUrl,
    galleryImages,
    shopEnabled,
    listingId,
    products,
  } = body;

  try {
    const updatedShop = await prisma.shop.update({
      where: { id: shopId },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(logo !== undefined && { logo }),
        ...(coverImage !== undefined && { coverImage: coverImage || null }),
        ...(location !== undefined && { location }),
        ...(address !== undefined && { address: address || null }),
        ...(zipCode !== undefined && { zipCode: zipCode || null }),
        ...(isOnlineOnly !== undefined && { isOnlineOnly: !!isOnlineOnly }),
        ...(storeUrl !== undefined && { storeUrl: storeUrl || null }),
        ...(galleryImages !== undefined && { galleryImages }),
        ...(shopEnabled !== undefined && { shopEnabled: !!shopEnabled }),
        ...(listingId !== undefined && { listingId: listingId || null }),
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
        products: true,
      },
    });

    // Sync products if provided
    if (Array.isArray(products)) {
      // Remove existing products and recreate
      await prisma.product.deleteMany({ where: { shopId } });

      const createdProducts = [];
      for (const p of products) {
        if (!p.name || !p.price) continue;

        const categoryName = p.category || "Uncategorized";
        let cat = await prisma.productCategory.findFirst({ where: { name: categoryName } });
        if (!cat) {
          cat = await prisma.productCategory.create({
            data: { name: categoryName, description: `Default category for ${categoryName} products` },
          });
        }

        const mainImage = p.mainImage || p.image || (p.images?.length ? p.images[0] : null);
        if (!mainImage) continue;

        const product = await prisma.product.create({
          data: {
            name: p.name,
            description: p.description || "",
            price: parseFloat(p.price.toString()),
            mainImage,
            galleryImages: p.images?.length ? p.images.slice(1) : [],
            shopId,
            categoryId: cat.id,
            tags: [categoryName],
            isPublished: true,
            isFeatured: true,
            inventory: 10,
            lowStockThreshold: 5,
            options: p.sizes?.length ? [{ name: "Size", values: p.sizes }] : null,
            variants: p.sizes?.length
              ? p.sizes.map((size: string) => ({
                  price: parseFloat(p.price.toString()),
                  inventory: 10,
                  optionValues: { Size: size },
                }))
              : null,
            favoritedBy: [],
          },
        });
        createdProducts.push(product);
      }

      // Update featured products
      await prisma.shop.update({
        where: { id: shopId },
        data: { featuredProducts: createdProducts.map((p) => p.id) },
      });
    }

    return NextResponse.json(updatedShop);
  } catch (error) {
    return apiErrorCode('INTERNAL_ERROR');
  }
}
