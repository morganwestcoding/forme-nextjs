import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { apiError, apiErrorCode } from "@/app/utils/api";
import { sanitizeText } from "@/app/utils/sanitize";
import { validateBody, createShopSchema } from "@/app/utils/validations";
import { createRateLimiter, getIP } from "@/app/libs/rateLimit";

export const runtime = 'nodejs';
export const maxDuration = 60;

let _shopLimiter: ReturnType<typeof createRateLimiter> | null = null;
function getShopLimiter() {
  if (!_shopLimiter) {
    _shopLimiter = createRateLimiter("shops", { limit: 5, windowSeconds: 60 });
  }
  return _shopLimiter;
}

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
): Promise<any[]> {
  if (!products?.length) return [];

  const created: any[] = [];
  for (const productData of products) {
    const { name, description, price, category, image, images, sizes } = productData;

    if (!name || !description || !price) continue;

    const mainImage = image || (images?.length ? images[0] : null);
    if (!mainImage) continue;

    const options = sizes?.length ? [{ name: 'Size', values: sizes }] : null;
    const variants = sizes?.length
      ? sizes.map((size) => ({
          price: parseFloat(price.toString()),
          inventory: 10,
          optionValues: { Size: size }
        }))
      : null;

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
    } catch (e) {
      console.error('[api/shops] product create failed', e);
    }
  }

  if (created.length > 0) {
    try {
      await prisma.shop.update({
        where: { id: shopId },
        data: { featuredProducts: { set: created.map((p) => p.id) } }
      });
    } catch (e) {
      console.error('[api/shops] featuredProducts update failed', e);
    }
  }

  return created;
}

const isObjectId = (v: unknown): v is string =>
  typeof v === 'string' && /^[a-f\d]{24}$/i.test(v);

export async function POST(request: Request) {
  try {
    const ip = getIP(request);
    const rl = getShopLimiter()(ip);
    if (!rl.allowed) {
      return apiError(`Too many requests. Try again in ${rl.retryAfterSeconds}s`, 429);
    }

    const currentUser = await getCurrentUser();
    if (!currentUser) return apiErrorCode('UNAUTHORIZED');

    let body: any;
    try {
      body = await request.json();
    } catch {
      return apiError('Invalid JSON body', 400);
    }

    const validation = validateBody(createShopSchema, body);
    if (!validation.success) {
      return apiError(validation.error, 400);
    }

    const {
      name,
      description,
      logo,
      coverImage,
      location,
      address,
      isOnlineOnly,
      storeUrl,
      listingId,
    } = validation.data;
    const { category, zipCode, galleryImages, shopEnabled, products } = body;

    const sanitizedName = sanitizeText(name);
    const sanitizedDescription = description ? sanitizeText(description) : '';

    const shop = await prisma.shop.create({
      data: {
        name: sanitizedName,
        description: sanitizedDescription,
        category: category || null,
        logo: logo || '',
        coverImage: coverImage || null,
        location: location || null,
        address: address || null,
        zipCode: zipCode || null,
        isOnlineOnly: !!isOnlineOnly,
        userId: currentUser.id,
        storeUrl: storeUrl || null,
        galleryImages: Array.isArray(galleryImages) ? galleryImages : [],
        isVerified: false,
        shopEnabled: shopEnabled !== undefined ? !!shopEnabled : true,
        featuredProducts: [],
        followers: [],
        listingId: isObjectId(listingId) ? listingId : null,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });

    let createdProducts: any[] = [];
    if (Array.isArray(products) && products.length > 0) {
      try {
        createdProducts = await createProductsForShop(products as ProductInput[], shop.id, currentUser.id);
      } catch (productErr) {
        console.error('[api/shops POST] product creation failed', productErr);
      }
    }

    return NextResponse.json({ ...shop, products: createdProducts });
  } catch (error) {
    const stack = error instanceof Error ? error.stack : undefined;
    const name = error instanceof Error ? error.name : typeof error;
    const msg = error instanceof Error ? error.message : 'Internal server error';
    console.error('[api/shops POST] failed', { name, msg, stack });
    const body: Record<string, unknown> = { error: msg };
    if (process.env.NODE_ENV !== 'production') body.stack = stack;
    return NextResponse.json(body, { status: 500 });
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
      include: {
        user: { select: { id: true, name: true, image: true } },
        products: { take: 4, select: { id: true, name: true, mainImage: true } },
      },
      take: limit ? parseInt(limit) : undefined,
      orderBy: { createdAt: 'desc' }
    });

    const safe = shops.map((s: typeof shops[number]) => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
      products: (s.products || []).map((p: any) => ({ ...p, image: p.mainImage })),
    }));

    return NextResponse.json(safe);
  } catch (error) {
    return apiErrorCode('INTERNAL_ERROR');
  }
}
