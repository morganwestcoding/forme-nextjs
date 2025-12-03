'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { SafeListing, SafeUser } from '@/app/types';
import SmartBadgeRating from './SmartBadgeRating';
import HeartButton from '../HeartButton';

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

    const VerificationBadge = () => (
      <span className="inline-flex items-center align-middle ml-1" aria-label="Verified">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          className="shrink-0"
        >
          {/* Badge shape with gradient fill */}
          <path
            d="M18.9905 19H19M18.9905 19C18.3678 19.6175 17.2393 19.4637 16.4479 19.4637C15.4765 19.4637 15.0087 19.6537 14.3154 20.347C13.7251 20.9374 12.9337 22 12 22C11.0663 22 10.2749 20.9374 9.68457 20.347C8.99128 19.6537 8.52349 19.4637 7.55206 19.4637C6.76068 19.4637 5.63218 19.6175 5.00949 19C4.38181 18.3776 4.53628 17.2444 4.53628 16.4479C4.53628 15.4414 4.31616 14.9786 3.59938 14.2618C2.53314 13.1956 2.00002 12.6624 2 12C2.00001 11.3375 2.53312 10.8044 3.59935 9.73817C4.2392 9.09832 4.53628 8.46428 4.53628 7.55206C4.53628 6.76065 4.38249 5.63214 5 5.00944C5.62243 4.38178 6.7556 4.53626 7.55208 4.53626C8.46427 4.53626 9.09832 4.2392 9.73815 3.59937C10.8044 2.53312 11.3375 2 12 2C12.6625 2 13.1956 2.53312 14.2618 3.59937C14.9015 4.23907 15.5355 4.53626 16.4479 4.53626C17.2393 4.53626 18.3679 4.38247 18.9906 5C19.6182 5.62243 19.4637 6.75559 19.4637 7.55206C19.4637 8.55858 19.6839 9.02137 20.4006 9.73817C21.4669 10.8044 22 11.3375 22 12C22 12.6624 21.4669 13.1956 20.4006 14.2618C19.6838 14.9786 19.4637 15.4414 19.4637 16.4479C19.4637 17.2444 19.6182 18.3776 18.9905 19Z"
            fill="url(#badgeGradient)"
          />
          {/* Checkmark */}
          <path
            d="M9 12.8929C9 12.8929 10.2 13.5447 10.8 14.5C10.8 14.5 12.6 10.75 15 9.5"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <defs>
            <linearGradient id="badgeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#4A90E2" />
            </linearGradient>
          </defs>
        </svg>
      </span>
    );

    if (words.length === 1) {
      // Single word - keep badge with it
      return (
        <span className="whitespace-nowrap">
          {words[0]}
          <VerificationBadge />
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
          <VerificationBadge />
        </span>
      </>
    );
  };

  return (
    <div
      onClick={() => router.push(`/listings/${data.id}`)}
className="
  group cursor-pointer relative overflow-hidden
  rounded-xl  bg-white transition-all duration-300 ease-out
  hover:-translate-y-2 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/10
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
          {/* Heart - Using HeartButton component */}
          <div className="absolute top-3 right-3 z-20">
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
              <h1 className="text-white text-[15px] leading-tight font-semibold drop-shadow">
                {renderTitleWithBadge(data.title)}
              </h1>
            </div>

            {/* Location - improved formatting */}
            <div className="text-white/90 text-[10px] leading-tight mb-2.5">
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