import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { createRateLimiter, getIP } from "@/app/libs/rateLimit";
import { apiError } from "@/app/utils/api";

const limiter = createRateLimiter("forgot-password", { limit: 3, windowSeconds: 3600 });

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

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

    if (!user) {
      return apiError("No user found with this email", 404);
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // Token valid for 1 hour

    // Store token in database
    await prisma.user.update({
      where: { email },
      data: {
        resetToken: resetToken,
        resetTokenExpiry: resetTokenExpiry
      },
    });

    // Create reset link
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Password Reset Request",
      html: `
        <h1>Password Reset Request</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });

    return NextResponse.json({ message: "Reset email sent successfully" });
  } catch (error) {
    console.error("Password reset error:", error);
    return apiError("Error processing password reset", 500);
  }
}