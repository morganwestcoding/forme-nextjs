'use client';

import React from 'react';
import Image from 'next/image';
import { SafeListing, SafeUser } from '@/app/types';
import useFavorite from "@/app/hooks/useFavorite";

interface ListingHeadProps {
  listing: SafeListing;
  currentUser?: SafeUser | null;
}

const ListingHead: React.FC<ListingHeadProps> = ({ listing, currentUser }) => {
  const { title, location, imageSrc, description, category, id } = listing;
  const { hasFavorited, toggleFavorite } = useFavorite({
    listingId: id,
    currentUser
  });

  return (
    <div className="w-full pl-4 pr-[1.5%]">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden relative">
        <div className="px-6 pt-6 flex justify-between items-start mb-6">
          <div className="w-2/3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                <span className="inline-block bg-gray-200 text-gray-700 text-xs px-3 py-2 rounded-lg">
                  {category}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">{location}</p>
            <p className="text-sm text-gray-700 mb-6 line-clamp-3 overflow-hidden">
              {description}
            </p>
          </div>
          <div className="w-1/3 flex items-start justify-end">
            <div className="w-36 h-36 relative">
              <Image 
                src={imageSrc || "/assets/default-listing.jpg"}
                layout="fill" 
                objectFit="cover" 
                className="rounded-lg" 
                alt={title} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingHead;