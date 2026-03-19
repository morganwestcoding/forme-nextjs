// components/listings/WorkerCard.tsx
'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SafeListing, SafeUser, SafeEmployee } from '@/app/types';
import HeartButton from '../HeartButton';

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

  const shouldShowImage = profileImage && !imageError;
  const rating = employee.rating ?? 5.0;

  // Get price range from listing services
  const prices = listing.services?.map(s => s.price).filter(p => p > 0) || [];
  const minPrice = prices.length > 0 ? Math.min(...prices) : null;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : null;
  const priceRange = minPrice !== null
    ? minPrice === maxPrice
      ? `$${minPrice}`
      : `$${minPrice} - $${maxPrice}`
    : null;

  // Solid background editorial layout (matches ServiceCard style on listing page)
  if (solidBackground) {
    return (
      <div
        onClick={handleCardClick}
        className="group cursor-pointer rounded-xl overflow-hidden relative transition-all duration-300 hover:border-neutral-300 hover:shadow-sm"
      >
        {/* White background */}
        <div className="absolute inset-0 bg-white rounded-xl border border-neutral-200/60" />

        {/* Heart button - visible on hover */}
        <div className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
          <HeartButton listingId={listing.id} currentUser={currentUser} variant="listingHead" />
          <span className="text-[10px] font-medium text-stone-400 dark:text-zinc-500 tabular-nums">{employee.followerCount ?? 0}</span>
        </div>

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
                    <div className="w-12 h-12 rounded-full overflow-hidden relative">
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
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-semibold"
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
  const imgSize = compact ? 'w-[72px] h-[72px]' : 'w-[100px] h-[100px]';

  return (
    <div
      onClick={handleCardClick}
      className="group cursor-pointer rounded-2xl p-3 -mx-3 flex flex-row gap-4 relative transition-colors duration-200 hover:bg-stone-50/80 dark:hover:bg-zinc-900/40"
    >
      {/* Avatar — 100px circle centered in 120px to align with ListingCard */}
      <div className="flex-shrink-0 w-[120px] h-[120px] flex items-center justify-center">
      <div className="relative overflow-hidden rounded-full w-[100px] h-[100px] shadow-sm">
        {shouldShowImage ? (
          <Image
            src={profileImage}
            alt={employee.fullName}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            sizes="120px"
            priority={false}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-white text-xl font-semibold"
            style={{ backgroundColor: avatarBg }}
          >
            {initials}
          </div>
        )}
      </div>
      </div>

      {/* Info */}
      <div className="flex flex-col justify-center min-w-0 flex-1">
        {/* Category — editorial cursive */}
        {(employee.jobTitle || listing.category) && (
          <p className="text-[11px] text-stone-400 dark:text-zinc-500 leading-none" style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontStyle: 'italic' }}>
            {employee.jobTitle || listing.category}
          </p>
        )}

        {/* Name */}
        <h2 className="text-[15px] font-semibold text-neutral-900 dark:text-zinc-100 tracking-[-0.01em] leading-tight line-clamp-2 mt-0.5">
          {employee.fullName}
        </h2>

        {/* Location — listing title */}
        <p className="text-[11px] text-stone-400 dark:text-zinc-500 leading-none mt-1.5">
          {listingTitle}
        </p>

        {/* Rating | Price */}
        <div className="flex items-center text-[11px] text-stone-400 dark:text-zinc-500 leading-none mt-2 tabular-nums">
          <svg width="11" height="11" viewBox="0 0 24 24" className="text-stone-400 dark:text-zinc-500 mr-1 -mt-px flex-shrink-0">
            <defs>
              <linearGradient id="workerStarGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f5c842" />
                <stop offset="100%" stopColor="#d4a017" />
              </linearGradient>
            </defs>
            <path d="M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z" fill="url(#workerStarGold)" />
          </svg>
          <span className="text-stone-500 dark:text-zinc-400">{Number(rating).toFixed(1)}</span>
          {priceRange && <><span className="mx-1.5 text-stone-300 dark:text-zinc-600">|</span>{priceRange}</>}
        </div>
      </div>

      {/* Right actions — heart + share, hover only */}
      <div
        className="flex flex-col items-center justify-center gap-3 flex-shrink-0 mr-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="-ml-0.5"><HeartButton listingId={listing.id} currentUser={currentUser} variant="card" /></div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (navigator.share) {
              navigator.share({ title: employee.fullName, url: `${window.location.origin}/listings/${listing.id}` });
            } else {
              navigator.clipboard.writeText(`${window.location.origin}/listings/${listing.id}`);
            }
          }}
          aria-label="Share"
          className="transition-colors duration-200 text-black dark:text-zinc-400 hover:text-stone-700 dark:hover:text-zinc-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.39584 4.5H8.35417C5.40789 4.5 3.93475 4.5 3.01946 5.37868C2.10417 6.25736 2.10417 7.67157 2.10417 10.5V14.5C2.10417 17.3284 2.10417 18.7426 3.01946 19.6213C3.93475 20.5 5.40789 20.5 8.35417 20.5H12.5608C15.5071 20.5 16.9802 20.5 17.8955 19.6213C18.4885 19.052 18.6973 18.2579 18.7708 17" />
            <path d="M16.1667 7V3.85355C16.1667 3.65829 16.3316 3.5 16.535 3.5C16.6326 3.5 16.7263 3.53725 16.7954 3.60355L21.5275 8.14645C21.7634 8.37282 21.8958 8.67986 21.8958 9C21.8958 9.32014 21.7634 9.62718 21.5275 9.85355L16.7954 14.3964C16.7263 14.4628 16.6326 14.5 16.535 14.5C16.3316 14.5 16.1667 14.3417 16.1667 14.1464V11H13.1157C8.875 11 7.3125 14.5 7.3125 14.5V12C7.3125 9.23858 9.64435 7 12.5208 7H16.1667Z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default WorkerCard;
