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
      <span className="inline-flex items-center align-middle ml-1" aria-label="Verified">
        <VerificationBadge size={16} />
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
        rounded-2xl border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-950
        transition-[transform,box-shadow] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
        hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]
        ${compact ? '' : 'max-w-[250px]'}
      `}
    >
      {/* Background image + lighter-at-top, bottom-heavy gradient */}
      <div className="absolute inset-0 z-0 overflow-hidden rounded-2xl">
        <Image
          src={cardImage}
          alt={data.title}
          fill
          className="object-cover"
          sizes="(max-width:768px) 100vw, 33vw"
          priority={false}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to top,' +
              'rgba(0,0,0,0.65) 0%,' +
              'rgba(0,0,0,0.45) 18%,' +
              'rgba(0,0,0,0.20) 40%,' +
              'rgba(0,0,0,0.00) 60%)',
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

          {/* Bottom info */}
          <div
            className="absolute bottom-4 left-4 right-4 z-20"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
          >
            {compact ? (
              <div className="flex flex-col gap-0.5">
                {/* Title */}
                <h1 className="text-white text-xs leading-tight font-semibold tracking-tight line-clamp-1">
                  {data.title}
                </h1>
                {/* Location */}
                <div className="text-white/90 text-xs leading-tight">
                  <span className="line-clamp-1">
                    {city && state ? `${city}, ${state}` : city || state || 'Location not specified'}
                  </span>
                </div>
                {/* Rating */}
                <div className="flex items-center mt-0.5 drop-shadow">
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
              <>
                {/* Title with verification badge that stays with last word */}
                <div className="mb-0.5">
                  <h1 className="text-white text-[17px] leading-tight font-medium tracking-tight line-clamp-2">
                    {renderTitleWithBadge(data.title)}
                  </h1>
                </div>

                {/* Location - improved formatting */}
                <div className="text-white/90 text-xs leading-tight font-medium mb-2.5">
                  <span className="line-clamp-1">
                    {city && state ? `${city}, ${state}` : city || state || 'Location not specified'}
                  </span>
                </div>

                {/* Rating + open status */}
                <div className="flex items-center drop-shadow">
                  <SmartBadgeRating
                    rating={data.rating ?? 5.0}
                    isTrending={data.isTrending || false}
                    onRatingClick={() => {}}
                    onTimeClick={() => {}}
                    storeHours={data.storeHours}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="pb-2" />
      </div>
    </div>
  );
};

export default ListingCard;