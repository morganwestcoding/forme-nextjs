import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

// GET /api/team/pay/agreement?employeeId=xxx
export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");

    if (!employeeId) {
      return NextResponse.json({ error: "Employee ID required" }, { status: 400 });
    }

    const agreement = await prisma.payAgreement.findUnique({
      where: { employeeId },
    });

    return NextResponse.json({ agreement });
  } catch (error) {
    console.error("[PAY_AGREEMENT_GET]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// PUT /api/team/pay/agreement — create or update pay agreement
export async function PUT(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { employeeId, type, splitPercent, rentalAmount, rentalFrequency, autoApprovePayout } = body;

    if (!employeeId || !type) {
      return NextResponse.json({ error: "Employee ID and type required" }, { status: 400 });
    }

    if (!["commission", "chair_rental"].includes(type)) {
      return NextResponse.json({ error: "Type must be 'commission' or 'chair_rental'" }, { status: 400 });
    }

    // Verify the current user owns the listing this employee belongs to
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { listing: { select: { userId: true } } },
    });

    if (!employee || employee.listing.userId !== currentUser.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const data: Record<string, unknown> = {
      type,
      autoApprovePayout: autoApprovePayout ?? false,
    };

    if (type === "commission") {
      if (splitPercent == null || splitPercent < 0 || splitPercent > 100) {
        return NextResponse.json({ error: "Split percent must be 0-100" }, { status: 400 });
      }
      data.splitPercent = splitPercent;
      data.rentalAmount = null;
      data.rentalFrequency = null;
    } else {
      if (rentalAmount == null || rentalAmount < 0) {
        return NextResponse.json({ error: "Rental amount must be positive" }, { status: 400 });
      }
      if (!["daily", "weekly", "monthly"].includes(rentalFrequency)) {
        return NextResponse.json({ error: "Rental frequency must be daily, weekly, or monthly" }, { status: 400 });
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
    console.error("[PAY_AGREEMENT_PUT]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
