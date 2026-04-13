// app/api/users/[userId]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { canModifyResource } from "@/app/libs/authorization";
import { getUserFromRequest } from "@/app/utils/mobileAuth";
import { apiError, apiErrorCode } from "@/app/utils/api";
import { sanitizeText } from "@/app/utils/sanitize";

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
    } = body || {};

    const sanitizedName = typeof name === "string" ? sanitizeText(name) : undefined;
    const sanitizedBio = typeof bio === "string" ? sanitizeText(bio) : undefined;

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        ...(sanitizedName !== undefined ? { name: sanitizedName } : {}),
        ...(typeof location === "string" ? { location } : {}),
        ...(sanitizedBio !== undefined ? { bio: sanitizedBio } : {}),
        ...(typeof image === "string" ? { image } : {}),
        ...(typeof imageSrc === "string" ? { imageSrc } : {}),
        ...(typeof backgroundImage === "string" ? { backgroundImage } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    return apiErrorCode('INTERNAL_ERROR');
  }
}
