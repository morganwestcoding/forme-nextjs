import prisma from "@/app/libs/prismadb";

interface IParams {
  listingId?: string;
}

export default async function getListingById(params: IParams) {
  try {
    const { listingId } = params;

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        user: true,
        services: true,
        employees: true, 
        storeHours: true
      }
    });

    if (!listing) return null;

    return {
      ...listing,
      createdAt: listing.createdAt.toISOString(),
      favoriteIds: [],
      services: listing.services.map(service => ({
        id: service.id,
        serviceName: service.serviceName,
        price: service.price,
        category: service.category,
        imageSrc: service.imageSrc ?? null, // include image
      })),
      employees: listing.employees.map(employee => ({
        id: employee.id,
        fullName: employee.fullName,
        jobTitle: employee.jobTitle || null,
        profileImage: employee.profileImage || null
      })),
      storeHours: listing.storeHours.map(hour => ({
        dayOfWeek: hour.dayOfWeek,
        openTime: hour.openTime,
        closeTime: hour.closeTime,
        isClosed: hour.isClosed
      })),
      galleryImages: listing.galleryImages || [],
      phoneNumber: listing.phoneNumber || null,
      website: listing.website || null,
      address: listing.address || null,
      zipCode: listing.zipCode || null,
      city: listing.location?.split(',')[0]?.trim() || null,
      state: listing.location?.split(',')[1]?.trim() || null,
      user: {
        ...listing.user,
        createdAt: listing.user.createdAt.toISOString(),
        updatedAt: listing.user.updatedAt.toISOString(),
        emailVerified: listing.user.emailVerified?.toISOString() || null,
      }
    };
  } catch (error: any) {
    throw new Error(error);
  }
}
