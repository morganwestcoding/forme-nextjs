// app/api/listings/route.ts - POST route fix
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

interface EmployeeInput {
  userId: string;
  jobTitle?: string;
  serviceIds?: string[];
}

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

  // Validate employees format - now expects EmployeeInput[] instead of string[]
  if (!Array.isArray(employees)) {
    return new Response("Employees must be an array", { status: 400 });
  }

  // Validate each employee has required userId
  const invalidEmployees = employees.filter((emp: any) => !emp.userId || typeof emp.userId !== 'string');
  if (invalidEmployees.length > 0) {
    return new Response("Invalid employee data - missing userId", { status: 400 });
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
    // Validate all employee users exist before creating listing AND fetch their names
    let employeesWithNames: Array<EmployeeInput & { fullName: string }> = [];
    
    if (employees.length > 0) {
      const userIds = employees.map((emp: EmployeeInput) => emp.userId);
      const existingUsers = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true }
      });
      
      const existingUserIds = new Set(existingUsers.map(u => u.id));
      const missingUserIds = userIds.filter(id => !existingUserIds.has(id));
      
      if (missingUserIds.length > 0) {
        return new Response(`Users not found: ${missingUserIds.join(', ')}`, { status: 400 });
      }

      // Create lookup map for user names
      const userNameMap = new Map(existingUsers.map(u => [u.id, u.name || 'Unnamed User']));
      
      // Add fullName to each employee
      employeesWithNames = employees.map((emp: EmployeeInput) => ({
        ...emp,
        fullName: userNameMap.get(emp.userId) || 'Unnamed User'
      }));
    }

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
            category: s.category
          })),
        },

        phoneNumber,  
        website,      
        address,
        zipCode,

        employees: {
          create: employeesWithNames.map((employee) => ({
            fullName: employee.fullName, // Now properly populated!
            jobTitle: employee.jobTitle || null,
            userId: employee.userId,
            serviceIds: employee.serviceIds || [],
            isActive: true,
          })),
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
        employees: {
          include: {
            user: true, // Include user data for proper response
          },
        },
        storeHours: true
      }
    });

    return NextResponse.json(listing);
  } catch (error) {
    console.error("Error creating listing:", error);
    if (error instanceof Error && error.message.includes("Users not found")) {
      return new Response(error.message, { status: 400 });
    }
    return new Response("Internal Server Error", { status: 500 });
  }
}
