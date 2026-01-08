// app/api/follow/[userId]/route.ts (or wherever your POST is)
import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

type FollowType = "user" | "listing" | "shop"; // ✅ add 'shop'

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
  // SHOP FOLLOW / UNFOLLOW
  // ---------------------------
  if (type === "shop") {
    // Shop model already has: followers String[] @db.ObjectId
    const shop = await prisma.shop.findUnique({
      where: { id: userId }, // note param name; it's a shop id in this branch
      select: { id: true, name: true, userId: true, followers: true },
    });
    if (!shop) throw new Error("Invalid ID");

    const followers = Array.isArray(shop.followers) ? shop.followers : [];
    const already = followers.includes(currentUser.id);

    const next = already
      ? followers.filter((uid) => uid !== currentUser.id)
      : [...followers, currentUser.id];

    const updatedShop = await prisma.shop.update({
      where: { id: shop.id },
      data: { followers: { set: next } },
    });

    // Notify shop owner only on FOLLOW
    if (!already && shop.userId && shop.userId !== currentUser.id) {
      await prisma.notification.create({
        data: {
          type: "SHOP_FOLLOW",
          content: `${currentUser.name || "Someone"} followed your shop "${shop.name || "your shop"}"`,
          userId: shop.userId,
        },
      });
    }

    return NextResponse.json(updatedShop);
  }

  // ---------------------------
  // LISTING FOLLOW / UNFOLLOW (existing)
  // ---------------------------
  if (type === "listing") {
    const listing = await prisma.listing.findUnique({
      where: { id: userId },
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

    if (!already && listing.userId && listing.userId !== currentUser.id) {
      await prisma.notification.create({
        data: {
          type: "LISTING_FOLLOW",
          content: `${currentUser.name || "Someone"} followed your listing "${listing.title || "your listing"}"`,
          userId: listing.userId,
        },
      });
    }

    return NextResponse.json(updatedListing);
  }

  // ---------------------------
  // USER FOLLOW / UNFOLLOW (existing)
  // ---------------------------
  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) throw new Error("Invalid ID");

  const meFollowing = Array.isArray(currentUser.following) ? [...currentUser.following] : [];
  const targetFollowers = Array.isArray(target.followers) ? [...target.followers] : [];

  const already = meFollowing.includes(userId);

  const newFollowing = already
    ? meFollowing.filter((id) => id !== userId)
    : [...meFollowing, userId];

  const newFollowers = already
    ? targetFollowers.filter((id) => id !== currentUser.id)
    : [...targetFollowers, currentUser.id];

  await prisma.user.update({
    where: { id: currentUser.id },
    data: { following: newFollowing },
  });

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { followers: newFollowers },
  });

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
          content: `${currentUser.name || "Someone"} followed you back - you are now mutually following each other!`,
          userId,
        },
      });
    }
  }

  return NextResponse.json(updatedUser);
}
