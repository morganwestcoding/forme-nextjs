// components/listings/WorkerCard.tsx
'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SafeListing, SafeUser, SafeEmployee } from '@/app/types';
import SmartBadgeWorker from './SmartBadgeWorker';
import HeartButton from '../HeartButton';
import useReservationModal from '@/app/hooks/useReservationModal';

interface WorkerCardProps {
  employee: SafeEmployee & {
    followerCount?: number;
    followingCount?: number;
    rating?: number;
    isTrending?: boolean;
    availabilityStatus?: 'free' | 'busy' | 'booked';
    storeHours?: Array<{
      dayOfWeek: string;
      openTime: string;
      closeTime: string;
      isClosed: boolean;
    }>;
  };
  listingTitle: string;
  data: {
    title: string;
    imageSrc: string;
    category: string;
  };
  listing: SafeListing;
  currentUser?: SafeUser | null;
  onFollow?: () => void;
  onBook?: () => void;
}

/** ---------- Helpers ---------- */
const getInitials = (fullName?: string) => {
  if (!fullName) return 'U';
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    const a = parts[0][0]?.toUpperCase() ?? 'U';
    const b = parts[0][1]?.toUpperCase() ?? '';
    return (a + b).slice(0, 2);
  }
  const first = parts[0][0]?.toUpperCase() ?? '';
  const last = parts[parts.length - 1][0]?.toUpperCase() ?? '';
  return (first + last) || 'U';
};

