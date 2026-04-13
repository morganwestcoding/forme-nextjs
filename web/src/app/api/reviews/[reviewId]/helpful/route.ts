// app/api/reviews/[reviewId]/helpful/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { apiError, apiErrorCode } from '@/app/utils/api';

interface IParams {
  reviewId?: string;
}

// POST - Toggle helpful vote
export async function POST(
  request: Request,
  { params }: { params: IParams }
) {
  const currentUser = await getCurrentUser();

  if (!currentUser || !currentUser.id) {
    return apiErrorCode('UNAUTHORIZED');
  }

  const { reviewId } = params;

  if (!reviewId) {
    return apiError('Review ID is required', 400);
  }

  try {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return apiErrorCode('NOT_FOUND');
    }

    // Prevent voting on own review
    if (review.userId === currentUser.id) {
      return apiError("You can't vote on your own review", 400);
    }

    const helpfulVotes = review.helpfulVotes || [];
    const hasVoted = helpfulVotes.includes(currentUser.id);

    // Toggle vote
    const updatedVotes = hasVoted
      ? helpfulVotes.filter((id: string) => id !== currentUser.id)
      : [...helpfulVotes, currentUser.id];

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: { helpfulVotes: updatedVotes },
    });

    return NextResponse.json({
      success: true,
      helpfulVotes: updatedReview.helpfulVotes,
      hasVoted: !hasVoted,
    });
  } catch (error) {
    console.error('Failed to toggle helpful vote:', error);
    return apiErrorCode('INTERNAL_ERROR');
  }
}
