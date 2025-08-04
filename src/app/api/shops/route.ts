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

// Function to get or create a default category
async function getOrCreateDefaultCategory(categoryName: string): Promise<string> {
  console.log(`Finding or creating category: ${categoryName}`);
  
  // Try to find an existing category with this name
  let category = await prisma.productCategory.findFirst({
    where: { name: categoryName }
  });
  
  // If no category exists, create a default one
  if (!category) {
    category = await prisma.productCategory.create({
      data: {
        name: categoryName,
        description: `Default category for ${categoryName} products`
      }
    });
    console.log(`Created default category: ${categoryName} with ID: ${category.id}`);
  } else {
    console.log(`Found existing category: ${categoryName} with ID: ${category.id}`);
  }
  
  return category.id;
}

// This function will process and create products for a shop
async function createProductsForShop(
  products: ProductInput[], 
  shopId: string, 
  userId: string
): Promise<Product[]> {
  console.log(`Creating ${products.length} products for shop ${shopId}`);
  
  if (!products || !Array.isArray(products) || products.length === 0) {
    console.log('No products to create');
    return [];
  }
  
  const createdProducts: Product[] = [];
  
  for (const productData of products) {
    console.log(`Processing product: ${productData.name}`);
    
    const {
      name,
      description,
      price,
      category,
      image,
      images,
      sizes
    } = productData;
    
    if (!name || !description || !price) {
      console.log(`Skipping product due to missing required fields`);
      continue;
    }
    
    // Format product options from sizes if present
    const options = sizes && sizes.length > 0 
      ? [{ name: 'Size', values: sizes }] 
      : null;

    // Format product variants from sizes if present
    const variants = sizes && sizes.length > 0 
      ? sizes.map((size: string) => ({
          price: parseFloat(price.toString()),
          inventory: 10, // Default inventory per variant
          optionValues: { Size: size }
        })) 
      : null;
      
    const mainImage = image || (images && images.length > 0 ? images[0] : null);
    
    if (!mainImage) {
      console.log(`Skipping product ${name} due to missing image`);
      continue;
    }
    
    try {
      // Get or create a default category
      const categoryToUse = category || "Uncategorized";
      const categoryId = await getOrCreateDefaultCategory(categoryToUse);
      
      console.log(`Using category: ${categoryToUse} with ID: ${categoryId}`);
      
      // Create the product
      const product = await prisma.product.create({
        data: {
          name,
          description,
          price: parseFloat(price.toString()),
          mainImage,
          galleryImages: images && images.length > 1 ? images.slice(1) : [],
          shopId: shopId,
          categoryId: categoryId,
          sku: null,
          barcode: null,
          tags: [categoryToUse],
          isPublished: true,
          isFeatured: true,
          inventory: 10,
          lowStockThreshold: 5,
          weight: null,
          options: options,
          variants: variants,
          favoritedBy: [],
          reviews: null,
        }
      });
      
      console.log(`Created product: ${product.id}`);
      createdProducts.push(product);
      
      // Update the shop's featuredProducts array
      await prisma.shop.update({
        where: { id: shopId },
        data: {
          featuredProducts: {
            push: product.id
          }
        }
      });
      
      console.log(`Updated shop's featuredProducts with product ${product.id}`);
    } catch (error) {
      console.error(`Error creating product ${name}:`, error);
      // Continue with other products instead of failing completely
    }
  }
  
  return createdProducts;
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  console.log("Full request body:", body);
  console.log("Shop socials data:", body.socials);

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
    products // Get the products array from the request body
  } = body;

  console.log("Received fields:", { 
    name, description, category, logo, coverImage, location, 
    address, zipCode, isOnlineOnly, storeUrl, galleryImages, 
    productsCount: products?.length || 0
  });

  const requiredFields = [ name, description, logo ];
  
  const missingFields = requiredFields.filter((field) => !field);
  if (missingFields.length > 0) {
    console.log("Missing fields:", missingFields);
    return new Response(`Missing required fields: ${missingFields.join(", ")}`, { status: 400 });
  }



  try {
    // Create the shop first
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
        isOnlineOnly: isOnlineOnly || false,

        userId: currentUser.id,
        storeUrl: storeUrl || null,
  
        galleryImages: galleryImages || [],
        isVerified: false,
        shopEnabled: shopEnabled !== undefined ? shopEnabled : true,
        featuredProducts: [],
        followers: [],
        listingId: listingId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });
    
    console.log(`Created shop with ID: ${shop.id}`);
    
    // Process products if they exist
    let createdProducts: Product[] = [];
    if (products && Array.isArray(products) && products.length > 0) {
      console.log(`Processing ${products.length} products for shop ${shop.id}`);
      createdProducts = await createProductsForShop(products as ProductInput[], shop.id, currentUser.id);
      console.log(`Created ${createdProducts.length} products`);
    }

    // Return the shop with any created products
    return NextResponse.json({
      ...shop,
      products: createdProducts
    });
  } catch (error) {
    console.error("Error creating shop:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const featured = searchParams.get('featured');
    const limit = searchParams.get('limit');
    
    let query: any = {};
    
    if (userId) {
      query.userId = userId;
    }
    
    const shops = await prisma.shop.findMany({
      where: query,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      take: limit ? parseInt(limit) : undefined,
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Format shops for client
    const safeShops = shops.map(shop => ({
      ...shop,
      createdAt: shop.createdAt.toISOString(),
      updatedAt: shop.updatedAt.toISOString()
    }));
    
    return NextResponse.json(safeShops);
  } catch (error) {
    console.error("Error fetching shops:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// Update and DELETE handlers would go here