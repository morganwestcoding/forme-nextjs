import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/app/libs/prismadb";

export const dynamic = "force-dynamic";

// Master-only helper. Returns the current master user or a NextResponse error.
async function requireMaster() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { error: NextResponse.json({ error: "Not authenticated" }, { status: 401 }) };
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email as string },
    select: { id: true, role: true },
  });
  if (!user || user.role !== "master") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { user };
}

// Resolve the listing an academy uses to attach services + employees.
// Phase 1's seed creates one Listing per Academy with academyId set.
async function getAcademyListing(academyId: string) {
  return prisma.listing.findFirst({ where: { academyId } });
}

// GET /api/academies/[academyId]/services
//
// Returns every service on the academy's listing. Used by the admin UI.
export async function GET(
  _request: Request,
  { params }: { params: { academyId: string } }
) {
  const auth = await requireMaster();
  if (auth.error) return auth.error;

  const listing = await getAcademyListing(params.academyId);
  if (!listing) {
    return NextResponse.json({ error: "Academy listing not found" }, { status: 404 });
  }

  const services = await prisma.service.findMany({
    where: { listingId: listing.id },
    orderBy: { serviceName: "asc" },
  });

  return NextResponse.json(services);
}

// POST /api/academies/[academyId]/services
//
// Creates a new service on the academy's listing AND syncs it to every active
// student's Employee.serviceIds (Phase 8c — auto-propagation).
export async function POST(
  request: Request,
  { params }: { params: { academyId: string } }
) {
  const auth = await requireMaster();
  if (auth.error) return auth.error;

  const listing = await getAcademyListing(params.academyId);
  if (!listing) {
    return NextResponse.json({ error: "Academy listing not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { serviceName, price, category } = body;

    if (!serviceName?.trim() || typeof price !== "number" || price < 0 || !category?.trim()) {
      return NextResponse.json(
        { error: "serviceName, price (>=0), and category are required" },
        { status: 400 }
      );
    }

    const service = await prisma.service.create({
      data: {
        serviceName: serviceName.trim(),
        price: Math.round(price),
        category: category.trim(),
        listingId: listing.id,
      },
    });

    // Auto-sync: every active student at this academy gets the new service
    // appended to their Employee.serviceIds. New students inherit at registration
    // (Phase 8b), this covers existing students when the menu grows.
    const studentEmployees = await prisma.employee.findMany({
      where: { listingId: listing.id, isActive: true },
      select: { id: true, serviceIds: true },
    });

    await Promise.all(
      studentEmployees.map((emp) =>
        prisma.employee.update({
          where: { id: emp.id },
          data: {
            serviceIds: {
              set: Array.from(new Set([...(emp.serviceIds ?? []), service.id])),
            },
          },
        })
      )
    );

    return NextResponse.json(service);
  } catch (error: any) {
    console.error("[POST academy services]", error);
    return NextResponse.json(
      { error: error.message || "Failed to create service" },
      { status: 500 }
    );
  }
}
