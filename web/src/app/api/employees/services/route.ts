import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { apiError, apiErrorCode } from '@/app/utils/api';

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return apiErrorCode('UNAUTHORIZED');
    }

    const body = await request.json();
    const { services } = body;

    if (!services || !Array.isArray(services)) {
      return apiError('Services array required', 400);
    }

    // Find the user's employee record (should be independent worker).
    // Independents have no listing/employee at registration — both are
    // lazy-created here on first call so services have somewhere to attach.
    let employee = await prisma.employee.findFirst({
      where: {
        userId: currentUser.id,
        isIndependent: true,
      },
      include: {
        listing: true,
      }
    });

    if (!employee) {
      if (currentUser.userType !== 'individual') {
        return apiError('Employee record not found', 404);
      }

      const listing = await prisma.listing.create({
        data: {
          title: `${currentUser.name || 'Independent'}'s Services`,
          description: currentUser.bio || '',
          imageSrc: currentUser.image || '',
          category: 'Beauty',
          location: currentUser.location || '',
          userId: currentUser.id,
        },
      });

      await prisma.user.update({
        where: { id: currentUser.id },
        data: { managedListings: { set: [listing.id] } },
      });

      employee = await prisma.employee.create({
        data: {
          fullName: currentUser.name || 'Independent',
          jobTitle: currentUser.jobTitle || null,
          listingId: listing.id,
          userId: currentUser.id,
          serviceIds: [],
          isActive: true,
          isIndependent: true,
          teamRole: 'owner',
        },
        include: { listing: true },
      });
    }

    // Filter valid services
    const validServices = services.filter((s: any) =>
      s.serviceName?.trim() &&
      s.category?.trim() &&
      Number(s.price) > 0
    );

    // Get existing services for this employee's listing
    const existingServices = await prisma.service.findMany({
      where: {
        listingId: employee.listingId,
      }
    });

    const existingServiceIds = new Set(existingServices.map((s: typeof existingServices[number]) => s.id));
    const newServiceIds: string[] = [];

    // Process each service
    for (const svc of validServices) {
      if (svc.id && existingServiceIds.has(svc.id)) {
        // Update existing service
        await prisma.service.update({
          where: { id: svc.id },
          data: {
            serviceName: svc.serviceName.trim(),
            price: Number(svc.price),
            category: svc.category.trim(),
          }
        });
        newServiceIds.push(svc.id);
      } else {
        // Create new service
        const created = await prisma.service.create({
          data: {
            serviceName: svc.serviceName.trim(),
            price: Number(svc.price),
            category: svc.category.trim(),
            listingId: employee.listingId,
          }
        });
        newServiceIds.push(created.id);
      }
    }

    // Update employee's serviceIds
    await prisma.employee.update({
      where: { id: employee.id },
      data: {
        serviceIds: newServiceIds,
      }
    });

    // Delete services that are no longer referenced
    const servicesToDelete = existingServices
      .filter((s: typeof existingServices[number]) => !newServiceIds.includes(s.id))
      .map((s: typeof existingServices[number]) => s.id);

    if (servicesToDelete.length > 0) {
      await prisma.service.deleteMany({
        where: {
          id: { in: servicesToDelete },
          listingId: employee.listingId,
        }
      });
    }

    // Fetch updated services
    const updatedServices = await prisma.service.findMany({
      where: {
        listingId: employee.listingId,
      }
    });

    return NextResponse.json({
      success: true,
      services: updatedServices,
    });
  } catch (error) {
    return apiErrorCode('INTERNAL_ERROR');
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return apiError('UserId required', 400);
    }

    // Find the employee record for this user
    const employee = await prisma.employee.findFirst({
      where: {
        userId: userId,
        isIndependent: true,
      },
      include: {
        listing: {
          include: {
            services: true,
          }
        }
      }
    });

    if (!employee) {
      return NextResponse.json({ services: [] });
    }

    // Filter services by the employee's serviceIds
    const services = employee.listing.services.filter((s: typeof employee.listing.services[number]) =>
      employee.serviceIds.includes(s.id)
    );

    return NextResponse.json({ services });
  } catch (error) {
    return apiErrorCode('INTERNAL_ERROR');
  }
}
