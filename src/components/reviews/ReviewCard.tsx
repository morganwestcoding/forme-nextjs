'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { SafeReview, SafeUser } from '@/app/types';

interface ReviewCardProps {
  review: SafeReview;
  currentUser?: SafeUser | null;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, currentUser }) => {
  const router = useRouter();
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulVotes?.length || 0);
  const [hasVoted, setHasVoted] = useState(
    currentUser?.id ? review.helpfulVotes?.includes(currentUser.id) : false
  );
  const [isVoting, setIsVoting] = useState(false);

  // Format relative time
  const getRelativeTime = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }, []);

  const handleHelpfulVote = async () => {
    if (!currentUser) {
      toast.error('Please sign in to vote');
      return;
    }
    if (currentUser.id === review.userId) {
      toast.error("You can't vote on your own review");
      return;
    }
    if (isVoting) return;

    setIsVoting(true);

    // Optimistic update
    const wasVoted = hasVoted;
    setHasVoted(!wasVoted);
    setHelpfulCount(prev => wasVoted ? prev - 1 : prev + 1);

    try {
      await axios.post(`/api/reviews/${review.id}/helpful`);
    } catch {
      // Revert on error
      setHasVoted(wasVoted);
      setHelpfulCount(prev => wasVoted ? prev + 1 : prev - 1);
      toast.error('Something went wrong');
    } finally {
      setIsVoting(false);
    }
  };

  const handleProfileClick = () => {
    router.push(`/profile/${review.userId}`);
  };

  const isVerified = review.user.verificationStatus === 'verified';

  return (
    <div className="group max-w-[250px] h-[280px] bg-white rounded-2xl p-4 border border-gray-100 hover:border-gray-200 hover:shadow-md hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300 flex flex-col">
      {/* Header: Avatar + Name */}
      <div className="flex items-center gap-2 min-w-0">
        {/* Avatar */}
        <button
          onClick={handleProfileClick}
          className="relative flex-shrink-0 w-8 h-8 rounded-full overflow-hidden bg-gray-100 hover:ring-2 hover:ring-gray-200 transition-all"
        >
          <img
            src={review.user.image || review.user.imageSrc || '/placeholder.jpg'}
            alt={review.user.name || 'User'}
            className="w-full h-full object-cover"
          />
        </button>

        {/* Name & Meta */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleProfileClick}
              className="font-semibold text-gray-900 text-sm truncate hover:underline"
            >
              {review.user.name || 'Anonymous'}
            </button>

            {/* Verified Badge */}
            {isVerified && (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0">
                <path
                  d="M18.9905 19H19M18.9905 19C18.3678 19.6175 17.2393 19.4637 16.4479 19.4637C15.4765 19.4637 15.0087 19.6537 14.3154 20.347C13.7251 20.9374 12.9337 22 12 22C11.0663 22 10.2749 20.9374 9.68457 20.347C8.99128 19.6537 8.52349 19.4637 7.55206 19.4637C6.76068 19.4637 5.63218 19.6175 5.00949 19C4.38181 18.3776 4.53628 17.2444 4.53628 16.4479C4.53628 15.4414 4.31616 14.9786 3.59938 14.2618C2.53314 13.1956 2.00002 12.6624 2 12C2.00001 11.3375 2.53312 10.8044 3.59935 9.73817C4.2392 9.09832 4.53628 8.46428 4.53628 7.55206C4.53628 6.76065 4.38249 5.63214 5 5.00944C5.62243 4.38178 6.7556 4.53626 7.55208 4.53626C8.46427 4.53626 9.09832 4.2392 9.73815 3.59937C10.8044 2.53312 11.3375 2 12 2C12.6625 2 13.1956 2.53312 14.2618 3.59937C14.9015 4.23907 15.5355 4.53626 16.4479 4.53626C17.2393 4.53626 18.3679 4.38247 18.9906 5C19.6182 5.62243 19.4637 6.75559 19.4637 7.55206C19.4637 8.55858 19.6839 9.02137 20.4006 9.73817C21.4669 10.8044 22 11.3375 22 12C22 12.6624 21.4669 13.1956 20.4006 14.2618C19.6838 14.9786 19.4637 15.4414 19.4637 16.4479C19.4637 17.2444 19.6182 18.3776 18.9905 19Z"
                  fill="url(#reviewVerifiedGrad)"
                />
                <path d="M9 12.8929C9 12.8929 10.2 13.5447 10.8 14.5C10.8 14.5 12.6 10.75 15 9.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <defs>
                  <linearGradient id="reviewVerifiedGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#60A5FA" />
                    <stop offset="100%" stopColor="#4A90E2" />
                  </linearGradient>
                </defs>
              </svg>
            )}
          </div>

          {/* Time & Verified Booking */}
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-400">
              {getRelativeTime(review.createdAt)}
            </span>
            {review.isVerifiedBooking && (
              <>
                <span className="text-gray-200">·</span>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Verified
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Comment */}
      <div className="flex-1 mt-3 overflow-hidden">
        {review.comment ? (
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-5">
            {review.comment}
          </p>
        ) : (
          <p className="text-sm text-gray-400 italic">No comment</p>
        )}
      </div>

      {/* Star Rating */}
      <div className="flex items-center justify-center gap-0.5 pt-3 pb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className={`w-4 h-4 ${star <= review.rating ? 'text-amber-400' : 'text-gray-200'}`}
            fill="currentColor"
          >
            <path d="M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z"/>
          </svg>
        ))}
      </div>

      {/* Footer: Helpful */}
      <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
        <button
          onClick={handleHelpfulVote}
          disabled={isVoting || !currentUser || currentUser.id === review.userId}
          className={`
            inline-flex items-center gap-1.5 text-xs font-medium transition-colors
            ${hasVoted
              ? 'text-blue-600'
              : 'text-gray-400 hover:text-gray-600'
            }
            ${(!currentUser || currentUser.id === review.userId) ? 'cursor-default' : 'cursor-pointer'}
          `}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="w-4 h-4"
            fill={hasVoted ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M7.47998 18.35L10.58 20.75C10.98 21.15 11.88 21.35 12.48 21.35H16.28C17.48 21.35 18.78 20.45 19.08 19.25L21.48 11.95C21.98 10.55 21.08 9.34997 19.58 9.34997H15.58C14.98 9.34997 14.48 8.84997 14.58 8.14997L15.08 4.94997C15.28 4.04997 14.68 3.04997 13.78 2.74997C12.98 2.44997 11.98 2.84997 11.58 3.44997L7.47998 9.54997" strokeMiterlimit="10"/>
            <path d="M2.38 18.35V8.55002C2.38 7.15002 2.98 6.65002 4.38 6.65002H5.38C6.78 6.65002 7.38 7.15002 7.38 8.55002V18.35C7.38 19.75 6.78 20.25 5.38 20.25H4.38C2.98 20.25 2.38 19.75 2.38 18.35Z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {helpfulCount > 0 ? `Helpful (${helpfulCount})` : 'Helpful'}
        </button>

        {/* Report (only show for other users' reviews) */}
        {currentUser && currentUser.id !== review.userId && (
          <button
            className="text-xs text-gray-300 hover:text-gray-400 transition-colors opacity-0 group-hover:opacity-100"
          >
            Report
          </button>
        )}
      </div>
    </div>
  );
};

export default ReviewCard;
