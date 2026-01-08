// app/api/check-email/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return new NextResponse('Email is required', { status: 400 });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    return NextResponse.json({ exists: !!existingUser });
  } catch (error) {
    return new NextResponse('Error checking email', { status: 500 });
  }
}