'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { SafeListing, SafeUser } from '@/app/types';
import { categories } from "../Categories";
import {
  MapPin, Star, Sparkles, TrendingUp, Layers, Search
} from 'lucide-react';

interface ListingHeadProps {
  listing: SafeListing & { user: SafeUser };
  currentUser?: SafeUser | null;
}

const ListingHead: React.FC<ListingHeadProps> = ({ listing }) => {
  const { title, location, galleryImages, imageSrc } = listing;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");

  const getStateAcronym = (state: string) => {
    const stateMap: { [key: string]: string } = {
      'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
      'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
      'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
      'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
      'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
      'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
      'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
      'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
      'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
      'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY'
    };
    return stateMap[state] || state;
  };

  const [city, state] = location?.split(',').map(s => s.trim()) || [];
  const stateAcronym = state ? getStateAcronym(state) : '';

  return (
    <div className="w-full overflow-hidden">
      {/* Gallery Thumbnails */}
      <div className="relative h-60 w-full overflow-hidden sm:-mx-6 lg:-mx-0">
        <div className="absolute bottom-6 right-6 z-20 flex space-x-2">
          {[0, 1, 2].map((index) => {
            const image = galleryImages?.[index];
            if (!image && index !== 0) return null;

            return (
              <div
                key={index}
                className="h-20 w-20 relative rounded-lg overflow-hidden border-2 border-white cursor-pointer"
                onClick={() => image && setSelectedImage(image)}
              >
                <Image
                  src={image || imageSrc || '/placeholder.jpg'}
                  alt={`Gallery preview ${index + 1}`}
                  fill
                  className="object-cover"
                />
                {index === 2 && galleryImages && galleryImages.length > 3 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-medium">+{galleryImages.length - 2}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Title, Location, Rating */}
      <div className="mt-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{title}</h1>
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <MapPin className="w-4 h-4" />
              <span>{city}, {stateAcronym}</span>
              <Star className="w-4 h-4 text-yellow-400 ml-4" />
              <span className="font-semibold text-sm">4.7</span>
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full mb-6">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search this listing..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full h-12 pl-12 pr-4 border text-sm border-gray-200 rounded-xl"
          />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className="pb-4 mr-6 flex items-center text-sm gap-2 border-b-2 border-[#60A5FA] text-[#60A5FA] font-medium"
          >
            <Sparkles className="w-5 h-5" />
            <span>Overview</span>
          </button>
          <button
            className="pb-4 mr-6 flex items-center text-sm gap-2 text-gray-500 hover:text-[#60A5FA]"
          >
            <TrendingUp className="w-5 h-5" />
            <span>Reviews</span>
          </button>
          <button
            className="pb-4 flex items-center text-sm gap-2 text-gray-500 hover:text-[#60A5FA]"
          >
            <Layers className="w-5 h-5" />
            <span>Services</span>
          </button>
        </div>
      </div>

      {/* Full Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8"
          onClick={() => setSelectedImage(null)}
        >
          <Image
            src={selectedImage}
            alt="Full size gallery image"
            className="max-w-full max-h-full object-contain"
            width={1200}
            height={800}
          />
        </div>
      )}
    </div>
  );
};

export default ListingHead;
