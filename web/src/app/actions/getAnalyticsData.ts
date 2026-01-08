// app/actions/getAnalyticsData.ts
import prisma from "@/app/libs/prismadb";

export interface AnalyticsData {
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

export default async function getAnalyticsData(userId: string): Promise<AnalyticsData> {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    // Get current date and 12 months ago
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);

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

      // Monthly reservations
      prisma.reservation.findMany({
        where: {
          listing: {
            userId
          },
          createdAt: {
            gte: twelveMonthsAgo
          }
        },
        select: {
          createdAt: true,
          totalPrice: true
        }
      }),

      // Monthly posts
      prisma.post.findMany({
        where: {
          userId,
          createdAt: {
            gte: twelveMonthsAgo
          }
        },
        select: {
          createdAt: true
        }
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
      ? Math.round((userReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10) / 10
      : 0;
    const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: userReviews.filter(r => r.rating === rating).length,
    }));

    // Process monthly data
    const monthlyData = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const monthReservations = monthlyReservations.filter(r => 
        r.createdAt >= date && r.createdAt < nextMonth
      );
      
      const monthPosts = monthlyPosts.filter(p => 
        p.createdAt >= date && p.createdAt < nextMonth
      );

      monthlyData.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        reservations: monthReservations.length,
        revenue: monthReservations.reduce((sum, r) => sum + r.totalPrice, 0),
        posts: monthPosts.length
      });
    }

    // Calculate top services from all services across all listings
    const allServices: Array<{
      serviceName: string;
      category: string;
      bookings: number;
      revenue: number;
    }> = [];

    userListings.forEach(listing => {
      listing.services.forEach(service => {
        allServices.push({
          serviceName: service.serviceName,
          category: service.category,
          bookings: service.reservations.length,
          revenue: service.reservations.reduce((sum, r) => sum + r.totalPrice, 0)
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
    const listingsWithStats = userListings.map(listing => ({
      id: listing.id,
      title: listing.title,
      category: listing.category,
      reservations: listing.reservations.length,
      revenue: listing.reservations.reduce((sum, r) => sum + r.totalPrice, 0),
      createdAt: listing.createdAt.toISOString()
    }));

    // Transform data to safe format
    const safeAnalyticsData: AnalyticsData = {
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
        reservations: recentReservations.map(reservation => ({
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
        posts: recentPosts.map(post => ({
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

    console.log('Fetched analytics data for user:', userId);
    return safeAnalyticsData;

  } catch (error: any) {
    console.error("Error fetching analytics data:", error);
    throw new Error(`Failed to fetch analytics data: ${error.message}`);
  }
}