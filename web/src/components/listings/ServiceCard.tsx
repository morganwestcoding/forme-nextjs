// components/inputs/ServiceCard.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SafeListing, SafeUser } from '@/app/types';
import HeartButton from '../HeartButton';
import SmartBadgePrice from './SmartBadgePrice';
import VerificationBadge from '../VerificationBadge';
import CardActionMenu from './CardActionMenu';
import useFavorite from '@/app/hooks/useFavorite';

interface ServiceItem {
  id: string;
  serviceName: string;
  price: number;
  category: string;
  imageSrc?: string | null;
  description?: string;
  popular?: boolean;
  isNew?: boolean;
  unit?: string; // "60 min", "session", etc.
}

interface ServiceCardProps {
  service: ServiceItem;
  listing?: (SafeListing & { user: SafeUser }) | null;
  currentUser?: SafeUser | null;
  onClick?: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  selected?: boolean;
  disabled?: boolean;
  storeHours?: any[];
  compact?: boolean;
  solidBackground?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  listing,
  currentUser,
  onClick,
  disabled = false,
  compact = false,
  solidBackground = false,
}) => {
  const router = useRouter();

  const { hasFavorited, toggleFavorite } = useFavorite({ listingId: service.id, currentUser });
  const [menuOpen, setMenuOpen] = useState(false);

  const isOwner =
    !!currentUser?.id && !!listing?.user?.id && currentUser.id === listing.user.id;

  // Navigate to reservation flow when card is clicked
  const handleCardClick = () => {
    if (disabled) return;
    if (onClick) {
      onClick();
      return;
    }
    if (listing?.id && currentUser) {
      // Open reservation flow with this service preselected
      router.push(`/reserve/${listing.id}?serviceId=${service.id}`);
    } else if (listing?.id) {
      // Not logged in, go to listing
      router.push(`/listings/${listing.id}`);
    }
  };

  const priceNum = Number(service.price ?? 0);
  const durationDisplay = service.unit || '60 min';
  const listingName = listing?.title || 'Service';

  // Background image - use listing image
  const listingImageSrc = listing?.imageSrc || listing?.galleryImages?.[0];
  const backgroundImageSrc = listingImageSrc;
  const hasImage = !!listingImageSrc;

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

  return (
    <div
      onClick={handleCardClick}
      className={`group cursor-pointer rounded-2xl relative shadow-elevation-1 transition-all duration-300 ${
        solidBackground
          ? 'hover:-translate-y-1 hover:shadow-elevation-2 overflow-visible'
          : 'hover:-translate-y-1 hover:scale-[1.01] hover:shadow-elevation-2 overflow-hidden'
      } ${compact ? '' : 'max-w-[250px]'}`}
    >
      {/* Background with image or empty state */}
      {/* Border overlay — renders on top of everything */}
      {solidBackground && (
        <div className="absolute inset-0 z-30 rounded-2xl border border-stone-200/80 dark:border-stone-800 group-hover:border-stone-300 dark:group-hover:border-stone-700 transition-colors pointer-events-none" />
      )}
      <div className="absolute inset-0 z-0">
        {solidBackground ? (
          <div className="absolute inset-0 bg-gradient-to-br from-white to-stone-50/80 dark:from-stone-900 dark:to-stone-950 rounded-2xl" />
        ) : hasImage ? (
          <>
            <Image
              src={backgroundImageSrc!}
              alt={service.serviceName || 'Service'}
              fill
              className="object-cover"
              sizes="(max-width:768px) 100vw, 250px"
              priority={false}
            />

            {/* Top gradient for badges and heart button visibility */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(to bottom,' +
                  'rgba(0,0,0,0.35) 0%,' +
                  'rgba(0,0,0,0.20) 15%,' +
                  'rgba(0,0,0,0.10) 30%,' +
                  'rgba(0,0,0,0.00) 45%)',
              }}
            />

            {/* Bottom gradient for text readability - matches ListingCard */}
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
          </>
        ) : (
          /* Empty state when no service image */
          <div className="absolute inset-0 bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-800 dark:to-stone-900">
            <div className="absolute inset-0 flex items-center justify-center">
              {isOwner ? (
                /* Owner sees upload CTA */
                <div className="text-center px-6">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/90 backdrop-blur-sm shadow-elevation-2 flex items-center justify-center border-2 border-stone-200 dark:border-stone-800">
                    <svg
                      className="w-9 h-9 text-stone-400 dark:text-stone-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-stone-700 dark:text-stone-200 mb-1">Add Service Photo</p>
                  <p className="text-xs text-stone-500  dark:text-stone-500 leading-relaxed">Photos get 3x more bookings</p>
                </div>
              ) : (
                /* Non-owners see minimal placeholder */
                <div className="w-20 h-20 rounded-full bg-white/90 backdrop-blur-sm shadow-elevation-2 flex items-center justify-center border-2 border-stone-200 dark:border-stone-800">
                  <svg
                    className="w-9 h-9 text-stone-400 dark:text-stone-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
              )}
            </div>

            {/* Light gradient overlay for text readability on empty state */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(to top,' +
                  'rgba(0,0,0,0.45) 0%,' +
                  'rgba(0,0,0,0.35) 15%,' +
                  'rgba(0,0,0,0.20) 35%,' +
                  'rgba(0,0,0,0.00) 60%)',
              }}
            />
          </div>
        )}
      </div>

      {/* 3-dot menu — top right, visible on hover (solid variant only).
          Stays visible while menu is open so the user can interact with it
          without the card's hover state collapsing it. */}
      {solidBackground && (
        <div
          className={`absolute top-6 right-4 z-40 transition-opacity duration-200 ${menuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <CardActionMenu
            shareUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/listings/${listing?.id ?? ''}`}
            shareTitle={service.serviceName || 'Service'}
            hasFavorited={hasFavorited}
            onToggleFavorite={(e) => toggleFavorite(e as any)}
            iconColorClass="text-stone-400 hover:text-stone-700 dark:text-stone-300 dark:hover:text-stone-100"
            onOpenChange={setMenuOpen}
          />
        </div>
      )}

      <div className="relative z-10">
        <div className={compact ? 'relative h-[180px]' : 'relative h-[280px]'}>
          {solidBackground ? (
            /* Bold editorial layout */
            <div className="absolute inset-0 flex flex-col z-20 overflow-hidden rounded-2xl">
              {/* Large price watermark in background */}
              <div className="absolute -right-2 -top-4 text-[80px] font-black text-stone-100/80 dark:text-stone-800/60 leading-none select-none pointer-events-none">
                {priceNum}
              </div>

              {/* Content — matches WorkerCard text position */}
              <div className="relative flex flex-col h-full p-5">
                {/* Spacer to match WorkerCard avatar height */}
                <div className={compact ? 'mb-2 h-8' : 'mb-3 h-12'} />

                {/* Service name - large and bold */}
                <h3 className="text-[17px] font-black text-stone-900 dark:text-stone-100 leading-[1.2] line-clamp-2 tracking-tight pr-8">
                  {service.serviceName || 'Untitled Service'}
                </h3>

                {/* Duration - understated */}
                <p className="mt-1.5 text-[11px] text-stone-400 dark:text-stone-500 font-medium">
                  {durationDisplay}
                </p>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Bottom row - price with subtle arrow */}
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-black text-stone-900 dark:text-stone-100 tabular-nums">${priceNum}</span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-stone-300 group-hover:text-stone-900 dark:hover:text-stone-100 dark:text-stone-100 group-hover:translate-x-0.5 transition-all duration-300 mb-1"
                  >
                    <path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Popular/New badges - top left */}
              {(service.popular || service.isNew) && (
                <div className="absolute left-3 top-3 flex items-center gap-1.5 z-20">
                  {service.popular && (
                    <span className="px-2 py-0.5 text-[9px] font-medium rounded-full backdrop-blur-md bg-white/15 text-white border border-white/30">
                      Popular
                    </span>
                  )}
                  {service.isNew && (
                    <span className="px-2 py-0.5 text-[9px] font-medium rounded-full backdrop-blur-md bg-white/15 text-white border border-white/30">
                      New
                    </span>
                  )}
                </div>
              )}

              {/* Heart - top right */}
              <div className="absolute top-4 right-4 z-20">
                <HeartButton
                  listingId={service.id}
                  currentUser={currentUser}
                  variant="worker"
                />
              </div>

              {/* Bottom info - matches ListingCard/WorkerCard structure */}
              <div className="absolute bottom-4 left-4 right-4 z-20">
                {compact ? (
                  <div className="flex flex-col gap-0.5">
                    {/* Service Name */}
                    <h3 className="text-white text-xs leading-tight font-semibold drop-shadow line-clamp-1">
                      {service.serviceName || 'Untitled Service'}
                    </h3>
                    {/* Category and duration */}
                    <div className="text-white/90 text-xs leading-tight">
                      <span className="line-clamp-1">{service.category} · {durationDisplay}</span>
                    </div>
                    {/* Price */}
                    <div className="flex items-center mt-0.5">
                      <SmartBadgePrice
                        price={priceNum}
                        showPrice={true}
                        variant="dark"
                        onPriceClick={() => {}}
                        onBookNowClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          if (listing && currentUser) {
                            router.push(`/reserve/${listing.id}?serviceId=${service.id}`);
                          }
                        }}
                        isVerified={true}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Service Name with verification badge */}
                    <div className="mb-0.5">
                      <h3 className="text-white text-lg leading-tight font-semibold drop-shadow line-clamp-2">
                        {renderTitleWithBadge(service.serviceName || 'Untitled Service')}
                      </h3>
                    </div>

                    {/* Category and location info */}
                    <div className="text-white/90 text-xs leading-tight mb-2.5">
                      <span className="line-clamp-1">{service.category} · {durationDisplay}</span>
                    </div>

                    {/* SmartBadgePrice - using dark variant for image background */}
                    <div className="flex items-center">
                      <SmartBadgePrice
                        price={priceNum}
                        showPrice={true}
                        variant="dark"
                        onPriceClick={() => {}}
                        onBookNowClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          if (listing && currentUser) {
                            router.push(`/reserve/${listing.id}?serviceId=${service.id}`);
                          }
                        }}
                        isVerified={true}
                      />
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Bottom padding to match WorkerCard */}
        <div className="pb-2" />
      </div>
    </div>
  );
};

export default ServiceCard;