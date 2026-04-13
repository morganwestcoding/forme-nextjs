import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { getUserFromRequest } from "@/app/utils/mobileAuth";
import { apiError, apiErrorCode } from "@/app/utils/api";
import { emitToMany } from '@/app/libs/eventEmitter';

export async function GET(
  request: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    const currentUser = await getUserFromRequest(request) || await getCurrentUser();
    if (!currentUser) {
      return apiErrorCode('UNAUTHORIZED');
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
      return apiError("Conversation not found", 404);
    }

    const isParticipant = conversation.userIds.includes(currentUser.id);
    if (!isParticipant) {
      return apiError("Not authorized to access this conversation", 403);
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

    const safeMessages = messages.map((message: typeof messages[number]) => ({
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
    return apiErrorCode('INTERNAL_ERROR');
  }
}

export async function POST(
  request: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return apiErrorCode('UNAUTHORIZED');
    }

    const body = await request.json();
    const { content } = body;

    if (!content) {
      return apiError("Missing content", 400);
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
      return apiError("Conversation not found", 404);
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

    const otherUsers = conversation.users.filter((user: typeof conversation.users[number]) => user.id !== currentUser.id);

    await Promise.all(otherUsers.map((user: typeof otherUsers[number]) =>
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

    // Real-time: notify other participants
    const otherUserIds = otherUsers.map((u: typeof otherUsers[number]) => u.id);
    emitToMany(otherUserIds, {
      type: 'MESSAGE_CREATED',
      payload: safeMessage,
    });

    // Also update conversation list for other users
    emitToMany(otherUserIds, {
      type: 'CONVERSATION_UPDATED',
      payload: {
        conversationId: params.conversationId,
        lastMessage: { content: safeMessage.content, createdAt: safeMessage.createdAt, isRead: false },
        lastMessageAt: safeMessage.createdAt,
      },
    });

    // Notify other users about new notification
    emitToMany(otherUserIds, {
      type: 'NOTIFICATION_CREATED',
      payload: {
        type: 'NEW_MESSAGE',
        content: `${currentUser.name || 'Someone'} sent you a message`,
      },
    });

    return NextResponse.json(safeMessage);
  } catch (error) {
    return apiErrorCode('INTERNAL_ERROR');
  }
}