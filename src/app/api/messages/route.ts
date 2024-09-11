import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { content, conversationId } = body;

    if (!content || !conversationId) {
      return new NextResponse("Missing required fields", { status: 400 });
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
    console.error("Error creating message:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}