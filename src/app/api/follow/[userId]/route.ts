import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }

  const { userId } = params;

  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid ID');
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    }
  });

  if (!user) {
    throw new Error('Invalid ID');
  }

  let updatedFollowing = [...(currentUser.following || [])];
  let updatedFollowers = [...(user.followers || [])];
  const isFollowing = !updatedFollowing.includes(userId);

  if (updatedFollowing.includes(userId)) {
    updatedFollowing = updatedFollowing.filter((id) => id !== userId);
    updatedFollowers = updatedFollowers.filter((id) => id !== currentUser.id);
  } else {
    updatedFollowing.push(userId);
    updatedFollowers.push(currentUser.id);
  }

  // Update current user's following
  await prisma.user.update({
    where: { id: currentUser.id },
    data: { following: updatedFollowing }
  });

  // Update target user's followers and create notification if it's a new follow
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { followers: updatedFollowers }
  });

  // Create notification if user is following (not unfollowing)
  if (isFollowing) {
    await prisma.notification.create({
      data: {
        type: 'NEW_FOLLOWER',
        content: `${currentUser.name || 'Someone'} started following you`,
        userId: userId
      }
    });

    // Check if this creates a mutual follow (both users follow each other)
    if (updatedFollowers.includes(currentUser.id) && updatedUser.following.includes(currentUser.id)) {
      await prisma.notification.create({
        data: {
          type: 'MUTUAL_FOLLOW',
          content: `${currentUser.name || 'Someone'} followed you back - you are now mutually following each other!`,
          userId: userId
        }
      });
    }
  }

  return NextResponse.json(updatedUser);
}