// components/listings/WorkerCard.tsx
'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SafeListing, SafeUser, SafeEmployee } from '@/app/types';
import SmartBadgeWorker from './SmartBadgeWorker';
import HeartButton from '../HeartButton';
import useReservationModal from '@/app/hooks/useReservationModal';
import VerificationBadge from '../VerificationBadge';

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

    const Badge = () => (
      <span className="inline-flex items-center align-middle ml-1" aria-label="Verified">
        <VerificationBadge size={16} />
      </span>
    );

    if (words.length === 1) {
      // Single word - keep badge with it
      return (
        <span className="whitespace-nowrap">
          {words[0]}
          <Badge />
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
          <Badge />
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
        <div className="absolute top-4 right-4 z-20">
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