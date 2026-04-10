import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";
import { getUserFromRequest } from "@/app/utils/mobileAuth";

export async function GET(request: Request) {
  try {
    const currentUser = await getUserFromRequest(request) || await getCurrentUser();
    if (!currentUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const favoriteIds = (currentUser as any).favoriteIds || [];
    if (favoriteIds.length === 0) {
      return NextResponse.json({ listings: [], posts: [] });
    }

    // Try fetching both listings and posts in parallel
    const [listings, posts] = await Promise.all([
      prisma.listing
        .findMany({
          where: { id: { in: favoriteIds } },
          include: { services: true, employees: true, storeHours: true },
        })
        .catch(() => []),
      prisma.post
        .findMany({
          where: { id: { in: favoriteIds } },
          include: { user: true },
        })
        .catch(() => []),
    ]);

    return NextResponse.json({
      listings: listings.map((l: any) => ({
        ...l,
        createdAt: l.createdAt?.toISOString(),
      })),
      posts: posts.map((p: any) => ({
        ...p,
        createdAt: p.createdAt?.toISOString(),
        user: p.user
          ? {
              id: p.user.id,
              name: p.user.name,
              image: p.user.image,
            }
          : null,
      })),
    });
  } catch (error) {
    console.error("[FAVORITES_GET]", error);
    return NextResponse.json({ listings: [], posts: [] }, { status: 500 });
  }
}
