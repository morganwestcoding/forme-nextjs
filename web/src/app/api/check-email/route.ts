// app/api/check-email/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { apiError, apiErrorCode } from "@/app/utils/api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return apiError('Email is required', 400);
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    return NextResponse.json({ exists: !!existingUser });
  } catch (error) {
    return apiErrorCode('INTERNAL_ERROR');
  }
}