import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/utils/adminAuth";
import prisma from "@/app/libs/prismadb";
import { apiErrorCode } from "@/app/utils/api";

// GET /api/admin/verifications — list of users awaiting verification approval.
// Mirrors the data the SSR /admin/verifications page fetches. Master/admin only.
export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if ('error' in auth) return auth.error;

  try {
    const pendingUsers = await prisma.user.findMany({
      where: { verificationStatus: "pending" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        licensingImage: true,
        createdAt: true,
        userType: true,
        location: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      users: pendingUsers.map((u) => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    return apiErrorCode("INTERNAL_ERROR");
  }
}
