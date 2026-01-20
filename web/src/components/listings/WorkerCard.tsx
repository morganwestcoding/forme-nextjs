// components/listings/WorkerCard.tsx
'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SafeListing, SafeUser, SafeEmployee } from '@/app/types';
import SmartBadgeWorker from './SmartBadgeWorker';
import HeartButton from '../HeartButton';
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
  compact?: boolean;
  solidBackground?: boolean;
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
  compact = false,
  solidBackground = false,
}) => {
  const [/*isFollowing*/, /*setIsFollowing*/] = useState(false);
  const [imageError, setImageError] = useState(false);
  const router = useRouter();

  const handleCardClick = () => {
    // Independent workers should route to their user profile
    if (employee.isIndependent) {
      router.push(`/profile/${employee.userId}`);
    } else if (currentUser) {
      // Open reservation flow with this employee preselected
      router.push(`/reserve/${listing.id}?employeeId=${employee.id}`);
    } else {
      // Not logged in, go to listing
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
        <VerificationBadge size={18} />
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
      className={solidBackground
        ? `group cursor-pointer overflow-hidden relative rounded-xl bg-white border border-gray-100 dark:border-neutral-800 dark:bg-neutral-950 transition-all duration-300 hover:border-neutral-300 hover:shadow-sm ${compact ? '' : 'max-w-[250px]'}`
        : `group cursor-pointer overflow-hidden relative rounded-3xl bg-neutral-900 transition-[transform,box-shadow,opacity] duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.15),0_8px_16px_rgba(0,0,0,0.1)] active:scale-[0.98] active:opacity-90 ${compact ? '' : 'max-w-[250px]'}`
      }
    >
      {/* Background */}
      <div className={`absolute inset-0 z-0 overflow-hidden ${solidBackground ? 'rounded-xl' : 'rounded-3xl'}`}>
        {solidBackground ? (
          /* Ultra-minimal white background */
          <div className="absolute inset-0 bg-white dark:bg-neutral-950 rounded-xl border border-neutral-200/60" />
        ) : (
          <>
            {/* Background image - grayscale and sharp */}
            <div className="absolute inset-0">
              <Image
                src={backgroundImageSrc}
                alt=""
                fill
                className="object-cover grayscale transition-[transform,filter] duration-700 ease-out group-hover:scale-110 group-hover:brightness-110"
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

            {/* Center vignette gradient for centered text */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse at center 55%, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.20) 50%, rgba(0,0,0,0.10) 100%)',
              }}
            />
          </>
        )}
      </div>

      <div className="relative z-10">
        {/* Match ListingCard height structure */}
        <div className={compact ? 'relative h-[180px]' : 'relative h-[280px]'}>
          {/* Heart - Using HeartButton component (hidden on minimal solid background) */}
          {!solidBackground && (
            <div className="absolute top-4 right-4 z-20">
              <HeartButton
                listingId={employee.id}
                currentUser={currentUser}
                variant="worker"
              />
            </div>
          )}

          {/* Avatar and info - different layout for solid vs image background */}
          {solidBackground ? (
            /* Bold editorial layout */
            <div className="absolute inset-0 flex flex-col z-20 overflow-hidden">
              {/* Large initials watermark in background */}
              <div className="absolute -right-3 -top-6 text-[90px] font-black text-neutral-100 leading-none select-none pointer-events-none tracking-tighter">
                {initials}
              </div>

              {/* Content */}
              <div className="relative flex flex-col h-full p-5">
                {/* Avatar - top left */}
                <div className="mb-3">
                  {shouldShowImage ? (
                    <div className="w-14 h-14 rounded-full overflow-hidden relative ring-2 ring-neutral-900">
                      <Image
                        src={profileImage}
                        alt={employee.fullName}
                        fill
                        className="object-cover"
                        onError={handleImageError}
                        onLoad={handleImageLoad}
                        priority={false}
                        sizes="56px"
                      />
                    </div>
                  ) : (
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold"
                      style={{ backgroundColor: avatarBg }}
                    >
                      {initials}
                    </div>
                  )}
                </div>

                {/* Name - large and bold */}
                <h3 className="text-[17px] font-black text-neutral-900 leading-[1.15] line-clamp-2 tracking-tight pr-6">
                  {employee.fullName}
                </h3>

                {/* Job title - understated */}
                <p className="mt-1.5 text-[11px] text-neutral-400 font-medium">
                  {employee.jobTitle || 'Specialist'}
                </p>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Bottom row - arrow */}
                <div className="flex items-end justify-end">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-neutral-300 group-hover:text-neutral-900 group-hover:translate-x-0.5 transition-all duration-300"
                  >
                    <path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Centered avatar + name + job title */}
              <div className="absolute inset-0 flex flex-col items-center justify-center z-20 px-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                {/* Avatar */}
                <div className="relative transition-transform duration-300 mb-3">
                  {shouldShowImage ? (
                    <div className={compact ? 'w-14 h-14 rounded-full overflow-hidden shadow-lg border-2 border-white relative' : 'w-20 h-20 rounded-full overflow-hidden shadow-lg border-2 border-white relative'}>
                      <Image
                        src={profileImage}
                        alt={employee.fullName}
                        fill
                        className="object-cover"
                        onError={handleImageError}
                        onLoad={handleImageLoad}
                        priority={false}
                        sizes={compact ? '56px' : '80px'}
                      />
                    </div>
                  ) : (
                    <div
                      className={compact ? 'w-14 h-14 rounded-full flex items-center justify-center text-white text-base font-semibold shadow-lg border-2 border-white' : 'w-20 h-20 rounded-full flex items-center justify-center text-white text-xl font-semibold shadow-lg border-2 border-white'}
                      style={{ backgroundColor: avatarBg }}
                      aria-label="Employee initials"
                      title={employee.fullName}
                    >
                      {initials}
                    </div>
                  )}
                </div>

                {/* Name + Job title */}
                {compact ? (
                  <div className="flex flex-col items-center text-center">
                    <h3 className="text-white text-sm leading-tight font-medium tracking-tight line-clamp-1">
                      {employee.fullName}
                    </h3>
                    <p className="text-white/75 text-[11px] font-extralight tracking-normal mt-0.5">
                      {employee.jobTitle || 'Specialist'}
                    </p>
                    <div className="mt-2">
                      <SmartBadgeWorker
                        employee={employee}
                        listingTitle={listingTitle}
                        followerCount={employee.followerCount || 1247}
                        onTimeClick={(e?: React.MouseEvent) => {
                          e?.stopPropagation();
                          if (currentUser) {
                            router.push(`/reserve/${listing.id}?employeeId=${employee.id}`);
                          }
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center">
                    <h3 className="text-white text-[20px] leading-tight font-semibold tracking-[-0.02em]">
                      {renderNameWithBadge(employee.fullName)}
                    </h3>
                    <p className="text-white/80 text-[14px] font-light tracking-wide mt-1.5">
                      {employee.jobTitle || 'Specialist'}
                    </p>
                    <div className="mt-3">
                      <SmartBadgeWorker
                        employee={employee}
                        listingTitle={listingTitle}
                        followerCount={employee.followerCount || 1247}
                        onTimeClick={(e?: React.MouseEvent) => {
                          e?.stopPropagation();
                          if (currentUser) {
                            router.push(`/reserve/${listing.id}?employeeId=${employee.id}`);
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkerCard;