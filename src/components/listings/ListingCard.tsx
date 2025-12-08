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
}

const ListingCard: React.FC<ListingCardProps> = ({ data, currentUser }) => {
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
className="
  group cursor-pointer relative overflow-hidden
  rounded-xl bg-white transition-all duration-300 ease-out
  hover:-translate-y-1 hover:scale-[1.01] hover:shadow-md
  max-w-[250px]"
    >
      {/* Background image + lighter-at-top, bottom-heavy gradient */}
      <div className="absolute inset-0 z-0">
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
              'rgba(0,0,0,0.72) 0%,' +
              'rgba(0,0,0,0.55) 18%,' +
              'rgba(0,0,0,0.32) 38%,' +
              'rgba(0,0,0,0.12) 55%,' +
              'rgba(0,0,0,0.00) 70%)',
          }}
        />
      </div>

      <div className="relative z-10">
        <div className="relative h-[280px]">
          {/* Heart - Using HeartButton component */}
          <div className="absolute top-4 right-4 z-20">
            <HeartButton
              listingId={data.id}
              currentUser={currentUser}
              variant="default"
            />
          </div>

          {/* Bottom info */}
          <div className="absolute bottom-4 left-4 right-4 z-20">
            {/* Title with verification badge that stays with last word */}
            <div className="mb-0.5">
              <h1 className="text-white text-base leading-tight font-semibold drop-shadow line-clamp-2">
                {renderTitleWithBadge(data.title)}
              </h1>
            </div>

            {/* Location - improved formatting */}
            <div className="text-white/90 text-xs leading-tight mb-2.5">
              <span className="line-clamp-1">
                {city && state ? `${city}, ${state}` : city || state || 'Location not specified'}
              </span>
            </div>

            {/* Rating + open status */}
            <div className="flex items-center">
              <SmartBadgeRating
                rating={data.rating || 4.7}
                isTrending={data.isTrending || false}
                onRatingClick={() => {}}
                onTimeClick={() => {}}
                storeHours={data.storeHours}
              />
            </div>
          </div>
        </div>

        <div className="pb-1" />
      </div>
    </div>
  );
};

export default ListingCard;