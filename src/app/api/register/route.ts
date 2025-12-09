import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/app/libs/prismadb";
import { apiError, apiErrorCode } from "@/app/utils/api";
import { registerSchema, validateBody } from "@/app/utils/validations";

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

    // Validate request body
    const validation = validateBody(registerSchema, body);
    if (!validation.success) {
      return apiError(validation.error, 400);
    }

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
      individualServices,
      // Individual provider listing fields
      listingCategory,
      listingTitle,
      listingDescription,
      listingImage,
    } = validation.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return apiErrorCode('EMAIL_EXISTS');
    }

    // Validate team member data
    if (userType === 'team') {
      // Job title required unless owner/manager (business selection is now optional)
      if (!isOwnerManager && !jobTitle?.trim()) {
        return apiError('Job title required for team members', 400);
      }

      // Only validate business/services if a listing was selected
      if (selectedListing) {
        const listing = await prisma.listing.findUnique({
          where: { id: selectedListing }
        });

        if (!listing) {
          return apiErrorCode('LISTING_NOT_FOUND');
        }

        if (selectedServices && selectedServices.length > 0) {
          const validServices = await prisma.service.findMany({
            where: {
              id: { in: selectedServices },
              listingId: selectedListing
            }
          });

          if (validServices.length !== selectedServices.length) {
            return apiError('Some selected services are invalid', 400);
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
          return apiError('You are already registered at this business', 409);
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
        return apiError('Failed to create employee record', 500);
      }
    }

    // For individual providers - create their listing with services and worker card
    if (userType === 'individual') {
      try {
        // Create the individual's listing (visible in Listings tab)
        const listing = await prisma.listing.create({
          data: {
            title: listingTitle || `${name}'s Services`,
            description: listingDescription || bio || 'Professional services',
            imageSrc: listingImage || image || '',
            category: listingCategory || 'Beauty', // Use selected category, default to Beauty
            location: location || '',
            userId: user.id,
          }
        });

        // Grant management permissions for their own listing
        await prisma.user.update({
          where: { id: user.id },
          data: {
            managedListings: [listing.id]
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
                  imageSrc: svc.imageSrc || null,
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

        console.log('Independent provider listing created:', listing.id, 'with', serviceIds.length, 'services');
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
    return apiErrorCode('INTERNAL_ERROR');
  }
}