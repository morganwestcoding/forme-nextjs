import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {
  
  // Get current user and validate
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json();

  // Destructure and validate body content
  const {
    title,
    description,
    imageSrc,
    category,
    state, // Now using state
    city, // and city fields
    services,
  
  } = body;

  const validatedState = typeof state === 'number' ? state.toString() : state;
  const validatedCity = typeof city === 'number' ? city.toString() : city;

  console.log("Received fields:", { title, description, imageSrc, category, state, city, services, });



  // Validate required fields
  const requiredFields = [title, description, imageSrc, category, state, city, services];
const missingFields = requiredFields.filter((field) => !field);
if (missingFields.length > 0) {
  console.log("Missing fields:", missingFields);
  return new Response(`Missing required fields: ${missingFields.join(", ")}`, { status: 400 });
}



  // Convert services to the correct format if necessary
  // Assuming services should be an array of objects
  let parsedServices;
  try {
    parsedServices = typeof services === 'string' ? JSON.parse(services) : services;
  } catch (error) {
    return new Response("Invalid services format", { status: 400 });
  }

  // Create the listing
  try {
    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        imageSrc,
        category,
        state: validatedState,
        city: validatedCity,
        userId: currentUser.id,
        services: {
          create: parsedServices, // Nested write for services
        },
      },
    });

    return NextResponse.json(listing);
  } catch (error) {
    console.error("Error creating listing:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
