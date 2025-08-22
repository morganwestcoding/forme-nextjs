import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return new Response("Unauthorized", { status: 401 });

  const body = await request.json();

  const {
    title,
    description,
    imageSrc,
    category,
    location,
    services,
    phoneNumber, 
    galleryImages, 
    website,      
    address,
    zipCode,
    employees,
    storeHours,
  } = body;

  const required = [ title, description, imageSrc, category, location, services, address, zipCode, storeHours, galleryImages ];
  const missing = required.filter((f) => !f);
  if (missing.length) {
    return new Response(`Missing required fields: ${missing.join(", ")}`, { status: 400 });
  }

  if (!Array.isArray(employees) || employees.some((emp: any) => typeof emp !== 'string' || !emp.trim())) {
    return new Response("Invalid employees data", { status: 400 });
  }

  let parsedServices = services;
  if (typeof services === 'string') {
    try { parsedServices = JSON.parse(services); } catch { return new Response("Invalid services format", { status: 400 }); }
  }

  let parsedStoreHours = storeHours;
  if (typeof storeHours === 'string') {
    try { parsedStoreHours = JSON.parse(storeHours); } catch { return new Response("Invalid store hours format", { status: 400 }); }
  }

  try {
    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        imageSrc,
        category,
        galleryImages: galleryImages || [],
        location,
        userId: currentUser.id,

        services: {
          create: (parsedServices || []).map((s: any) => ({
            serviceName: s.serviceName,
            price: Math.round(Number(s.price) || 0),
            category: s.category,
            imageSrc: s.imageSrc ?? null,
          })),
        },

        phoneNumber,  
        website,      
        address,
        zipCode,

        employees: {
          create: (employees || [])
            .filter((emp: string) => (emp || '').trim())
            .map((employee: string) => ({ fullName: employee.trim() })),
        },

        storeHours: {
          create: (parsedStoreHours || []).map((hour: any) => ({
            dayOfWeek: hour.dayOfWeek,
            openTime: hour.openTime,
            closeTime: hour.closeTime,
            isClosed: !!hour.isClosed
          }))
        }
      },
      include: {
        services: true,
        employees: true,
        storeHours: true
      }
    });

    return NextResponse.json(listing);
  } catch (error) {
    console.error("Error creating listing:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
