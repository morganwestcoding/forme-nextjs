import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { canModifyResource } from "@/app/libs/authorization";
import { apiError, apiErrorCode } from "@/app/utils/api";
import { sanitizeText } from "@/app/utils/sanitize";
import { validateBody, createProductSchema } from "@/app/utils/validations";
import { createRateLimiter, getIP } from "@/app/libs/rateLimit";

const productLimiter = createRateLimiter("products", { limit: 10, windowSeconds: 60 });

// Function to get or create a default category
async function getOrCreateDefaultCategory(categoryName: string) {
  try {
    let category = await prisma.productCategory.findFirst({
      where: { name: categoryName }
    });

    if (category) {
      return category.id;
    }

    category = await prisma.productCategory.create({
      data: {
        name: categoryName,
        description: `Default category for ${categoryName} products`
      }
    });
    return category.id;
  } catch (error) {
    throw error;
  }
}

export async function POST(request: Request) {
  const ip = getIP(request);
  const rl = productLimiter(ip);
  if (!rl.allowed) {
    return apiError(`Too many requests. Try again in ${rl.retryAfterSeconds}s`, 429);
  }

  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return apiErrorCode('UNAUTHORIZED');
  }

  let body;
  try {
    body = await request.json();
  } catch (error) {
    return apiError("Invalid request body", 400);
  }

  // Check if we're handling a shop with embedded products
  const isShopWithProducts = body.name && !body.shopId && body.products && Array.isArray(body.products);

  if (isShopWithProducts) {
    // Sanitize shop-level text fields
    if (typeof body.name === 'string') body.name = sanitizeText(body.name);
    if (typeof body.description === 'string') body.description = sanitizeText(body.description);
    // Sanitize embedded product text fields
    if (Array.isArray(body.products)) {
      body.products = body.products.map((p: any) => ({
        ...p,
        ...(typeof p.name === 'string' ? { name: sanitizeText(p.name) } : {}),
        ...(typeof p.description === 'string' ? { description: sanitizeText(p.description) } : {}),
      }));
    }

    try {
      // First, create the shop if it doesn't exist
      let shop;
      
      if (body.id) {
        // If shop ID is provided, find the shop
        shop = await prisma.shop.findUnique({
          where: { id: body.id }
        });
        
        if (!shop) {
          return apiError("Shop not found", 404);
        }
        
        // Verify ownership (owner or master/admin)
        if (!canModifyResource(currentUser, shop.userId)) {
          return apiError("Not authorized to modify this shop", 403);
        }
        
      } else {
        
        try {
          shop = await prisma.shop.create({
            data: {
              name: body.name,
              description: body.description,
              logo: body.logo,
              coverImage: body.coverImage || null,
              location: body.location || null,
              userId: currentUser.id,
              storeUrl: body.storeUrl || null,
              category: body.category || null,
    
              galleryImages: body.galleryImages || [],
              isVerified: false,
              shopEnabled: body.shopEnabled !== undefined ? body.shopEnabled : true,
              featuredProducts: [],
              followers: [],
              listingId: body.listingId || null,
            }
          });
        } catch (shopError) {
          return apiError(`Failed to create shop: ${shopError instanceof Error ? shopError.message : 'Unknown error'}`, 500);
        }
      }
      
      const productsCreated = [];
      
      for (let i = 0; i < body.products.length; i++) {
        const productData = body.products[i];
        
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
          continue; // Skip products with missing required fields
        }
        
        // Format product options from sizes if present
        const options = sizes && sizes.length > 0 
          ? [{ name: 'Size', values: sizes }] 
          : null;

        // Format product variants from sizes if present
        const variants = sizes && sizes.length > 0 
          ? sizes.map((size: string) => ({
              price: parseFloat(price),
              inventory: 10, // Default inventory per variant
              optionValues: { Size: size }
            })) 
          : null;
          
        const mainImage = image || (images && images.length > 0 ? images[0] : null);
        
        // Skip if no image provided
        if (!mainImage) {
          continue;
        }
        
        try {
          const categoryToUse = category || "Uncategorized";
          let categoryId;
          
          try {
            categoryId = await getOrCreateDefaultCategory(categoryToUse);
          } catch (categoryError) {
            continue; // Skip this product but continue with others
          }
          
          try {
            const product = await prisma.product.create({
              data: {
                name,
                description,
                price: parseFloat(price),
                mainImage,
                galleryImages: images && images.length > 1 ? images.slice(1) : [],
                shopId: shop.id,
                categoryId, // Use actual category ID
                sku: null,
                barcode: null,
                tags: [categoryToUse], // Use the category as a tag
                isPublished: true,
                isFeatured: true, // Mark as featured by default for visibility
                inventory: 10, // Default inventory
                lowStockThreshold: 5,
                weight: null,
                options,
                variants,
                favoritedBy: [],
                reviews: null,
              }
            });
            
            productsCreated.push(product);
            
            try {
              await prisma.shop.update({
                where: { id: shop.id },
                data: {
                  featuredProducts: {
                    push: product.id
                  }
                }
              });
            } catch (updateError) {
              // Continue anyway since the product was created
            }
          } catch (productError) {
            // Continue with other products instead of failing completely
          }
        } catch (processingError) {
          // Continue with other products
        }
      }
      
      return NextResponse.json({ 
        message: "Products created successfully", 
        count: productsCreated.length,
        shopId: shop.id,
        products: productsCreated
      });
    } catch (error) {
      return apiError(`Error processing shop products: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
    }
  }

  try {
    // Note: createProductSchema expects `mainImage` but this route receives `image`.
    // Use partial validation to check fields that do match the schema.
    const productValidation = validateBody(
      createProductSchema.partial({ mainImage: true }).passthrough(),
      body
    );
    if (!productValidation.success) {
      return apiError(productValidation.error, 400);
    }

    const {
      name: rawName,
      description: rawDescription,
      price,
      category,
      image,
      images,
      sizes,
      shopId,
    } = body;

    const name = typeof rawName === 'string' ? sanitizeText(rawName) : rawName;
    const description = typeof rawDescription === 'string' ? sanitizeText(rawDescription) : rawDescription;

    const productPrice = typeof price === 'number' ? price : parseFloat(price);

    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
    });

    if (!shop) {
      return apiError("Shop not found", 404);
    }

    if (!canModifyResource(currentUser, shop.userId)) {
      return apiError("Not authorized to add products to this shop", 403);
    }
    
    const categoryToUse = category || "Uncategorized";
    let categoryId;
    
    try {
      categoryId = await getOrCreateDefaultCategory(categoryToUse);
    } catch (categoryError) {
      return apiError(`Failed to get/create category: ${categoryError instanceof Error ? categoryError.message : 'Unknown error'}`, 500);
    }

    // Format product options from sizes if present
    const options = sizes && sizes.length > 0 
      ? [{ name: 'Size', values: sizes }] 
      : null;

    // Format product variants from sizes if present
    const variants = sizes && sizes.length > 0 
      ? sizes.map((size: string) => ({
          price: productPrice,
          inventory: 10, // Default inventory per variant
          optionValues: { Size: size }
        })) 
      : null;

    try {
      const product = await prisma.product.create({
        data: {
          name,
          description,
          price: productPrice,
          mainImage: image || (images && images.length > 0 ? images[0] : null),
          galleryImages: images && images.length > 1 ? images.slice(1) : [],
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
        },
        include: {
          shop: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
        },
      });
      
      try {
        await prisma.shop.update({
          where: { id: shopId },
          data: {
            featuredProducts: {
              push: product.id
            }
          }
        });
      } catch (updateError) {
        // Continue anyway since the product was created
      }

      return NextResponse.json(product);
    } catch (productError) {
      return apiError(`Failed to create product: ${productError instanceof Error ? productError.message : 'Unknown error'}`, 500);
    }
  } catch (error) {
    return apiError(`Internal Server Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
  }
}