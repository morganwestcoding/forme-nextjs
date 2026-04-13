import { NextResponse } from "next/server";
import { apiError, apiErrorCode } from "@/app/utils/api";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

// GET /api/team/members — get all employees for the current user's listings
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return apiErrorCode('UNAUTHORIZED');
    }

    // Get all listings owned by the current user
    const listings = await prisma.listing.findMany({
      where: { userId: currentUser.id },
      select: { id: true, title: true, category: true },
    });

    const listingIds = listings.map((l) => l.id);

    if (listingIds.length === 0) {
      return NextResponse.json({ members: [] });
    }

    // Get all employees across the user's listings
    const employees = await prisma.employee.findMany({
      where: { listingId: { in: listingIds } },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            imageSrc: true,
            email: true,
          },
        },
        availability: true,
        timeOffRequests: {
          where: {
            endDate: { gte: new Date() },
          },
          orderBy: { startDate: "asc" },
        },
        reservations: {
          where: {
            date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          },
          select: { id: true, totalPrice: true, date: true, status: true },
        },
      },
    });

    const members = employees.map((emp) => ({
      id: emp.id,
      fullName: emp.fullName,
      jobTitle: emp.jobTitle,
      userId: emp.userId,
      listingId: emp.listingId,
      serviceIds: emp.serviceIds,
      isActive: emp.isActive,
      isIndependent: emp.isIndependent,
      teamRole: emp.teamRole,
      createdAt: emp.createdAt.toISOString(),
      user: emp.user,
      availability: emp.availability,
      timeOffRequests: emp.timeOffRequests.map((tor) => ({
        id: tor.id,
        startDate: tor.startDate.toISOString(),
        endDate: tor.endDate.toISOString(),
        reason: tor.reason,
        status: tor.status,
      })),
      upcomingBookings: emp.reservations.length,
      monthlyRevenue: emp.reservations
        .filter((r) => r.status !== "declined")
        .reduce((sum, r) => sum + r.totalPrice, 0),
    }));

    return NextResponse.json({ members, listings });
  } catch (error) {
    console.error("[TEAM_MEMBERS_GET]", error);
    return apiErrorCode('INTERNAL_ERROR');
  }
}

// PATCH /api/team/members — update an employee's role or status
export async function PATCH(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return apiErrorCode('UNAUTHORIZED');
    }

    const body = await request.json();
    const { employeeId, teamRole, isActive } = body;

    if (!employeeId) {
      return apiError("Employee ID required", 400);
    }

    // Verify the employee belongs to a listing owned by the current user
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { listing: { select: { userId: true } } },
    });

    if (!employee || employee.listing.userId !== currentUser.id) {
      return apiErrorCode('FORBIDDEN');
    }

    const updateData: Record<string, unknown> = {};
    if (teamRole !== undefined) updateData.teamRole = teamRole;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updated = await prisma.employee.update({
      where: { id: employeeId },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[TEAM_MEMBERS_PATCH]", error);
    return apiErrorCode('INTERNAL_ERROR');
  }
}
