// app/api/notifications/[notificationId]/route.ts
import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

// PATCH to mark as read
export async function PATCH(
  request: Request,
  { params }: { params: { notificationId: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { notificationId } = params;

    const notification = await prisma.notification.update({
      where: {
        id: notificationId,
        userId: currentUser.id
      },
      data: {
        isRead: true
      }
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error("Error updating notification:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// DELETE notification
export async function DELETE(
  request: Request,
  { params }: { params: { notificationId: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { notificationId } = params;

    await prisma.notification.delete({
      where: {
        id: notificationId,
        userId: currentUser.id
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}