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
    coordinates,
    storeUrl,
    galleryImages,
    socials,
    shopEnabled,
    listingId,
  } = body;

  console.log("Received fields:", { 
    name, description, category, logo, coverImage, location, 
    address, zipCode, isOnlineOnly, storeUrl, galleryImages, socials
  });

  const requiredFields = [ name, description, logo ];
  
  const missingFields = requiredFields.filter((field) => !field);
  if (missingFields.length > 0) {
    console.log("Missing fields:", missingFields);
    return new Response(`Missing required fields: ${missingFields.join(", ")}`, { status: 400 });
  }

  let parsedSocials;
  try {
    parsedSocials = typeof socials === 'string' ? JSON.parse(socials) : socials;
  } catch (error) {
    return new Response("Invalid socials format", { status: 400 });
  }

  let parsedCoordinates;
  try {
    parsedCoordinates = typeof coordinates === 'string' ? JSON.parse(coordinates) : coordinates;
  } catch (error) {
    return new Response("Invalid coordinates format", { status: 400 });
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