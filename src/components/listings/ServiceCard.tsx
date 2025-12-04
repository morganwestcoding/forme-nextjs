// components/inputs/ServiceCard.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SafeListing, SafeUser } from '@/app/types';
import HeartButton from '../HeartButton';
import SmartBadgePrice from './SmartBadgePrice';
import useReservationModal from '@/app/hooks/useReservationModal';

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

  // Verification badge component (matches WorkerCard gradient style)
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
          fill="url(#serviceBadgeGradient)"
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
          <linearGradient id="serviceBadgeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#4A90E2" />
          </linearGradient>
        </defs>
      </svg>
    </span>
  );

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

          {/* Heart - top right */}
          <div className="absolute top-3 right-3 z-20">
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
              <h3 className="text-white text-lg leading-tight font-semibold drop-shadow">
                <span className="whitespace-nowrap">
                  {service.serviceName || 'Untitled Service'}
                  <VerificationBadge />
                </span>
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