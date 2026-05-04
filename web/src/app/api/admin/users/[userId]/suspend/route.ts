import { NextResponse } from "next/server";
import { apiError, apiErrorCode } from "@/app/utils/api";
import { requireAdmin } from "@/app/utils/adminAuth";
import prisma from "@/app/libs/prismadb";


export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const auth = await requireAdmin(request);
  if ('error' in auth) return auth.error;
  const admin = auth.user;

  const { action } = (await request.json()) as { action: "suspend" | "unsuspend" };

  if (!["suspend", "unsuspend"].includes(action)) {
    return apiError("Invalid action", 400);
  }

  if (params.userId === admin.id) {
    return apiError("Cannot suspend yourself", 400);
  }

  const target = await prisma.user.findUnique({ where: { id: params.userId } });
  if (!target) return apiErrorCode("USER_NOT_FOUND");

  if (target.role === "master") {
    return apiError("Cannot suspend a master admin", 400);
  }

  await prisma.user.update({
    where: { id: params.userId },
    data: {
      role: action === "suspend" ? "suspended" : "user",
    },
  });

  return NextResponse.json({
    ok: true,
    userId: params.userId,
    role: action === "suspend" ? "suspended" : "user",
  });
}
