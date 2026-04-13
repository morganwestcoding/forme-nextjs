import { NextResponse } from 'next/server';
import prisma from "@/app/libs/prismadb";
import getCurrentUser from '@/app/actions/getCurrentUser';
import { getUserFromRequest } from '@/app/utils/mobileAuth';
import { apiError, apiErrorCode } from '@/app/utils/api';

export async function GET(request: Request) {
  try {
    const currentUser = await getUserFromRequest(request) || await getCurrentUser();

    if (!currentUser?.id) {
      return apiErrorCode('UNAUTHORIZED');
    }

    // First, let's check if we can find any conversations for this user
    const conversationCount = await prisma.conversation.count({
      where: {
        userIds: {
          has: currentUser.id
        }
      }
    });

    const conversations = await prisma.conversation.findMany({
      where: {
        userIds: {
          has: currentUser.id
        }
      },
      include: {
        users: true,
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        lastMessageAt: 'desc'
      }
    });

    const safeConversations = conversations.map((conversation: typeof conversations[number]) => {
      const otherUser = conversation.users.find((user: typeof conversation.users[number]) => user.id !== currentUser.id);
      const lastMessage = conversation.messages[0];
      
      const safeConversation = {
        id: conversation.id,
        otherUser: {
          id: otherUser?.id || '',
          name: otherUser?.name || null,
          image: otherUser?.image || null,
        },
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          createdAt: lastMessage.createdAt.toISOString(),
          isRead: lastMessage.isRead,
        } : undefined,
        lastMessageAt: conversation.lastMessageAt?.toISOString() || new Date().toISOString(), // Provide default value
      };
      
      return safeConversation;
    });

    return NextResponse.json(safeConversations);
  } catch (error) {
    return apiErrorCode('INTERNAL_ERROR');
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getUserFromRequest(request) || await getCurrentUser();
    const body = await request.json();
    if (!currentUser?.id) {
      return apiErrorCode('UNAUTHORIZED');
    }

    const { userId } = body;

    if (!userId) {
      return apiError('Invalid request - missing userId', 400);
    }

    // Check if a conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { userIds: { has: currentUser.id } },
          { userIds: { has: userId } }
        ]
      },
      include: {
        users: true
      }
    });

    if (existingConversation) {
      return NextResponse.json(existingConversation);
    }

    // Create a new conversation
    const newConversation = await prisma.conversation.create({
      data: {
        userIds: [currentUser.id, userId],
        users: {
          connect: [
            { id: currentUser.id },
            { id: userId }
          ]
        }
      },
      include: {
        users: true
      }
    });

    return NextResponse.json(newConversation);
  } catch (error) {
    return apiErrorCode('INTERNAL_ERROR');
  }
}