import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

// POST /api/team/fix-roles — one-time fix: set teamRole for listing owners and managers
export async function POST() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const listings = await prisma.listing.findMany({
      where: { userId: currentUser.id },
      select: { id: true },
    });

    const listingIds = listings.map((l) => l.id);

    if (listingIds.length === 0) {
      return NextResponse.json({ fixed: 0 });
    }

    // Fix 1: The listing owner's own employee record → "owner"
    const ownerFix = await prisma.employee.updateMany({
      where: {
        listingId: { in: listingIds },
        userId: currentUser.id,
        teamRole: "staff",
      },
      data: { teamRole: "owner" },
    });

    // Fix 2: Anyone with "Owner/Manager" or "Manager" job title → "manager"
    const managerFix = await prisma.employee.updateMany({
      where: {
        listingId: { in: listingIds },
        teamRole: "staff",
        jobTitle: { in: ["Owner/Manager", "Manager", "owner/manager", "manager"] },
      },
      data: { teamRole: "manager" },
    });

    return NextResponse.json({
      fixedOwners: ownerFix.count,
      fixedManagers: managerFix.count,
    });
  } catch (error) {
    console.error("[FIX_ROLES]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
