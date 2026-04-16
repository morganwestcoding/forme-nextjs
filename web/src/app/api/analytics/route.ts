import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import getAnalyticsData from "@/app/actions/getAnalyticsData";

export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const analyticsData = await getAnalyticsData(currentUser.id);
    return NextResponse.json(analyticsData);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load analytics data" },
      { status: 500 }
    );
  }
}
