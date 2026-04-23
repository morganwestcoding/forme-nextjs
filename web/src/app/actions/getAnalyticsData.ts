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
      totalRevenueResult,
      recentReservations,
      recentPosts,
      monthlyReservations,
      monthlyPosts,
      userListings,
      userReviews,
    ] = await Promise.all([
      // Total listings
      prisma.listing.count({
        where: { userId }
      }),

      // Total reservations
      prisma.reservation.count({
        where: {
          listing: {
            userId
          }
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

      // Total revenue
      prisma.reservation.aggregate({
        where: {
          listing: {
            userId
          },
          paymentStatus: 'completed'
        },
        _sum: {
          totalPrice: true
        }
      }),

      // Recent reservations
      prisma.reservation.findMany({
        where: {
          listing: {
            userId
          }
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

      // Reservations within the active window [windowStart, windowEnd)
      prisma.reservation.findMany({
        where: {
          listing: { userId },
          createdAt: { gte: windowStart, lt: windowEnd },
        },
        select: { createdAt: true, totalPrice: true },
      }),

      // Posts within the active window
      prisma.post.findMany({
        where: {
          userId,
          createdAt: { gte: windowStart, lt: windowEnd },
        },
        select: { createdAt: true },
      }),

      // User listings with services for top services calculation
      prisma.listing.findMany({
        where: { userId },
        include: {
          services: {
            include: {
              reservations: {
                select: {
                  totalPrice: true
                }
              }
            }
          },
          reservations: {
            select: {
              totalPrice: true
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
      })
    ]);

    // Calculate totals
    const totalRevenue = totalRevenueResult._sum.totalPrice || 0;
    const totalFollowers = userWithCounts?.followers.length || 0;
    const totalFollowing = userWithCounts?.following.length || 0;

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
      monthlyData.push({
        month: label,
        reservations: bucketRes.length,
        revenue: bucketRes.reduce((sum: number, r: any) => sum + r.totalPrice, 0),
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

    // Calculate top services from all services across all listings
    const allServices: Array<{
      serviceName: string;
      category: string;
      bookings: number;
      revenue: number;
    }> = [];

    userListings.forEach((listing: any) => {
      listing.services.forEach((service: any) => {
        allServices.push({
          serviceName: service.serviceName,
          category: service.category,
          bookings: service.reservations.length,
          revenue: service.reservations.reduce((sum: number, r: any) => sum + r.totalPrice, 0)
        });
      });
    });

    // Group and sort services
    const serviceMap = new Map<string, {
      serviceName: string;
      category: string;
      bookings: number;
      revenue: number;
    }>();

    allServices.forEach(service => {
      const key = `${service.serviceName}-${service.category}`;
      if (serviceMap.has(key)) {
        const existing = serviceMap.get(key)!;
        existing.bookings += service.bookings;
        existing.revenue += service.revenue;
      } else {
        serviceMap.set(key, { ...service });
      }
    });

    const topServices = Array.from(serviceMap.values())
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 10);

    // Process listings with performance data
    const listingsWithStats = userListings.map((listing: any) => ({
      id: listing.id,
      title: listing.title,
      category: listing.category,
      reservations: listing.reservations.length,
      revenue: listing.reservations.reduce((sum: number, r: any) => sum + r.totalPrice, 0),
      createdAt: listing.createdAt.toISOString()
    }));

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