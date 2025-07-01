'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SafeService } from '@/app/types';
import { Heart, Clock, Star, User, Scissors, Droplet, SprayCan, Waves, Palette, Flower, Dumbbell } from 'lucide-react';

interface ServiceCardProps {
  service: SafeService;
  listingLocation: string | null;
  listingTitle: string;
  listingImage: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  listingLocation,
  listingTitle,
  listingImage,
}) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/services/${service.id}`);
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
      onClick={handleClick}
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
            <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-xl text-center px-3 py-2 shadow-lg hover:bg-white/30 transition-all duration-300">
              <div className="flex items-center justify-center gap-1.5">
                {getCategoryConfig(service.category).icon}
                <span className="text-xs font-semibold text-white tracking-wide">{service.category}</span>
              </div>
            </div>
          </div>

          {/* Main content at bottom (same layout as ListingCard) */}
          <div className="absolute bottom-5 left-5 right-5 text-white z-20">
            {/* Service name and business info */}
            <div className="flex items-center space-x-2 mb-1">
              <h1 className="text-xl font-medium drop-shadow-lg">{service.serviceName}</h1>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#60A5FA">
                <path d="M18.9905 19H19M18.9905 19C18.3678 19.6175 17.2393 19.4637 16.4479 19.4637C15.4765 19.4637 15.0087 19.6537 14.3154 20.347C13.7251 20.9374 12.9337 22 12 22C11.0663 22 10.2749 20.9374 9.68457 20.347C8.99128 19.6537 8.52349 19.4637 7.55206 19.4637C6.76068 19.4637 5.63218 19.6175 5.00949 19C4.38181 18.3776 4.53628 17.2444 4.53628 16.4479C4.53628 15.4414 4.31616 14.9786 3.59938 14.2618C2.53314 13.1956 2.00002 12.6624 2 12C2.00001 11.3375 2.53312 10.8044 3.59935 9.73817C4.2392 9.09832 4.53628 8.46428 4.53628 7.55206C4.53628 6.76065 4.38249 5.63214 5 5.00944C5.62243 4.38178 6.7556 4.53626 7.55208 4.53626C8.46427 4.53626 9.09832 4.2392 9.73815 3.59937C10.8044 2.53312 11.3375 2 12 2C12.6625 2 13.1956 2.53312 14.2618 3.59937C14.9015 4.23907 15.5355 4.53626 16.4479 4.53626C17.2393 4.53626 18.3679 4.38247 18.9906 5C19.6182 5.62243 19.4637 6.75559 19.4637 7.55206C19.4637 8.55858 19.6839 9.02137 20.4006 9.73817C21.4669 10.8044 22 11.3375 22 12C22 12.6624 21.4669 13.1956 20.4006 14.2618C19.6838 14.9786 19.4637 15.4414 19.4637 16.4479C19.4637 17.2444 19.6182 18.3776 18.9905 19Z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M9 12.8929L10.8 14.5L15 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            
            {/* Business and location */}
            <p className="text-xs drop-shadow-md font-thin flex items-center mb-3">
              {listingTitle} • {city}, {state} • 2.3 miles away
            </p>

            {/* Price badge as main focus (replacing SmartBadgeRating area) */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-1 border border-white/30 shadow-xl">
              <div className="flex items-center justify-center">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle price/booking click
                  }}
                  className="flex-1 flex flex-col items-center py-4 hover:bg-white/10 transition-all duration-300 group rounded-xl relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                  <div className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 backdrop-blur-md border border-emerald-400/40 rounded-xl px-4 py-2 mb-2 group-hover:scale-110 transition-all duration-300 shadow-lg min-w-[120px] flex justify-center">
                    <div className="flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" className="text-emerald-200" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"></circle>
                        <path d="M15 9.5C15 8.11929 13.8807 7 12.5 7C11.1193 7 10 8.11929 10 9.5C10 10.8807 11.1193 12 12.5 12C13.8807 12 15 13.1193 15 14.5C15 15.8807 13.8807 17 12.5 17C11.1193 17 10 15.8807 10 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
                        <path d="M12.5 7V5.5M12.5 18.5V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
                      </svg>
                      <span className="text-base font-bold text-emerald-200">${service.price}</span>
                    </div>
                  </div>
                  <div className="text-xs text-white/80 font-medium tracking-wide">Book Service</div>
                  <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom button (same as ListingCard) */}
        <div className="px-5 pb-4 pt-2 -mt-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            className="w-full bg-[#60A5FA]/50 backdrop-blur-md text-white p-3 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all shadow-lg border border-white/10"
          >
            <div className="flex items-center text-center gap-3">
              <div className="flex flex-col items-center text-center">
                <span className="font-medium text-sm">View Details</span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;