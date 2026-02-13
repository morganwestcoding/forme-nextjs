import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/app/libs/prismadb';
import { signMobileToken } from '@/app/utils/mobileAuth';
import { apiError, apiErrorCode } from '@/app/utils/api';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return apiError('Email and password are required', 400);
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.hashedPassword) {
      return apiErrorCode('INVALID_CREDENTIALS');
    }

    const isCorrectPassword = await bcrypt.compare(password, user.hashedPassword);
    if (!isCorrectPassword) {
      return apiErrorCode('INVALID_CREDENTIALS');
    }

    const token = await signMobileToken(user.id, user.email!);

    return NextResponse.json({
      user: {
        ...user,
        hashedPassword: undefined,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        emailVerified: user.emailVerified?.toISOString() || null,
      },
      token,
    });
  } catch (error) {
    console.error('LOGIN_ERROR', error);
    return apiErrorCode('INTERNAL_ERROR');
  }
}
