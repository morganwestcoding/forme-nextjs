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
        className="group cursor-pointer rounded-xl overflow-hidden relative transition-all duration-300 hover:border-stone-400 hover:shadow-sm"
      >
        {/* Gradient background */}
        <div
          className="absolute inset-0 rounded-xl border border-stone-300/90"
          style={{
            background: 'linear-gradient(to bottom, #FAFAF9, #F7F7F6)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.7)',
          }}
        />

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
      className="group cursor-pointer rounded-xl border border-stone-300/90 p-3 transition-all duration-300 hover:border-stone-400 hover:shadow-sm"
      style={{
        background: 'linear-gradient(to bottom, #FAFAF9, #F7F7F6)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.7)',
      }}
    >
      <div className="flex flex-row gap-4 items-center w-full relative">
        {/* Heart button - top right */}
        <div className="absolute top-0 right-0 z-20">
          <HeartButton
            listingId={employee.id}
            currentUser={currentUser}
            variant="listingHead"
          />
        </div>
        {/* Avatar container - matches ListingCard image size */}
        <div className={`flex-shrink-0 flex items-center justify-center ${compact ? 'w-[100px] h-[100px]' : 'w-[120px] h-[120px]'}`}>
          {shouldShowImage ? (
            <div className={`${compact ? 'w-[68px] h-[68px]' : 'w-[80px] h-[80px]'} rounded-full overflow-hidden shadow-sm relative transition-transform duration-300 group-hover:scale-105 border border-neutral-200`}>
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
              className={`${compact ? 'w-[68px] h-[68px] text-lg' : 'w-[80px] h-[80px] text-xl'} rounded-full flex items-center justify-center text-white font-semibold shadow-sm transition-transform duration-300 group-hover:scale-105 border border-neutral-200`}
              style={{ backgroundColor: avatarBg }}
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
            <h1 className="text-neutral-900 text-[15px] leading-snug font-semibold tracking-[-0.01em] line-clamp-2 max-w-[140px]">
              {employee.fullName}
            </h1>
            <p className="text-neutral-400 text-[11px] line-clamp-1">
              {listingTitle}
            </p>
            <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
              <span className="font-semibold text-neutral-900 tabular-nums">{Number(rating).toFixed(1)}</span>
              <span className="text-neutral-300">|</span>
              <span className="text-neutral-500">Reserve</span>
            </div>
          </>
        ) : (
          <>
            <span className="text-[12px] text-neutral-400">
              {employee.jobTitle || 'Specialist'}
            </span>
            <h1 className="text-neutral-900 text-[16px] leading-snug font-semibold tracking-[-0.01em] line-clamp-2 max-w-[160px]">
              {renderNameWithBadge(employee.fullName)}
            </h1>
            <p className="text-neutral-400 text-[12px] line-clamp-1">
              {listingTitle}
            </p>
            <div className="mt-2 flex items-center gap-2 text-[12px]">
              <span className="font-semibold text-neutral-900 tabular-nums">{Number(rating).toFixed(1)}</span>
              <span className="text-neutral-300">|</span>
              <span className="text-neutral-500">Reserve</span>
            </div>
          </>
        )}
        </div>
      </div>
    </div>
  );
};

export default WorkerCard;
