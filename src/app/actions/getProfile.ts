// src/app/actions/getProfile.ts
import prisma from "@/app/libs/prismadb";
import { ExtendedSafeUser } from "@/app/types";

interface IProfileParams {
  userId: string;
}

const getProfile = async ({ userId }: IProfileParams): Promise<ExtendedSafeUser> => {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: { user: true },
  });

  if (!profile) {
    throw new Error("Profile not found");
  }

  return {
    ...profile.user,
    userImage: profile.userImage || "/default/userImage.jpeg",
    imageSrc: profile.imageSrc || "/default/imageSrc.jpeg",
    profileId: profile.id,
    // Make sure to convert Date objects to strings if necessary
    createdAt: profile.user.createdAt.toISOString(),
    updatedAt: profile.user.updatedAt.toISOString(),
    emailVerified: profile.user.emailVerified?.toISOString() || null,
  };
};

export default getProfile;
