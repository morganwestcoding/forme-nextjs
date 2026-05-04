import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/app/libs/prismadb";
import { apiError, apiErrorCode } from "@/app/utils/api";
import { getUserFromRequest } from "@/app/utils/mobileAuth";

/**
 * Require master/admin role on a request. Accepts either a NextAuth web session
 * or a mobile bearer token. Returns the resolved admin user, or a NextResponse
 * error to short-circuit the route.
 *
 * Usage:
 *   const auth = await requireAdmin(request);
 *   if ('error' in auth) return auth.error;
 *   // auth.user is the admin
 */
export async function requireAdmin(request: Request) {
  const mobileUser = await getUserFromRequest(request);
  const session = mobileUser ? null : await getServerSession(authOptions);
  if (!mobileUser && !session?.user?.email) {
    return { error: apiErrorCode("UNAUTHORIZED") };
  }

  const user = mobileUser
    ? await prisma.user.findUnique({
        where: { id: mobileUser.id },
        select: { id: true, role: true, email: true },
      })
    : await prisma.user.findUnique({
        where: { email: session!.user!.email as string },
        select: { id: true, role: true, email: true },
      });

  if (!user || (user.role !== "master" && user.role !== "admin")) {
    return { error: apiErrorCode("FORBIDDEN") };
  }
  return { user };
}
