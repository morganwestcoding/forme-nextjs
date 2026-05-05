// app/api/independent-workers/route.ts
//
// Returns all active independent providers (SafeEmployee[]) so non-web clients
// (currently iOS Discover) can include them alongside listing-employees in
// "Trending Professionals". Web composes this server-side in app/page.tsx;
// see getIndependentWorkers.ts for the shell-listing rationale.
import { NextResponse } from "next/server";
import getIndependentWorkers from "@/app/actions/getIndependentWorkers";

export async function GET() {
  try {
    const workers = await getIndependentWorkers();
    return NextResponse.json({ workers });
  } catch {
    return new Response("Internal Server Error", { status: 500 });
  }
}
