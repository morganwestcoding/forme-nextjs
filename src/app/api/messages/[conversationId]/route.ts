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

    const conversation = await prisma.conversation.findUnique({
      where: {
        id: params.conversationId
      },
      include: {
        users: true
      }
    });

    if (!conversation) {
      return new NextResponse("Conversation not found", { status: 404 });
    }

    const isParticipant = conversation.userIds.includes(currentUser.id);
    if (!isParticipant) {
      return new NextResponse("Not authorized to access this conversation", { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId: params.conversationId
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    const safeMessages = messages.map(message => ({
      id: message.id,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
      senderId: message.senderId,
      conversationId: message.conversationId,
      isRead: message.isRead,
      sender: {
        id: message.sender.id,
        name: message.sender.name || null,
        image: message.sender.image || null,
      }
    }));

    return NextResponse.json(safeMessages);
  } catch (error) {
    console.error("Error getting messages:", error);
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

    // Update last message at timestamp
    await prisma.conversation.update({
      where: {
        id: params.conversationId
      },
      data: {
        lastMessageAt: new Date()
      }
    });

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
      isRead: false,
      sender: {
        id: newMessage.sender.id,
        name: newMessage.sender.name || null,
        image: newMessage.sender.image || null,
      }
    };

    return NextResponse.json(safeMessage);
  } catch (error) {
    console.error("Error creating message:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}