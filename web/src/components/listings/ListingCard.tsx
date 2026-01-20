'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { SafeListing, SafeUser } from '@/app/types';
import SmartBadgeRating from './SmartBadgeRating';
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
}

const ListingCard: React.FC<ListingCardProps> = ({ data, currentUser, compact = false }) => {
  const router = useRouter();

  const [city, state] = data.location?.split(',').map((s) => s.trim()) || [];
  const cardImage = data.imageSrc || data.galleryImages?.[0] || '/placeholder.jpg';

  // Function to render title with verification badge that stays with last word
  const renderTitleWithBadge = (title: string) => {
    const words = title.trim().split(' ');
    if (words.length === 0) return null;

    const Badge = () => (
      <span className="inline-flex items-center align-middle ml-0.5" aria-label="Verified">
        <VerificationBadge size={14} />
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

  return (
    <div
      onClick={() => router.push(`/listings/${data.id}`)}
      className={`
        group cursor-pointer relative overflow-hidden
        rounded-3xl bg-neutral-900
        transition-[transform,box-shadow,opacity] duration-500 ease-out
        hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.15),0_8px_16px_rgba(0,0,0,0.1)]
        active:scale-[0.98] active:opacity-90
        ${compact ? '' : 'max-w-[250px]'}
      `}
    >
      {/* Background image + lighter-at-top, bottom-heavy gradient */}
      <div className="absolute inset-0 z-0 overflow-hidden rounded-3xl">
        <Image
          src={cardImage}
          alt={data.title}
          fill
          className="object-cover transition-[transform,filter] duration-700 ease-out group-hover:scale-105 group-hover:brightness-110"
          sizes="(max-width:768px) 100vw, 33vw"
          priority={false}
        />
        {/* Center vignette gradient for centered text */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(0,0,0,0.50) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.15) 100%)',
          }}
        />
        {/* Top gradient for heart button */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 25%)',
          }}
        />
      </div>

      <div className="relative z-10">
        <div className={compact ? 'relative h-[180px]' : 'relative h-[280px]'}>
          {/* Heart - Using HeartButton component */}
          <div className="absolute top-4 right-4 z-20">
            <HeartButton
              listingId={data.id}
              currentUser={currentUser}
              variant="default"
            />
          </div>

          {/* Centered title + location */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center z-20 px-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
          >
            {compact ? (
              <div className="flex flex-col items-center text-center">
                <h1 className="text-white text-xs leading-snug font-medium tracking-tight line-clamp-2">
                  {data.title}
                </h1>
                <p className="text-white/70 text-[10px] font-light tracking-normal mt-0.5">
                  {city && state ? `${city}, ${state}` : city || state || 'Location not specified'}
                </p>
                <div className="mt-1.5">
                  <SmartBadgeRating
                    rating={data.rating ?? 5.0}
                    isTrending={data.isTrending || false}
                    onRatingClick={() => {}}
                    onTimeClick={() => {}}
                    storeHours={data.storeHours}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <h1 className="text-white text-lg leading-snug font-medium tracking-tight">
                  {renderTitleWithBadge(data.title)}
                </h1>
                <p className="text-white/70 text-[12px] font-light tracking-wide mt-1">
                  {city && state ? `${city}, ${state}` : city || state || 'Location not specified'}
                </p>
                <div className="mt-2">
                  <SmartBadgeRating
                    rating={data.rating ?? 5.0}
                    isTrending={data.isTrending || false}
                    onRatingClick={() => {}}
                    onTimeClick={() => {}}
                    storeHours={data.storeHours}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;