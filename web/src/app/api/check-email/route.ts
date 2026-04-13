// app/api/check-email/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { apiError, apiErrorCode } from "@/app/utils/api";
import { createRateLimiter, getIP } from "@/app/libs/rateLimit";

const limiter = createRateLimiter("check-email", { limit: 10, windowSeconds: 60 });

export async function GET(request: Request) {
  const ip = getIP(request);
  const rl = limiter(ip);
  if (!rl.allowed) {
    return apiError(`Too many requests. Try again in ${rl.retryAfterSeconds}s`, 429);
  }

  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return apiError('Email is required', 400);
  }

  try {
    const start = Date.now();
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    // Constant-time response to prevent timing-based enumeration
    const elapsed = Date.now() - start;
    if (elapsed < 200) {
      await new Promise(r => setTimeout(r, 200 - elapsed));
    }

    return NextResponse.json({ exists: !!existingUser });
  } catch (error) {
    return apiErrorCode('INTERNAL_ERROR');
  }
}