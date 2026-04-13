import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import bcrypt from "bcryptjs";
import { createRateLimiter, getIP } from "@/app/libs/rateLimit";
import { apiError } from "@/app/utils/api";

const limiter = createRateLimiter("reset-password", { limit: 10, windowSeconds: 3600 });

export async function POST(request: Request) {
  try {
    const ip = getIP(request);
    const rate = limiter(ip);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: `Too many attempts. Try again in ${rate.retryAfterSeconds}s` },
        { status: 429 }
      );
    }

    const { token, newPassword } = await request.json();

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        AND: [
          {
            resetToken: {
              equals: token
            }
          },
          {
            resetTokenExpiry: {
              gt: new Date()
            }
          }
        ]
      }
    });

    if (!user) {
      return apiError("Invalid or expired reset token", 400);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user's password and clear reset token
    await prisma.user.update({
      where: { 
        id: user.id 
      },
      data: {
        hashedPassword: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      },
    });

    return NextResponse.json({ message: "Password reset successful" });
  } catch (error) {
    return apiError("Error resetting password", 500);
  }
}