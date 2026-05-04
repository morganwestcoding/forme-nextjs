// app/api/listings/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { apiError, apiErrorCode } from "@/app/utils/api";
import { sanitizeText } from "@/app/utils/sanitize";
import { validateBody, createListingSchema } from "@/app/utils/validations";

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const location = searchParams.get('location');
  const userId = searchParams.get('userId');
  const includeAcademy = searchParams.get('includeAcademy') === 'true';
  // When true and userId is set, also return listings where the user is an
  // employee (not just the owner). Used by the Team view so employees see
  // the listing they work at.
  const includeEmployed = searchParams.get('includeEmployed') === 'true';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const skip = (page - 1) * limit;

  const where: any = {};
  if (category) where.category = category;
  if (location) where.location = { contains: location, mode: 'insensitive' };
  if (userId) {
    if (includeEmployed) {
      where.OR = [
        { userId },
        { employees: { some: { userId } } },
      ];
    } else {
      where.userId = userId;
    }
  }
  // Hide academy-owned listings from public discovery by default.
  // (See getListings.ts for the Mongo `isSet: false` rationale.)
  if (!includeAcademy) where.academyId = { isSet: false };

  // Hide hidden "shell" listings auto-created for independent providers —
  // they're internal containers, not real storefronts. (See getListings.ts.)
  where.employees = { none: { isIndependent: true } };

  try {
    const [listings, totalCount] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          services: true,
          employees: { include: { user: { select: { id: true, name: true, image: true, userType: true, academy: { select: { name: true } } } } } },
          storeHours: true,
          user: { select: { id: true, name: true, image: true, verificationStatus: true } },
        },
      }),
      prisma.listing.count({ where }),
    ]);

    // Map employee.user.academy.name → employee.user.academyName so WorkerCard can read it
    const mapped = listings.map((l: any) => ({
      ...l,
      employees: (l.employees || []).map((e: any) => ({
        ...e,
        user: {
          ...e.user,
          academyName: e.user?.academy?.name ?? null,
        },
      })),
    }));

    return NextResponse.json({
      listings: mapped,
      totalCount,
      hasMore: skip + listings.length < totalCount,
    });
  } catch (error) {
    return new Response('Internal Server Error', { status: 500 });
  }
}

interface EmployeeInput {
  userId: string;
  jobTitle?: string;
  serviceIds?: string[];
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return apiErrorCode('UNAUTHORIZED');

  const body = await request.json();
  const validation = validateBody(createListingSchema, body);
  if (!validation.success) {
    return apiError(validation.error, 400);
  }

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
  } = validation.data;

  const sanitizedTitle = sanitizeText(title);
  const sanitizedDescription = sanitizeText(description);

  // Validate employees format - now expects EmployeeInput[] instead of string[]
  if (!Array.isArray(employees)) {
    return apiError("Employees must be an array", 400);
  }

  // Validate each employee has required userId
  const invalidEmployees = employees.filter((emp: any) => !emp.userId || typeof emp.userId !== 'string');
  if (invalidEmployees.length > 0) {
    return apiError("Invalid employee data - missing userId", 400);
  }

  let parsedServices = services;
  if (typeof services === 'string') {
    try { parsedServices = JSON.parse(services); } catch { return apiError("Invalid services format", 400); }
  }

  let parsedStoreHours = storeHours;
  if (typeof storeHours === 'string') {
    try { parsedStoreHours = JSON.parse(storeHours); } catch { return apiError("Invalid store hours format", 400); }
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
      
      const existingUserIds = new Set(existingUsers.map((u: typeof existingUsers[number]) => u.id));
      const missingUserIds = userIds.filter((id: string) => !existingUserIds.has(id));
      
      if (missingUserIds.length > 0) {
        return new Response(`Users not found: ${missingUserIds.join(', ')}`, { status: 400 });
      }

      // Create lookup map for user names
      const userNameMap = new Map<string, string>(existingUsers.map((u: typeof existingUsers[number]) => [u.id, u.name || 'Unnamed User']));
      
      // Add fullName to each employee
      employeesWithNames = employees.map((emp: EmployeeInput) => ({
        ...emp,
        fullName: userNameMap.get(emp.userId) || 'Unnamed User'
      }));
    }

    // Geocode the address for map coordinates
    const coords = await geocodeAddress(address || location || '');

    const listing = await prisma.listing.create({
      data: {
        title: sanitizedTitle,
        description: sanitizedDescription,
        imageSrc,
        category,
        galleryImages: galleryImages || [],
        location,
        userId: currentUser.id,
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,

        services: {
          create: (parsedServices || []).map((s: any) => {
            const dur = Number(s.durationMinutes ?? s.duration);
            return {
              serviceName: s.serviceName,
              price: Math.round(Number(s.price) || 0),
              category: s.category,
              ...(Number.isFinite(dur) && dur > 0 ? { durationMinutes: Math.round(dur) } : {}),
            };
          }),
        },

        phoneNumber,  
        website,      
        address,
        zipCode,

        employees: {
          create: employeesWithNames.map((employee: typeof employeesWithNames[number]) => ({
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
    if (error instanceof Error && error.message.includes("Users not found")) {
      return new Response(error.message, { status: 400 });
    }
    return apiErrorCode('INTERNAL_ERROR');
  }
}
