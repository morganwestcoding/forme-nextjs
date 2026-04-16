import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const employeeRecord = await prisma.employee.findFirst({
      where: { userId: currentUser.id, isActive: true },
    });

    return NextResponse.json({ isEmployee: !!employeeRecord });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to check employee status" },
      { status: 500 }
    );
  }
}