const stringToColor = (seed: string, s = 70, l = 45) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    // eslint-disable-next-line no-bitwise
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, ${s}%, ${l}%)`;
};

// FIXED: Helper function to get the profile image - now prioritizes actual profile pictures
const getProfileImage = (employee: SafeEmployee): string | null => {
  // Priority: user.image (profile picture) > null
  // We only want actual profile pictures, not background images
  return employee.user.image || null;
};

const WorkerCard: React.FC<WorkerCardProps> = ({
  employee,
  listingTitle,
  data,
  listing,
  currentUser,
}) => {
  const [/*isFollowing*/, /*setIsFollowing*/] = useState(false);
  const [imageError, setImageError] = useState(false);
  const router = useRouter();
  const reservationModal = useReservationModal();

  const handleCardClick = () => {
    // Independent workers should route to their user profile, not a listing
    if (employee.isIndependent) {
      router.push(`/profile/${employee.userId}`);
    } else {
      router.push(`/listings/${listing.id}`);
    }
  };

  // Memoize initials + bg for perf
  const initials = useMemo(() => getInitials(employee.fullName), [employee.fullName]);
  const avatarBg = useMemo(
    () => stringToColor(`${employee.id}${employee.fullName}`),
    [employee.id, employee.fullName]
  );

  // Get the profile image with cache busting - now only uses actual profile pictures
  const profileImage = useMemo(() => {
    const baseImage = getProfileImage(employee);
    
    if (!baseImage) return null;
    
    // Add cache buster to ensure we get the latest image
    const cacheBuster = Date.now();
    const separator = baseImage.includes('?') ? '&' : '?';
    return `${baseImage}${separator}cb=${cacheBuster}`;
  }, [
    employee.user.image, // Only depend on profile image, not imageSrc
    // Re-compute when user data changes
    employee.user.id
  ]);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageError(false);
  };

  // Function to render name with verification badge that stays with last word
  const renderNameWithBadge = (fullName: string) => {
    const words = fullName.trim().split(' ');
    if (words.length === 0) return null;

    const VerificationBadge = () => (
      <span className="inline-flex items-center align-middle ml-1" aria-label="Verified">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          className="shrink-0"
        >
          {/* Badge shape with gradient fill */}
          <path
            d="M18.9905 19H19M18.9905 19C18.3678 19.6175 17.2393 19.4637 16.4479 19.4637C15.4765 19.4637 15.0087 19.6537 14.3154 20.347C13.7251 20.9374 12.9337 22 12 22C11.0663 22 10.2749 20.9374 9.68457 20.347C8.99128 19.6537 8.52349 19.4637 7.55206 19.4637C6.76068 19.4637 5.63218 19.6175 5.00949 19C4.38181 18.3776 4.53628 17.2444 4.53628 16.4479C4.53628 15.4414 4.31616 14.9786 3.59938 14.2618C2.53314 13.1956 2.00002 12.6624 2 12C2.00001 11.3375 2.53312 10.8044 3.59935 9.73817C4.2392 9.09832 4.53628 8.46428 4.53628 7.55206C4.53628 6.76065 4.38249 5.63214 5 5.00944C5.62243 4.38178 6.7556 4.53626 7.55208 4.53626C8.46427 4.53626 9.09832 4.2392 9.73815 3.59937C10.8044 2.53312 11.3375 2 12 2C12.6625 2 13.1956 2.53312 14.2618 3.59937C14.9015 4.23907 15.5355 4.53626 16.4479 4.53626C17.2393 4.53626 18.3679 4.38247 18.9906 5C19.6182 5.62243 19.4637 6.75559 19.4637 7.55206C19.4637 8.55858 19.6839 9.02137 20.4006 9.73817C21.4669 10.8044 22 11.3375 22 12C22 12.6624 21.4669 13.1956 20.4006 14.2618C19.6838 14.9786 19.4637 15.4414 19.4637 16.4479C19.4637 17.2444 19.6182 18.3776 18.9905 19Z"
            fill="url(#workerBadgeGradient)"
          />
          {/* Checkmark */}
          <path
            d="M9 12.8929C9 12.8929 10.2 13.5447 10.8 14.5C10.8 14.5 12.6 10.75 15 9.5"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <defs>
            <linearGradient id="workerBadgeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#4A90E2" />
            </linearGradient>
          </defs>
        </svg>
      </span>
    );


    if (words.length === 1) {
      // Single word - keep badge with it
      return (
        <span className="whitespace-nowrap">
          {words[0]}
          <VerificationBadge />
        </span>
      );
    }

    // Multiple words - keep badge with last word
    const firstWords = words.slice(0, -1);
    const lastWord = words[words.length - 1];

    return (
      <>
        {firstWords.join(' ')}{' '}
        <span className="whitespace-nowrap">
          {lastWord}
          <VerificationBadge />
        </span>
      </>
    );
  };


  const shouldShowImage = profileImage && !imageError;

  // Background image priority - matches ProfileHead logic:
  // 1. user.backgroundImage (primary background)
  // 2. listing.imageSrc (for team members, or if no backgroundImage)
  // 3. user.imageSrc (fallback)
  // 4. placeholder
  const backgroundImageSrc =
    employee.user.backgroundImage ||
    data.imageSrc ||
    employee.user.imageSrc ||
    '/images/placeholder.jpg';

  return (
    <div
      onClick={handleCardClick}
      className="group cursor-pointer rounded-xl overflow-hidden relative transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-md max-w-[250px]"
    >
      {/* Background with user's background image or listing image */}
      <div className="absolute inset-0 z-0">
        {/* Background image - grayscale and sharp */}
        <div className="absolute inset-0">
          <Image
            src={backgroundImageSrc}
            alt=""
            fill
            className="object-cover grayscale scale-105"
            style={{ opacity: 0.75 }}
            sizes="250px"
          />
        </div>

        {/* Very light desaturation overlay */}
        <div
          className="absolute inset-0 bg-gray-600/15"
          style={{ mixBlendMode: 'multiply' }}
        />

        {/* Subtle blue radial gradient emanating from avatar position */}
        <div
          className="absolute inset-0 opacity-12"
          style={{
            background: 'radial-gradient(circle at 50% 28%, rgba(96, 165, 250, 0.18) 0%, transparent 55%)'
          }}
        />

        {/* Top gradient for framing and heart button visibility */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom,' +
              'rgba(0,0,0,0.35) 0%,' +
              'rgba(0,0,0,0.20) 15%,' +
              'rgba(0,0,0,0.10) 30%,' +
              'rgba(0,0,0,0.00) 45%)',
          }}
        />

        {/* Bottom gradient for text readability - matches ListingCard */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to top,' +
              'rgba(0,0,0,0.72) 0%,' +
              'rgba(0,0,0,0.55) 18%,' +
              'rgba(0,0,0,0.32) 38%,' +
              'rgba(0,0,0,0.12) 55%,' +
              'rgba(0,0,0,0.00) 70%)',
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Match ListingCard height structure */}
        <div className="relative h-[280px]">
        {/* Heart - Using HeartButton component */}
        <div className="absolute top-6 right-6 z-20">
          <HeartButton
            listingId={employee.id}
            currentUser={currentUser}
            variant="worker"
          />
        </div>

        {/* Avatar - Centered */}
        <div className="absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative transition-transform duration-300">
            {/* Profile Image or Initials Circle */}
            {shouldShowImage ? (
              <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg border-2 border-white relative">
                <Image
                  src={profileImage}
                  alt={employee.fullName}
                  fill
                  className="object-cover"
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                  priority={false}
                  sizes="96px"
                />
              </div>
            ) : (
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl font-semibold shadow-lg border-2 border-white"
                style={{ backgroundColor: avatarBg }}
                aria-label="Employee initials"
                title={employee.fullName}
              >
                {initials}
              </div>
            )}
          </div>
        </div>

        {/* Bottom info - positioned like ListingCard */}
        <div className="absolute bottom-4 left-4 right-4 z-20">
          {/* Name with verification badge */}
          <div className="mb-0.5">
            <h3 className="text-lg font-semibold text-white drop-shadow leading-tight">
              {renderNameWithBadge(employee.fullName)}
            </h3>
          </div>

          {/* Job title and location - improved formatting */}
          <div className="text-white/90 text-xs leading-tight mb-2.5">
            <span className="line-clamp-1">{employee.jobTitle || 'Specialist'}</span>
          </div>

          {/* SmartBadge */}
          <div className="flex items-center">
            <SmartBadgeWorker
              employee={employee}
              listingTitle={listingTitle}
              followerCount={employee.followerCount || 1247}
              onTimeClick={(e?: React.MouseEvent) => {
                e?.stopPropagation();
                if (currentUser) {
                  reservationModal.onOpen(listing, currentUser, undefined, employee.id);
                }
              }}
            />
          </div>
        </div>
        </div>

        {/* Match ListingCard bottom padding */}
        <div className="pb-2" />
      </div>
    </div>
  );
};

export default WorkerCard;