import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { canModifyResource } from "@/app/libs/authorization";

// Function to get or create a default category
async function getOrCreateDefaultCategory(categoryName: string) {
  console.log(`[DEBUG] Finding or creating category: ${categoryName}`);
  
  try {
    // Try to find an existing category with this name
    let category = await prisma.productCategory.findFirst({
      where: { name: categoryName }
    });
    
    if (category) {
      console.log(`[DEBUG] Found existing category: ${categoryName} with ID: ${category.id}`);
      return category.id;
    }
    
    // If no category exists, create a default one
    console.log(`[DEBUG] No category found, creating new one: ${categoryName}`);
    category = await prisma.productCategory.create({
      data: {
        name: categoryName,
        description: `Default category for ${categoryName} products`
      }
    });
    console.log(`[DEBUG] Created new category: ${categoryName} with ID: ${category.id}`);
    return category.id;
  } catch (error) {
    console.error(`[ERROR] Error in getOrCreateDefaultCategory for ${categoryName}:`, error);
    throw error; // Re-throw to be caught by the caller
  }
}

export async function POST(request: Request) {
  console.log("[DEBUG] Starting POST request to /api/products");
  
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    console.log("[DEBUG] Unauthorized - No current user");
    return new Response("Unauthorized", { status: 401 });
  }
  
  console.log(`[DEBUG] User authenticated: ${currentUser.id}`);
  
  let body;
  try {
    body = await request.json();
    console.log("[DEBUG] Request body parsed successfully");
  } catch (error) {
    console.error("[ERROR] Failed to parse request body:", error);
    return new Response("Invalid request body", { status: 400 });
  }

  // Check if we're handling a shop with embedded products
  const isShopWithProducts = body.name && !body.shopId && body.products && Array.isArray(body.products);
  console.log(`[DEBUG] Is this a shop with embedded products? ${isShopWithProducts}`);
  
  if (isShopWithProducts) {
    console.log("[DEBUG] Processing shop with embedded products");
    console.log(`[DEBUG] Products in payload: ${body.products.length}`);
    
    try {
      // First, create the shop if it doesn't exist
      let shop;
      
      if (body.id) {
        console.log(`[DEBUG] Looking up existing shop with ID: ${body.id}`);
        // If shop ID is provided, find the shop
        shop = await prisma.shop.findUnique({
          where: { id: body.id }
        });
        
        if (!shop) {
          console.log(`[DEBUG] Shop not found with ID: ${body.id}`);
          return new Response("Shop not found", { status: 404 });
        }
        
        // Verify ownership (owner or master/admin)
        if (!canModifyResource(currentUser, shop.userId)) {
          console.log(`[DEBUG] Not authorized - Shop belongs to ${shop.userId}, not ${currentUser.id}`);
          return new Response("Not authorized to modify this shop", { status: 403 });
        }
        
        console.log(`[DEBUG] Found existing shop: ${shop.id}`);
      } else {
        // Create new shop with the products included
        console.log("[DEBUG] Creating new shop");
        
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
          console.log(`[DEBUG] Successfully created shop with ID: ${shop.id}`);
        } catch (shopError) {
          console.error("[ERROR] Failed to create shop:", shopError);
          return new Response(`Failed to create shop: ${shopError instanceof Error ? shopError.message : 'Unknown error'}`, { status: 500 });
        }
      }
      
      // Process each product from the embedded products array
      console.log(`[DEBUG] Beginning product creation for ${body.products.length} products`);
      const productsCreated = [];
      
      for (let i = 0; i < body.products.length; i++) {
        const productData = body.products[i];
        console.log(`[DEBUG] Processing product ${i+1}/${body.products.length}: ${productData.name}`);
        
        const {
          name,
          description,
          price,
          category,
          image,
          images,
          sizes
        } = productData;
        
        // Log all product details
        console.log(`[DEBUG] Product details:`, {
          name,
          description,
          price,
          category,
          imageAvailable: !!image,
          imagesCount: images?.length,
          sizesCount: sizes?.length
        });
        
        if (!name || !description || !price) {
          console.log(`[DEBUG] Skipping product due to missing required fields: ${JSON.stringify(productData)}`);
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
          console.log(`[DEBUG] Skipping product ${name} due to missing image`);
          continue;
        }
        
        try {
          // Get or create a default category
          console.log(`[DEBUG] Getting or creating category for: ${category || "Uncategorized"}`);
          const categoryToUse = category || "Uncategorized";
          let categoryId;
          
          try {
            categoryId = await getOrCreateDefaultCategory(categoryToUse);
            console.log(`[DEBUG] Using category: ${categoryToUse} with ID: ${categoryId}`);
          } catch (categoryError) {
            console.error(`[ERROR] Failed to get/create category ${categoryToUse}:`, categoryError);
            continue; // Skip this product but continue with others
          }
          
          // Create the product with required shopId and categoryId
          console.log(`[DEBUG] Creating product: ${name} with shopId: ${shop.id}, categoryId: ${categoryId}`);
          
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
            
            console.log(`[DEBUG] Successfully created product with ID: ${product.id}`);
            productsCreated.push(product);
            
            // Update the shop's featuredProducts array to include this product
            console.log(`[DEBUG] Updating shop's featuredProducts array with product ${product.id}`);
            
            try {
              await prisma.shop.update({
                where: { id: shop.id },
                data: {
                  featuredProducts: {
                    push: product.id
                  }
                }
              });
              console.log(`[DEBUG] Successfully updated shop's featuredProducts`);
            } catch (updateError) {
              console.error(`[ERROR] Failed to update shop's featuredProducts:`, updateError);
              // Continue anyway since the product was created
            }
          } catch (productError) {
            console.error(`[ERROR] Failed to create product ${name}:`, productError);
            // Continue with other products instead of failing completely
          }
        } catch (processingError) {
          console.error(`[ERROR] Error processing product ${name}:`, processingError);
          // Continue with other products
        }
      }
      
      console.log(`[DEBUG] Product creation complete. Created ${productsCreated.length} out of ${body.products.length} products`);
      
      return NextResponse.json({ 
        message: "Products created successfully", 
        count: productsCreated.length,
        shopId: shop.id,
        products: productsCreated
      });
    } catch (error) {
      console.error("[ERROR] Error processing shop products:", error);
      return new Response(`Error processing shop products: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
    }
  }

  // Handle direct product submission
  console.log("[DEBUG] Processing direct product submission");
  
  try {
    const {
      name,
      description,
      price,
      category,
      image,
      images,
      sizes,
      shopId,
    } = body;

    console.log("[DEBUG] Direct product submission details:", { 
      name, 
      description, 
      price, 
      category, 
      imageAvailable: !!image,
      imagesCount: images?.length,
      sizesCount: sizes?.length,
      shopId
    });

    // Required fields validation
    const requiredFields = { name, description, price, image: image || (images && images.length > 0 ? images[0] : null), shopId };
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      console.log(`[DEBUG] Missing required fields: ${missingFields.join(", ")}`);
      return new Response(`Missing required fields: ${missingFields.join(", ")}`, { status: 400 });
    }

    // Validate price format
    const productPrice = parseFloat(price);
    if (isNaN(productPrice) || productPrice < 0) {
      console.log(`[DEBUG] Invalid price format: ${price}`);
      return new Response("Invalid price format", { status: 400 });
    }

    // Check if the user owns the shop
    console.log(`[DEBUG] Checking if user owns shop: ${shopId}`);
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
    });

    if (!shop) {
      console.log(`[DEBUG] Shop not found: ${shopId}`);
      return new Response("Shop not found", { status: 404 });
    }

    // Check if user can modify (owner or master/admin)
    if (!canModifyResource(currentUser, shop.userId)) {
      console.log(`[DEBUG] User ${currentUser.id} does not own shop ${shopId} (owned by ${shop.userId})`);
      return new Response("Not authorized to add products to this shop", { status: 403 });
    }
    
    // Get or create a default category
    console.log(`[DEBUG] Getting or creating category for: ${category || "Uncategorized"}`);
    const categoryToUse = category || "Uncategorized";
    let categoryId;
    
    try {
      categoryId = await getOrCreateDefaultCategory(categoryToUse);
      console.log(`[DEBUG] Using category ID: ${categoryId}`);
    } catch (categoryError) {
      console.error(`[ERROR] Failed to get/create category:`, categoryError);
      return new Response(`Failed to get/create category: ${categoryError instanceof Error ? categoryError.message : 'Unknown error'}`, { status: 500 });
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

    // Create the product
    console.log(`[DEBUG] Creating product with shopId: ${shopId}, categoryId: ${categoryId}`);
    
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
      
      console.log(`[DEBUG] Successfully created product with ID: ${product.id}`);

      // Update the shop's featuredProducts array
      console.log(`[DEBUG] Updating shop's featuredProducts array with product ${product.id}`);
      
      try {
        await prisma.shop.update({
          where: { id: shopId },
          data: {
            featuredProducts: {
              push: product.id
            }
          }
        });
        console.log(`[DEBUG] Successfully updated shop's featuredProducts`);
      } catch (updateError) {
        console.error(`[ERROR] Failed to update shop's featuredProducts:`, updateError);
        // Continue anyway since the product was created
      }

      return NextResponse.json(product);
    } catch (productError) {
      console.error(`[ERROR] Failed to create product:`, productError);
      return new Response(`Failed to create product: ${productError instanceof Error ? productError.message : 'Unknown error'}`, { status: 500 });
    }
  } catch (error) {
    console.error("[ERROR] Error in direct product creation:", error);
    return new Response(`Internal Server Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
}