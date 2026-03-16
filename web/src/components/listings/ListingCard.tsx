'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { SafeListing, SafeUser } from '@/app/types';
import HeartButton from '../HeartButton';
import VerificationBadge from '../VerificationBadge';

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

const ListingCard: React.FC<ListingCardProps> = ({ data, currentUser, compact = false, variant = 'horizontal', solidBackground = false }) => {
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

  // Function to render title with verification badge that stays with last word
  const renderTitleWithBadge = (title: string, size: number = 14) => {
    const words = title.trim().split(' ');
    if (words.length === 0) return null;

    const Badge = () => (
      <span className="inline-flex items-center align-middle ml-0.5" aria-label="Verified">
        <VerificationBadge size={size} />
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

  // Solid background editorial layout (matches WorkerCard/ServiceCard style on profile page)
  if (solidBackground) {
    return (
      <div
        onClick={() => router.push(`/listings/${data.id}`)}
        className="group cursor-pointer rounded-xl overflow-hidden relative transition-all duration-300 hover:border-neutral-300 hover:shadow-sm"
      >
        {/* White background */}
        <div className="absolute inset-0 bg-white rounded-xl border border-neutral-200/60" />

        <div className="relative z-10">
          <div className={compact ? 'relative h-[180px]' : 'relative h-[280px]'}>
            {/* Bold editorial layout */}
            <div className="absolute inset-0 flex flex-col z-20 overflow-hidden">
              {/* Large rating watermark in background */}
              <div className="absolute -right-2 -top-4 text-[80px] font-black text-neutral-100 leading-none select-none pointer-events-none">
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
              {/* Title with verification badge */}
              <h1 className="text-white text-[17px] leading-snug font-semibold tracking-[-0.02em] drop-shadow line-clamp-2">
                {renderTitleWithBadge(data.title, 16)}
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

  // Horizontal layout (new style - default)
  return (
    <div
      onClick={() => router.push(`/listings/${data.id}`)}
      className="group cursor-pointer rounded-2xl p-3.5 transition-all duration-300 hover:bg-stone-50 dark:hover:bg-zinc-800/50 relative"
    >
      {/* Heart button — top right, visible on hover */}
      <div
        className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center gap-0.5"
        onClick={(e) => e.stopPropagation()}
      >
        <HeartButton listingId={data.id} currentUser={currentUser} variant="listingHead" />
        <span className="text-[10px] font-medium text-stone-400 dark:text-zinc-500 tabular-nums">{data.ratingCount ?? 0}</span>
      </div>
      <div className="flex flex-row gap-4 items-center w-full">
        {/* Image card */}
        <div
          className={`
            relative overflow-hidden rounded-xl flex-shrink-0 shadow-md
            transition-transform duration-500 ease-out group-hover:scale-[1.02]
            ${compact ? 'w-[80px] h-[80px]' : 'w-[100px] h-[100px]'}
          `}
        >
          <Image
            src={cardImage}
            alt={data.title}
            fill
            className="object-cover"
            sizes="100px"
            priority={false}
          />
        </div>

        {/* Text content */}
        <div className="flex flex-col justify-center min-w-0 flex-1 gap-0.5">
        {compact ? (
          <>
            {data.category && (
              <span className="text-[10px] italic text-stone-400 dark:text-zinc-500 tracking-wide">
                {data.category}
              </span>
            )}
            <h1 className="text-neutral-900 dark:text-zinc-100 text-[15px] leading-snug font-semibold tracking-[-0.02em] line-clamp-1">
              {data.title}
            </h1>
            <p className="text-stone-400 dark:text-zinc-500 text-[11px] line-clamp-1">
              {city && state ? `${city}, ${state}` : city || state || 'Location'}
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] whitespace-nowrap overflow-hidden">
              <span className="font-semibold text-neutral-900 dark:text-zinc-100 tabular-nums">{Number(data.rating ?? 0).toFixed(1)}</span>
              <svg className="w-2.5 h-2.5 text-stone-400 dark:text-zinc-500" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              <span className="text-stone-300 dark:text-zinc-600 mx-0.5">&middot;</span>
              <span className="text-stone-400 dark:text-zinc-500">{data.ratingCount ?? 0} reviews</span>
              {priceRange && (
                <>
                  <span className="text-stone-300 dark:text-zinc-600 mx-0.5">&middot;</span>
                  <span className="text-stone-500 dark:text-zinc-400 font-medium">{priceRange}</span>
                </>
              )}
            </div>
          </>
        ) : (
          <>
            {data.category && (
              <span className="text-[11px] italic text-stone-400 dark:text-zinc-500 tracking-wide">
                {data.category}
              </span>
            )}
            <h1 className="text-neutral-900 dark:text-zinc-100 text-[16px] leading-snug font-semibold tracking-[-0.02em] line-clamp-1">
              {data.title}
            </h1>
            <p className="text-stone-400 dark:text-zinc-500 text-[12px] line-clamp-1">
              {city && state ? `${city}, ${state}` : city || state || 'Location'}
            </p>
            <div className="mt-2 flex items-center gap-2 text-[12px] whitespace-nowrap overflow-hidden">
              <span className="font-semibold text-neutral-900 dark:text-zinc-100 tabular-nums">{Number(data.rating ?? 0).toFixed(1)}</span>
              <svg className="w-3 h-3 text-stone-400 dark:text-zinc-500" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              <span className="text-stone-300 dark:text-zinc-600 mx-0.5">&middot;</span>
              <span className="text-stone-400 dark:text-zinc-500">{data.ratingCount ?? 0} reviews</span>
              {priceRange && (
                <>
                  <span className="text-stone-300 dark:text-zinc-600 mx-0.5">&middot;</span>
                  <span className="text-stone-500 dark:text-zinc-400 font-medium">{priceRange}</span>
                </>
              )}
            </div>
          </>
        )}
        </div>

      </div>
    </div>
  );
};

export default ListingCard;
