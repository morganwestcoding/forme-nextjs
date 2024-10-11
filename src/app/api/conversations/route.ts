import { NextResponse } from 'next/server';
import prisma from "@/app/libs/prismadb";
import getCurrentUser from '@/app/actions/getCurrentUser';

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
      }
    });

    // Format the conversations to match the SafeConversation type
    const safeConversations = conversations.map(conversation => {
      const otherUser = conversation.users.find(user => user.id !== currentUser.id);
      const lastMessage = conversation.messages[0];
      return {
        id: conversation.id,
        otherUser: {
          id: otherUser?.id || '',
          name: otherUser?.name || null,
          image: otherUser?.image || null,
        },
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          createdAt: lastMessage.createdAt.toISOString(),
          isRead: lastMessage.isRead,  // This line should now work
        } : undefined,
        lastMessageAt: conversation.lastMessageAt?.toISOString() || '',
      };
    });

    return NextResponse.json(safeConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
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
    console.error('Error in conversation route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}