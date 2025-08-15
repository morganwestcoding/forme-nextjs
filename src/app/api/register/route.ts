import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/app/libs/prismadb";

type CanonicalTier = 'bronze' | 'professional' | 'enterprise';

// in app/api/subscription/select/route.ts (or wherever you normalize)
function normalizeSubscription(input: unknown): 'bronze' | 'professional' | 'enterprise' {
  const raw = String(input || '').toLowerCase();
  if (raw.includes('diamond') || raw.includes('enterprise')) return 'enterprise';
  if (
    raw.includes('pearl') || raw.includes('civilian') ||
    raw.includes('sapphire') || raw.includes('ruby') || raw.includes('emerald') ||
    raw.includes('silver') || raw.includes('gold') || raw.includes('platinum') ||
    raw.includes('pro') || raw.includes('professional')
  ) return 'professional';
  if (raw.includes('quartz') || raw.includes('basic') || raw.includes('bronze')) return 'bronze';
  return 'bronze';
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { 
      name,
      email,
      password,
      location,
      subscription, // string like "silver (pro tier 1)" etc., lowercased by UI
      bio,
      image,
      imageSrc,
    } = body || {};

    if (!email || !password || !name) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return new NextResponse('Email already exists', { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Normalize & decide paid/free
    const canonicalTier: CanonicalTier = normalizeSubscription(subscription);
    const isSubscribed = canonicalTier !== 'bronze';

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
        location: location ?? '',
        bio: bio ?? '',
        image: image ?? '',
        imageSrc: imageSrc ?? '',
        // Store the UI label exactly as chosen (you can keep it lowercase or title-case it later for display)
        subscriptionTier: subscription ?? 'bronze (customer)',
        isSubscribed,
        ...(isSubscribed && {
          subscriptionStartDate: now,
          subscriptionEndDate: thirtyDaysFromNow
        })
      }
    });

    return NextResponse.json(user);
  } catch (err) {
    console.error('REGISTER_ERROR', err);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
