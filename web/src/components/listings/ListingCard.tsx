'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { SafeListing, SafeUser } from '@/app/types';
import HeartButton from '../HeartButton';

interface ListingCardProps {
  data: SafeListing;
  currentUser?: SafeUser | null;
  categories?: { label: string; color: string }[];
  onAction?: () => void;
  disabled?: boolean;
  actionLabel?: string;
  compact?: boolean;
  variant?: 'horizontal' | 'vertical';
  solidBackground?: boolean;
  hideActions?: boolean;
  customActions?: React.ReactNode;
}

// Inline status indicator for the image
const StatusIndicator = ({ storeHours }: { storeHours?: { dayOfWeek: string; openTime: string; closeTime: string; isClosed: boolean }[] }) => {
  const getStatus = (): { status: 'open' | 'soon' | 'closing' | 'closed'; label: string } => {
    if (!storeHours?.length) return { status: 'open', label: 'Open' };
    const now = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = storeHours.find(h => h.dayOfWeek.toLowerCase() === dayNames[now.getDay()].toLowerCase());
    if (!today || today.isClosed) return { status: 'closed', label: 'Closed' };

    const to24 = (t: string) => t.includes('M') ? t.replace(/(\d+):(\d+)\s*(AM|PM)/i, (_, h, m, p) => `${(p.toUpperCase() === 'PM' && h !== '12' ? +h + 12 : h === '12' && p.toUpperCase() === 'AM' ? '00' : h).toString().padStart(2, '0')}:${m}`) : t;
    const toMinutes = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };

    const currTime = now.toTimeString().slice(0, 5);
    const curr = toMinutes(to24(currTime));
    const open = toMinutes(to24(today.openTime));
    const close = toMinutes(to24(today.closeTime));

    if (curr < open) {
      // Before opening - check if opening soon (within 30 min)
      return open - curr <= 30 ? { status: 'soon', label: 'Soon' } : { status: 'closed', label: 'Closed' };
    }
    if (curr >= close) {
      return { status: 'closed', label: 'Closed' };
    }
    // Currently open - check if closing soon (within 30 min)
    return close - curr <= 30 ? { status: 'closing', label: 'Closing' } : { status: 'open', label: 'Open' };
  };

  const { status, label } = getStatus();

  const dotColors = {
    open: { color: '#10b981', glow: 'rgba(16,185,129,0.5)' },
    soon: { color: '#eab308', glow: 'rgba(234,179,8,0.5)' },
    closing: { color: '#f97316', glow: 'rgba(249,115,22,0.5)' },
    closed: { color: '#a3a3a3', glow: 'none' },
  };

  const d = dotColors[status];
  const isActive = status === 'open' || status === 'soon';

  return (
    <span className="relative flex items-center justify-center w-2.5 h-2.5">
      {isActive && (
        <span
          className="absolute inset-0 rounded-full animate-ping"
          style={{ backgroundColor: d.color, opacity: 0.4, animationDuration: '2s' }}
        />
      )}
      <span
        className="relative w-2.5 h-2.5 rounded-full"
        style={{
          backgroundColor: d.color,
          boxShadow: isActive ? `0 0 6px 2px ${d.glow}` : 'none',
        }}
      />
    </span>
  );
};

