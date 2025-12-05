// app/api/reviews/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';

// POST - Create a new review
export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser || !currentUser.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { rating, comment, targetType, targetUserId, targetListingId } = body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Validate target
    if (!targetType || !['user', 'listing'].includes(targetType)) {
      return NextResponse.json({ error: 'Invalid target type' }, { status: 400 });
    }

    if (targetType === 'user' && !targetUserId) {
      return NextResponse.json({ error: 'Target user ID is required' }, { status: 400 });
    }

    if (targetType === 'listing' && !targetListingId) {
      return NextResponse.json({ error: 'Target listing ID is required' }, { status: 400 });
    }

    // Prevent self-review for users
    if (targetType === 'user' && targetUserId === currentUser.id) {
      return NextResponse.json({ error: "You can't review yourself" }, { status: 400 });
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
      return NextResponse.json({ error: 'You have already reviewed this' }, { status: 400 });
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

    return NextResponse.json({ success: true, review, isVerifiedBooking: hasVerifiedBooking });
  } catch (error) {
    console.error('Review creation failed:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
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
      return NextResponse.json({ error: 'Invalid target type' }, { status: 400 });
    }

    if (targetType === 'user' && !targetUserId) {
      return NextResponse.json({ error: 'Target user ID is required' }, { status: 400 });
    }

    if (targetType === 'listing' && !targetListingId) {
      return NextResponse.json({ error: 'Target listing ID is required' }, { status: 400 });
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
    const userIds = Array.from(new Set(reviews.map(r => r.userId)));
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
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    // Rating distribution
    const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: reviews.filter(r => r.rating === rating).length,
    }));

    return NextResponse.json({
      reviews: reviewsWithBookingStatus,
      totalCount,
      averageRating: Math.round(avgRating * 10) / 10,
      ratingDistribution,
    });
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
