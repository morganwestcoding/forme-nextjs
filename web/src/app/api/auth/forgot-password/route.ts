import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import crypto from "crypto";
import { createRateLimiter, getIP } from "@/app/libs/rateLimit";
import { apiError } from "@/app/utils/api";
import { sendEmail, passwordResetEmail } from "@/app/libs/email";

const limiter = createRateLimiter("forgot-password", { limit: 3, windowSeconds: 3600 });

export async function POST(request: Request) {
  try {
    const ip = getIP(request);
    const rate = limiter(ip);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Try again in ${rate.retryAfterSeconds}s` },
        { status: 429 }
      );
    }

    const { email } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always respond the same way to prevent account enumeration.
    // Only send the email if the user actually exists.
    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

      await prisma.user.update({
        where: { email },
        data: { resetToken, resetTokenExpiry },
      });

      const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
      const template = passwordResetEmail(resetLink);
      await sendEmail({ ...template, to: email });
    }

    return NextResponse.json({
      message: "If an account exists for that email, a reset link has been sent.",
    });
  } catch (error) {
    return apiError("Error processing password reset", 500);
  }
}
