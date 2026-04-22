import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { getUserFromRequest } from "@/app/utils/mobileAuth";
import getAnalyticsData from "@/app/actions/getAnalyticsData";

export async function GET(request: Request) {
  const currentUser = await getUserFromRequest(request) || await getCurrentUser();
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
