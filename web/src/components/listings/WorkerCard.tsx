// components/listings/WorkerCard.tsx
'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SafeListing, SafeUser, SafeEmployee } from '@/app/types';
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

// Helper function to get the profile image
const getProfileImage = (employee: SafeEmployee): string | null => {
  return employee.user.image || null;
};

const WorkerCard: React.FC<WorkerCardProps> = ({
  employee,
  listingTitle,
  listing,
  currentUser,
  compact = false,
  solidBackground = false,
}) => {
  const [imageError, setImageError] = useState(false);
  const router = useRouter();

  const handleCardClick = () => {
    if (employee.isIndependent) {
      router.push(`/profile/${employee.userId}`);
    } else if (currentUser) {
      router.push(`/reserve/${listing.id}?employeeId=${employee.id}`);
    } else {
      router.push(`/listings/${listing.id}`);
    }
  };

  const initials = useMemo(() => getInitials(employee.fullName), [employee.fullName]);
  const avatarBg = useMemo(
    () => stringToColor(`${employee.id}${employee.fullName}`),
    [employee.id, employee.fullName]
  );

  const profileImage = useMemo(() => {
    const baseImage = getProfileImage(employee);
    if (!baseImage) return null;
    const cacheBuster = Date.now();
    const separator = baseImage.includes('?') ? '&' : '?';
    return `${baseImage}${separator}cb=${cacheBuster}`;
  }, [employee.user.image, employee.user.id]);

  const handleImageError = () => setImageError(true);
  const handleImageLoad = () => setImageError(false);

  const renderNameWithBadge = (fullName: string) => {
    const words = fullName.trim().split(' ');
    if (words.length === 0) return null;

    const Badge = () => (
      <span className="inline-flex items-center align-middle ml-0.5" aria-label="Verified">
        <VerificationBadge size={14} />
      </span>
    );

    if (words.length === 1) {
      return (
        <span className="whitespace-nowrap">
          {words[0]}
          <Badge />
        </span>
      );
    }

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
  const rating = employee.rating ?? 5.0;

  // Solid background editorial layout (matches ServiceCard style on listing page)
  if (solidBackground) {
    return (
      <div
        onClick={handleCardClick}
        className="group cursor-pointer rounded-xl overflow-hidden relative transition-all duration-300 hover:border-neutral-300 hover:shadow-sm"
      >
        {/* White background */}
        <div className="absolute inset-0 bg-white rounded-xl border border-neutral-200/60" />

        <div className="relative z-10">
          <div className={compact ? 'relative h-[180px]' : 'relative h-[280px]'}>
            {/* Bold editorial layout */}
            <div className="absolute inset-0 flex flex-col z-20 overflow-hidden">
              {/* Large initials watermark in background */}
              <div className="absolute -right-2 -top-4 text-[80px] font-black text-neutral-100 leading-none select-none pointer-events-none">
                {initials}
              </div>

              {/* Content */}
              <div className="relative flex flex-col h-full p-5">
                {/* Avatar */}
                <div className="mb-3">
                  {shouldShowImage ? (
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-neutral-900 shadow-sm relative">
                      <Image
                        src={profileImage}
                        alt={employee.fullName}
                        fill
                        className="object-cover"
                        sizes="48px"
                        priority={false}
                        onError={handleImageError}
                        onLoad={handleImageLoad}
                      />
                    </div>
                  ) : (
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-semibold border-2 border-neutral-900 shadow-sm"
                      style={{ backgroundColor: avatarBg }}
                    >
                      {initials}
                    </div>
                  )}
                </div>

                {/* Name - large and bold */}
                <h3 className="text-[17px] font-black text-neutral-900 leading-[1.15] line-clamp-2 tracking-tight pr-8">
                  {employee.fullName}
                </h3>

                {/* Job title - understated */}
                <p className="mt-1.5 text-[11px] text-neutral-400 font-medium">
                  {employee.jobTitle || 'Specialist'}
                </p>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Bottom row - rating with subtle arrow */}
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-black text-neutral-900 tabular-nums">{Number(rating).toFixed(1)}</span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-neutral-300 group-hover:text-neutral-900 group-hover:translate-x-0.5 transition-all duration-300 mb-1"
                  >
                    <path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom padding */}
          <div className="pb-2" />
        </div>
      </div>
    );
  }

  // Horizontal layout (default)
  return (
    <div
      onClick={handleCardClick}
      className="group cursor-pointer rounded-xl p-3 transition-all duration-300 hover:bg-neutral-50"
    >
      <div className="flex flex-row gap-4 items-center w-full">
        {/* Avatar container - matches ListingCard image size */}
        <div className={`flex-shrink-0 flex items-center justify-center ${compact ? 'w-[80px] h-[80px]' : 'w-[100px] h-[100px]'}`}>
          {shouldShowImage ? (
            <div className={`${compact ? 'w-[64px] h-[64px]' : 'w-[78px] h-[78px]'} rounded-full overflow-hidden relative transition-transform duration-300 group-hover:scale-105`} style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.11)' }}>
              <Image
                src={profileImage}
                alt={employee.fullName}
                fill
                className="object-cover"
                sizes={compact ? '68px' : '80px'}
                priority={false}
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
            </div>
          ) : (
            <div
              className={`${compact ? 'w-[64px] h-[64px] text-base' : 'w-[78px] h-[78px] text-lg'} rounded-full flex items-center justify-center text-white font-semibold transition-transform duration-300 group-hover:scale-105`}
              style={{ backgroundColor: avatarBg, boxShadow: '0 4px 10px rgba(0,0,0,0.11)' }}
            >
              {initials}
            </div>
          )}
        </div>

        {/* Text content */}
        <div className="flex flex-col justify-center min-w-0 flex-1 gap-0.5">
        {compact ? (
          <>
            <span className="text-[11px] text-neutral-400">
              {employee.jobTitle || 'Specialist'}
            </span>
            <h1 className="text-neutral-900 text-[15px] leading-snug font-semibold tracking-[-0.01em] line-clamp-1">
              {employee.fullName}
            </h1>
            <p className="text-neutral-400 text-[11px] line-clamp-1">
              {listingTitle}
            </p>
            <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
              <svg className="w-2.5 h-2.5 text-amber-400" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              <span className="font-bold text-neutral-900 tabular-nums">{Number(rating).toFixed(1)}</span>
              <span className="w-px h-3 bg-neutral-200 mx-0.5" />
              <span className="text-neutral-400">0 reviews</span>
            </div>
          </>
        ) : (
          <>
            <span className="text-[12px] text-neutral-400">
              {employee.jobTitle || 'Specialist'}
            </span>
            <h1 className="text-neutral-900 text-[16px] leading-snug font-semibold tracking-[-0.01em] line-clamp-1">
              {employee.fullName}
            </h1>
            <p className="text-neutral-400 text-[12px] line-clamp-1">
              {listingTitle}
            </p>
            <div className="mt-2 flex items-center gap-2 text-[12px]">
              <svg className="w-3 h-3 text-amber-400" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              <span className="font-bold text-neutral-900 tabular-nums">{Number(rating).toFixed(1)}</span>
              <span className="w-px h-3.5 bg-neutral-200 mx-0.5" />
              <span className="text-neutral-400">0 reviews</span>
            </div>
          </>
        )}
        </div>

      </div>
    </div>
  );
};

export default WorkerCard;
