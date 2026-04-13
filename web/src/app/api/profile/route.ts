import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { canModifyResource } from "@/app/libs/authorization";
import { getUserFromRequest } from "@/app/utils/mobileAuth";
import { apiError, apiErrorCode } from "@/app/utils/api";
import { validateBody, updateProfileSchema } from "@/app/utils/validations";

export async function POST(request: Request) {
  const currentUser = await getUserFromRequest(request) || await getCurrentUser();
  if (!currentUser) {
    return apiErrorCode('UNAUTHORIZED');
  }

  const body = await request.json();
  const validation = validateBody(updateProfileSchema, body);
  if (!validation.success) {
    return apiError(validation.error, 400);
  }

  const { image, imageSrc, bio, location } = validation.data;
  const { action, galleryImage, targetUserId } = body;

  // Determine which user to update (self or target if master)
  const userIdToUpdate = targetUserId || currentUser.id;

  // If trying to update another user, verify master/admin access
  if (targetUserId && targetUserId !== currentUser.id) {
    if (!canModifyResource(currentUser, targetUserId)) {
      return apiError("Unauthorized to modify this user", 403);
    }
  }

  try {
    let updatedUser;

    if (action === "addGalleryImage") {
      updatedUser = await prisma.user.update({
        where: { id: userIdToUpdate },
        data: {
          galleryImages: {
            push: galleryImage
          }
        },
      });
    } else if (action === "updateProfile") {
      // Update other profile information
      updatedUser = await prisma.user.update({
        where: { id: userIdToUpdate },
        data: { image, imageSrc, bio, location },
      });
    } else {
      return apiError("Invalid action", 400);
    }

    if (!updatedUser) {
      return apiError("User update failed", 404);
    }

    return new Response(JSON.stringify(updatedUser), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return apiErrorCode('INTERNAL_ERROR');
  }
}

export async function GET(request: Request) {
  const currentUser = await getUserFromRequest(request) || await getCurrentUser();
  if (!currentUser) {
    return apiErrorCode('UNAUTHORIZED');
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
    });

    if (!user) {
      return apiErrorCode('USER_NOT_FOUND');
    }

    return new Response(JSON.stringify(user), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return apiErrorCode('INTERNAL_ERROR');
  }
}

export async function DELETE(request: Request) {
  const currentUser = await getUserFromRequest(request) || await getCurrentUser();
  if (!currentUser) {
    return apiErrorCode('UNAUTHORIZED');
  }

  const { searchParams } = new URL(request.url);
  const imageIndex = searchParams.get('imageIndex');
  const targetUserId = searchParams.get('targetUserId');

  if (imageIndex === null) {
    return apiError("Image index is required", 400);
  }

  // Determine which user to update (self or target if master)
  const userIdToUpdate = targetUserId || currentUser.id;

  // If trying to update another user, verify master/admin access
  if (targetUserId && targetUserId !== currentUser.id) {
    if (!canModifyResource(currentUser, targetUserId)) {
      return apiError("Unauthorized to modify this user", 403);
    }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userIdToUpdate },
    });

    if (!user) {
      return apiErrorCode('USER_NOT_FOUND');
    }

    const updatedGalleryImages = user.galleryImages.filter((_: string, index: number) => index !== parseInt(imageIndex));

    const updatedUser = await prisma.user.update({
      where: { id: userIdToUpdate },
      data: {
        galleryImages: updatedGalleryImages,
      },
    });

    return new Response(JSON.stringify(updatedUser), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return apiErrorCode('INTERNAL_ERROR');
  }
}