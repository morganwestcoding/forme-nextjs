// app/api/users/[userId]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { canModifyResource } from "@/app/libs/authorization";

export async function PUT(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const targetUserId = params.userId;
    if (!targetUserId) {
      return new NextResponse("Missing userId", { status: 400 });
    }

    // Only allow user to update themselves OR master/admin users
    if (!canModifyResource(currentUser, targetUserId)) {
      return new NextResponse("Forbidden", { status: 403 });
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

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        ...(typeof name === "string" ? { name } : {}),
        ...(typeof location === "string" ? { location } : {}),
        ...(typeof bio === "string" ? { bio } : {}),
        ...(typeof image === "string" ? { image } : {}),
        ...(typeof imageSrc === "string" ? { imageSrc } : {}),
        ...(typeof backgroundImage === "string" ? { backgroundImage } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("USER_UPDATE_ERROR", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
