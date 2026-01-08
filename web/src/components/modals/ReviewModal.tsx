'use client';

import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Modal from './Modal';
import useReviewModal from '@/app/hooks/useReviewModal';

const ReviewModal: React.FC = () => {
  const reviewModal = useReviewModal();
  const { isOpen, targetType, targetUser, targetListing, currentUser, onClose } = reviewModal;

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const targetName = targetType === 'user'
    ? targetUser?.name || 'this provider'
    : targetListing?.title || 'this listing';

  const targetImage = targetType === 'user'
    ? targetUser?.image || targetUser?.imageSrc || '/placeholder.jpg'
    : targetListing?.imageSrc || '/placeholder.jpg';

  const handleClose = useCallback(() => {
    setRating(0);
    setHoveredRating(0);
    setComment('');
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(async () => {
    if (!currentUser) {
      toast.error('Please sign in to leave a review');
      return;
    }

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (targetType === 'user' && currentUser.id === targetUser?.id) {
      toast.error("You can't review yourself");
      return;
    }

    setIsSubmitting(true);

    try {
      await axios.post('/api/reviews', {
        rating,
        comment: comment.trim() || null,
        targetType,
        targetUserId: targetType === 'user' ? targetUser?.id : null,
        targetListingId: targetType === 'listing' ? targetListing?.id : null,
      });

      toast.success('Review submitted successfully!');
      handleClose();

      // Refresh the page to show the new review
      window.location.reload();
    } catch (error: any) {
      const message = error?.response?.data?.error || 'Something went wrong';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [rating, comment, targetType, targetUser, targetListing, currentUser, handleClose]);

  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

  const bodyContent = (
    <div className="flex flex-col gap-6">
      {/* Header with target info */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-3 ring-4 ring-gray-100">
          <img
            src={targetImage}
            alt={targetName}
            className="w-full h-full object-cover"
          />
        </div>
        <h2 className="text-xl font-bold text-gray-900">
          Review {targetName}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Share your experience to help others
        </p>
      </div>

      {/* Star Rating */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-1 transition-transform hover:scale-110 active:scale-95"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className={`w-10 h-10 transition-colors duration-150 ${
                  star <= (hoveredRating || rating)
                    ? 'text-amber-400'
                    : 'text-gray-200'
                }`}
                fill="currentColor"
              >
                <path d="M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z"/>
              </svg>
            </button>
          ))}
        </div>
        <span className={`text-sm font-medium transition-opacity ${
          (hoveredRating || rating) > 0 ? 'opacity-100' : 'opacity-0'
        } ${
          (hoveredRating || rating) >= 4 ? 'text-emerald-600' :
          (hoveredRating || rating) >= 3 ? 'text-amber-600' : 'text-orange-600'
        }`}>
          {ratingLabels[hoveredRating || rating]}
        </span>
      </div>

      {/* Comment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your review <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell others about your experience..."
          rows={4}
          maxLength={1000}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm placeholder:text-gray-400"
        />
        <div className="flex justify-end mt-1">
          <span className="text-xs text-gray-400">
            {comment.length}/1000
          </span>
        </div>
      </div>

      {/* Guidelines */}
      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-xs text-gray-500 leading-relaxed">
          By submitting this review, you confirm that it represents your genuine experience.
          Reviews should be helpful, respectful, and relevant.
        </p>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleSubmit}
      actionLabel={isSubmitting ? 'Submitting...' : 'Submit Review'}
      secondaryAction={handleClose}
      secondaryActionLabel="Cancel"
      disabled={isSubmitting || rating === 0}
      body={bodyContent}
      className="w-full md:w-[480px]"
    />
  );
};

export default ReviewModal;
