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
      return {
        id: conversation.id,
        otherUser: {
          id: otherUser?.id || '',
          name: otherUser?.name || null,
          image: otherUser?.image || null,
        },
        lastMessage: conversation.messages[0] ? {
          content: conversation.messages[0].content,
          createdAt: conversation.messages[0].createdAt.toISOString(),
        } : undefined,
      };
    });

    return NextResponse.json(safeConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}