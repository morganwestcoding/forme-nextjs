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
    bio,
    image,
    imageSrc,
   } = body;

   const hashedPassword = await bcrypt.hash(password, 12);

   const user = await prisma.user.create({
    data: {
      email,
      name,
      hashedPassword,
      location,
      bio,
      image,
      imageSrc
    }
  });

  return NextResponse.json(user);
}