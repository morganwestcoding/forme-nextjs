import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { getUserFromRequest } from "@/app/utils/mobileAuth";
import { apiError, apiErrorCode } from "@/app/utils/api";

export async function DELETE(
  request: Request,
  { params }: { params: { conversationId: string; messageId: string } }
) {
  try {
    const currentUser = await getUserFromRequest(request) || await getCurrentUser();
    if (!currentUser) return apiErrorCode("UNAUTHORIZED");

    const message = await prisma.message.findUnique({
      where: { id: params.messageId },
    });

    if (!message) return apiErrorCode("NOT_FOUND");
    if (message.conversationId !== params.conversationId) return apiErrorCode("NOT_FOUND");
    if (message.senderId !== currentUser.id) return apiErrorCode("NOT_OWNER");

    // Soft delete
    await prisma.message.update({
      where: { id: params.messageId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiErrorCode("INTERNAL_ERROR");
  }
}
