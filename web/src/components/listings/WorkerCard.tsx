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
      className="group cursor-pointer py-3 flex flex-row items-center gap-3.5 relative max-w-[400px]"
    >
      {/* Avatar */}
      {shouldShowImage ? (
        <div className={`relative overflow-hidden rounded-full flex-shrink-0 shadow-sm transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] brightness-[0.97] group-hover:brightness-100 group-hover:scale-[1.02] ${imgSize}`}>
          <Image
            src={profileImage}
            alt={employee.fullName}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            sizes="100px"
            priority={false}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        </div>
      ) : (
        <div
          className={`${imgSize} rounded-full flex-shrink-0 flex items-center justify-center text-white font-semibold transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.02] ${compact ? 'text-base' : 'text-lg'}`}
          style={{ backgroundColor: avatarBg }}
        >
          {initials}
        </div>
      )}

      {/* Info */}
      <div className="flex flex-col min-w-0 flex-1">
        {/* Rating + Heart — pinned right with left divider */}
        <div className="absolute top-5 right-0 flex flex-col items-center pl-3 border-l border-neutral-200 dark:border-zinc-700/50 gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {/* Star + rating count */}
          <div className="flex flex-col items-center">
            <svg width="18" height="18" viewBox="0 0 24 24" className="text-stone-500 dark:text-zinc-400">
              <path d="M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span className="text-[11px] text-stone-400 dark:text-zinc-500 tabular-nums mt-0.5">
              {Number(rating).toFixed(1)}
            </span>
          </div>
          {/* Heart + favorite count */}
          <div className="flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <HeartButton listingId={listing.id} currentUser={currentUser} variant="listingHead" />
            <span className="text-[11px] text-stone-400 dark:text-zinc-500 tabular-nums mt-0.5">
              {employee.followerCount ?? 0}
            </span>
          </div>
        </div>

        {/* Text stack — padded right to avoid overlapping rating */}
        <div className="pr-0 group-hover:pr-16 transition-all duration-300">
          {/* Name */}
          <h1 className="text-neutral-900 dark:text-zinc-100 text-[15px] leading-tight font-semibold tracking-[-0.02em] line-clamp-2">
            {employee.fullName}
          </h1>

          {/* Job title + listing */}
          <p className="text-stone-500 dark:text-zinc-400 text-[12px] mt-1 line-clamp-1">
            {employee.jobTitle || 'Specialist'} · {listingTitle}
          </p>
        </div>

        {/* Price + Open status + Rating */}
        <div className="mt-1 flex items-center gap-2 text-[11px]">
          {priceRange && (
            <span className="text-stone-600 dark:text-zinc-400 font-medium">{priceRange}</span>
          )}
          {priceRange && <span className="text-stone-400 dark:text-zinc-600">·</span>}
          <span className="flex items-center gap-0.5 text-stone-500 dark:text-zinc-400">
            <svg width="11" height="11" viewBox="0 0 24 24" className="text-stone-400 dark:text-zinc-500">
              <path d="M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z" fill="currentColor" />
            </svg>
            <span className="tabular-nums">{Number(rating).toFixed(1)}</span>
          </span>
          <span className="text-stone-400 dark:text-zinc-600">·</span>
          {(() => {
            const storeHours = employee.storeHours;
            const now = new Date();
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const today = (storeHours as any[])?.find((h: any) => h.dayOfWeek.toLowerCase() === dayNames[now.getDay()].toLowerCase());

            const to12 = (t: string) => {
              if (t.includes('M')) return t;
              const [h, m] = t.split(':').map(Number);
              const period = h >= 12 ? 'PM' : 'AM';
              const hour = h % 12 || 12;
              return m === 0 ? `${hour}${period}` : `${hour}:${m.toString().padStart(2, '0')}${period}`;
            };
            const to24 = (t: string) => t.includes('M') ? t.replace(/(\d+):(\d+)\s*(AM|PM)/i, (_, h, m, p) => `${(p.toUpperCase() === 'PM' && h !== '12' ? +h + 12 : h === '12' && p.toUpperCase() === 'AM' ? '00' : h).toString().padStart(2, '0')}:${m}`) : t;
            const toMinutes = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };

            if (!storeHours?.length) return <span className="text-emerald-500 font-medium">Open until 9PM</span>;

            const findNextOpen = () => {
              for (let i = 1; i <= 7; i++) {
                const nextDay = (storeHours as any[])?.find((h: any) => h.dayOfWeek.toLowerCase() === dayNames[(now.getDay() + i) % 7].toLowerCase());
                if (nextDay && !nextDay.isClosed) return to12(nextDay.openTime);
              }
              return '9AM';
            };

            if (!today || today.isClosed) return <span className="text-stone-400 dark:text-zinc-500 font-medium">{`Closed until ${findNextOpen()}`}</span>;

            const curr = toMinutes(now.toTimeString().slice(0, 5));
            const open = toMinutes(to24(today.openTime));
            const close = toMinutes(to24(today.closeTime));

            if (curr < open) return <span className="text-stone-400 dark:text-zinc-500 font-medium">{`Closed until ${to12(today.openTime)}`}</span>;
            if (curr >= close) return <span className="text-stone-400 dark:text-zinc-500 font-medium">{`Closed until ${findNextOpen()}`}</span>;
            const minsLeft = close - curr;
            if (minsLeft <= 30) return <span className="text-amber-500 font-medium">{`Closing in ${minsLeft} min`}</span>;
            return <span className="text-emerald-500 font-medium">{`Open until ${to12(today.closeTime)}`}</span>;
          })()}
        </div>
      </div>
    </div>
  );
};

export default WorkerCard;
