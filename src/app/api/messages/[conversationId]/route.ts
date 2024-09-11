// app/api/messages/[conversationId]/route.ts

import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function GET(
  request: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId: params.conversationId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const safeMessages = messages.map((message) => ({
      id: message.id,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
      senderId: message.senderId,
      conversationId: message.conversationId,
      sender: {
        id: message.sender.id,
        name: message.sender.name || null,
        image: message.sender.image || null,
      },
    }));

    return NextResponse.json(safeMessages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content) {
      return new NextResponse("Missing content", { status: 400 });
    }

    const newMessage = await prisma.message.create({
      data: {
        content,
        conversationId: params.conversationId,
        senderId: currentUser.id,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    const safeMessage = {
      id: newMessage.id,
      content: newMessage.content,
      createdAt: newMessage.createdAt.toISOString(),
      senderId: newMessage.senderId,
      conversationId: newMessage.conversationId,
      sender: {
        id: newMessage.sender.id,
        name: newMessage.sender.name || null,
        image: newMessage.sender.image || null,
      },
    };

    return NextResponse.json(safeMessage);
  } catch (error) {
    console.error("Error creating message:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}