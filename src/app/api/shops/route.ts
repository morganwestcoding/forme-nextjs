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
  console.log("Products data:", body.products);

  const {
    category,
    name,
    description,
    location,
    address,
    zipCode,
    isOnlineOnly,
    coordinates,
    logo,
    coverImage,
    storeUrl,
    galleryImages,
    socials,
    shopEnabled,
    listingId,
    products,
  } = body;

  console.log("Received fields:", { 
    category, name, description, location, address, zipCode, 
    isOnlineOnly, logo, coverImage, storeUrl, galleryImages, 
    socials, shopEnabled, listingId, products 
  });

  // Required fields validation
  const requiredFields = { name, description, logo, category };
  const missingFields = Object.entries(requiredFields)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingFields.length > 0) {
    console.log("Missing fields:", missingFields);
    return new Response(`Missing required fields: ${missingFields.join(", ")}`, { status: 400 });
  }

  // Location validation - must have either isOnlineOnly or physical location
  if (!isOnlineOnly && (!address || !zipCode)) {
    return new Response("Physical shops must have address and zip code", { status: 400 });
  }

  let parsedSocials;
  if (socials) {
    try {
      parsedSocials = typeof socials === 'string' ? JSON.parse(socials) : socials;
    } catch (error) {
      return new Response("Invalid socials format", { status: 400 });
    }
  }

  let parsedCoordinates;
  if (coordinates) {
    try {
      parsedCoordinates = typeof coordinates === 'string' ? JSON.parse(coordinates) : coordinates;
    } catch (error) {
      return new Response("Invalid coordinates format", { status: 400 });
    }
  }

  try {
    const shop = await prisma.shop.create({
      data: {
        name,
        description,
        logo,
        coverImage: coverImage || null,
        location: isOnlineOnly ? "Online Shop" : location,
        userId: currentUser.id,
        storeUrl: storeUrl || null,
        socials: parsedSocials || null,
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

    return NextResponse.json(shop);
  } catch (error) {
    console.error("Error creating shop:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const shopId = searchParams.get("shopId");

    let query: any = {};

    if (userId) {
      query.userId = userId;
    }

    if (shopId) {
      query.id = shopId;
    }

    const shops = await prisma.shop.findMany({
      where: query,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        products: {
          take: 4,
          where: {
            isPublished: true,
          },
          select: {
            id: true,
            name: true,
            price: true,
            mainImage: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Add computed fields
    const shopsWithCounts = shops.map((shop) => ({
      ...shop,
      productCount: shop._count.products,
      followerCount: shop.followers.length,
      _count: undefined,
    }));

    return NextResponse.json(shopsWithCounts);
  } catch (error) {
    console.error("Error fetching shops:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function PUT(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const shopId = searchParams.get("id");

  if (!shopId) {
    return new Response("Shop ID is required", { status: 400 });
  }

  // Check if the user owns the shop
  const existingShop = await prisma.shop.findUnique({
    where: { id: shopId },
  });

  if (!existingShop) {
    return new Response("Shop not found", { status: 404 });
  }

  if (existingShop.userId !== currentUser.id) {
    return new Response("Not authorized to update this shop", { status: 403 });
  }

  const body = await request.json();
  console.log("Update request body:", body);

  // Parse any JSON fields that might come as strings
  let parsedSocials = body.socials;
  if (body.socials && typeof body.socials === 'string') {
    try {
      parsedSocials = JSON.parse(body.socials);
    } catch (error) {
      return new Response("Invalid socials format", { status: 400 });
    }
  }

  try {
    const updatedShop = await prisma.shop.update({
      where: { id: shopId },
      data: {
        ...body,
        socials: parsedSocials,
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

    return NextResponse.json(updatedShop);
  } catch (error) {
    console.error("Error updating shop:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const shopId = searchParams.get("id");

  if (!shopId) {
    return new Response("Shop ID is required", { status: 400 });
  }

  // Check if the user owns the shop
  const existingShop = await prisma.shop.findUnique({
    where: { id: shopId },
  });

  if (!existingShop) {
    return new Response("Shop not found", { status: 404 });
  }

  if (existingShop.userId !== currentUser.id) {
    return new Response("Not authorized to delete this shop", { status: 403 });
  }

  try {
    // Delete the shop (this will cascade delete all products)
    await prisma.shop.delete({
      where: { id: shopId },
    });

    return NextResponse.json({ message: "Shop deleted successfully" });
  } catch (error) {
    console.error("Error deleting shop:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}