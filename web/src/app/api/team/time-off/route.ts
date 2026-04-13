import { NextResponse } from "next/server";
import { apiError, apiErrorCode } from "@/app/utils/api";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

// GET /api/team/time-off?listingId=xxx
export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return apiErrorCode('UNAUTHORIZED');
    }

    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get("listingId");

    if (!listingId) {
      return apiError("Listing ID required", 400);
    }

    // Get all time off requests for employees in this listing
    const requests = await prisma.timeOffRequest.findMany({
      where: {
        employee: { listingId },
      },
      include: {
        employee: {
          select: { id: true, fullName: true, userId: true },
        },
      },
      orderBy: { startDate: "asc" },
    });

    return NextResponse.json({
      requests: requests.map((r) => ({
        id: r.id,
        employeeId: r.employeeId,
        employeeName: r.employee.fullName,
        startDate: r.startDate.toISOString(),
        endDate: r.endDate.toISOString(),
        reason: r.reason,
        status: r.status,
        createdAt: r.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("[TIME_OFF_GET]", error);
    return apiErrorCode('INTERNAL_ERROR');
  }
}

// POST /api/team/time-off — create a time off request
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return apiErrorCode('UNAUTHORIZED');
    }

    const body = await request.json();
    const { employeeId, startDate, endDate, reason } = body;

    if (!employeeId || !startDate || !endDate) {
      return apiErrorCode('MISSING_FIELDS');
    }

    // Verify the employee exists and the current user is either the employee or the listing owner
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { listing: { select: { userId: true } } },
    });

    if (!employee) {
      return apiError("Employee not found", 404);
    }

    const isOwner = employee.listing.userId === currentUser.id;
    const isSelf = employee.userId === currentUser.id;
    if (!isOwner && !isSelf) {
      return apiErrorCode('FORBIDDEN');
    }

    const timeOff = await prisma.timeOffRequest.create({
      data: {
        employeeId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason: reason || null,
        // Auto-approve if submitted by the listing owner
        status: isOwner ? "approved" : "pending",
      },
    });

    // If submitted by employee, notify the listing owner
    if (!isOwner) {
      await prisma.notification.create({
        data: {
          type: "TIME_OFF_REQUEST",
          content: `${employee.fullName} requested time off from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`,
          userId: employee.listing.userId,
        },
      });
    }

    return NextResponse.json({
      id: timeOff.id,
      startDate: timeOff.startDate.toISOString(),
      endDate: timeOff.endDate.toISOString(),
      reason: timeOff.reason,
      status: timeOff.status,
    });
  } catch (error) {
    console.error("[TIME_OFF_POST]", error);
    return apiErrorCode('INTERNAL_ERROR');
  }
}

// PATCH /api/team/time-off — approve or deny a request
export async function PATCH(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return apiErrorCode('UNAUTHORIZED');
    }

    const body = await request.json();
    const { requestId, status } = body; // status: "approved" | "denied"

    if (!requestId || !["approved", "denied"].includes(status)) {
      return apiError("Invalid request", 400);
    }

    // Get the time off request and verify ownership
    const timeOff = await prisma.timeOffRequest.findUnique({
      where: { id: requestId },
      include: {
        employee: {
          include: { listing: { select: { userId: true, title: true } } },
        },
      },
    });

    if (!timeOff) {
      return apiError("Request not found", 404);
    }

    if (timeOff.employee.listing.userId !== currentUser.id) {
      return apiErrorCode('FORBIDDEN');
    }

    const updated = await prisma.timeOffRequest.update({
      where: { id: requestId },
      data: { status },
    });

    // Notify the employee
    await prisma.notification.create({
      data: {
        type: status === "approved" ? "TIME_OFF_APPROVED" : "TIME_OFF_DENIED",
        content: `Your time off request for ${timeOff.startDate.toLocaleDateString()} - ${timeOff.endDate.toLocaleDateString()} has been ${status}`,
        userId: timeOff.employee.userId,
      },
    });

    return NextResponse.json({ status: updated.status });
  } catch (error) {
    console.error("[TIME_OFF_PATCH]", error);
    return apiErrorCode('INTERNAL_ERROR');
  }
}
