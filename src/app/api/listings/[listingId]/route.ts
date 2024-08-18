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

export async function PATCH(
  request: Request,
  { params }: { params: IParams }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { listingId } = params;
  if (!listingId || typeof listingId !== 'string') {
    return new NextResponse("Invalid listing ID", { status: 400 });
  }

  const body = await request.json();
  const { action, image, imageIndex } = body;

  try {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return new NextResponse("Listing not found", { status: 404 });
    }

    if (listing.userId !== currentUser.id) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    let updatedListing;

    switch (action) {
      case "addImage":
        if (!image) {
          return new NextResponse("Image URL is required", { status: 400 });
        }
        updatedListing = await prisma.listing.update({
          where: { id: listingId },
          data: {
            galleryImages: {
              push: image,
            },
          },
        });
        break;

      case "removeImage":
        if (imageIndex === undefined) {
          return new NextResponse("Image index is required", { status: 400 });
        }
        const updatedImages = listing.galleryImages.filter((_, index) => index !== imageIndex);
        updatedListing = await prisma.listing.update({
          where: { id: listingId },
          data: {
            galleryImages: updatedImages,
          },
        });
        break;

      default:
        return new NextResponse("Invalid action", { status: 400 });
    }

    return NextResponse.json(updatedListing);
  } catch (error) {
    console.error("Error updating listing:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}