import prisma from "@/app/libs/prismadb";
import { SafeReview } from "@/app/types";

interface GetReviewsParams {
  targetType: 'user' | 'listing';
  targetUserId?: string;
  targetListingId?: string;
  limit?: number;
  offset?: number;
}

interface GetReviewsResult {
  reviews: SafeReview[];
  totalCount: number;
  averageRating: number;
  ratingDistribution: { rating: number; count: number }[];
}

export default async function getReviews(
  params: GetReviewsParams
): Promise<GetReviewsResult> {
  try {
    const {
      targetType,
      targetUserId,
      targetListingId,
      limit = 20,
      offset = 0,
    } = params;

    if (!targetType) {
      return {
        reviews: [],
        totalCount: 0,
        averageRating: 0,
        ratingDistribution: [1, 2, 3, 4, 5].map(r => ({ rating: r, count: 0 })),
      };
    }

    const whereClause = {
      targetType,
      ...(targetType === 'user' ? { targetUserId } : { targetListingId }),
    };

    // Get total count and all reviews for stats
    const [totalCount, allReviews] = await Promise.all([
      prisma.review.count({ where: whereClause }),
      prisma.review.findMany({
        where: whereClause,
        select: { rating: true },
      }),
    ]);

    // Get paginated reviews
    const reviews = await prisma.review.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    });

    // Get user info for each review
    const userIds = [...new Set(reviews.map(r => r.userId))];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        name: true,
        image: true,
        imageSrc: true,
        verificationStatus: true,
      },
    });

    const userMap = new Map(users.map(u => [u.id, u]));

    // Check for verified bookings
    const reviewsWithBookingStatus = await Promise.all(
      reviews.map(async (review) => {
        let isVerifiedBooking = false;

        if (targetType === 'user' && targetUserId) {
          const reservation = await prisma.reservation.findFirst({
            where: {
              userId: review.userId,
              employee: { userId: targetUserId },
              status: 'completed',
            },
          });
          isVerifiedBooking = !!reservation;
        } else if (targetType === 'listing' && targetListingId) {
          const reservation = await prisma.reservation.findFirst({
            where: {
              userId: review.userId,
              listingId: targetListingId,
              status: 'completed',
            },
          });
          isVerifiedBooking = !!reservation;
        }

        const user = userMap.get(review.userId);

        return {
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt.toISOString(),
          updatedAt: review.updatedAt.toISOString(),
          userId: review.userId,
          targetType: review.targetType as 'user' | 'listing',
          targetUserId: review.targetUserId,
          targetListingId: review.targetListingId,
          reservationId: review.reservationId,
          helpfulVotes: review.helpfulVotes,
          user: {
            id: user?.id || review.userId,
            name: user?.name || null,
            image: user?.image || null,
            imageSrc: user?.imageSrc || null,
            verificationStatus: user?.verificationStatus || null,
          },
          isVerifiedBooking,
        };
      })
    );

    // Calculate average rating
    const avgRating = allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : 0;

    // Rating distribution
    const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: allReviews.filter(r => r.rating === rating).length,
    }));

    return {
      reviews: reviewsWithBookingStatus,
      totalCount,
      averageRating: Math.round(avgRating * 10) / 10,
      ratingDistribution,
    };
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    return {
      reviews: [],
      totalCount: 0,
      averageRating: 0,
      ratingDistribution: [1, 2, 3, 4, 5].map(r => ({ rating: r, count: 0 })),
    };
  }
}
