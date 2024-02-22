// getProfileById.ts

import prisma from "@/app/libs/prismadb";
import { SafeProfile } from "../types";

interface IParams {
  profileId?: string;
}

export default async function getProfileById(params: IParams) {
  try {
    const { profileId } = params;

    // Assuming profileId is the id of the User model
    const user = await prisma.user.findUnique({
      where: {
        id: profileId,
      },
      include: {
        profile: true, // Include the profile
      }
    });

    if (!user) {
      return null;
    }

    // Constructing the response object
    // Adjust the structure as per your front-end needs
    const response: SafeProfile = {
    id: user.id,
    userId: user.id,
    name: user.name ?? undefined,
    image: user.image ?? undefined,
    bio: user.profile?.bio || '',
    imageSrc: user.profile?.imageSrc || '',
      
    };

    return response;
  } catch (error: any) {
    console.error("Error fetching profile:", error);
    throw new Error(error);
  }
}
