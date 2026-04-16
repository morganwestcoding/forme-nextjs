import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import getTeamData from "@/app/actions/getTeamData";

export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const teamData = await getTeamData(currentUser.id);
    return NextResponse.json(teamData);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load team data" },
      { status: 500 }
    );
  }
}
