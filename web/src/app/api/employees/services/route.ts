import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { services } = body;

    if (!services || !Array.isArray(services)) {
      return NextResponse.json({ error: 'Services array required' }, { status: 400 });
    }

    // Find the user's employee record (should be independent worker)
    const employee = await prisma.employee.findFirst({
      where: {
        userId: currentUser.id,
        isIndependent: true,
      },
      include: {
        listing: true,
      }
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee record not found' }, { status: 404 });
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

    const existingServiceIds = new Set(existingServices.map(s => s.id));
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
      .filter(s => !newServiceIds.includes(s.id))
      .map(s => s.id);

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
    console.error('Error updating services:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'UserId required' }, { status: 400 });
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
    const services = employee.listing.services.filter(s =>
      employee.serviceIds.includes(s.id)
    );

    return NextResponse.json({ services });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
