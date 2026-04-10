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
      return NextResponse.json([]);
    }

    const listings = await prisma.listing.findMany({
      where: { id: { in: favoriteIds } },
      include: {
        services: true,
        employees: true,
        storeHours: true,
      },
    });

    return NextResponse.json(
      listings.map((l: any) => ({
        ...l,
        createdAt: l.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error("[FAVORITES_GET]", error);
    return NextResponse.json([], { status: 500 });
  }
}
