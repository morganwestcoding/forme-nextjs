import { NextResponse } from "next/server";
import { apiError, apiErrorCode } from "@/app/utils/api";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

// GET /api/team/pay/periods?employeeId=xxx — list pay periods
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

    const periods = await prisma.payPeriod.findMany({
      where: { employeeId },
      orderBy: { periodStart: "desc" },
      take: 20,
    });

    return NextResponse.json({
      periods: periods.map((p) => ({
        id: p.id,
        periodStart: p.periodStart.toISOString(),
        periodEnd: p.periodEnd.toISOString(),
        feeAmount: p.feeAmount,
        status: p.status,
        waivedAt: p.waivedAt?.toISOString() || null,
        waivedReason: p.waivedReason,
      })),
    });
  } catch (error) {
    return apiErrorCode('INTERNAL_ERROR');
  }
}

// POST /api/team/pay/periods — generate a new pay period (for chair rental employees)
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return apiErrorCode('UNAUTHORIZED');
    }

    const body = await request.json();
    const { employeeId } = body;

    if (!employeeId) {
      return apiError("Employee ID required", 400);
    }

    // Verify ownership
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        listing: { select: { userId: true } },
        payAgreement: true,
      },
    });

    if (!employee || employee.listing.userId !== currentUser.id) {
      return apiErrorCode('FORBIDDEN');
    }

    if (!employee.payAgreement || employee.payAgreement.type !== "chair_rental") {
      return apiError("Employee does not have a chair rental agreement", 400);
    }

    const { rentalAmount, rentalFrequency } = employee.payAgreement;
    if (!rentalAmount || !rentalFrequency) {
      return apiError("Rental details not configured", 400);
    }

    // Calculate period dates based on frequency
    const now = new Date();
    let periodStart: Date;
    let periodEnd: Date;

    if (rentalFrequency === "daily") {
      periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      periodEnd = new Date(periodStart.getTime() + 24 * 60 * 60 * 1000 - 1);
    } else if (rentalFrequency === "weekly") {
      const dayOfWeek = now.getDay();
      periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
      periodEnd = new Date(periodStart.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
    } else {
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }

    // Check for existing period in this range
    const existing = await prisma.payPeriod.findFirst({
      where: {
        employeeId,
        periodStart: { gte: periodStart },
        periodEnd: { lte: new Date(periodEnd.getTime() + 1000) },
      },
    });

    if (existing) {
      return apiError("Period already exists", 409);
    }

    const period = await prisma.payPeriod.create({
      data: {
        employeeId,
        periodStart,
        periodEnd,
        feeAmount: rentalAmount,
        status: "charged",
      },
    });

    return NextResponse.json({
      id: period.id,
      periodStart: period.periodStart.toISOString(),
      periodEnd: period.periodEnd.toISOString(),
      feeAmount: period.feeAmount,
      status: period.status,
    });
  } catch (error) {
    return apiErrorCode('INTERNAL_ERROR');
  }
}

// PATCH /api/team/pay/periods — waive or charge a period
export async function PATCH(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return apiErrorCode('UNAUTHORIZED');
    }

    const body = await request.json();
    const { periodId, action, reason } = body; // action: "waive" | "charge"

    if (!periodId || !["waive", "charge"].includes(action)) {
      return apiError("Invalid request", 400);
    }

    const period = await prisma.payPeriod.findUnique({
      where: { id: periodId },
      include: {
        employee: {
          include: { listing: { select: { userId: true } } },
        },
      },
    });

    if (!period || period.employee.listing.userId !== currentUser.id) {
      return apiErrorCode('FORBIDDEN');
    }

    if (action === "waive") {
      await prisma.payPeriod.update({
        where: { id: periodId },
        data: {
          status: "waived",
          waivedAt: new Date(),
          waivedReason: reason || null,
        },
      });

      await prisma.notification.create({
        data: {
          type: "FEE_WAIVED",
          content: `Your rental fee of $${period.feeAmount.toFixed(2)} for ${period.periodStart.toLocaleDateString()} - ${period.periodEnd.toLocaleDateString()} has been waived`,
          userId: period.employee.userId,
        },
      });
    } else {
      await prisma.payPeriod.update({
        where: { id: periodId },
        data: { status: "charged", waivedAt: null, waivedReason: null },
      });
    }

    return NextResponse.json({ status: action === "waive" ? "waived" : "charged" });
  } catch (error) {
    return apiErrorCode('INTERNAL_ERROR');
  }
}
