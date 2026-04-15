// components/listings/WorkerCard.tsx
'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SafeListing, SafeUser, SafeEmployee, SafeStoreHours } from '@/app/types';
import HeartButton from '../HeartButton';

interface WorkerCardProps {
  employee: SafeEmployee & {
    followerCount?: number;
    followingCount?: number;
    isTrending?: boolean;
    availabilityStatus?: 'free' | 'busy' | 'booked';
    storeHours?: SafeStoreHours[];
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
  onCardClick?: () => void;
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
  onCardClick,
  compact = false,
  solidBackground = false,
}) => {
  const [imageError, setImageError] = useState(false);
  const router = useRouter();

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick();
      return;
    }
    // Default: send to the worker's profile (used on Discover, Shop, Favorites).
    router.push(`/profile/${employee.userId}`);
  };

  const initials = useMemo(() => getInitials(employee.fullName), [employee.fullName]);

  // Student badge — show "Student at {Academy}" so customers don't mistake
  // a trainee for a fully licensed pro before booking.
  const isStudent = employee.user?.userType === 'student';
  const studentAcademyName = employee.user?.academyName ?? null;
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
        className="group cursor-pointer rounded-2xl overflow-visible relative transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white to-stone-50/80 dark:from-stone-900 dark:to-stone-950 rounded-2xl" />
        {/* Border overlay — renders on top of watermark */}
        <div className="absolute inset-0 z-30 rounded-2xl border border-stone-200/80 dark:border-stone-800 group-hover:border-stone-300 dark:group-hover:border-stone-700 transition-colors pointer-events-none" />

        {/* Heart + Share — top right, visible on hover */}
        <div className="absolute top-3 right-[18px] z-30 flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" onClick={(e) => e.stopPropagation()}>
          <HeartButton listingId={listing.id} currentUser={currentUser} variant="listingHead" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (navigator.share) {
                navigator.share({ title: employee.fullName, url: `${window.location.origin}/profile/${employee.userId}` });
              } else {
                navigator.clipboard.writeText(`${window.location.origin}/profile/${employee.userId}`);
              }
            }}
            aria-label="Share"
            className="transition-all duration-300 text-stone-300 hover:text-stone-900"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.0017 3C7.05534 3.03208 5.41096 3.21929 4.31838 4.31188C2.99988 5.63037 2.99988 7.75248 2.99988 11.9966C2.99988 16.2409 2.99988 18.363 4.31838 19.6815C5.63688 21 7.75899 21 12.0032 21C16.2474 21 18.3695 21 19.688 19.6815C20.7808 18.5887 20.9678 16.9438 20.9999 13.9963" />
              <path d="M14 3H18C19.4142 3 20.1213 3 20.5607 3.43934C21 3.87868 21 4.58579 21 6V10M20 4L11 13" />
            </svg>
          </button>
        </div>

        <div className="relative z-10">
          <div className={compact ? 'relative h-[180px]' : 'relative h-[280px]'}>
            {/* Bold editorial layout */}
            <div className="absolute inset-0 flex flex-col z-20 overflow-hidden rounded-2xl">
              {/* Large initials watermark in background */}
              <div className="absolute -right-2 -top-4 text-[80px] font-black text-stone-100/80 dark:text-stone-800/60 leading-none select-none pointer-events-none">
                {initials}
              </div>

              {/* Content */}
              <div className="relative flex flex-col h-full p-5">
                {/* Avatar */}
                <div className="mb-3">
                  <div className="relative w-12 h-12">
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
                    {isStudent && (
                      <div
                        title={studentAcademyName ? `Student at ${studentAcademyName}` : 'Student'}
                        className="absolute -bottom-1 -right-1 w-[22px] h-[22px] rounded-full bg-gradient-to-br from-stone-600 to-stone-900 ring-[1.5px] ring-white flex items-center justify-center shadow-[0_1px_3px_rgba(49,46,129,0.35)]"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                {/* Name - large and bold */}
                <h3 className="text-[17px] font-black text-stone-900 dark:text-stone-100 leading-[1.15] line-clamp-2 tracking-tight pr-8">
                  {employee.fullName}
                </h3>

                {/* Job title - understated */}
                <p className="mt-1.5 text-[11px] text-stone-400 dark:text-stone-500 font-medium">
                  {employee.jobTitle || employee.user?.jobTitle || 'Specialist'}
                </p>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Bottom row - rating with subtle arrow */}
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-black text-stone-900 dark:text-stone-100 tabular-nums">{Number(rating).toFixed(1)}</span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-stone-300 dark:text-stone-700 group-hover:text-stone-900 dark:group-hover:text-stone-100 group-hover:translate-x-0.5 transition-all duration-300 mb-1"
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
      className="group cursor-pointer rounded-2xl p-3 -mx-3 flex flex-row gap-4 relative transition-colors duration-200 hover:bg-stone-50/80 dark:hover:bg-stone-900/40"
    >
      {/* Avatar — 100px circle centered in 120px to align with ListingCard */}
      <div className="flex-shrink-0 w-[120px] h-[120px] flex items-center justify-center">
        <div className="relative w-[100px] h-[100px]">
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
          {isStudent && (
            <div
              title={studentAcademyName ? `Student at ${studentAcademyName}` : 'Student'}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-gradient-to-br from-stone-600 to-stone-900 ring-[1.5px] ring-white flex items-center justify-center shadow-[0_2px_8px_rgba(49,46,129,0.4)]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col justify-center min-w-0 flex-1">
        {/* Category — editorial cursive */}
        {(employee.jobTitle || employee.user?.jobTitle || listing.category) && (
          <p className="text-[11px] text-stone-400 dark:text-stone-500 leading-none" style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontStyle: 'italic' }}>
            {employee.jobTitle || employee.user?.jobTitle || listing.category}
          </p>
        )}

        {/* Name */}
        <h2 className="text-[15px] font-semibold text-stone-900 dark:text-stone-100 tracking-[-0.01em] leading-tight line-clamp-2 mt-0.5">
          {employee.fullName}
        </h2>

        {/* Location — listing title */}
        <p className="text-[11px] text-stone-400 dark:text-stone-500 leading-none mt-1.5">
          {listingTitle}
        </p>

        {/* Rating | Price */}
        <div className="flex items-center text-[11px] text-stone-400 dark:text-stone-500 leading-none mt-2 tabular-nums">
          <svg width="11" height="11" viewBox="0 0 24 24" className="text-stone-400 dark:text-stone-500 mr-1 -mt-px flex-shrink-0">
            <defs>
              <linearGradient id="workerStarGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f5c842" />
                <stop offset="100%" stopColor="#d4a017" />
              </linearGradient>
            </defs>
            <path d="M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z" fill="url(#workerStarGold)" />
          </svg>
          <span className="text-stone-500 dark:text-stone-400">{Number(rating).toFixed(1)}</span>
          {priceRange && <><span className="mx-1.5 text-stone-300 dark:text-stone-600">|</span>{priceRange}</>}
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
          className="transition-colors duration-200 text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.0017 3C7.05534 3.03208 5.41096 3.21929 4.31838 4.31188C2.99988 5.63037 2.99988 7.75248 2.99988 11.9966C2.99988 16.2409 2.99988 18.363 4.31838 19.6815C5.63688 21 7.75899 21 12.0032 21C16.2474 21 18.3695 21 19.688 19.6815C20.7808 18.5887 20.9678 16.9438 20.9999 13.9963" />
            <path d="M14 3H18C19.4142 3 20.1213 3 20.5607 3.43934C21 3.87868 21 4.58579 21 6V10M20 4L11 13" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default WorkerCard;
