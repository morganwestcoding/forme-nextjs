import { NextResponse } from "next/server";
import { apiError, apiErrorCode } from "@/app/utils/api";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

const VALID_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// GET /api/team/availability?employeeId=xxx
export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return apiErrorCode('UNAUTHORIZED');
    }

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");

    if (!employeeId) {
      return apiError("Employee ID required", 400);
    }

    const availability = await prisma.employeeAvailability.findMany({
      where: { employeeId },
      orderBy: { dayOfWeek: "asc" },
    });

    return NextResponse.json({ availability });
  } catch (error) {
    return apiErrorCode('INTERNAL_ERROR');
  }
}

// PUT /api/team/availability — bulk set weekly schedule for an employee
export async function PUT(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return apiErrorCode('UNAUTHORIZED');
    }

    const body = await request.json();
    const { employeeId, schedule } = body;
    // schedule: Array<{ dayOfWeek, startTime, endTime, isOff }>

    if (!employeeId || !Array.isArray(schedule)) {
      return apiError("Employee ID and schedule array required", 400);
    }

    // Verify the employee belongs to a listing owned by the current user
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { listing: { select: { userId: true } } },
    });

    if (!employee) {
      return apiError("Employee not found", 404);
    }

    // Allow if current user is listing owner or the employee themselves
    const isOwner = employee.listing.userId === currentUser.id;
    const isSelf = employee.userId === currentUser.id;
    if (!isOwner && !isSelf) {
      return apiErrorCode('FORBIDDEN');
    }

    // Validate and upsert each day
    const results = [];
    for (const day of schedule) {
      if (!VALID_DAYS.includes(day.dayOfWeek)) continue;

      const upserted = await prisma.employeeAvailability.upsert({
        where: {
          employeeId_dayOfWeek: {
            employeeId,
            dayOfWeek: day.dayOfWeek,
          },
        },
        update: {
          startTime: day.startTime || "09:00",
          endTime: day.endTime || "17:00",
          isOff: day.isOff ?? false,
        },
        create: {
          employeeId,
          dayOfWeek: day.dayOfWeek,
          startTime: day.startTime || "09:00",
          endTime: day.endTime || "17:00",
          isOff: day.isOff ?? false,
        },
      });
      results.push(upserted);
    }

    return NextResponse.json({ availability: results });
  } catch (error) {
    return apiErrorCode('INTERNAL_ERROR');
  }
}
