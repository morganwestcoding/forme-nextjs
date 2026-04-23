import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { getUserFromRequest } from "@/app/utils/mobileAuth";
import getAnalyticsData, { AnalyticsMonths } from "@/app/actions/getAnalyticsData";

// Max 2 years of history — past that the monthly buckets get unwieldy and
// the Prisma query does real work for little payoff.
const MAX_SPAN_DAYS = 730;

export async function GET(request: Request) {
  const currentUser = await getUserFromRequest(request) || await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);

    // New path: ?start=YYYY-MM-DD&end=YYYY-MM-DD. Preferred. Date-only
    // format keeps the client's selected calendar day exactly what the
    // server sees — no timezone shift regardless of where either end
    // of the wire is deployed.
    const startRaw = url.searchParams.get('start');
    const endRaw = url.searchParams.get('end');
    if (startRaw && endRaw) {
      const parseLocalDate = (s: string): Date | null => {
        // Accept strict YYYY-MM-DD; also accept full ISO as a fallback
        // for any old client still sending timestamps.
        const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (!m) return null;
        const y = Number(m[1]); const mo = Number(m[2]); const d = Number(m[3]);
        if (!y || !mo || !d) return null;
        const date = new Date(y, mo - 1, d);
        return isNaN(date.getTime()) ? null : date;
      };
      const start = parseLocalDate(startRaw);
      const end = parseLocalDate(endRaw);
      if (!start || !end) {
        return NextResponse.json({ error: "Invalid start/end — expected YYYY-MM-DD" }, { status: 400 });
      }
      if (start.getTime() > end.getTime()) {
        return NextResponse.json({ error: "start must be ≤ end" }, { status: 400 });
      }
      const spanDays = Math.round((end.getTime() - start.getTime()) / 86_400_000);
      if (spanDays > MAX_SPAN_DAYS) {
        return NextResponse.json({ error: `Range must be ≤ ${MAX_SPAN_DAYS} days` }, { status: 400 });
      }
      const analyticsData = await getAnalyticsData(currentUser.id, start, end);
      return NextResponse.json(analyticsData);
    }

    // Legacy back-compat: ?months=N. Kept so the web app and any existing
    // mobile installs don't break while the update rolls out.
    const monthsRaw = Number(url.searchParams.get('months') ?? '12');
    const months: AnalyticsMonths =
      monthsRaw === 1 || monthsRaw === 3 || monthsRaw === 6 || monthsRaw === 12
        ? (monthsRaw as AnalyticsMonths)
        : 12;
    const analyticsData = await getAnalyticsData(currentUser.id, months);
    return NextResponse.json(analyticsData);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load analytics data" },
      { status: 500 }
    );
  }
}
