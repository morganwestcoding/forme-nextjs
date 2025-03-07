'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SafeListing } from '@/app/types';
import Image from 'next/image';

interface TrendingStoresProps {
  listings: SafeListing[];
}

const TrendingStores: React.FC<TrendingStoresProps> = ({
  listings
}) => {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Debug output
  console.log('TrendingStores received listings:', listings?.length);
  if (listings && listings.length > 0) {
    console.log('First listing in TrendingStores:', listings[0]);
  }
  
  useEffect(() => {
    if (listings && listings.length > 6) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          (prevIndex + 6 >= listings.length) ? 0 : prevIndex + 6
        );
      }, 7000);

      return () => clearInterval(interval);
    }
  }, [listings?.length]);

  // Add null check for listings
  if (!listings || listings.length === 0) {
    console.log('No listings available in TrendingStores');
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Trending Stores</h2>
          <button 
            className="text-sm text-gray-500 hover:text-[#F08080] transition-colors"
            onClick={() => router.push('/listings')}
          >
            View all
          </button>
        </div>
        <div className="p-4 bg-gray-100 rounded-md text-center">
          No trending stores available at the moment.
        </div>
      </div>
    );
  }

  const currentStores = listings.slice(currentIndex, Math.min(currentIndex + 6, listings.length));
  const totalPages = Math.ceil(listings.length / 6);
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Trending Stores</h2>
        <button 
          className="text-sm text-gray-500 hover:text-[#F08080] transition-colors"
          onClick={() => router.push('/listings')}
        >
          View all
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {currentStores.map((listing) => (
          <div 
            key={listing.id}
            onClick={() => router.push(`/listings/${listing.id}`)}
            className="cursor-pointer group"
          >
            <div className="relative w-full h-[180px] overflow-hidden rounded-lg bg-gray-200 mb-2">
              <img 
                src={listing.imageSrc} 
                alt={listing.title}
                className="w-full h-full object-cover transform transition-all duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition" />
            </div>
            <h3 className="text-sm font-medium truncate">{listing.title}</h3>
            <p className="text-xs text-gray-500 truncate">{listing.location}</p>
          </div>
        ))}
      </div>

      {listings.length > 6 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx * 6)}
              className={`
                w-2 h-2 rounded-full transition-colors
                ${currentIndex === idx * 6 ? 'bg-[#60A5FA]' : 'bg-gray-300'}
              `}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TrendingStores;