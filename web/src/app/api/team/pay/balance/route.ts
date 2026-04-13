import { NextResponse } from "next/server";
import { apiError, apiErrorCode } from "@/app/utils/api";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

// GET /api/team/pay/balance?employeeId=xxx
// Calculates: total booking revenue - rental fees (not waived) - commission taken - already paid out
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

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        listing: { select: { userId: true } },
        payAgreement: true,
      },
    });

    if (!employee) {
      return apiError("Employee not found", 404);
    }

    // Auth: must be the employee, the listing owner, or admin
    const isOwner = employee.listing.userId === currentUser.id;
    const isSelf = employee.userId === currentUser.id;
    if (!isOwner && !isSelf) {
      return apiErrorCode('FORBIDDEN');
    }

    // 1. Total booking revenue for this employee (completed payments only)
    const bookings = await prisma.reservation.findMany({
      where: {
        employeeId,
        paymentStatus: "completed",
      },
      select: { totalPrice: true },
    });
    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);

    // 2. Calculate earnings based on pay agreement
    let grossEarnings = totalRevenue;
    let commissionTaken = 0;

    if (employee.payAgreement) {
      if (employee.payAgreement.type === "commission" && employee.payAgreement.splitPercent != null) {
        grossEarnings = totalRevenue * (employee.payAgreement.splitPercent / 100);
        commissionTaken = totalRevenue - grossEarnings;
      }
      // For chair_rental, employee keeps 100% of bookings
    }

    // 3. Total rental fees charged (not waived)
    const chargedPeriods = await prisma.payPeriod.findMany({
      where: {
        employeeId,
        status: "charged",
      },
      select: { feeAmount: true },
    });
    const totalRentalFees = chargedPeriods.reduce((sum, p) => sum + p.feeAmount, 0);

    // Pending rental fees (not yet charged or waived)
    const pendingPeriods = await prisma.payPeriod.findMany({
      where: {
        employeeId,
        status: "pending",
      },
      select: { feeAmount: true },
    });
    const pendingRentalFees = pendingPeriods.reduce((sum, p) => sum + p.feeAmount, 0);

    // 4. Total already paid out
    const completedPayouts = await prisma.payout.findMany({
      where: {
        employeeId,
        status: "completed",
      },
      select: { amount: true },
    });
    const totalPaidOut = completedPayouts.reduce((sum, p) => sum + p.amount, 0);

    // Pending payouts (approved or processing)
    const pendingPayouts = await prisma.payout.findMany({
      where: {
        employeeId,
        status: { in: ["pending", "approved", "processing"] },
      },
      select: { amount: true },
    });
    const totalPendingPayouts = pendingPayouts.reduce((sum, p) => sum + p.amount, 0);

    // 5. Available balance
    const availableBalance = grossEarnings - totalRentalFees - totalPaidOut - totalPendingPayouts;

    return NextResponse.json({
      totalRevenue,
      grossEarnings,
      commissionTaken,
      totalRentalFees,
      pendingRentalFees,
      totalPaidOut,
      totalPendingPayouts,
      availableBalance,
      agreementType: employee.payAgreement?.type || null,
    });
  } catch (error) {
    console.error("[BALANCE_GET]", error);
    return apiErrorCode('INTERNAL_ERROR');
  }
}