const ListingCard: React.FC<ListingCardProps> = ({ data, currentUser, compact = false, variant = 'horizontal', solidBackground = false, hideActions = false, customActions }) => {
  const router = useRouter();

  const [city, state] = data.location?.split(',').map((s) => s.trim()) || [];
  const cardImage = data.imageSrc || data.galleryImages?.[0] || '/placeholder.jpg';

  // Get price range from services
  const prices = data.services?.map(s => s.price).filter(p => p > 0) || [];
  const minPrice = prices.length > 0 ? Math.min(...prices) : null;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : null;
  const priceRange = minPrice !== null
    ? minPrice === maxPrice
      ? `$${minPrice}`
      : `$${minPrice} - $${maxPrice}`
    : null;

  // Solid background editorial layout (matches WorkerCard/ServiceCard style on profile page)
  if (solidBackground) {
    return (
      <div
        onClick={() => router.push(`/listings/${data.id}`)}
        className="group cursor-pointer rounded-xl overflow-visible relative transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
      >
        {/* White background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white to-stone-50/80 rounded-xl" />
        {/* Border overlay — renders on top of watermark */}
        <div className="absolute inset-0 z-30 rounded-xl border border-stone-200/80 group-hover:border-stone-300 transition-colors pointer-events-none" />

        <div className="relative z-10">
          <div className={compact ? 'relative h-[180px]' : 'relative h-[280px]'}>
            {/* Bold editorial layout */}
            <div className="absolute inset-0 flex flex-col z-20 overflow-hidden rounded-xl">
              {/* Large rating watermark in background */}
              <div className="absolute -right-2 -top-4 text-[80px] font-black text-stone-100/80 leading-none select-none pointer-events-none">
                {Number(data.rating ?? 5.0).toFixed(1)}
              </div>

              {/* Content */}
              <div className="relative flex flex-col h-full p-5">
                {/* Category */}
                {data.category && (
                  <span className="text-[11px] text-neutral-400 font-medium mb-1.5">
                    {data.category}
                  </span>
                )}

                {/* Title - large and bold */}
                <h3 className="text-[17px] font-black text-neutral-900 leading-[1.15] line-clamp-2 tracking-tight pr-8">
                  {data.title}
                </h3>

                {/* Location - understated */}
                <p className="mt-1.5 text-[11px] text-neutral-400 font-medium">
                  {city && state ? `${city}, ${state}` : city || state || 'Location'}
                </p>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Bottom row - rating with subtle arrow */}
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-black text-neutral-900 tabular-nums">
                    {Number(data.rating ?? 5.0).toFixed(1)}
                  </span>
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

  // Vertical layout (original style)
  if (variant === 'vertical') {
    return (
      <div
        onClick={() => router.push(`/listings/${data.id}`)}
        className="group cursor-pointer overflow-hidden relative rounded-xl bg-neutral-900 transition-[transform,box-shadow,opacity] duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.15),0_8px_16px_rgba(0,0,0,0.1)] active:scale-[0.98] active:opacity-90 max-w-[250px]"
      >
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={cardImage}
            alt={data.title}
            fill
            className="object-cover transition-[transform,filter] duration-700 ease-out group-hover:scale-105 group-hover:brightness-110"
            sizes="(max-width:768px) 100vw, 33vw"
            priority={false}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(to top,' +
                'rgba(0,0,0,0.75) 0%,' +
                'rgba(0,0,0,0.70) 12%,' +
                'rgba(0,0,0,0.60) 26%,' +
                'rgba(0,0,0,0.45) 42%,' +
                'rgba(0,0,0,0.30) 56%,' +
                'rgba(0,0,0,0.15) 70%,' +
                'rgba(0,0,0,0.04) 82%,' +
                'rgba(0,0,0,0.00) 90%,' +
                'rgba(0,0,0,0.00) 100%)',
            }}
          />
        </div>

        <div className="relative z-10">
          <div className="relative h-[280px]">
            {/* Heart button */}
            <div className="absolute top-4 right-4 z-20">
              <HeartButton
                listingId={data.id}
                currentUser={currentUser}
                variant="default"
              />
            </div>

            {/* Bottom info */}
            <div className="absolute bottom-4 left-4 right-4 z-20">
              {/* Category */}
              {data.category && (
                <span className="text-[9px] uppercase tracking-[0.1em] text-white/70 font-medium drop-shadow-sm">
                  {data.category}
                </span>
              )}
              {/* Title */}
              <h1 className="text-white text-[17px] leading-snug font-semibold tracking-[-0.02em] drop-shadow line-clamp-2">
                {data.title}
              </h1>

              {/* Location */}
              <p className="text-white/80 text-[12px] line-clamp-1 drop-shadow-sm">
                {city && state ? `${city}, ${state}` : city || state || 'Location'}
              </p>

              {/* Rating + price */}
              <div className="mt-2 flex items-baseline gap-2 text-[12px]">
                <span className="font-semibold text-white tabular-nums drop-shadow-sm">{Number(data.rating ?? 5.0).toFixed(1)}</span>
                {priceRange && (
                  <>
                    <span className="text-white/40">/</span>
                    <span className="text-emerald-400 font-medium drop-shadow-sm">{priceRange}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="pb-2" />
        </div>
      </div>
    );
  }

  // Horizontal layout (default)
  const ratingNum = Number(data.rating ?? 0).toFixed(1);

  return (
    <div
      onClick={() => router.push(`/listings/${data.id}`)}
      className="group cursor-pointer rounded-2xl p-3 -mx-3 flex flex-row gap-4 relative transition-colors duration-200 hover:bg-stone-50/80 dark:hover:bg-zinc-900/40"
    >
      {/* Image */}
      <div className="relative overflow-hidden rounded-[14px] flex-shrink-0 w-[120px] h-[120px]">
        <Image
          src={cardImage}
          alt={data.title}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          sizes="120px"
          priority={false}
        />
      </div>

      {/* Text */}
      <div className="flex flex-col justify-center min-w-0 flex-1">
        {/* Category — editorial cursive */}
        {data.category && (
          <p className="text-[11px] text-stone-400 dark:text-zinc-500 leading-none" style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontStyle: 'italic' }}>
            {data.category}
          </p>
        )}

        {/* Title */}
        <h2 className="text-[15px] font-semibold text-neutral-900 dark:text-zinc-100 tracking-[-0.01em] leading-tight line-clamp-2 mt-0.5">
          {data.title}
        </h2>

        {/* Location */}
        <p className="text-[11px] text-stone-400 dark:text-zinc-500 leading-none mt-1.5">
          {city && state ? `${city}, ${state}` : city || state || 'Location'}
        </p>

        {/* Rating | Price */}
        <div className="flex items-center text-[11px] text-stone-400 dark:text-zinc-500 leading-none mt-2 tabular-nums">
          <svg width="11" height="11" viewBox="0 0 24 24" className="text-stone-400 dark:text-zinc-500 mr-1 -mt-px flex-shrink-0">
            <defs>
              <linearGradient id="listingStarGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f5c842" />
                <stop offset="100%" stopColor="#d4a017" />
              </linearGradient>
            </defs>
            <path d="M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z" fill="url(#listingStarGold)" />
          </svg>
          <span className="text-stone-500 dark:text-zinc-400">{ratingNum === '0.0' ? '5.0' : ratingNum}</span>
          {priceRange && <><span className="mx-1.5 text-stone-300 dark:text-zinc-600">|</span>{priceRange}</>}
        </div>
      </div>

      {/* Right actions */}
      {customActions ? customActions : !hideActions && (
        <div
          className="flex flex-col items-center justify-center gap-3 flex-shrink-0 mr-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="-ml-0.5"><HeartButton listingId={data.id} currentUser={currentUser} variant="card" /></div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (navigator.share) {
                navigator.share({ title: data.title, url: `${window.location.origin}/listings/${data.id}` });
              } else {
                navigator.clipboard.writeText(`${window.location.origin}/listings/${data.id}`);
              }
            }}
            aria-label="Share"
            className="transition-colors duration-200 text-stone-500 dark:text-zinc-400 hover:text-stone-700 dark:hover:text-zinc-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.0017 3C7.05534 3.03208 5.41096 3.21929 4.31838 4.31188C2.99988 5.63037 2.99988 7.75248 2.99988 11.9966C2.99988 16.2409 2.99988 18.363 4.31838 19.6815C5.63688 21 7.75899 21 12.0032 21C16.2474 21 18.3695 21 19.688 19.6815C20.7808 18.5887 20.9678 16.9438 20.9999 13.9963" />
              <path d="M14 3H18C19.4142 3 20.1213 3 20.5607 3.43934C21 3.87868 21 4.58579 21 6V10M20 4L11 13" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default ListingCard;
