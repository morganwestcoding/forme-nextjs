import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { Product } from "@prisma/client";

interface ProductInput {
  name: string;
  description: string;
  price: number | string;
  category?: string;
  image?: string;
  images?: string[];
  sizes?: string[];
}

async function getOrCreateDefaultCategory(categoryName: string): Promise<string> {
  let category = await prisma.productCategory.findFirst({ where: { name: categoryName } });
  if (!category) {
    category = await prisma.productCategory.create({
      data: { name: categoryName, description: `Default category for ${categoryName} products` }
    });
  }
  return category.id;
}

async function createProductsForShop(
  products: ProductInput[],
  shopId: string,
  userId: string
): Promise<Product[]> {
  if (!products?.length) return [];

  const created: Product[] = [];
  for (const productData of products) {
    const { name, description, price, category, image, images, sizes } = productData;

    if (!name || !description || !price) {
      console.log(`Skipping product missing fields`, { name, description, price });
      continue;
    }

    const options = sizes?.length ? [{ name: 'Size', values: sizes }] : null;
    const variants = sizes?.length
      ? sizes.map((size) => ({
          price: parseFloat(price.toString()),
          inventory: 10,
          optionValues: { Size: size }
        }))
      : null;

    const mainImage = image || (images?.length ? images[0] : null);
    if (!mainImage) {
      console.log(`Skipping product ${name} due to missing image`);
      continue;
    }

    try {
      const categoryToUse = category || "Uncategorized";
      const categoryId = await getOrCreateDefaultCategory(categoryToUse);

      const product = await prisma.product.create({
        data: {
          name,
          description,
          price: parseFloat(price.toString()),
          mainImage,
          galleryImages: images?.length ? images.slice(1) : [],
          shopId,
          categoryId,
          sku: null,
          barcode: null,
          tags: [categoryToUse],
          isPublished: true,
          isFeatured: true,
          inventory: 10,
          lowStockThreshold: 5,
          weight: null,
          options,
          variants,
          favoritedBy: [],
          reviews: null,
        }
      });

      created.push(product);

      await prisma.shop.update({
        where: { id: shopId },
        data: { featuredProducts: { push: product.id } }
      });
    } catch (e) {
      console.error(`Error creating product ${name}:`, e);
    }
  }

  return created;
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return new Response("Unauthorized", { status: 401 });

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
    products
  } = body;

  console.log("Received fields:", {
    name, description, category, logo, coverImage, location,
    address, zipCode, isOnlineOnly, storeUrl, galleryImages,
    productsCount: products?.length || 0
  });

  // Better missing-fields report
  const required: Record<string, any> = { name, description, logo };
  const missingKeys = Object.entries(required)
    .filter(([, v]) => !v)
    .map(([k]) => k);

  if (missingKeys.length) {
    return new Response(`Missing required fields: ${missingKeys.join(", ")}`, { status: 400 });
  }

  try {
    const shop = await prisma.shop.create({
      data: {
        name,
        description,
        category,
        logo,
        coverImage: coverImage || null,
        location,
        address: address || null,
        zipCode: zipCode || null,
        isOnlineOnly: !!isOnlineOnly,
        userId: currentUser.id,
        storeUrl: storeUrl || null,
        galleryImages: galleryImages || [],
        isVerified: false,
        shopEnabled: shopEnabled !== undefined ? !!shopEnabled : true,
        featuredProducts: [],
        followers: [],
        listingId: listingId || null,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });

    let createdProducts: Product[] = [];
    if (products?.length) {
      createdProducts = await createProductsForShop(products as ProductInput[], shop.id, currentUser.id);
    }

    return NextResponse.json({ ...shop, products: createdProducts });
  } catch (error) {
    console.error("Error creating shop:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = searchParams.get('limit');

    const where: any = {};
    if (userId) where.userId = userId;

    const shops = await prisma.shop.findMany({
      where,
      include: { user: { select: { id: true, name: true, image: true } } },
      take: limit ? parseInt(limit) : undefined,
      orderBy: { createdAt: 'desc' }
    });

    const safe = shops.map(s => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }));

    return NextResponse.json(safe);
  } catch (error) {
    console.error("Error fetching shops:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
