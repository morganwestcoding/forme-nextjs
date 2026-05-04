import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/utils/adminAuth";
import getAdminStats from "@/app/actions/getAdminStats";
import { apiErrorCode } from "@/app/utils/api";

// GET /api/admin/stats — KPI snapshot for the admin dashboard. Wraps the
// existing `getAdminStats` server action so iOS gets the same numbers the
// web SSR page renders. Master/admin only.
export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if ('error' in auth) return auth.error;

  try {
    const stats = await getAdminStats();
    return NextResponse.json(stats);
  } catch (error) {
    return apiErrorCode("INTERNAL_ERROR");
  }
}
