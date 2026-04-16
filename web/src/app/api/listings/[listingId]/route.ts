// app/api/listings/[listingId]/route.ts - PUT route fix
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";
import { canModifyResource } from "@/app/libs/authorization";
import { apiError, apiErrorCode } from "@/app/utils/api";

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!token) return null;
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${token}&limit=1`
    );
    const data = await res.json();
    if (data.features?.length) {
      const [lng, lat] = data.features[0].center;
      return { lat, lng };
    }
  } catch {}
  return null;
}

interface IParams {
  listingId?: string;
}

interface EmployeeInput {
  userId: string;
  jobTitle?: string;
  serviceIds?: string[];
}

export async function GET(_request: Request, { params }: { params: IParams }) {
  const { listingId } = params;
  if (!listingId) return apiError('Listing ID required', 400);

  const { default: getListingById } = await import('@/app/actions/getListingById');
  const listing = await getListingById({ listingId });
  if (!listing) return apiError('Listing not found', 404);

  return NextResponse.json(listing);
}

export async function PUT(request: Request, { params }: { params: IParams }) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return apiErrorCode('UNAUTHORIZED');

  const { listingId } = params;
  if (!listingId || typeof listingId !== "string") {
    return apiError("Invalid ID", 400);
  }

  try {
    const body = await request.json();

    // Fetch the listing first
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { services: true },
    });

    if (!listing) {
      return apiErrorCode('LISTING_NOT_FOUND');
    }

    // Check if user can modify (owner or master/admin)
    if (!canModifyResource(currentUser, listing.userId)) {
      return apiErrorCode('FORBIDDEN');
    }

    const incomingServices = Array.isArray(body.services) ? body.services : [];
    const incomingEmployees: EmployeeInput[] = Array.isArray(body.employees) ? body.employees : [];
    const incomingHours = Array.isArray(body.storeHours) ? body.storeHours : [];

    // Re-geocode if address or location changed
    const addressChanged = body.address !== listing.address || body.location !== listing.location;
    let coords: { lat: number; lng: number } | null = null;
    if (addressChanged) {
      coords = await geocodeAddress(body.address || body.location || '');
    }

    const fresh = await prisma.$transaction(async (tx: any) => {
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
          ...(addressChanged && coords ? { lat: coords.lat, lng: coords.lng } : {}),
        },
      });

      // 2) Services: upsert existing, create new (no deletions to avoid reservation conflicts)
      const existingServices = await tx.service.findMany({ where: { listingId } });
      const existingServiceIds = new Set(existingServices.map((s: typeof existingServices[number]) => s.id));

      for (const s of incomingServices) {
        const priceInt = Math.round(Number(s.price) || 0);
        if (s.id && existingServiceIds.has(s.id)) {
          await tx.service.update({
            where: { id: s.id },
            data: {
              serviceName: s.serviceName,
              price: priceInt,
              category: s.category,
            },
          });
        } else {
          await tx.service.create({
            data: {
              serviceName: s.serviceName,
              price: priceInt,
              category: s.category,
              listingId,
            },
          });
        }
      }

      // 3) Employees: Validate users exist, fetch names, then upsert
      let employeesWithNames: Array<EmployeeInput & { fullName: string }> = [];
      
      if (incomingEmployees.length > 0) {
        const userIds = incomingEmployees.map((emp: EmployeeInput) => emp.userId);
        
        // Validate all users exist AND get their names
        const existingUsers = await tx.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true }
        });
        
        const existingUserIds = new Set(existingUsers.map((u: typeof existingUsers[number]) => u.id));
        const missingUserIds = userIds.filter((id: string) => !existingUserIds.has(id));
        
        if (missingUserIds.length > 0) {
          throw new Error(`Users not found: ${missingUserIds.join(', ')}`);
        }

        // Create lookup map for user names
        const userNameMap = new Map<string, string>(existingUsers.map((u: typeof existingUsers[number]) => [u.id, u.name || 'Unnamed User']));
        
        // Add fullName to each employee
        employeesWithNames = incomingEmployees.map((emp: EmployeeInput) => ({
          ...emp,
          fullName: userNameMap.get(emp.userId) || 'Unnamed User'
        }));
      }

      const existingEmployees = await tx.employee.findMany({
        where: { listingId },
        include: {
          reservations: { select: { id: true }, take: 1 },
        },
      });

      const existingByUserId = new Map<string, typeof existingEmployees[number]>(existingEmployees.map((e: typeof existingEmployees[number]) => [e.userId, e]));
      const incomingUserIds = new Set(employeesWithNames.map((emp: typeof employeesWithNames[number]) => emp.userId));

      // Create or update employees
      for (const empWithName of employeesWithNames) {
        const existing = existingByUserId.get(empWithName.userId);
        
        if (existing) {
          // Update existing employee (including fullName in case user changed their name)
          await tx.employee.update({
            where: { id: existing.id },
            data: {
              fullName: empWithName.fullName, // Update name in case it changed
              jobTitle: empWithName.jobTitle || null,
              serviceIds: empWithName.serviceIds || [],
              isActive: true,
            },
          });
        } else {
          // Create new employee with proper fullName
          await tx.employee.create({
            data: {
              fullName: empWithName.fullName,
              jobTitle: empWithName.jobTitle || null,
              listingId,
              userId: empWithName.userId,
              serviceIds: empWithName.serviceIds || [],
              isActive: true,
              teamRole: empWithName.userId === listing.userId ? 'owner' : 'staff',
            },
          });
        }
      }

      // Delete employees not in incoming list AND not referenced by reservations
      const deletableIds = existingEmployees
        .filter(
          (e: typeof existingEmployees[number]) => !incomingUserIds.has(e.userId) && e.reservations.length === 0
        )
        .map((e: typeof existingEmployees[number]) => e.id);

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

    // Invalidate server-rendered feeds so WorkerCard/ServiceCard changes
    // show up on Discover, newsfeed, and the listing page itself.
    revalidatePath('/');
    revalidatePath(`/listings/${params.listingId}`);
    revalidatePath('/newsfeed');

    return NextResponse.json(fresh);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Users not found")) {
      return new NextResponse(error.message, { status: 400 });
    }
    return apiErrorCode('INTERNAL_ERROR');
  }
}