import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { getUserFromRequest } from "@/app/utils/mobileAuth";
import { apiError, apiErrorCode } from "@/app/utils/api";

export async function GET(request: Request) {
  try {
    const currentUser = await getUserFromRequest(request) || await getCurrentUser();
    if (!currentUser) return apiErrorCode("UNAUTHORIZED");

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();

    if (!q || q.length < 2) {
      return apiError("Search query must be at least 2 characters", 400);
    }

    // Find conversations the user is part of
    const conversations = await prisma.conversation.findMany({
      where: { userIds: { has: currentUser.id } },
      select: { id: true },
    });

    const conversationIds = conversations.map((c) => c.id);
    if (conversationIds.length === 0) {
      return NextResponse.json({ results: [] });
    }

    // Search messages within those conversations
    const messages = await prisma.message.findMany({
      where: {
        conversationId: { in: conversationIds },
        content: { contains: q, mode: "insensitive" },
        deletedAt: null,
      },
      include: {
        sender: { select: { id: true, name: true, image: true } },
        conversation: {
          select: {
            id: true,
            users: { select: { id: true, name: true, image: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    const results = messages.map((m) => ({
      id: m.id,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
      senderId: m.senderId,
      sender: m.sender,
      conversationId: m.conversationId,
      otherUser: m.conversation.users.find((u) => u.id !== currentUser.id) || null,
    }));

    return NextResponse.json({ results });
  } catch (error) {
    return apiErrorCode("INTERNAL_ERROR");
  }
}
