// app/api/users/[userId]/route.ts
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { canModifyResource } from "@/app/libs/authorization";
import { getUserFromRequest } from "@/app/utils/mobileAuth";
import { apiError, apiErrorCode } from "@/app/utils/api";
import { sanitizeText } from "@/app/utils/sanitize";
import { deleteUserCascade } from "@/app/libs/deleteUserCascade";
import { titleCaseName } from "@/lib/names";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
    });
    if (!user) return apiErrorCode('NOT_FOUND');
    return NextResponse.json({
      id: user.id,
      name: user.name,
      image: user.image,
      imageSrc: user.imageSrc,
      backgroundImage: user.backgroundImage,
      bio: user.bio,
      location: user.location,
      userType: user.userType,
      verificationStatus: user.verificationStatus,
      createdAt: user.createdAt.toISOString(),
      favoriteIds: user.favoriteIds,
    });
  } catch (e) {
    return apiErrorCode('INTERNAL_ERROR');
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return apiErrorCode('UNAUTHORIZED');
    }

    const targetUserId = params.userId;
    if (!targetUserId) {
      return apiError("Missing userId", 400);
    }

    // Only allow user to update themselves OR master/admin users
    if (!canModifyResource(currentUser, targetUserId)) {
      return apiErrorCode('FORBIDDEN');
    }

    const body = await request.json();
    const {
      name,
      location,
      bio,
      image,
      imageSrc,
      backgroundImage,
      jobTitle,
      hideWelcomeModal,
      interests,
    } = body || {};

    const sanitizedName = typeof name === "string" ? titleCaseName(sanitizeText(name)) : undefined;
    const sanitizedBio = typeof bio === "string" ? sanitizeText(bio) : undefined;
    const sanitizedJobTitle = typeof jobTitle === "string" ? sanitizeText(jobTitle) : undefined;

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        ...(sanitizedName !== undefined ? { name: sanitizedName } : {}),
        ...(typeof location === "string" ? { location } : {}),
        ...(sanitizedBio !== undefined ? { bio: sanitizedBio } : {}),
        ...(typeof image === "string" ? { image } : {}),
        ...(typeof imageSrc === "string" ? { imageSrc } : {}),
        ...(typeof backgroundImage === "string" ? { backgroundImage } : {}),
        ...(sanitizedJobTitle !== undefined ? { jobTitle: sanitizedJobTitle } : {}),
        ...(typeof hideWelcomeModal === "boolean" ? { hideWelcomeModal } : {}),
        ...(Array.isArray(interests)
          ? { interests: interests.filter((i): i is string => typeof i === "string") }
          : {}),
      },
    });

    // When the profile job title changes, sync it to this user's Employee
    // records so WorkerCards (which read from employee.jobTitle) also update.
    // This matches user expectation: if I set my title on my profile, it
    // should show up everywhere I'm listed.
    if (sanitizedJobTitle !== undefined) {
      await prisma.employee.updateMany({
        where: { userId: targetUserId },
        data: { jobTitle: sanitizedJobTitle || null },
      });
    }

    // Invalidate server-rendered routes that show user info so edits show up
    // on Discover, the user's profile, and any listings they belong to.
    revalidatePath('/');
    revalidatePath(`/profile/${targetUserId}`);
    revalidatePath('/newsfeed');

    return NextResponse.json(updated);
  } catch (err) {
    return apiErrorCode('INTERNAL_ERROR');
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const sessionUser = await getCurrentUser();
    const currentUser = sessionUser ?? (await getUserFromRequest(request));
    if (!currentUser) return apiErrorCode('UNAUTHORIZED');

    const targetUserId = params.userId;
    if (!targetUserId) return apiError("Missing userId", 400);

    if (!canModifyResource(currentUser, targetUserId)) {
      return apiErrorCode('FORBIDDEN');
    }

    const target = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, role: true },
    });
    if (!target) return apiErrorCode('USER_NOT_FOUND');
    if (target.role === "master") {
      return apiError("Master accounts cannot be deleted", 403);
    }

    const result = await deleteUserCascade(targetUserId);

    revalidatePath('/');
    revalidatePath(`/profile/${targetUserId}`);
    revalidatePath('/newsfeed');

    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error('[DELETE /api/users/:userId]', err);
    return apiErrorCode('INTERNAL_ERROR');
  }
}
