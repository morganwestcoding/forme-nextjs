'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SafeService } from '@/app/types';

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

  const [city, state] = listingLocation?.split(',').map(s => s.trim()) || [];

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer w-full h-[193px] rounded-xl shadow-md hover:shadow-lg overflow-hidden relative transition-all"
    >
      {/* Background Image with gradient */}
      <div className="absolute inset-0 z-0">
        <Image
          src={listingImage || '/placeholder-service.png'}
          alt={service.serviceName}
          fill
          className="w-full h-full object-cover"
        />
       <div className="absolute inset-0 card__overlay" />
      </div>

      {/* Category label */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-black/40 border border-white backdrop-blur-sm rounded-lg text-center justify-center w-20 px-3 py-2 text-white">
          <span className="text-xs font-medium">{service.category}</span>
        </div>
      </div>

      {/* Foreground content */}
      <div className="relative z-10 flex flex-col justify-end h-full p-4 text-white">
        <h2 className="text-sm font-semibold truncate">{service.serviceName}</h2>
        <p className="text-xs text-white/80 truncate">{listingTitle}</p>
        <p className="text-xs text-white/60 mt-1">{city}, {state} • 2.3 miles away</p>
        <p className="text-sm font-medium mt-1">${service.price}</p>
      </div>
    </div>
  );
};

export default ServiceCard;