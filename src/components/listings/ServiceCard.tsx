'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SafeService, SafeListing, SafeUser } from '@/app/types';
import SmartBadgePrice from './SmartBadgePrice';
import useReservationModal from '@/app/hooks/useReservationModal';
import useLoginModal from '@/app/hooks/useLoginModal';
import { Heart, Clock, Star, User, Scissors, Droplet, SprayCan, Waves, Palette, Flower, Dumbbell } from 'lucide-react';

interface ServiceCardProps {
  service: SafeService;
  listingLocation: string | null;
  listingTitle: string;
  listingImage: string;
  listing: SafeListing; // Add full listing data
  currentUser?: SafeUser | null; // Add current user
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

  // Handle card click (navigate to listing page)
  const handleCardClick = () => {
    router.push(`/listings/${listing.id}`);
  };

  // Handle reserve button click (open reservation modal)
  const handleReserveClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    
    if (!currentUser) {
      loginModal.onOpen();
      return;
    }
    
    // Open reservation modal with this service pre-selected
    reservationModal.onOpen(listing, currentUser, service.id);
  };

  const getCategoryConfig = (category: string) => {
    const configs: { [key: string]: { icon: React.ReactElement } } = {
      'Spa': { icon: <Waves className="w-3 h-3" /> },
      'Beauty': { icon: <Palette className="w-3 h-3" /> },
      'Barber': { icon: <Scissors className="w-3 h-3" /> },
      'Fitness': { icon: <Dumbbell className="w-3 h-3" /> },
      'Salon': { icon: <SprayCan className="w-3 h-3" /> },
      'Wellness': { icon: <Flower className="w-3 h-3" /> },
      'Skincare': { icon: <Droplet className="w-3 h-3" /> }
    };
    return configs[category] || { icon: <Star className="w-3 h-3" /> };
  };

  const [city, state] = listingLocation?.split(',').map(s => s.trim()) || [];

  return (
    <div
      onClick={handleCardClick}
      className="cursor-pointer bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden relative"
    >
      <div className="absolute inset-0 z-0">
        <Image
          src={listingImage || '/placeholder-service.png'}
          alt={service.serviceName}
          fill
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 card__overlay" />
      </div>

      <div className="relative z-10">
        <div className="relative h-[345px] overflow-hidden">
          {/* Category badge - top left (same as ListingCard) */}
          <div className="absolute top-4 left-4 z-20">
            <div className="bg-white/90 backdrop-blur-md border border-white/30 rounded-xl text-center w-24 py-2 shadow-lg hover:bg-white/30 transition-all duration-300">
              <div className="flex items-center justify-center gap-1.5">
        
                <span className="text-xs font-normal text-black tracking-wide">{service.category}</span>
              </div>
            </div>
          </div>

          {/* Main content at bottom (same layout as ListingCard) */}
          <div className="absolute bottom-5 left-5 right-5 text-white z-20">
            {/* Service name and business info */}
            <div className="flex items-center space-x-2 mb-1">
              <h1 className="text-xl font-medium drop-shadow-lg">{service.serviceName}</h1>
            </div>
            
            {/* Business and location */}
            <p className="text-xs drop-shadow-md font-thin flex items-center mb-3">
              {listingTitle} • {city}, {state}
            </p>

            {/* SmartBadgePrice component */}
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