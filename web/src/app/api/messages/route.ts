import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { getUserFromRequest } from "@/app/utils/mobileAuth";
import { apiError, apiErrorCode } from "@/app/utils/api";

export async function POST(request: Request) {
  try {
    const currentUser = await getUserFromRequest(request) || await getCurrentUser();
    if (!currentUser) {
      return apiErrorCode('UNAUTHORIZED');
    }

    const body = await request.json();
    const { content, conversationId } = body;

    if (!content || !conversationId) {
      return apiErrorCode('MISSING_FIELDS');
    }

    const newMessage = await prisma.message.create({
      data: {
        content,
        conversationId,
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

    // ... (rest of the code to format and return the message)

  } catch (error) {
    return apiErrorCode('INTERNAL_ERROR');
  }
}