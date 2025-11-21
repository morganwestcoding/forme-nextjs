import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/app/libs/prismadb";

type CanonicalTier = 'bronze' | 'professional' | 'enterprise';
type UserType = 'customer' | 'individual' | 'team';

function normalizeSubscription(input: unknown): 'bronze' | 'professional' | 'enterprise' {
  const raw = String(input || '').toLowerCase();
  if (raw.includes('diamond') || raw.includes('enterprise')) return 'enterprise';
  if (
    raw.includes('pearl') || raw.includes('civilian') ||
    raw.includes('sapphire') || raw.includes('ruby') || raw.includes('emerald') ||
    raw.includes('silver') || raw.includes('gold') || raw.includes('platinum') ||
    raw.includes('pro') || raw.includes('professional')
  ) return 'professional';
  if (raw.includes('quartz') || raw.includes('basic') || raw.includes('bronze')) return 'bronze';
  return 'bronze';
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      name,
      email,
      password,
      location,
      subscription,
      bio,
      image,
      imageSrc,
      backgroundImage,
      userType,
      selectedListing,
      jobTitle,
      isOwnerManager,
      selectedServices,
      individualServices, // Services array for individual providers
    } = body || {};

    if (!email || !password || !name) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return new NextResponse('Email already exists', { status: 409 });
    }

    // Validate team member data
    if (userType === 'team') {
      // Job title required unless owner/manager (business selection is now optional)
      if (!isOwnerManager && !jobTitle?.trim()) {
        return new NextResponse('Job title required for team members', { status: 400 });
      }

      // Only validate business/services if a listing was selected
      if (selectedListing) {
        const listing = await prisma.listing.findUnique({
          where: { id: selectedListing }
        });

        if (!listing) {
          return new NextResponse('Selected business not found', { status: 400 });
        }

        if (selectedServices && selectedServices.length > 0) {
          const validServices = await prisma.service.findMany({
            where: {
              id: { in: selectedServices },
              listingId: selectedListing
            }
          });

          if (validServices.length !== selectedServices.length) {
            return new NextResponse('Some selected services are invalid', { status: 400 });
          }
        }
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const canonicalTier: CanonicalTier = normalizeSubscription(subscription);
    const isSubscribed = canonicalTier !== 'bronze';

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Create the user first
    const user = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
        location: location ?? '',
        bio: bio ?? '',
        image: image ?? '',
        imageSrc: imageSrc ?? '',
        backgroundImage: backgroundImage ?? '',
        subscriptionTier: subscription ?? 'bronze (customer)',
        isSubscribed,
        managedListings: [], // Initialize as empty array
        ...(isSubscribed && {
          subscriptionStartDate: now,
          subscriptionEndDate: thirtyDaysFromNow
        })
      }
    });

    // Handle team member registration
    if (userType === 'team' && selectedListing) {
      try {
        // Check for existing employee record
        const existingEmployee = await prisma.employee.findFirst({
          where: { 
            userId: user.id,
            listingId: selectedListing
          }
        });

        if (existingEmployee) {
          await prisma.user.delete({ where: { id: user.id } });
          return new NextResponse('You are already registered at this business', { status: 409 });
        }

        // Create employee record - removed profileImage field
        const employee = await prisma.employee.create({
          data: {
            fullName: name,
            jobTitle: isOwnerManager ? 'Owner/Manager' : (jobTitle || ''),
            // profileImage removed - use user.image/imageSrc instead
            listingId: selectedListing,
            userId: user.id,
            serviceIds: selectedServices || [],
            isActive: true,
          }
        });

        // Grant management permissions for owner/manager
        if (isOwnerManager) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              managedListings: [selectedListing] // Set array with the listing ID
            }
          });
        }

        console.log('Employee created:', employee.id);
        
      } catch (employeeError) {
        console.error('Error creating employee record:', employeeError);
        await prisma.user.delete({ where: { id: user.id } });
        return new NextResponse('Failed to create employee record', { status: 500 });
      }
    }

    // For individual providers - create a hidden personal listing with services and worker card
    if (userType === 'individual') {
      try {
        // Create a hidden personal listing (not shown in Listings tab)
        // This maintains referential integrity since services require a listingId
        const listing = await prisma.listing.create({
          data: {
            title: `${name}'s Personal Services`,
            description: bio || 'Professional services',
            imageSrc: image || '',
            category: 'Personal', // Special category to identify personal listings
            location: location || '',
            userId: user.id,
          }
        });

        // Create services if provided during registration
        const serviceIds: string[] = [];
        if (individualServices && Array.isArray(individualServices) && individualServices.length > 0) {
          for (const svc of individualServices) {
            if (svc.serviceName?.trim() && svc.category?.trim() && Number(svc.price) > 0) {
              const createdService = await prisma.service.create({
                data: {
                  serviceName: svc.serviceName.trim(),
                  price: Number(svc.price),
                  category: svc.category.trim(),
                  listingId: listing.id,
                }
              });
              serviceIds.push(createdService.id);
            }
          }
        }

        // Create worker card (Employee record) with isIndependent flag
        await prisma.employee.create({
          data: {
            fullName: name,
            jobTitle: jobTitle || null,
            listingId: listing.id,
            userId: user.id,
            serviceIds: serviceIds, // Link to created services
            isActive: true,
            isIndependent: true, // Mark as independent worker
          }
        });

        console.log('Independent worker card created for:', user.id, 'with', serviceIds.length, 'services');
      } catch (listingError) {
        console.error('Error creating listing/worker card for individual provider:', listingError);
        // Don't fail registration if this fails, just log it
      }
    }

    return NextResponse.json({
      ...user,
      userType: userType || 'customer'
    });
  } catch (err) {
    console.error('REGISTER_ERROR', err);
    return new NextResponse('Internal Error', { status: 500 });
  }
}