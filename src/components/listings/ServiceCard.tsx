// components/inputs/ServiceCard.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SafeListing, SafeUser } from '@/app/types';
import HeartButton from '../HeartButton';
import SmartBadgePrice from './SmartBadgePrice';
import useReservationModal from '@/app/hooks/useReservationModal';
import VerificationBadge from '../VerificationBadge';

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
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  listing,
  currentUser,
  onClick,
  onEdit,
  onDuplicate,
  disabled = false,
}) => {
  const router = useRouter();
  const reservationModal = useReservationModal();

  const isOwner =
    !!currentUser?.id && !!listing?.user?.id && currentUser.id === listing.user.id;

  // Navigate to listing when card is clicked
  const handleCardClick = () => {
    if (disabled) return;
    if (onClick) {
      onClick();
      return;
    }
    if (listing?.id) {
      router.push(`/listings/${listing.id}`);
    }
  };

  const priceNum = Number(service.price ?? 0);
  const durationDisplay = service.unit || '60 min';
  const listingName = listing?.title || 'Service';

  // Background image - use service image or fall back to listing image
  const hasServiceImage = service.imageSrc && service.imageSrc !== '/images/placeholder.jpg';
  const listingImageSrc = listing?.imageSrc || listing?.galleryImages?.[0];
  const backgroundImageSrc = hasServiceImage ? service.imageSrc : listingImageSrc;
  const hasImage = hasServiceImage || !!listingImageSrc;

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
      className="group cursor-pointer rounded-xl overflow-hidden relative transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-md max-w-[250px]"
    >
      {/* Background with image or empty state */}
      <div className="absolute inset-0 z-0">
        {hasImage ? (
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
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="absolute inset-0 flex items-center justify-center">
              {isOwner ? (
                /* Owner sees upload CTA */
                <div className="text-center px-6">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center border-2 border-gray-200">
                    <svg
                      className="w-9 h-9 text-gray-400"
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
                  <p className="text-sm font-semibold text-gray-700 mb-1">Add Service Photo</p>
                  <p className="text-xs text-gray-500 leading-relaxed">Photos get 3x more bookings</p>
                </div>
              ) : (
                /* Non-owners see minimal placeholder */
                <div className="w-20 h-20 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center border-2 border-gray-200">
                  <svg
                    className="w-9 h-9 text-gray-400"
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

      <div className="relative z-10">
        <div className="relative h-[280px]">
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

          {/* Heart - top left */}
          <div className="absolute top-4 right-4 z-20">
            <HeartButton
              listingId={service.id}
              currentUser={currentUser}
              variant="worker"
            />
          </div>


          {/* Bottom info - matches ListingCard/WorkerCard structure */}
          <div className="absolute bottom-4 left-4 right-4 z-20">
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
                onPriceClick={() => {
                  console.log('Price clicked for service:', service.serviceName);
                }}
                onBookNowClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  if (listing && currentUser) {
                    reservationModal.onOpen(listing, currentUser, service.id);
                  }
                }}
                isVerified={true}
              />
            </div>
          </div>
        </div>

        {/* Bottom padding to match ListingCard */}
        <div className="pb-1" />
      </div>
    </div>
  );
};

export default ServiceCard;