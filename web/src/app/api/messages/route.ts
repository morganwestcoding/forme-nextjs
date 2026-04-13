import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { getUserFromRequest } from "@/app/utils/mobileAuth";
import { apiError, apiErrorCode } from "@/app/utils/api";
import { sanitizeText } from "@/app/utils/sanitize";
import { validateBody, createMessageSchema } from "@/app/utils/validations";
import { createRateLimiter, getIP } from "@/app/libs/rateLimit";

const limiter = createRateLimiter("messages", { limit: 30, windowSeconds: 60 });

export async function POST(request: Request) {
  const ip = getIP(request);
  const rl = limiter(ip);
  if (!rl.allowed) {
    return apiError(`Too many requests. Try again in ${rl.retryAfterSeconds}s`, 429);
  }

  try {
    const currentUser = await getUserFromRequest(request) || await getCurrentUser();
    if (!currentUser) {
      return apiErrorCode('UNAUTHORIZED');
    }

    const body = await request.json();
    const validation = validateBody(createMessageSchema, body);
    if (!validation.success) {
      return apiError(validation.error, 400);
    }

    const { content, conversationId } = validation.data;

    if (!conversationId) {
      return apiErrorCode('MISSING_FIELDS');
    }

    const sanitizedContent = sanitizeText(content);

    const newMessage = await prisma.message.create({
      data: {
        content: sanitizedContent,
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