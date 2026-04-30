// app/actions/getAnalyticsData.ts
import prisma from "@/app/libs/prismadb";
import { hasFeature } from "@/app/utils/subscription";

// Small date helpers used by window-resolution and bucket-walking code.
// Kept local — the rest of the file is the only caller.
function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

export interface AnalyticsData {
  // Window that backs the chart timeseries. Client chooses an arbitrary
  // [start, end] range via presets or a custom picker; server decides
  // bucket granularity based on span length.
  period: {
    start: string;
    end: string;
    label: string;
    days: number;
    granularity: 'day' | 'week' | 'month';
  };
  overview: {
    totalListings: number;
    totalReservations: number;
    totalRevenue: number;
    totalPosts: number;
    totalFollowers: number;
    totalFollowing: number;
  };
  reviews: {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: { rating: number; count: number }[];
  };
  engagement: {
    totalPostViews: number;
    totalPostLikes: number;
    totalPostComments: number;
    totalListingFollowers: number;
  };
  recentActivity: {
    reservations: Array<{
      id: string;
      serviceName: string;
      date: string; // This is a string (ISO format)
      totalPrice: number;
      status: string;
      user: {
        name: string | null;
        image: string | null;
      };
      listing: {
        title: string;
      };
    }>;
    posts: Array<{
      id: string;
      content: string;
      createdAt: string; // This is a string (ISO format)
      likes: string[];
      comments: number;
    }>;
  };
  monthlyData: Array<{
    month: string;
    reservations: number;
    revenue: number;
    posts: number;
  }>;
  topServices: Array<{
    serviceName: string;
    category: string;
    bookings: number;
    revenue: number;
  }>;
  listings: Array<{
    id: string;
    title: string;
    category: string;
    reservations: number;
    revenue: number;
    followers: number;
    reviews: number;
    averageRating: number;
    createdAt: string; // This is a string (ISO format)
  }>;
}

// Legacy aliases preserved so older callers still compile during the
// migration — new code should go through `getAnalyticsData(userId, start, end)`.
export type AnalyticsRange = 'week' | 'month' | 'year';
export type AnalyticsMonths = 1 | 3 | 6 | 12;

