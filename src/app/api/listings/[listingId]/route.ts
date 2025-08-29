import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

interface IParams {
  listingId?: string;
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
    const incomingEmployees: string[] = (Array.isArray(body.employees) ? body.employees : [])
      .map((n: string) => (n || "").trim())
      .filter(Boolean);
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

      // 3) Employees: upsert by normalized name; delete only if unused (avoid P2014)
      const existingEmployees = await tx.employee.findMany({
        where: { listingId },
        include: {
          reservations: { select: { id: true }, take: 1 },
        },
      });

      const norm = (s: string) => s.trim().toLowerCase();
      const existingByName = new Map(existingEmployees.map((e) => [norm(e.fullName), e]));

      // create / update names
      for (const name of incomingEmployees) {
        const key = norm(name);
        const existing = existingByName.get(key);
        if (existing) {
          // normalize case-only changes
          if (existing.fullName !== name) {
            await tx.employee.update({
              where: { id: existing.id },
              data: { fullName: name },
            });
          }
        } else {
          await tx.employee.create({
            data: { fullName: name, listingId },
          });
        }
      }

      // delete employees not present anymore AND not referenced by reservations
      const deletableIds = existingEmployees
        .filter(
          (e) => !incomingEmployees.some((n) => norm(n) === norm(e.fullName)) && e.reservations.length === 0
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

      // 5) Return fresh snapshot
      return tx.listing.findUnique({
        where: { id: listingId },
        include: { services: true, employees: true, storeHours: true },
      });
    });

    return NextResponse.json(fresh);
  } catch (error) {
    console.error("[LISTING_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
