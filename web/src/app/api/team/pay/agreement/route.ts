import { NextResponse } from "next/server";
import { apiError, apiErrorCode } from "@/app/utils/api";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

// GET /api/team/pay/agreement?employeeId=xxx
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

    const agreement = await prisma.payAgreement.findUnique({
      where: { employeeId },
    });

    return NextResponse.json({ agreement });
  } catch (error) {
    return apiErrorCode('INTERNAL_ERROR');
  }
}

// PUT /api/team/pay/agreement — create or update pay agreement
export async function PUT(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return apiErrorCode('UNAUTHORIZED');
    }

    const body = await request.json();
    const { employeeId, type, splitPercent, rentalAmount, rentalFrequency, autoApprovePayout } = body;

    if (!employeeId || !type) {
      return apiError("Employee ID and type required", 400);
    }

    if (!["commission", "chair_rental"].includes(type)) {
      return apiError("Type must be 'commission' or 'chair_rental'", 400);
    }

    // Verify the current user owns the listing this employee belongs to
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { listing: { select: { userId: true } } },
    });

    if (!employee || employee.listing.userId !== currentUser.id) {
      return apiErrorCode('FORBIDDEN');
    }

    const data: Record<string, unknown> = {
      type,
      autoApprovePayout: autoApprovePayout ?? false,
    };

    if (type === "commission") {
      if (splitPercent == null || splitPercent < 0 || splitPercent > 100) {
        return apiError("Split percent must be 0-100", 400);
      }
      data.splitPercent = splitPercent;
      data.rentalAmount = null;
      data.rentalFrequency = null;
    } else {
      if (rentalAmount == null || rentalAmount < 0) {
        return apiError("Rental amount must be positive", 400);
      }
      if (!["daily", "weekly", "monthly"].includes(rentalFrequency)) {
        return apiError("Rental frequency must be daily, weekly, or monthly", 400);
      }
      data.rentalAmount = rentalAmount;
      data.rentalFrequency = rentalFrequency;
      data.splitPercent = null;
    }

    const agreement = await prisma.payAgreement.upsert({
      where: { employeeId },
      update: data,
      create: { employeeId, ...data } as any,
    });

    return NextResponse.json({ agreement });
  } catch (error) {
    return apiErrorCode('INTERNAL_ERROR');
  }
}
