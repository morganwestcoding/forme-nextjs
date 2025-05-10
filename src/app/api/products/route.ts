import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  console.log("Full request body:", body);
  console.log("Options data:", body.options);
  console.log("Variants data:", body.variants);

  const {
    name,
    description,
    price,
    compareAtPrice,
    mainImage,
    galleryImages,
    shopId,
    sku,
    barcode,
    categoryId,
    tags,
    isPublished,
    isFeatured,
    inventory,
    lowStockThreshold,
    weight,
    options,
    variants,
  } = body;

  console.log("Received fields:", { 
    name, description, price, mainImage, shopId, categoryId,
    compareAtPrice, galleryImages, sku, barcode, tags,
    isPublished, isFeatured, inventory, lowStockThreshold,
    weight, options, variants
  });

  // Required fields validation
  const requiredFields = { name, description, price, mainImage, shopId, categoryId };
  const missingFields = Object.entries(requiredFields)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingFields.length > 0) {
    console.log("Missing fields:", missingFields);
    return new Response(`Missing required fields: ${missingFields.join(", ")}`, { status: 400 });
  }

  // Validate price formats
  if (isNaN(parseFloat(price)) || parseFloat(price) < 0) {
    return new Response("Invalid price format", { status: 400 });
  }

  if (compareAtPrice && (isNaN(parseFloat(compareAtPrice)) || parseFloat(compareAtPrice) < 0)) {
    return new Response("Invalid compare at price format", { status: 400 });
  }

  // Check if the user owns the shop
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
  });

  if (!shop) {
    return new Response("Shop not found", { status: 404 });
  }

  if (shop.userId !== currentUser.id) {
    return new Response("Not authorized to add products to this shop", { status: 403 });
  }

  // Check if category exists
  const category = await prisma.productCategory.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    return new Response("Category not found", { status: 404 });
  }

  // Parse JSON fields if they come as strings
  let parsedOptions;
  if (options) {
    try {
      parsedOptions = typeof options === 'string' ? JSON.parse(options) : options;
    } catch (error) {
      return new Response("Invalid options format", { status: 400 });
    }
  }

  let parsedVariants;
  if (variants) {
    try {
      parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;
    } catch (error) {
      return new Response("Invalid variants format", { status: 400 });
    }
  }

  try {
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        mainImage,
        galleryImages: galleryImages || [],
        shopId,
        sku: sku || null,
        barcode: barcode || null,
        categoryId,
        tags: tags || [],
        isPublished: isPublished !== undefined ? isPublished : true,
        isFeatured: isFeatured || false,
        inventory: inventory || 0,
        lowStockThreshold: lowStockThreshold || 5,
        weight: weight ? parseFloat(weight) : null,
        options: parsedOptions || null,
        variants: parsedVariants || null,
        favoritedBy: [],
        reviews: null,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        shop: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get("shopId");
    const productId = searchParams.get("productId");
    const categoryId = searchParams.get("categoryId");
    const featured = searchParams.get("featured");
    const published = searchParams.get("published");

    let query: any = {};

    if (shopId) {
      query.shopId = shopId;
    }

    if (productId) {
      query.id = productId;
    }

    if (categoryId) {
      query.categoryId = categoryId;
    }

    if (featured === "true") {
      query.isFeatured = true;
    }

    if (published !== null) {
      query.isPublished = published === "true";
    } else {
      // By default, only fetch published products
      query.isPublished = true;
    }

    const products = await prisma.product.findMany({
      where: query,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        shop: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function PUT(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("id");

  if (!productId) {
    return new Response("Product ID is required", { status: 400 });
  }

  // Check if the product exists and get the shop info
  const existingProduct = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      shop: true,
    },
  });

  if (!existingProduct) {
    return new Response("Product not found", { status: 404 });
  }

  // Check if the user owns the shop
  if (existingProduct.shop.userId !== currentUser.id) {
    return new Response("Not authorized to update this product", { status: 403 });
  }

  const body = await request.json();
  console.log("Update request body:", body);

  // Parse JSON fields if they come as strings
  let parsedOptions = body.options;
  if (body.options && typeof body.options === 'string') {
    try {
      parsedOptions = JSON.parse(body.options);
    } catch (error) {
      return new Response("Invalid options format", { status: 400 });
    }
  }

  let parsedVariants = body.variants;
  if (body.variants && typeof body.variants === 'string') {
    try {
      parsedVariants = JSON.parse(body.variants);
    } catch (error) {
      return new Response("Invalid variants format", { status: 400 });
    }
  }

  try {
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        ...body,
        price: body.price ? parseFloat(body.price) : undefined,
        compareAtPrice: body.compareAtPrice ? parseFloat(body.compareAtPrice) : undefined,
        weight: body.weight ? parseFloat(body.weight) : undefined,
        options: parsedOptions,
        variants: parsedVariants,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        shop: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("id");

  if (!productId) {
    return new Response("Product ID is required", { status: 400 });
  }

  // Check if the product exists and get the shop info
  const existingProduct = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      shop: true,
    },
  });

  if (!existingProduct) {
    return new Response("Product not found", { status: 404 });
  }

  // Check if the user owns the shop
  if (existingProduct.shop.userId !== currentUser.id) {
    return new Response("Not authorized to delete this product", { status: 403 });
  }

  try {
    // Delete the product
    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}