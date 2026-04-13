// app/api/reviews/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { apiError, apiErrorCode } from '@/app/utils/api';

// POST - Create a new review
export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser || !currentUser.id) {
    return apiErrorCode('UNAUTHORIZED');
  }

  try {
    const body = await request.json();
    const { rating, comment, targetType, targetUserId, targetListingId } = body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return apiError('Rating must be between 1 and 5', 400);
    }

    // Validate target
    if (!targetType || !['user', 'listing'].includes(targetType)) {
      return apiError('Invalid target type', 400);
    }

    if (targetType === 'user' && !targetUserId) {
      return apiError('Target user ID is required', 400);
    }

    if (targetType === 'listing' && !targetListingId) {
      return apiError('Target listing ID is required', 400);
    }

    // Prevent self-review for users
    if (targetType === 'user' && targetUserId === currentUser.id) {
      return apiError("You can't review yourself", 400);
    }

    // Check if user already reviewed this target
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: currentUser.id,
        targetType,
        ...(targetType === 'user' ? { targetUserId } : { targetListingId }),
      },
    });

    if (existingReview) {
      return apiError('You have already reviewed this', 400);
    }

    // Check if user has had a booking with this target (for verified badge)
    let hasVerifiedBooking = false;
    if (targetType === 'user') {
      const reservation = await prisma.reservation.findFirst({
        where: {
          userId: currentUser.id,
          employee: {
            userId: targetUserId,
          },
          status: 'completed',
        },
      });
      hasVerifiedBooking = !!reservation;
    } else if (targetType === 'listing') {
      const reservation = await prisma.reservation.findFirst({
        where: {
          userId: currentUser.id,
          listingId: targetListingId,
          status: 'completed',
        },
      });
      hasVerifiedBooking = !!reservation;
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        rating,
        comment: comment || null,
        userId: currentUser.id,
        targetType,
        targetUserId: targetType === 'user' ? targetUserId : null,
        targetListingId: targetType === 'listing' ? targetListingId : null,
        reservationId: null, // Could link to specific reservation if needed
        helpfulVotes: [],
      },
    });

    // Update the listing's cached rating if this is a listing review
    if (targetType === 'listing' && targetListingId) {
      // Get all reviews for this listing to calculate new average
      const allListingReviews = await prisma.review.findMany({
        where: {
          targetType: 'listing',
          targetListingId,
        },
        select: { rating: true },
      });

      const totalRatings = allListingReviews.length;
      const avgRating = totalRatings > 0
        ? allListingReviews.reduce((sum: number, r: typeof allListingReviews[number]) => sum + r.rating, 0) / totalRatings
        : null;

      // Update the listing with the new rating
      await prisma.listing.update({
        where: { id: targetListingId },
        data: {
          rating: avgRating ? Math.round(avgRating * 10) / 10 : null,
          ratingCount: totalRatings,
        },
      });
    }

    return NextResponse.json({ success: true, review, isVerifiedBooking: hasVerifiedBooking });
  } catch (error) {
    return apiErrorCode('INTERNAL_ERROR');
  }
}

// GET - Fetch reviews for a target
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetType = searchParams.get('targetType');
    const targetUserId = searchParams.get('targetUserId');
    const targetListingId = searchParams.get('targetListingId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!targetType || !['user', 'listing'].includes(targetType)) {
      return apiError('Invalid target type', 400);
    }

    if (targetType === 'user' && !targetUserId) {
      return apiError('Target user ID is required', 400);
    }

    if (targetType === 'listing' && !targetListingId) {
      return apiError('Target listing ID is required', 400);
    }

    const whereClause = {
      targetType,
      ...(targetType === 'user' ? { targetUserId } : { targetListingId }),
    };

    // Get total count
    const totalCount = await prisma.review.count({ where: whereClause });

    // Get reviews with user info
    const reviews = await prisma.review.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    });

    // Get user info for each review
    const userIds = Array.from(new Set(reviews.map((r: typeof reviews[number]) => r.userId)));
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

    const userMap = new Map<string, typeof users[number]>(users.map((u: typeof users[number]) => [u.id, u]));

    // Check for verified bookings
    const reviewsWithBookingStatus = await Promise.all(
      reviews.map(async (review: typeof reviews[number]) => {
        let isVerifiedBooking = false;

        if (targetType === 'user') {
          const reservation = await prisma.reservation.findFirst({
            where: {
              userId: review.userId,
              employee: { userId: targetUserId! },
              status: 'completed',
            },
          });
          isVerifiedBooking = !!reservation;
        } else {
          const reservation = await prisma.reservation.findFirst({
            where: {
              userId: review.userId,
              listingId: targetListingId!,
              status: 'completed',
            },
          });
          isVerifiedBooking = !!reservation;
        }

        return {
          ...review,
          createdAt: review.createdAt.toISOString(),
          updatedAt: review.updatedAt.toISOString(),
          user: userMap.get(review.userId) || {
            id: review.userId,
            name: null,
            image: null,
            imageSrc: null,
            verificationStatus: null,
          },
          isVerifiedBooking,
        };
      })
    );

    // Calculate average rating
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum: number, r: typeof reviews[number]) => sum + r.rating, 0) / reviews.length
      : 0;

    // Rating distribution
    const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: reviews.filter((r: typeof reviews[number]) => r.rating === rating).length,
    }));

    return NextResponse.json({
      reviews: reviewsWithBookingStatus,
      totalCount,
      averageRating: Math.round(avgRating * 10) / 10,
      ratingDistribution,
    });
  } catch (error) {
    return apiErrorCode('INTERNAL_ERROR');
  }
}
