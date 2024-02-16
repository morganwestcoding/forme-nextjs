// File: src/app/actions/getUserProfileById.ts

import prisma from "@/app/libs/prismadb";

export async function getProfileId(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  // Additional logic for transformation and error checking

  return user ? {
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    emailVerified: user.emailVerified?.toISOString() || null,
  } : null;
}
