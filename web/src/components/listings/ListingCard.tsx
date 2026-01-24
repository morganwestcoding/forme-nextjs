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
}

// Inline status indicator for the image
const StatusIndicator = ({ storeHours }: { storeHours?: { dayOfWeek: string; openTime: string; closeTime: string; isClosed: boolean }[] }) => {
  const getStatus = () => {
    if (!storeHours?.length) return { isOpen: true, label: 'Open' };
    const now = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = storeHours.find(h => h.dayOfWeek.toLowerCase() === dayNames[now.getDay()].toLowerCase());
    if (!today || today.isClosed) return { isOpen: false, label: 'Closed' };
    const hhmm = now.toTimeString().slice(0, 5);
    const to24 = (t: string) => t.includes('M') ? t.replace(/(\d+):(\d+)\s*(AM|PM)/i, (_, h, m, p) => `${(p.toUpperCase() === 'PM' && h !== '12' ? +h + 12 : h === '12' && p.toUpperCase() === 'AM' ? '00' : h).toString().padStart(2, '0')}:${m}`) : t;
    const curr = to24(hhmm), open = to24(today.openTime), close = to24(today.closeTime);
    return curr >= open && curr < close ? { isOpen: true, label: 'Open' } : { isOpen: false, label: 'Closed' };
  };
  const { isOpen, label } = getStatus();
  return (
    <span
      className={`
        inline-flex items-center justify-center text-[10px] font-semibold px-2.5 h-[22px] rounded-md
        backdrop-blur-md border
        ${isOpen
          ? 'bg-emerald-500/90 text-white border-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
          : 'bg-black/60 text-white/90 border-white/20'
        }
      `}
      style={{ lineHeight: '22px' }}
    >
      {label}
    </span>
  );
};

const ListingCard: React.FC<ListingCardProps> = ({ data, currentUser, compact = false, variant = 'horizontal' }) => {
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
            listingId={data.id}
            currentUser={currentUser}
            variant="listingHead"
          />
        </div>
        {/* Image card */}
        <div
          className={`
            relative overflow-hidden rounded-lg bg-neutral-900 flex-shrink-0
            transition-[transform,filter] duration-500 ease-out
            group-hover:scale-[1.02]
            ${compact ? 'w-[100px] h-[100px]' : 'w-[120px] h-[120px]'}
          `}
        >
          <Image
            src={cardImage}
            alt={data.title}
            fill
            className="object-cover transition-[transform,filter] duration-700 ease-out group-hover:brightness-105"
            sizes="120px"
            priority={false}
          />
          {/* Status indicator */}
          <div className="absolute bottom-2 left-2 z-20">
            <StatusIndicator storeHours={data.storeHours} />
          </div>
        </div>

        {/* Text content */}
        <div className="flex flex-col justify-center min-w-0 flex-1 gap-0.5">
        {compact ? (
          <>
            {data.category && (
              <span className="text-[11px] text-neutral-400">
                {data.category}
              </span>
            )}
            <h1 className="text-neutral-900 text-[15px] leading-snug font-semibold tracking-[-0.01em] line-clamp-2 max-w-[140px]">
              {data.title}
            </h1>
            <p className="text-neutral-400 text-[11px] line-clamp-1">
              {city && state ? `${city}, ${state}` : city || state || 'Location'}
            </p>
            <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
              <span className="font-semibold text-neutral-900 tabular-nums">{Number(data.rating ?? 5.0).toFixed(1)}</span>
              {priceRange && (
                <>
                  <span className="text-neutral-300">|</span>
                  <span className="text-neutral-500">{priceRange}</span>
                </>
              )}
            </div>
          </>
        ) : (
          <>
            {data.category && (
              <span className="text-[12px] text-neutral-400">
                {data.category}
              </span>
            )}
            <h1 className="text-neutral-900 text-[16px] leading-snug font-semibold tracking-[-0.01em] line-clamp-2 max-w-[160px]">
              {renderTitleWithBadge(data.title)}
            </h1>
            <p className="text-neutral-400 text-[12px] line-clamp-1">
              {city && state ? `${city}, ${state}` : city || state || 'Location'}
            </p>
            <div className="mt-2 flex items-center gap-2 text-[12px]">
              <span className="font-semibold text-neutral-900 tabular-nums">{Number(data.rating ?? 5.0).toFixed(1)}</span>
              {priceRange && (
                <>
                  <span className="text-neutral-300">|</span>
                  <span className="text-neutral-500">{priceRange}</span>
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
