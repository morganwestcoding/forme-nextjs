import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { apiError } from "@/app/utils/api";

// GET /api/academies — returns all partner academies for the licensing
// "Need Training" page and the student registration academy picker.
// Public endpoint (no auth required) so the registration flow can call it
// before a user is logged in.
export async function GET() {
  try {
    const academies = await prisma.academy.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        location: true,
        logoUrl: true,
        website: true,
        courses: true,
        duration: true,
        priceLabel: true,
        rating: true,
      },
    });

    return NextResponse.json(academies);
  } catch (error) {
    console.error("[GET /api/academies]", error);
    return apiError("Failed to load academies", 500);
  }
}
