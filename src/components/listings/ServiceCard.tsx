'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SafeListing, SafeUser } from '@/app/types';
import SmartBadgePrice from './SmartBadgePrice';
import useReservationModal from '@/app/hooks/useReservationModal';
import useLoginModal from '@/app/hooks/useLoginModal';
import { Star, Scissors, Droplet, SprayCan, Waves, Palette, Flower, Dumbbell } from 'lucide-react';

type ServiceLike = {
  id: string;
  serviceName: string;
  price: number;
  category: string;
  imageSrc?: string | null; // <- allow null
};

interface ServiceCardProps {
  service: ServiceLike;                       // <- accepts SafeService or plain Service item
  listingLocation: string | null;
  listingTitle: string;
  listingImage?: string | null;               // <- may be null/undefined; we’ll fallback
  listing: SafeListing;
  currentUser?: SafeUser | null;
  storeHours?: Array<{
    dayOfWeek: string;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
  }>;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  listingLocation,
  listingTitle,
  listingImage,
  listing,
  currentUser,
  storeHours = [
    { dayOfWeek: 'Monday', openTime: '09:00', closeTime: '21:00', isClosed: false },
    { dayOfWeek: 'Tuesday', openTime: '09:00', closeTime: '21:00', isClosed: false },
    { dayOfWeek: 'Wednesday', openTime: '09:00', closeTime: '21:00', isClosed: false },
    { dayOfWeek: 'Thursday', openTime: '09:00', closeTime: '21:00', isClosed: false },
    { dayOfWeek: 'Friday', openTime: '09:00', closeTime: '22:00', isClosed: false },
    { dayOfWeek: 'Saturday', openTime: '08:00', closeTime: '22:00', isClosed: false },
    { dayOfWeek: 'Sunday', openTime: '10:00', closeTime: '20:00', isClosed: false }
  ]
}) => {
  const router = useRouter();
  const reservationModal = useReservationModal();
  const loginModal = useLoginModal();

  const handleCardClick = () => router.push(`/listings/${listing.id}`);

  const handleReserveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      loginModal.onOpen();
      return;
    }
    reservationModal.onOpen(listing, currentUser, service.id);
  };

  const getCategoryConfig = (category: string) => {
    const iconClass = "w-3 h-3";
    const configs: Record<string, { icon: React.ReactElement }> = {
      'Spa': { icon: <Waves className={iconClass} /> },
      'Beauty': { icon: <Palette className={iconClass} /> },
      'Barber': { icon: <Scissors className={iconClass} /> },
      'Fitness': { icon: <Dumbbell className={iconClass} /> },
      'Salon': { icon: <SprayCan className={iconClass} /> },
      'Wellness': { icon: <Flower className={iconClass} /> },
      'Skincare': { icon: <Droplet className={iconClass} /> },
    };
    return configs[category] || { icon: <Star className={iconClass} /> };
  };

  const [city, state] = listingLocation?.split(',').map(s => s.trim()) || [];
  const cityState = [city, state].filter(Boolean).join(', ');

  // Prefer the service image first, then listing-level fallback, then placeholder
  const primaryImage = service.imageSrc || listingImage || '/placeholder-service.png';

  return (
    <div
      onClick={handleCardClick}
      className="cursor-pointer bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden relative"
    >
      <div className="absolute inset-0 z-0">
        <Image
          src={primaryImage}
          alt={service.serviceName || 'Service'}
          fill
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 card__overlay" />
      </div>

      <div className="relative z-10">
        <div className="relative h-[345px] overflow-hidden">
          {/* Category badge - top left */}
          <div className="absolute top-4 left-4 z-20">
            <div className="bg-white/90 backdrop-blur-md border border-white/30 rounded-xl text-center w-24 py-2 shadow-lg hover:bg-white/30 transition-all duration-300">
              <div className="flex items-center justify-center gap-1.5">
                {/* {getCategoryConfig(service.category).icon} */}
                <span className="text-xs font-normal text-black tracking-wide">{service.category}</span>
              </div>
            </div>
          </div>

          {/* Bottom content */}
          <div className="absolute bottom-5 left-5 right-5 text-white z-20">
            <div className="flex items-center space-x-2 mb-1">
              <h1 className="text-xl font-medium drop-shadow-lg">{service.serviceName}</h1>
            </div>

            <p className="text-xs drop-shadow-md font-thin flex items-center mb-5">
              {listingTitle}{cityState ? ` • ${cityState}` : ''}
            </p>

            <SmartBadgePrice
              price={service.price}
              storeHours={storeHours}
              onPriceClick={() => {
                if (!currentUser) {
                  loginModal.onOpen();
                  return;
                }
                reservationModal.onOpen(listing, currentUser, service.id);
              }}
              onTimeClick={() => {
                if (!currentUser) {
                  loginModal.onOpen();
                  return;
                }
                reservationModal.onOpen(listing, currentUser, service.id);
              }}
            />
          </div>
        </div>

        {/* Bottom reserve button */}
        <div className="px-5 pb-4 pt-2 -mt-3">
          <button
            onClick={handleReserveClick}
            className="w-full bg-[#60A5FA]/50 backdrop-blur-md text-white p-3 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all shadow-lg border border-white/10"
          >
            <div className="flex items-center text-center gap-3">
              <div className="flex flex-col items-center text-center">
                <span className="font-medium text-sm">Reserve</span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
