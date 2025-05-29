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
      className="cursor-pointer w-full rounded-3xl shadow-md hover:shadow-lg overflow-hidden relative transition-all"
    >
      {/* Image with gradient overlay */}
      <div className="relative h-[193px] w-full">
        <Image
          src={listingImage || '/placeholder-service.png'}
          alt="Service Image"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#60A5FA]/10 via-black/60 to-black" />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-10 text-white">
        <h2 className="text-sm font-semibold truncate">{service.serviceName}</h2>
        <p className="text-xs text-white/80 truncate">{listingTitle}</p>
        <p className="text-xs text-white/60 mt-1">
          {city}, {state} • 2.3 miles away
        </p>
        <p className="text-sm font-medium mt-1">${service.price}</p>
      </div>
    </div>
  );
};

export default ServiceCard;
