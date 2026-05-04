import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/app/libs/prismadb";
import { apiError, apiErrorCode } from "@/app/utils/api";


async function requireMaster() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { error: apiError("Not authenticated", 401) };
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email as string },
    select: { id: true, role: true },
  });
  if (!user || (user.role !== "master" && user.role !== "admin")) {
    return { error: apiErrorCode("FORBIDDEN") };
  }
  return { user };
}

// Verifies the service actually belongs to the academy in the URL — prevents
// editing a service across academy boundaries.
async function loadAcademyService(academyId: string, serviceId: string) {
  const listing = await prisma.listing.findFirst({ where: { academyId } });
  if (!listing) return null;
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || service.listingId !== listing.id) return null;
  return { listing, service };
}

// PATCH /api/academies/[academyId]/services/[serviceId]
//
// Updates name / price / category. Doesn't touch student Employee.serviceIds
// because the service id is unchanged.
export async function PATCH(
  request: Request,
  { params }: { params: { academyId: string; serviceId: string } }
) {
  const auth = await requireMaster();
  if (auth.error) return auth.error;

  const found = await loadAcademyService(params.academyId, params.serviceId);
  if (!found) {
    return apiError("Service not found", 404);
  }

  try {
    const body = await request.json();
    const data: any = {};

    if (typeof body.serviceName === "string") {
      if (!body.serviceName.trim()) {
        return apiError("serviceName cannot be empty", 400);
      }
      data.serviceName = body.serviceName.trim();
    }

    if (typeof body.price === "number") {
      if (body.price < 0) {
        return apiError("price must be >= 0", 400);
      }
      data.price = Math.round(body.price);
    }

    if (typeof body.category === "string") {
      if (!body.category.trim()) {
        return apiError("category cannot be empty", 400);
      }
      data.category = body.category.trim();
    }

    const updated = await prisma.service.update({
      where: { id: found.service.id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return apiError(error.message || "Failed to update service", 500);
  }
}

// DELETE /api/academies/[academyId]/services/[serviceId]
//
// Hard-deletes the service. Also strips the service id out of every active
// student's Employee.serviceIds at this academy (Phase 8c).
export async function DELETE(
  _request: Request,
  { params }: { params: { academyId: string; serviceId: string } }
) {
  const auth = await requireMaster();
  if (auth.error) return auth.error;

  const found = await loadAcademyService(params.academyId, params.serviceId);
  if (!found) {
    return apiError("Service not found", 404);
  }

  try {
    // Strip from student employees first so we never have a dangling reference.
    const studentEmployees = await prisma.employee.findMany({
      where: { listingId: found.listing.id, isActive: true },
      select: { id: true, serviceIds: true },
    });

    await Promise.all(
      studentEmployees
        .filter((e) => (e.serviceIds ?? []).includes(found.service.id))
        .map((emp) =>
          prisma.employee.update({
            where: { id: emp.id },
            data: {
              serviceIds: {
                set: (emp.serviceIds ?? []).filter((id) => id !== found.service.id),
              },
            },
          })
        )
    );

    await prisma.service.delete({ where: { id: found.service.id } });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return apiError(error.message || "Failed to delete service", 500);
  }
}
