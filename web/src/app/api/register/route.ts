import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/app/libs/prismadb";
import { apiError, apiErrorCode } from "@/app/utils/api";
import { registerSchema, validateBody } from "@/app/utils/validations";
import { signMobileToken } from "@/app/utils/mobileAuth";
import { createRateLimiter, getIP } from "@/app/libs/rateLimit";
import { sendEmail, welcomeEmail } from "@/app/libs/email";

const limiter = createRateLimiter("register", { limit: 5, windowSeconds: 3600 });

type CanonicalTier = 'bronze' | 'professional' | 'enterprise';
type UserType = 'customer' | 'individual' | 'team' | 'student';

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
    const ip = getIP(request);
    const rate = limiter(ip);
    if (!rate.allowed) {
      return apiError(`Too many registration attempts. Try again in ${rate.retryAfterSeconds}s`, 429);
    }

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
      // Student fields
      academyId,
    } = validation.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return apiErrorCode('EMAIL_EXISTS');
    }

    // Validate student data
    let studentAcademy: Awaited<ReturnType<typeof prisma.academy.findUnique>> = null;
    let studentAcademyListing: Awaited<ReturnType<typeof prisma.listing.findFirst>> = null;
    if (userType === 'student') {
      if (!academyId?.trim()) {
        return apiError('Academy is required for students', 400);
      }
      studentAcademy = await prisma.academy.findUnique({ where: { id: academyId } });
      if (!studentAcademy) {
        return apiError('Selected academy not found', 404);
      }
      // Each academy must have a Listing for students to be Employees of.
      // The seed creates this, but guard for missing data anyway.
      studentAcademyListing = await prisma.listing.findFirst({
        where: { academyId: studentAcademy.id },
      });
      if (!studentAcademyListing) {
        return apiError(
          'This academy is not yet set up to accept students. Please contact support.',
          400
        );
      }
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
    const isStudent = userType === 'student';
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
        // Students get a sponsored "student" tier (free, not Stripe-backed)
        // and skip the subscription page entirely.
        subscriptionTier: isStudent ? 'student' : (subscription ?? 'bronze (customer)'),
        isSubscribed: isStudent ? false : isSubscribed,
        managedListings: [], // Initialize as empty array
        // Student fields
        userType: userType ?? null,
        academyId: isStudent ? studentAcademy!.id : null,
        // Auto-verify students — academy enrollment IS their training.
        verificationStatus: isStudent ? 'verified' : 'none',
        verifiedAt: isStudent ? now : null,
        ...(isSubscribed && !isStudent && {
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
            listingId: selectedListing,
            userId: user.id,
            serviceIds: selectedServices || [],
            isActive: true,
            teamRole: isOwnerManager ? 'manager' : 'staff',
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

      } catch (employeeError) {
        await prisma.user.delete({ where: { id: user.id } });
        return apiError('Failed to create employee record', 500);
      }
    }

    // For students — link to the academy's listing as an Employee, and create
    // a PayAgreement that mirrors the academy's default split. This makes the
    // student a billable worker under the academy without giving them their
    // own Stripe Connect account (the academy holds the Connect account).
    if (isStudent && studentAcademy && studentAcademyListing) {
      try {
        // Phase 8b: students auto-inherit every service the academy currently offers.
        // Phase 8c keeps these in sync as the academy adds/removes services later.
        const academyServices = await prisma.service.findMany({
          where: { listingId: studentAcademyListing.id },
          select: { id: true },
        });
        const inheritedServiceIds = academyServices.map((s) => s.id);

        const employee = await prisma.employee.create({
          data: {
            fullName: name,
            jobTitle: jobTitle || 'Student',
            listingId: studentAcademyListing.id,
            userId: user.id,
            serviceIds: inheritedServiceIds,
            isActive: true,
            isIndependent: false,
            teamRole: 'staff',
          },
        });

        // Inherit the academy's default pay arrangement.
        // If the academy hasn't configured one, fall back to commission/0%
        // (academy keeps everything until they set a per-student override).
        const payType = studentAcademy.defaultPayType ?? 'commission';
        await prisma.payAgreement.create({
          data: {
            employeeId: employee.id,
            type: payType,
            splitPercent:
              payType === 'commission'
                ? studentAcademy.defaultSplitPercent ?? 0
                : null,
            rentalAmount:
              payType === 'chair_rental'
                ? studentAcademy.defaultRentalAmount ?? 0
                : null,
            rentalFrequency:
              payType === 'chair_rental'
                ? studentAcademy.defaultRentalFrequency ?? 'monthly'
                : null,
          },
        });

      } catch (studentErr) {
        // Roll back the user to keep state consistent.
        await prisma.user.delete({ where: { id: user.id } });
        return apiError('Failed to link student to academy', 500);
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
            serviceIds: serviceIds,
            isActive: true,
            isIndependent: true,
            teamRole: 'owner',
          }
        });

      } catch (listingError) {
        // Don't fail registration if this fails
      }
    }

    const token = await signMobileToken(user.id, user.email!);

    // Send welcome email (fire-and-forget)
    if (user.email) {
      const template = welcomeEmail(user.name || '');
      sendEmail({ ...template, to: user.email }).catch(() => {});
    }

    return NextResponse.json({
      user: {
        ...user,
        hashedPassword: undefined,
        userType: userType || 'customer',
      },
      token,
    });
  } catch (err) {
    return apiErrorCode('INTERNAL_ERROR');
  }
}