export default async function getAnalyticsData(
  userId: string,
  startOrMonths?: Date | AnalyticsMonths,
  endMaybe?: Date,
): Promise<AnalyticsData> {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    // Defense-in-depth: verify subscription access even if the page gate is bypassed
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isSubscribed: true, subscriptionTier: true, subscriptionStatus: true },
    });
    if (!user || !hasFeature(user, 'analytics')) {
      throw new Error("This feature requires an active Gold or Platinum subscription");
    }

    // Resolve the window. Two calling conventions supported so the web
    // client and any old links keep working:
    //   - getAnalyticsData(userId, start: Date, end: Date) ← new
    //   - getAnalyticsData(userId, months: 1|3|6|12)       ← legacy
    //   - getAnalyticsData(userId)                          ← defaults to past year
    const now = new Date();
    let windowStart: Date;
    let windowEnd: Date;

    if (startOrMonths instanceof Date && endMaybe instanceof Date) {
      windowStart = startOfDay(startOrMonths);
      // Interval is half-open [start, end), so bump the end date forward
      // by one day so the caller's `end` is inclusive of that whole day.
      windowEnd = addDays(startOfDay(endMaybe), 1);
    } else if (typeof startOrMonths === 'number') {
      const months = ([1, 3, 6, 12] as const).includes(startOrMonths as 1 | 3 | 6 | 12)
        ? (startOrMonths as AnalyticsMonths)
        : 12;
      windowEnd = now;
      windowStart = new Date(now.getFullYear(), now.getMonth() - months, now.getDate());
    } else {
      windowEnd = now;
      windowStart = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    }

    // Guard: if the caller inverts the range or sends a negative span,
    // coerce to a single-day window so the bucketing code doesn't explode.
    if (windowStart.getTime() >= windowEnd.getTime()) {
      windowStart = startOfDay(windowEnd);
      windowEnd = addDays(windowStart, 1);
    }

    const spanMs = windowEnd.getTime() - windowStart.getTime();
    const spanDays = Math.max(1, Math.round(spanMs / 86_400_000));

    // Overview metrics - Run all queries in parallel
    const [
      totalListings,
      totalReservations,
      totalPosts,
      userWithCounts,
      recentReservations,
      recentPosts,
      monthlyReservations,
      monthlyPosts,
      userListings,
      userReviews,
      userPosts,
      topServiceReservations,
    ] = await Promise.all([
      // Total listings
      prisma.listing.count({
        where: { userId }
      }),

      // Total reservations — match either side of the booking:
      //   - listing owner sees every booking across their listings
      //     (i.e. the sum of all their employees' bookings)
      //   - a worker who doesn't own the listing sees only the bookings
      //     assigned to them as the employee
      // Excludes declined since those weren't actually received.
      prisma.reservation.count({
        where: {
          OR: [
            { listing: { userId } },
            { employee: { userId } },
          ],
          NOT: { status: 'declined' },
        }
      }),

      // Total posts
      prisma.post.count({
        where: { userId }
      }),

      // User with follower/following counts
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          followers: true,
          following: true
        }
      }),

      // Recent reservations — same dual scope: owners see all listing
      // bookings, workers see their own assignments.
      prisma.reservation.findMany({
        where: {
          OR: [
            { listing: { userId } },
            { employee: { userId } },
          ],
        },
        include: {
          user: {
            select: {
              name: true,
              image: true
            }
          },
          listing: {
            select: {
              title: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      }),

      // Recent posts
      prisma.post.findMany({
        where: { userId },
        include: {
          comments: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      }),

      // Reservations within the active window [windowStart, windowEnd).
      // Pull status fields so the chart's revenue line only includes
      // payments that actually settled, matching the revenue tile.
      // Same dual scope as the overview tiles.
      prisma.reservation.findMany({
        where: {
          OR: [
            { listing: { userId } },
            { employee: { userId } },
          ],
          createdAt: { gte: windowStart, lt: windowEnd },
        },
        select: {
          createdAt: true,
          totalPrice: true,
          status: true,
          paymentStatus: true,
          refundStatus: true,
        },
      }),

      // Posts within the active window
      prisma.post.findMany({
        where: {
          userId,
          createdAt: { gte: windowStart, lt: windowEnd },
        },
        select: { createdAt: true },
      }),

      // User listings — drives the Listings tab and listing-level review/
      // follower counts. Reservations are pulled with status fields so the
      // per-listing row can compute real bookings (not declined) and real
      // revenue (paid, not refunded) on the JS side.
      prisma.listing.findMany({
        where: { userId },
        include: {
          reservations: {
            select: {
              totalPrice: true,
              status: true,
              paymentStatus: true,
              refundStatus: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),

      // Reviews for the user (as a provider)
      prisma.review.findMany({
        where: {
          targetType: 'user',
          targetUserId: userId
        },
        select: {
          rating: true
        }
      }),

      // All of the user's posts — for engagement totals (views, likes, comments)
      prisma.post.findMany({
        where: { userId },
        select: {
          likes: true,
          viewedBy: true,
          comments: { select: { id: true } },
        }
      }),

      // Reservations the user is involved in — owner-side or worker-side.
      // Drives the Top Services aggregation across both modes uniformly.
      prisma.reservation.findMany({
        where: {
          OR: [
            { listing: { userId } },
            { employee: { userId } },
          ],
        },
        select: {
          totalPrice: true,
          status: true,
          paymentStatus: true,
          refundStatus: true,
          service: { select: { serviceName: true, category: true } },
        }
      }),
    ]);

    // Reviews scoped to each of the user's listings — fetched after the
    // listings query so we can scope by the actual listing IDs (Review has
    // no relation to Listing in the schema, only a targetListingId string).
    const listingIds = userListings.map((l: any) => l.id);
    const listingReviews = listingIds.length
      ? await prisma.review.findMany({
          where: {
            targetType: 'listing',
            targetListingId: { in: listingIds },
          },
          select: { rating: true, targetListingId: true }
        })
      : [];

    // Predicates used everywhere we surface money or "actual" reservation
    // counts — kept in one place so the listings table, services table,
    // and overview tile can never disagree on what counts as real.
    const isRealReservation = (r: any) => r.status !== 'declined';
    // Loosened from `paymentStatus === 'completed'` to "any non-declined,
    // non-refunded reservation". Keeps the chart's revenue line, the
    // listings table, and the overview Total Revenue tile in lockstep —
    // none of them require the Stripe webhook to have fired in order to
    // surface revenue.
    const isPaidReservation = (r: any) =>
      r.status !== 'declined' &&
      r.refundStatus !== 'completed' &&
      r.refundStatus !== 'approved';

    // Calculate totals — derived from the same all-time, OR-scoped result
    // set used by Top Services so the tile, chart, table, and services
    // breakdown are guaranteed to agree. Filtering happens in JS via
    // isPaidReservation (rather than at the DB layer) to dodge Prisma+
    // MongoDB quirks around NOT/notIn on optional fields.
    const totalRevenue = topServiceReservations
      .filter(isPaidReservation)
      .reduce((sum: number, r: any) => sum + (r.totalPrice || 0), 0);
    const totalFollowers = userWithCounts?.followers.length || 0;
    const totalFollowing = userWithCounts?.following.length || 0;

    // Engagement aggregates — pulled from the user's own posts (views,
    // likes, comments) and the cumulative follower count across all of
    // their listings. These power the Engagement tab's stat cards.
    const totalPostViews = userPosts.reduce(
      (sum: number, p: any) => sum + (p.viewedBy?.length || 0),
      0
    );
    const totalPostLikes = userPosts.reduce(
      (sum: number, p: any) => sum + (p.likes?.length || 0),
      0
    );
    const totalPostComments = userPosts.reduce(
      (sum: number, p: any) => sum + (p.comments?.length || 0),
      0
    );
    const totalListingFollowers = userListings.reduce(
      (sum: number, l: any) => sum + (l.followers?.length || 0),
      0
    );

    // Calculate review statistics
    const totalReviews = userReviews.length;
    const averageRating = totalReviews > 0
      ? Math.round((userReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / totalReviews) * 10) / 10
      : 0;
    const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: userReviews.filter((r: any) => r.rating === rating).length,
    }));

    // Bucket granularity is picked from the span of the window so the
    // chart always shows ~7–45 points regardless of whether the user
    // picked "Today" or "Last 1 Year":
    //   ≤ 45 days  → daily buckets
    //   ≤ 180 days → weekly buckets
    //   otherwise  → monthly buckets
    type Granularity = 'day' | 'week' | 'month';
    const granularity: Granularity =
      spanDays <= 45 ? 'day' : spanDays <= 180 ? 'week' : 'month';

    const bucketNext = (start: Date): Date => {
      const d = new Date(start);
      if (granularity === 'day') d.setDate(d.getDate() + 1);
      else if (granularity === 'week') d.setDate(d.getDate() + 7);
      else d.setMonth(d.getMonth() + 1);
      return d;
    };

    // Anchor the first bucket start at the window start so the buckets
    // line up with the caller's requested window. Weekly buckets are
    // 7-day windows from that anchor (not calendar weeks); monthly
    // buckets snap to the first of each calendar month so users see
    // whole months on the axis.
    let firstBucketStart: Date;
    if (granularity === 'month') {
      firstBucketStart = new Date(windowStart.getFullYear(), windowStart.getMonth(), 1);
    } else {
      firstBucketStart = new Date(windowStart);
    }

    const monthlyData: AnalyticsData['monthlyData'] = [];
    let cursor = firstBucketStart;
    while (cursor.getTime() < windowEnd.getTime()) {
      const next = bucketNext(cursor);
      const bucketRes = monthlyReservations.filter((r: any) => r.createdAt >= cursor && r.createdAt < next);
      const bucketPosts = monthlyPosts.filter((p: any) => p.createdAt >= cursor && p.createdAt < next);
      const label =
        granularity === 'month'
          ? cursor.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          : cursor.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      // Reservations count uses the same "real" filter as the overview
      // tile, and revenue uses the same "paid" filter as the revenue
      // tile, so the chart and the headline numbers stay consistent.
      monthlyData.push({
        month: label,
        reservations: bucketRes.filter(isRealReservation).length,
        revenue: bucketRes
          .filter(isPaidReservation)
          .reduce((sum: number, r: any) => sum + r.totalPrice, 0),
        posts: bucketPosts.length,
      });
      cursor = next;
    }

    // Human-readable window label — "10 Feb 2023 – 17 Mar 2023" style,
    // matching the date-range picker's header.
    const inclusiveEnd = addDays(windowEnd, -1);
    const periodLabel = spanDays === 1
      ? windowStart.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
      : `${windowStart.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} – ${inclusiveEnd.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`;

    // Top services — aggregated from the user's involved reservations
    // (owner-side or worker-side). Bookings = real (non-declined),
    // revenue = subset that paid and wasn't refunded.
    const serviceMap = new Map<string, {
      serviceName: string;
      category: string;
      bookings: number;
      revenue: number;
    }>();

    topServiceReservations.forEach((r: any) => {
      if (!r.service) return;
      const key = `${r.service.serviceName}-${r.service.category}`;
      const entry = serviceMap.get(key) ?? {
        serviceName: r.service.serviceName,
        category: r.service.category,
        bookings: 0,
        revenue: 0,
      };
      if (isRealReservation(r)) entry.bookings += 1;
      if (isPaidReservation(r)) entry.revenue += r.totalPrice;
      serviceMap.set(key, entry);
    });

    const topServices = Array.from(serviceMap.values())
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 10);

    // Index listing reviews by listing ID so each listing row can carry
    // its own review count + average rating without an N+1 lookup.
    const reviewsByListing = new Map<string, { count: number; sum: number }>();
    listingReviews.forEach((r: any) => {
      const key = r.targetListingId;
      if (!key) return;
      const entry = reviewsByListing.get(key) ?? { count: 0, sum: 0 };
      entry.count += 1;
      entry.sum += r.rating;
      reviewsByListing.set(key, entry);
    });

    // Process listings with performance data
    const listingsWithStats = userListings.map((listing: any) => {
      const realRes = listing.reservations.filter(isRealReservation);
      const paidRes = listing.reservations.filter(isPaidReservation);
      const reviewEntry = reviewsByListing.get(listing.id);
      return {
        id: listing.id,
        title: listing.title,
        category: listing.category,
        reservations: realRes.length,
        revenue: paidRes.reduce((sum: number, r: any) => sum + r.totalPrice, 0),
        followers: listing.followers?.length ?? 0,
        reviews: reviewEntry?.count ?? 0,
        averageRating: reviewEntry && reviewEntry.count > 0
          ? Math.round((reviewEntry.sum / reviewEntry.count) * 10) / 10
          : 0,
        createdAt: listing.createdAt.toISOString()
      };
    });

    // Transform data to safe format
    const safeAnalyticsData: AnalyticsData = {
      period: {
        start: windowStart.toISOString(),
        // Return the caller's inclusive end (one day before our half-open
        // windowEnd) so iOS/web don't have to adjust.
        end: inclusiveEnd.toISOString(),
        label: periodLabel,
        days: spanDays,
        granularity,
      },
      overview: {
        totalListings,
        totalReservations,
        totalRevenue,
        totalPosts,
        totalFollowers,
        totalFollowing
      },
      reviews: {
        totalReviews,
        averageRating,
        ratingDistribution
      },
      engagement: {
        totalPostViews,
        totalPostLikes,
        totalPostComments,
        totalListingFollowers,
      },
      recentActivity: {
        reservations: recentReservations.map((reservation: any) => ({
          id: reservation.id,
          serviceName: reservation.serviceName,
          date: reservation.date.toISOString(),
          totalPrice: reservation.totalPrice,
          status: reservation.status,
          user: {
            name: reservation.user.name,
            image: reservation.user.image
          },
          listing: {
            title: reservation.listing.title
          }
        })),
        posts: recentPosts.map((post: any) => ({
          id: post.id,
          content: post.content,
          createdAt: post.createdAt.toISOString(),
          likes: post.likes,
          comments: post.comments.length
        }))
      },
      monthlyData,
      topServices,
      listings: listingsWithStats
    };

    return safeAnalyticsData;

  } catch (error: any) {
    throw new Error(`Failed to fetch analytics data: ${error.message}`);
  }
}