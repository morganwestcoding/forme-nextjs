import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

interface IParams {
  listingId?: string;
}

interface EmployeeInput {
  userId: string;
  jobTitle?: string;
  serviceIds?: string[];
}

export async function PUT(request: Request, { params }: { params: IParams }) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return new NextResponse("Unauthorized", { status: 401 });

  const { listingId } = params;
  if (!listingId || typeof listingId !== "string") {
    return new NextResponse("Invalid ID", { status: 400 });
  }

  try {
    const body = await request.json();

    // Ensure the listing is owned by the current user
    const owned = await prisma.listing.findFirst({
      where: { id: listingId, userId: currentUser.id },
      include: { services: true },
    });
    if (!owned) {
      return new NextResponse("Unauthorized or listing not found", { status: 403 });
    }

    const incomingServices = Array.isArray(body.services) ? body.services : [];
    const incomingEmployees: EmployeeInput[] = Array.isArray(body.employees) ? body.employees : [];
    const incomingHours = Array.isArray(body.storeHours) ? body.storeHours : [];

    const fresh = await prisma.$transaction(async (tx) => {
      // 1) Update top-level fields
      await tx.listing.update({
        where: { id: listingId },
        data: {
          title: body.title,
          description: body.description,
          imageSrc: body.imageSrc,
          category: body.category,
          location: body.location,
          address: body.address,
          zipCode: body.zipCode,
          phoneNumber: body.phoneNumber,
          website: body.website,
          galleryImages: body.galleryImages,
        },
      });

      // 2) Services: upsert existing, create new (no deletions to avoid reservation conflicts)
      const existingServices = await tx.service.findMany({ where: { listingId } });
      const existingServiceIds = new Set(existingServices.map((s) => s.id));

      for (const s of incomingServices) {
        const priceInt = Math.round(Number(s.price) || 0);
        if (s.id && existingServiceIds.has(s.id)) {
          await tx.service.update({
            where: { id: s.id },
            data: {
              serviceName: s.serviceName,
              price: priceInt,
              category: s.category,
              imageSrc: s.imageSrc ?? null,
            },
          });
        } else {
          await tx.service.create({
            data: {
              serviceName: s.serviceName,
              price: priceInt,
              category: s.category,
              imageSrc: s.imageSrc ?? null,
              listingId,
            },
          });
        }
      }

      // 3) Employees: Validate users exist, then upsert
      if (incomingEmployees.length > 0) {
        const userIds = incomingEmployees.map(emp => emp.userId);
        
        // Validate all users exist
        const existingUsers = await tx.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true }
        });
        
        const existingUserIds = new Set(existingUsers.map(u => u.id));
        const missingUserIds = userIds.filter(id => !existingUserIds.has(id));
        
        if (missingUserIds.length > 0) {
          throw new Error(`Users not found: ${missingUserIds.join(', ')}`);
        }
      }

      const existingEmployees = await tx.employee.findMany({
        where: { listingId },
        include: {
          reservations: { select: { id: true }, take: 1 },
        },
      });

      const existingByUserId = new Map(existingEmployees.map((e) => [e.userId, e]));
      const incomingUserIds = new Set(incomingEmployees.map(emp => emp.userId));

      // Create or update employees
      for (const empInput of incomingEmployees) {
        const existing = existingByUserId.get(empInput.userId);
        
        if (existing) {
          // Update existing employee
          await tx.employee.update({
            where: { id: existing.id },
            data: {
              jobTitle: empInput.jobTitle || null,
              serviceIds: empInput.serviceIds || [],
              isActive: true,
            },
          });
        } else {
          // Create new employee
          await tx.employee.create({
            data: {
              fullName: "", // Will be populated from user data on read
              jobTitle: empInput.jobTitle || null,
              listingId,
              userId: empInput.userId,
              serviceIds: empInput.serviceIds || [],
              isActive: true,
            },
          });
        }
      }

      // Delete employees not in incoming list AND not referenced by reservations
      const deletableIds = existingEmployees
        .filter(
          (e) => !incomingUserIds.has(e.userId) && e.reservations.length === 0
        )
        .map((e) => e.id);

      if (deletableIds.length) {
        await tx.employee.deleteMany({ where: { id: { in: deletableIds } } });
      }

      // 4) Store hours: replace
      await tx.storeHours.deleteMany({ where: { listingId } });
      if (incomingHours.length) {
        await tx.storeHours.createMany({
          data: incomingHours.map((h: any) => ({
            dayOfWeek: h.dayOfWeek,
            openTime: h.openTime,
            closeTime: h.closeTime,
            isClosed: !!h.isClosed,
            listingId,
          })),
        });
      }

      // 5) Return fresh snapshot with user data for employees
      return tx.listing.findUnique({
        where: { id: listingId },
        include: { 
          services: true, 
          employees: {
            include: {
              user: true, // Include user data for SafeEmployee mapping
            },
          }, 
          storeHours: true 
        },
      });
    });

    return NextResponse.json(fresh);
  } catch (error) {
    console.error("[LISTING_UPDATE]", error);
    if (error instanceof Error && error.message.includes("Users not found")) {
      return new NextResponse(error.message, { status: 400 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}