import { NextResponse } from 'next/server';
import prisma from "@/app/libs/prismadb";
import getCurrentUser from '@/app/actions/getCurrentUser';

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { conversationId } = body;

    if (!conversationId) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    await prisma.message.updateMany({
      where: {
        conversationId: conversationId,
        NOT: {
          senderId: currentUser.id
        },
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    const updatedConversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId
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

    if (!updatedConversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Format the conversation to match your SafeConversation type
    const otherUser = updatedConversation.users.find(user => user.id !== currentUser.id);
    const lastMessage = updatedConversation.messages[0];
    
    const safeConversation = {
      id: updatedConversation.id,
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
      lastMessageAt: updatedConversation.lastMessageAt?.toISOString() || '',
    };

    return NextResponse.json(safeConversation);
  } catch (error) {
    console.error('Error updating message read status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}