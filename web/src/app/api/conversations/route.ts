import { NextResponse } from 'next/server';
import prisma from "@/app/libs/prismadb";
import getCurrentUser from '@/app/actions/getCurrentUser';

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    console.log('Current user:', currentUser); // Debug log
    
    if (!currentUser?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First, let's check if we can find any conversations for this user
    const conversationCount = await prisma.conversation.count({
      where: {
        userIds: {
          has: currentUser.id
        }
      }
    });
    console.log('Found conversation count:', conversationCount); // Debug log

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
    
    console.log('Raw conversations:', conversations); // Debug log

    const safeConversations = conversations.map(conversation => {
      const otherUser = conversation.users.find(user => user.id !== currentUser.id);
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

    console.log('Safe conversations:', safeConversations); // Debug log
    
    return NextResponse.json(safeConversations);
  } catch (error) {
    console.error('Error details:', error); // More detailed error logging
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    const body = await request.json();
    console.log('POST request body:', body); // Debug log
    console.log('Current user:', currentUser); // Debug log

    if (!currentUser?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Invalid request - missing userId' }, { status: 400 });
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

    console.log('Existing conversation:', existingConversation); // Debug log

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

    console.log('New conversation created:', newConversation); // Debug log

    return NextResponse.json(newConversation);
  } catch (error) {
    console.error('Error details:', error); // More detailed error logging
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 });
  }
}