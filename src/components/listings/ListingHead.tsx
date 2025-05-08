'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { SafeListing, SafeUser, SafeStoreHours } from '@/app/types';
import { categories } from "../Categories";
import HeartButton from '../HeartButton';
import OpenStatus from './OpenStatus';
import { MapPin, Star, Heart, Share2, ImagePlus, Check } from 'lucide-react';
import ListingGalleryImage from './ListingGalleryImage';

interface ListingHeadProps {
  listing: SafeListing & {
    user: SafeUser;
  };
  currentUser?: SafeUser | null;
}

const ListingHead: React.FC<ListingHeadProps> = ({ listing, currentUser }) => {
  const { title, location, description, category, id, address, website, phoneNumber, userId, storeHours, galleryImages, imageSrc } = listing;
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('services');

  const tabs = [
    { id: 'services', label: 'Services' },
    { id: 'team', label: 'Team' },
    { id: 'reviews', label: 'Reviews' }
  ];

  // Ensure we have at least one image
  const allImages = [imageSrc, ...(galleryImages || [])].filter(Boolean);
  
  // Only take the first 5 images for the gallery grid
  const displayImages = allImages.slice(0, 5);
  const remainingImagesCount = Math.max(0, allImages.length - 5);

  const getStateAcronym = (state: string) => {
    const stateMap: {[key: string]: string} = {
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
  
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };
  
  const handleShare = () => {
    // Implement share functionality
    console.log('Share listing');
  };

  return (
    <div className=" w-full">
      
        {/* Image Grid */}
        <div className="w-full mt-2">
                <ListingGalleryImage listing={listing} currentUser={currentUser} />
              </div>

        {/* Listing Details Header */}
        <div className="mt-6 mb-6">
    
          <div className="flex justify-between items-start">
            {/* Listing Title and Location */}
            <div>
              <h1 className="text-3xl font-bold text-neutral-800 mb-2">
                {title}
              </h1>
              <div className="flex items-center space-x-2 text-neutral-600 mb-3">
                <MapPin className="w-5 h-5 text-green-600" />
                <span>{address}, {city}, {stateAcronym} {listing.zipCode}</span>
              </div>
              
              {/* Rating */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className="font-semibold text-neutral-800">4.7</span>
                </div>
                <span className="text-neutral-600">(124 reviews)</span>
              </div>
              
              
            </div>
          

            {/* Action Buttons */}
            <div className="flex space-x-3">
              {/* Like/Favorite Button */}
              <button 
                onClick={toggleFavorite}
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center 
                  border transition-colors ${
                    isFavorite 
                      ? 'bg-green-100 border-green-500 text-green-600' 
                      : 'bg-white border-neutral-300 text-neutral-600 hover:bg-neutral-100'
                  }
                `}
              >
                {isFavorite ? <Check className="w-6 h-6" /> : <Heart className="w-6 h-6" />}
              </button>

              {/* Share Button */}
              <button 
                onClick={handleShare}
                className="w-12 h-12 rounded-full border border-neutral-300 
                bg-white text-neutral-600 hover:bg-neutral-100 
                flex items-center justify-center"
              >
                <Share2 className="w-6 h-6" />
              </button>
            </div>
          </div>
    
        </div>

        {/* Tabs and Content */}
        <div className=" bg-white">
          {/* Tabs */}
          <div className="flex space-x-6 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  pb-4 
                  ${activeTab === tab.id 
                    ? 'text-green-600 border-b-2 text-sm border-green-600' 
                    : 'text-neutral-500 text-sm hover:text-neutral-800'}
                  transition-colors
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className='border-neutral-200 border-b -mx-6 -mt-6'></div>
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