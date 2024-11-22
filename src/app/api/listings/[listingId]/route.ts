import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

interface IParams {
  listingId?: string;
}

export async function DELETE(
  request: Request, 
  { params }: { params: IParams }
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }

  const { listingId } = params;

  if (!listingId || typeof listingId !== 'string') {
    throw new Error('Invalid ID');
  }

  const listing = await prisma.listing.deleteMany({
    where: {
      id: listingId,
      userId: currentUser.id
    }
  });

  return NextResponse.json(listing);
}

export async function PUT(
  request: Request,
  { params }: { params: IParams }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.error();
  }

  const { listingId } = params;
  if (!listingId || typeof listingId !== 'string') {
    throw new Error('Invalid ID');
  }

  try {
    const body = await request.json();

    // Verify listing exists and belongs to user
    const existingListing = await prisma.listing.findUnique({
      where: {
        id: listingId,
        userId: currentUser.id
      }
    });

    if (!existingListing) {
      return new NextResponse("Unauthorized or listing not found", { status: 403 });
    }

    // Update main listing
    const updatedListing = await prisma.listing.update({
      where: {
        id: listingId
      },
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

    // Update services
    await prisma.service.deleteMany({
      where: { listingId }
    });
    
    await prisma.$transaction(
      body.services.map((service: any) => 
        prisma.service.create({
          data: {
            serviceName: service.serviceName,
            price: service.price,
            category: service.category,
            listingId
          }
        })
      )
    );

    // Update employees
    await prisma.employee.deleteMany({
      where: { listingId }
    });

    await prisma.$transaction(
      body.employees.map((employee: string) => 
        prisma.employee.create({
          data: {
            fullName: employee,
            listingId
          }
        })
      )
    );

    // Update store hours
    await prisma.storeHours.deleteMany({
      where: { listingId }
    });

    await prisma.$transaction(
      body.storeHours.map((hours: any) => 
        prisma.storeHours.create({
          data: {
            dayOfWeek: hours.dayOfWeek,
            openTime: hours.openTime,
            closeTime: hours.closeTime,
            isClosed: hours.isClosed,
            listingId
          }
        })
      )
    );

    return NextResponse.json(updatedListing);
  } catch (error) {
    console.error('[LISTING_UPDATE]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}