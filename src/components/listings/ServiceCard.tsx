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
  const [isLiked, setIsLiked] = useState(false);

  const handleClick = () => {
    router.push(`/services/${service.id}`);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
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
      className="cursor-pointer w-full h-[220px] rounded-2xl shadow-sm hover:shadow-2xl overflow-hidden relative transition-all duration-300 group"
    >
      {/* Background Image with enhanced overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src={listingImage || '/placeholder-service.png'}
          alt={service.serviceName}
          fill
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/20" />
      </div>

      {/* Category badge - top left */}
      <div className="absolute top-3 left-3 z-20">
        <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-xl px-3 py-1.5 shadow-lg hover:bg-white/30 transition-all duration-300">
          <div className="flex items-center justify-center gap-1.5">
            {getCategoryConfig(service.category).icon}
            <span className="text-xs font-semibold text-white tracking-wide">{service.category}</span>
          </div>
        </div>
      </div>

      {/* Action button - top right */}
      <div className="absolute top-3 right-3 z-20">
        <button 
          onClick={handleLike}
          className={`p-2 rounded-full border border-white/20 backdrop-blur-md transition-all duration-200 ${
            isLiked 
              ? 'bg-red-500/30 text-red-200 border-red-300/30' 
              : 'bg-white/10 text-white hover:bg-white/30 hover:text-red-300'
          }`}
        >
          <Heart 
            className={`w-4 h-4 transition-all ${isLiked ? 'fill-current' : ''}`} 
          />
        </button>
      </div>

      {/* Content section */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-5">
        {/* Main content group */}
        <div className="mb-4">
          {/* Service name */}
          <h2 className="text-2xl font-bold text-white drop-shadow-lg mb-2 truncate">
            {service.serviceName}
          </h2>
          
          {/* Business name with subtle styling */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-white/40 rounded-full"></div>
            <p className="text-base text-white/95 font-medium truncate drop-shadow-md">
              {listingTitle}
            </p>
          </div>
        </div>

        {/* Bottom row - location and price */}
        <div className="flex items-end justify-between">
          <div className="flex-1 mr-3">
            <p className="text-sm text-white/85 font-medium drop-shadow-md leading-tight">
              {city}, {state}
            </p>

          </div>
          
          {/* Enhanced price badge */}
          <div className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 backdrop-blur-md border border-emerald-400/40 rounded-xl px-3 py-1.5 shadow-lg hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" className="text-emerald-200" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"></circle>
                <path d="M15 9.5C15 8.11929 13.8807 7 12.5 7C11.1193 7 10 8.11929 10 9.5C10 10.8807 11.1193 12 12.5 12C13.8807 12 15 13.1193 15 14.5C15 15.8807 13.8807 17 12.5 17C11.1193 17 10 15.8807 10 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
                <path d="M12.5 7V5.5M12.5 18.5V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
              </svg>
              <span className="text-sm font-bold text-emerald-200">${service.price}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;