import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

interface IParams {
  listingId?: string;
}

export async function PUT(
  request: Request,
  { params }: { params: IParams }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.error();

  const { listingId } = params;
  if (!listingId || typeof listingId !== 'string') throw new Error('Invalid ID');

  try {
    const body = await request.json();

    // Make sure the listing belongs to the user
    const existingListing = await prisma.listing.findFirst({
      where: { id: listingId, userId: currentUser.id },
      include: { services: true }
    });
    if (!existingListing) {
      return new NextResponse("Unauthorized or listing not found", { status: 403 });
    }

    // Update top-level listing fields first
    await prisma.listing.update({
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
      }
    });

    // ---- Services: upsert instead of delete+recreate (prevents P2014)
    const incomingServices = Array.isArray(body.services) ? body.services : [];
    const existingById = new Map(existingListing.services.map(s => [s.id, s]));

    const tx: any[] = [];

    for (const s of incomingServices) {
      const priceInt = Math.round(Number(s.price) || 0);
      if (s.id && existingById.has(s.id)) {
        // update
        tx.push(
          prisma.service.update({
            where: { id: s.id },
            data: {
              serviceName: s.serviceName,
              price: priceInt,
              category: s.category,
              imageSrc: s.imageSrc ?? null,
            }
          })
        );
      } else {
        // create
        tx.push(
          prisma.service.create({
            data: {
              serviceName: s.serviceName,
              price: priceInt,
              category: s.category,
              imageSrc: s.imageSrc ?? null,
              listingId
            }
          })
        );
      }
    }

    // NOTE: We intentionally DO NOT delete services here to avoid P2014 with reservations.
    // If you want deletions, either soft-delete or only delete services with no reservations:
    // const toKeepIds = new Set(incomingServices.filter((x:any)=>x.id).map((x:any)=>x.id));
    // const deletable = await prisma.service.findMany({ where: { listingId, id: { notIn: [...toKeepIds] }, reservations: { none: {} } }});
    // tx.push(prisma.service.deleteMany({ where: { id: { in: deletable.map(d=>d.id) } } }));

    // ---- Employees (recreate as before)
    await prisma.employee.deleteMany({ where: { listingId } });
    tx.push(
      ...((body.employees || []) as string[]).map(emp =>
        prisma.employee.create({ data: { fullName: (emp || '').trim(), listingId } })
      )
    );

    // ---- Store hours (recreate as before)
    await prisma.storeHours.deleteMany({ where: { listingId } });
    tx.push(
      ...((body.storeHours || []) as any[]).map(hours =>
        prisma.storeHours.create({
          data: {
            dayOfWeek: hours.dayOfWeek,
            openTime: hours.openTime,
            closeTime: hours.closeTime,
            isClosed: !!hours.isClosed,
            listingId
          }
        })
      )
    );

    await prisma.$transaction(tx);

    // Return fresh listing snapshot including services (with updated imageSrc)
    const fresh = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { services: true, employees: true, storeHours: true }
    });

    return NextResponse.json(fresh);
  } catch (error) {
    console.error('[LISTING_UPDATE]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
