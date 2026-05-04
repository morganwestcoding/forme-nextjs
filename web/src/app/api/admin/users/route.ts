import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/utils/adminAuth";
import prisma from "@/app/libs/prismadb";
import { apiErrorCode } from "@/app/utils/api";

// GET /api/admin/users — paginated user search for the admin user list.
// Query params: ?q=&role=&tier=&page=&pageSize= (mirrors the SSR
// /admin/users page). Master/admin only.
export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if ('error' in auth) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const role = searchParams.get("role");
    const tier = searchParams.get("tier");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "50", 10)));

    const where: any = {};
    if (q.trim()) {
      where.OR = [
        { name: { contains: q.trim(), mode: "insensitive" } },
        { email: { contains: q.trim(), mode: "insensitive" } },
      ];
    }
    if (role) where.role = role;
    if (tier) where.subscriptionTier = tier;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          subscriptionTier: true,
          isSubscribed: true,
          verificationStatus: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users: users.map((u) => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
      })),
      total,
      page,
      pageSize,
    });
  } catch (error) {
    return apiErrorCode("INTERNAL_ERROR");
  }
}
