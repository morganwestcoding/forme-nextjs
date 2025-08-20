import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

type FollowType = "user" | "listing";

export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.error();

  const { userId } = params;
  if (!userId || typeof userId !== "string") throw new Error("Invalid ID");

  const url = new URL(request.url);
  const type = (url.searchParams.get("type") as FollowType) || "user";

  // ---------------------------
  // LISTING FOLLOW / UNFOLLOW
  // ---------------------------
  if (type === "listing") {
    // Listing model must have: followers String[] @default([])
    const listing = await prisma.listing.findUnique({
      where: { id: userId }, // note: param is called userId, but it's a listing id here
      select: { id: true, title: true, userId: true, followers: true },
    });
    if (!listing) throw new Error("Invalid ID");

    const followers = Array.isArray(listing.followers) ? listing.followers : [];
    const already = followers.includes(currentUser.id);

    const next = already
      ? followers.filter((uid) => uid !== currentUser.id)
      : [...followers, currentUser.id];

    const updatedListing = await prisma.listing.update({
      where: { id: listing.id },
      data: { followers: { set: next } },
    });

    // Notify owner only on FOLLOW (not on unfollow)
    if (!already && listing.userId && listing.userId !== currentUser.id) {
      await prisma.notification.create({
        data: {
          type: "LISTING_FOLLOW",
          content: `${currentUser.name || "Someone"} followed your listing "${
            listing.title || "your listing"
          }"`,
          userId: listing.userId,
        },
      });
    }

    return NextResponse.json(updatedListing);
  }

  // ---------------------------
  // USER FOLLOW / UNFOLLOW
  // ---------------------------
  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) throw new Error("Invalid ID");

  const meFollowing = Array.isArray(currentUser.following)
    ? [...currentUser.following]
    : [];
  const targetFollowers = Array.isArray(target.followers)
    ? [...target.followers]
    : [];

  const already = meFollowing.includes(userId);

  const newFollowing = already
    ? meFollowing.filter((id) => id !== userId)
    : [...meFollowing, userId];

  const newFollowers = already
    ? targetFollowers.filter((id) => id !== currentUser.id)
    : [...targetFollowers, currentUser.id];

  // Update my following list
  await prisma.user.update({
    where: { id: currentUser.id },
    data: { following: newFollowing },
  });

  // Update target's followers
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { followers: newFollowers },
  });

  // Notifications only when following (not unfollowing)
  if (!already) {
    await prisma.notification.create({
      data: {
        type: "NEW_FOLLOWER",
        content: `${currentUser.name || "Someone"} started following you`,
        userId,
      },
    });

    const targetNowFollowsMe = updatedUser.following.includes(currentUser.id);
    const iNowFollowTarget = newFollowing.includes(userId);
    if (targetNowFollowsMe && iNowFollowTarget) {
      await prisma.notification.create({
        data: {
          type: "MUTUAL_FOLLOW",
          content: `${
            currentUser.name || "Someone"
          } followed you back - you are now mutually following each other!`,
          userId,
        },
      });
    }
  }

  return NextResponse.json(updatedUser);
}
