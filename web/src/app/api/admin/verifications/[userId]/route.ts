import { NextResponse } from "next/server";
import { apiError, apiErrorCode } from "@/app/utils/api";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/app/libs/prismadb";
import { sendEmail } from "@/app/libs/email";


export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return apiErrorCode("UNAUTHORIZED");

  const admin = await prisma.user.findUnique({
    where: { email: session.user.email as string },
  });
  if (!admin || (admin.role !== "master" && admin.role !== "admin")) return apiErrorCode("FORBIDDEN");

  const { action, reason } = (await request.json()) as {
    action: "approve" | "reject";
    reason?: string;
  };

  if (!["approve", "reject"].includes(action)) {
    return apiError("Invalid action", 400);
  }

  const target = await prisma.user.findUnique({ where: { id: params.userId } });
  if (!target) return apiErrorCode("USER_NOT_FOUND");

  if (target.verificationStatus !== "pending") {
    return apiError("User is not pending verification", 400);
  }

  const now = new Date();

  if (action === "approve") {
    await prisma.user.update({
      where: { id: params.userId },
      data: {
        verificationStatus: "verified",
        verifiedAt: now,
      },
    });

    // Notify user
    await prisma.notification.create({
      data: {
        type: "VERIFICATION_APPROVED",
        content: "Your licensing has been verified! You can now accept bookings.",
        userId: params.userId,
      },
    });

    // Email
    if (target.email) {
      sendEmail({
        to: target.email,
        subject: "Verification Approved!",
        html: `<h2>You're Verified!</h2><p>Your licensing has been approved. You can now accept bookings on ForMe.</p>`,
      }).catch(() => {});
    }
  } else {
    await prisma.user.update({
      where: { id: params.userId },
      data: {
        verificationStatus: "rejected",
        verificationRejectedAt: now,
        rejectionReason: reason || null,
      },
    });

    await prisma.notification.create({
      data: {
        type: "VERIFICATION_REJECTED",
        content: reason
          ? `Your verification was not approved: ${reason}`
          : "Your verification was not approved. Please resubmit with updated documentation.",
        userId: params.userId,
      },
    });

    if (target.email) {
      sendEmail({
        to: target.email,
        subject: "Verification Update",
        html: `<h2>Verification Update</h2><p>${
          reason
            ? `Your submission was not approved: ${reason}`
            : "Your submission was not approved. Please resubmit with updated documentation."
        }</p>`,
      }).catch(() => {});
    }
  }

  return NextResponse.json({ ok: true, action });
}
