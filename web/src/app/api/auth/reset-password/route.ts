import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
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
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
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
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Error resetting password" },
      { status: 500 }
    );
  }
}