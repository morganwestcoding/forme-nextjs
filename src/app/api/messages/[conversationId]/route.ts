// app/api/messages/[conversationId]/route.ts

import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

// GET route remains the same...

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

    // Get conversation to find other participants
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: params.conversationId
      },
      include: {
        users: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!conversation) {
      return new NextResponse("Conversation not found", { status: 404 });
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

    // Create notifications for all other users in the conversation
    const otherUsers = conversation.users.filter(user => user.id !== currentUser.id);
    
    await Promise.all(otherUsers.map(user => 
      prisma.notification.create({
        data: {
          type: 'NEW_MESSAGE',
          content: `${currentUser.name || 'Someone'} sent you a message: "${content.length > 30 ? content.substring(0, 30) + '...' : content}"`,
          userId: user.id
        }
      })
    ));

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