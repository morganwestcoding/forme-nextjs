import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { canModifyResource } from "@/app/libs/authorization";
import { getUserFromRequest } from "@/app/utils/mobileAuth";

export async function POST(request: Request) {
  const currentUser = await getUserFromRequest(request) || await getCurrentUser();
  if (!currentUser) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  console.log("Received request body:", body);
  const { image, imageSrc, bio, location, action, galleryImage, targetUserId } = body;

  // Determine which user to update (self or target if master)
  const userIdToUpdate = targetUserId || currentUser.id;

  // If trying to update another user, verify master/admin access
  if (targetUserId && targetUserId !== currentUser.id) {
    if (!canModifyResource(currentUser, targetUserId)) {
      return new Response("Unauthorized to modify this user", { status: 403 });
    }
  }

  try {
    let updatedUser;

    if (action === "addGalleryImage") {
      console.log("Adding new gallery image:", galleryImage);
      updatedUser = await prisma.user.update({
        where: { id: userIdToUpdate },
        data: {
          galleryImages: {
            push: galleryImage
          }
        },
      });
      console.log("Updated user after adding image:", updatedUser);
    } else if (action === "updateProfile") {
      // Update other profile information
      updatedUser = await prisma.user.update({
        where: { id: userIdToUpdate },
        data: { image, imageSrc, bio, location },
      });
    } else {
      return new Response("Invalid action", { status: 400 });
    }

    if (!updatedUser) {
      return new Response("User update failed", { status: 404 });
    }

    return new Response(JSON.stringify(updatedUser), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function GET(request: Request) {
  const currentUser = await getUserFromRequest(request) || await getCurrentUser();
  if (!currentUser) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
    });

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    return new Response(JSON.stringify(user), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const currentUser = await getUserFromRequest(request) || await getCurrentUser();
  if (!currentUser) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const imageIndex = searchParams.get('imageIndex');
  const targetUserId = searchParams.get('targetUserId');

  if (imageIndex === null) {
    return new Response("Image index is required", { status: 400 });
  }

  // Determine which user to update (self or target if master)
  const userIdToUpdate = targetUserId || currentUser.id;

  // If trying to update another user, verify master/admin access
  if (targetUserId && targetUserId !== currentUser.id) {
    if (!canModifyResource(currentUser, targetUserId)) {
      return new Response("Unauthorized to modify this user", { status: 403 });
    }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userIdToUpdate },
    });

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    const updatedGalleryImages = user.galleryImages.filter((_, index) => index !== parseInt(imageIndex));

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
    console.error("Error deleting gallery image:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}