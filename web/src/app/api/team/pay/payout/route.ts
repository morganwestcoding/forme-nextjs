import { NextResponse } from "next/server";
import { apiError, apiErrorCode } from "@/app/utils/api";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

// GET /api/team/pay/payout?employeeId=xxx — get payout history
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

    const payouts = await prisma.payout.findMany({
      where: { employeeId },
      orderBy: { requestedAt: "desc" },
    });

    return NextResponse.json({
      payouts: payouts.map((p) => ({
        id: p.id,
        amount: p.amount,
        status: p.status,
        note: p.note,
        requestedAt: p.requestedAt.toISOString(),
        processedAt: p.processedAt?.toISOString() || null,
      })),
    });
  } catch (error) {
    return apiErrorCode('INTERNAL_ERROR');
  }
}

// POST /api/team/pay/payout — employee requests a payout
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return apiErrorCode('UNAUTHORIZED');
    }

    const body = await request.json();
    const { employeeId, amount, note } = body;

    if (!employeeId || !amount || amount <= 0) {
      return apiError("Valid employee ID and amount required", 400);
    }

    // Verify the requester is the employee
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        listing: { select: { userId: true } },
        payAgreement: true,
      },
    });

    if (!employee || employee.userId !== currentUser.id) {
      return apiErrorCode('FORBIDDEN');
    }

    // Check if employee has Stripe Connect set up
    const employeeUser = await prisma.user.findUnique({
      where: { id: employee.userId },
      select: { stripeConnectAccountId: true, stripeConnectPayoutsEnabled: true },
    });

    if (!employeeUser?.stripeConnectAccountId || !employeeUser.stripeConnectPayoutsEnabled) {
      return apiError("Set up your payment account first", 400);
    }

    // Check if auto-approve is enabled
    const autoApprove = employee.payAgreement?.autoApprovePayout ?? false;

    const payout = await prisma.payout.create({
      data: {
        employeeId,
        amount,
        note: note || null,
        status: autoApprove ? "approved" : "pending",
      },
    });

    // If auto-approved, process the Stripe transfer immediately
    if (autoApprove) {
      try {
        const businessOwner = await prisma.user.findUnique({
          where: { id: employee.listing.userId },
          select: { stripeConnectAccountId: true },
        });

        if (businessOwner?.stripeConnectAccountId) {
          const transfer = await stripe.transfers.create({
            amount: Math.round(amount * 100),
            currency: "usd",
            destination: employeeUser.stripeConnectAccountId,
            metadata: {
              payoutId: payout.id,
              employeeId,
              employeeName: employee.fullName,
            },
          });

          await prisma.payout.update({
            where: { id: payout.id },
            data: {
              status: "completed",
              stripeTransferId: transfer.id,
              processedAt: new Date(),
            },
          });
        }
      } catch (stripeError) {
        // Revert to pending if transfer fails
        await prisma.payout.update({
          where: { id: payout.id },
          data: { status: "pending" },
        });
      }
    } else {
      // Notify the business owner
      await prisma.notification.create({
        data: {
          type: "PAYOUT_REQUEST",
          content: `${employee.fullName} requested a payout of $${amount.toFixed(2)}`,
          userId: employee.listing.userId,
        },
      });
    }

    return NextResponse.json({
      id: payout.id,
      status: payout.status,
      amount: payout.amount,
    });
  } catch (error) {
    return apiErrorCode('INTERNAL_ERROR');
  }
}

// PATCH /api/team/pay/payout — owner approves/denies a payout
export async function PATCH(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return apiErrorCode('UNAUTHORIZED');
    }

    const body = await request.json();
    const { payoutId, action, note } = body; // action: "approve" | "deny"

    if (!payoutId || !["approve", "deny"].includes(action)) {
      return apiError("Invalid request", 400);
    }

    const payout = await prisma.payout.findUnique({
      where: { id: payoutId },
      include: {
        employee: {
          include: {
            listing: { select: { userId: true } },
            user: {
              select: { stripeConnectAccountId: true, stripeConnectPayoutsEnabled: true },
            },
          },
        },
      },
    });

    if (!payout) {
      return apiError("Payout not found", 404);
    }

    // Only the listing owner can approve/deny
    if (payout.employee.listing.userId !== currentUser.id) {
      return apiErrorCode('FORBIDDEN');
    }

    if (payout.status !== "pending") {
      return apiError("Payout already processed", 400);
    }

    if (action === "deny") {
      await prisma.payout.update({
        where: { id: payoutId },
        data: { status: "denied", note: note || null, processedAt: new Date() },
      });

      await prisma.notification.create({
        data: {
          type: "PAYOUT_DENIED",
          content: `Your payout request of $${payout.amount.toFixed(2)} was denied${note ? `: ${note}` : ""}`,
          userId: payout.employee.userId,
        },
      });

      return NextResponse.json({ status: "denied" });
    }

    // Approve and process Stripe transfer
    const employeeStripeAccount = payout.employee.user.stripeConnectAccountId;
    if (!employeeStripeAccount || !payout.employee.user.stripeConnectPayoutsEnabled) {
      return apiError("Employee payment account not set up", 400);
    }

    try {
      const transfer = await stripe.transfers.create({
        amount: Math.round(payout.amount * 100),
        currency: "usd",
        destination: employeeStripeAccount,
        metadata: {
          payoutId: payout.id,
          employeeId: payout.employeeId,
          employeeName: payout.employee.fullName,
        },
      });

      await prisma.payout.update({
        where: { id: payoutId },
        data: {
          status: "completed",
          stripeTransferId: transfer.id,
          processedAt: new Date(),
        },
      });

      await prisma.notification.create({
        data: {
          type: "PAYOUT_COMPLETED",
          content: `Your payout of $${payout.amount.toFixed(2)} has been sent to your account`,
          userId: payout.employee.userId,
        },
      });

      return NextResponse.json({ status: "completed", transferId: transfer.id });
    } catch (stripeError: any) {
      return apiError(`Transfer failed: ${stripeError.message}`, 500);
    }
  } catch (error) {
    return apiErrorCode('INTERNAL_ERROR');
  }
}
