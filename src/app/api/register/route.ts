import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import prisma from "@/app/libs/prismadb";

export async function POST(
  request: Request, 
) {
  const body = await request.json();
  const { 
    name,
    email,
    password,
    location,
    subscription,
    bio,
    image,
    imageSrc,
   } = body;

   const hashedPassword = await bcrypt.hash(password, 12);

   const isSubscribed = subscription !== 'bronze (customer)';
   const now = new Date();
   const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

   const user = await prisma.user.create({
    data: {
      email,
      name,
      hashedPassword,
      location,
      bio,
      image,
      imageSrc,
      isSubscribed,
      subscriptionTier: subscription,
      ...(isSubscribed && {
        subscriptionStartDate: now,
        subscriptionEndDate: thirtyDaysFromNow
      })
    }
  });

  return NextResponse.json(user);
}