import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {
  
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json();

  const {
    title,
    description,
    imageSrc,
    category,
    location,
    services,
    phoneNumber,  
    website,      
    address,      
  } = body;


  console.log("Received fields:", { title, description, imageSrc, category, location, services, phoneNumber, website, address });


  const requiredFields = [title, description, imageSrc, category, location, services];
const missingFields = requiredFields.filter((field) => !field);
if (missingFields.length > 0) {
  console.log("Missing fields:", missingFields);
  return new Response(`Missing required fields: ${missingFields.join(", ")}`, { status: 400 });
}

  let parsedServices;
  try {
    parsedServices = typeof services === 'string' ? JSON.parse(services) : services;
  } catch (error) {
    return new Response("Invalid services format", { status: 400 });
  }

  try {
    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        imageSrc,
        category,
        location,
        userId: currentUser.id,
        services: {
        create: parsedServices, // Nested write for services
        },
        phoneNumber,  
        website,      
        address,      
      },
    });

    return NextResponse.json(listing);
  } catch (error) {
    console.error("Error creating listing:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
