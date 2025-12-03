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

  const goToEditThisService = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (onEdit) return onEdit();
    if (!service.id) return;
    const params = new URLSearchParams(window.location.search);
    params.set('editServiceId', service.id);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleDuplicate = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    onDuplicate?.();
  };

  const priceNum = Number(service.price ?? 0);
  const durationDisplay = service.unit || '60 min';
  const listingName = listing?.title || 'Service';

  // Background image - only use service-specific image
  const hasServiceImage = service.imageSrc && service.imageSrc !== '/images/placeholder.jpg';
  const backgroundImageSrc = service.imageSrc;

  // Verification badge component (matches ListingCard/WorkerCard)
  const VerificationBadge = () => (
    <span className="inline-flex items-center align-middle ml-1.5 translate-y-[-1px]">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="#60A5FA"
        className="shrink-0 text-white/20 drop-shadow-sm"
        aria-label="Verified"
      >
        <path
          d="M18.9905 19H19M18.9905 19C18.3678 19.6175 17.2393 19.4637 16.4479 19.4637C15.4765 19.4637 15.0087 19.6537 14.3154 20.347C13.7251 20.9374 12.9337 22 12 22C11.0663 22 10.2749 20.9374 9.68457 20.347C8.99128 19.6537 8.52349 19.4637 7.55206 19.4637C6.76068 19.4637 5.63218 19.6175 5.00949 19C4.38181 18.3776 4.53628 17.2444 4.53628 16.4479C4.53628 15.4414 4.31616 14.9786 3.59938 14.2618C2.53314 13.1956 2.00002 12.6624 2 12C2.00001 11.3375 2.53312 10.8044 3.59935 9.73817C4.2392 9.09832 4.53628 8.46428 4.53628 7.55206C4.53628 6.76065 4.38249 5.63214 5 5.00944C5.62243 4.38178 6.7556 4.53626 7.55208 4.53626C8.46427 4.53626 9.09832 4.2392 9.73815 3.59937C10.8044 2.53312 11.3375 2 12 2C12.6625 2 13.1956 2.53312 14.2618 3.59937C14.9015 4.23907 15.5355 4.53626 16.4479 4.53626C17.2393 4.53626 18.3679 4.38247 18.9906 5C19.6182 5.62243 19.4637 6.75559 19.4637 7.55206C19.4637 8.55858 19.6839 9.02137 20.4006 9.73817C21.4669 10.8044 22 11.3375 22 12C22 12.6624 21.4669 13.1956 20.4006 14.2618C19.6838 14.9786 19.4637 15.4414 19.4637 16.4479C19.4637 17.2444 19.6182 18.3776 18.9905 19Z"
          stroke="white"
          strokeWidth="1"
          fill="#60A5FA"
        />
        <path
          d="M9 12.8929L10.8 14.5L15 9.5"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
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
        {hasServiceImage ? (
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

          {/* Edit/Duplicate actions for owners - appears on hover */}
          {(isOwner || onEdit || onDuplicate) && (
            <div className="absolute right-3 top-11 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
              <button
                aria-label={`Edit ${service.serviceName || 'service'}`}
                onClick={goToEditThisService}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-md bg-white/15 text-white border border-white/30 hover:bg-white/25 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M16.425 4.605L17.415 3.615c.82-.82 2.149-.82 2.97 0 .82.82.82 2.15 0 2.97l-0.99.99M16.425 4.605L9.766 11.264c-.508.508-.868 1.144-1.042 1.84L8 16l2.896-.724c.696-.174 1.332-.534 1.84-1.041l6.659-6.66M16.425 4.605l2.97 2.97" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M19 13.5c0 3.288 0 4.931-0.908 6.038-.166.203-.352.389-.555.555C16.431 21 14.787 21 11.5 21H11c-3.771 0-5.657 0-6.828-1.172C3 18.657 3 16.771 3 13.5V13c0-3.287 0-4.931.908-6.038.166-.202.352-.388.555-.555C5.569 5.5 7.213 5.5 10.5 5.5" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>

              {onDuplicate && (
                <button
                  aria-label={`Duplicate ${service.serviceName || 'service'}`}
                  onClick={handleDuplicate}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-md bg-white/15 text-white border border-white/30 hover:bg-white/25 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M8 8.5C8 7.12 9.12 6 10.5 6H16.5C17.88 6 19 7.12 19 8.5V14.5C19 15.88 17.88 17 16.5 17H10.5C9.12 17 8 15.88 8 14.5V8.5Z" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M6 10.5V15.5C6 17.985 8.015 20 10.5 20H15.5" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                </button>
              )}
            </div>
          )}


          {/* Bottom info - matches ListingCard/WorkerCard structure */}
          <div className="absolute bottom-4 left-4 right-4 z-20">
            {/* Service Name with verification badge */}
            <div className="mb-0.5">
              <h3 className="text-white text-[15px] leading-tight font-semibold drop-shadow">
                <span className="whitespace-nowrap">
                  {service.serviceName || 'Untitled Service'}
                  <VerificationBadge />
                </span>
              </h3>
            </div>

            {/* Category and location info */}
            <div className="text-white/90 text-[10px] leading-tight mb-2.5">
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