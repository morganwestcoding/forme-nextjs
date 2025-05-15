// app/api/shops/route.ts
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
  } = body;

  console.log("Received fields:", { 
    category, name, description, location, address, zipCode, 
    isOnlineOnly, logo, coverImage, storeUrl, galleryImages, 
    socials, shopEnabled, listingId
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

  // Parse socials if it comes as a string
  let parsedSocials;
  if (socials) {
    try {
      parsedSocials = typeof socials === 'string' ? JSON.parse(socials) : socials;
    } catch (error) {
      return new Response("Invalid socials format", { status: 400 });
    }
  }

  // Parse coordinates if it comes as a string
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
        category,
        logo,
        coverImage: coverImage || null,
        location: isOnlineOnly ? "Online Shop" : location,
        address: address || null,
        zipCode: zipCode || null,
        isOnlineOnly: isOnlineOnly || false,
        coordinates: parsedCoordinates || null,
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

// Keep the rest of your original GET, PUT, DELETE methods unchanged