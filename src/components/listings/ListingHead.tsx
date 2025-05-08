'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { SafeListing, SafeUser } from '@/app/types';
import { categories } from "../Categories";
import ListingGalleryImage from "./ListingGalleryImage";
import { MapPin, Star, Heart, Share2, ArrowLeft, Check, Clock, Phone, Globe } from 'lucide-react';
import OpenStatus from './OpenStatus';

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
    console.log('Share listing');
  };

  const handleBack = () => {
    window.history.back();
  };

  const formatPhoneNumber = (phone?: string) => {
    if (!phone) return '(555) 555-1234';
    
    // Basic formatting for US phone numbers
    if (phone.length === 10) {
      return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
    }
    
    return phone;
  };

  return (
    <div className="w-full overflow-hidden">
      {/* Hero Image Header - Full Width, No Padding */}
      <div className="relative h-64 w-full overflow-hidden -mx-4 sm:-mx-6 md:-mx-8 lg:-mx-0">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/70 z-10"></div>
        
        <Image 
          src={imageSrc || '/placeholder.jpg'} 
          alt={title}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        
        {/* Header Actions */}
        <div className="absolute top-6 left-6 right-6 z-20 flex justify-between">
          <button 
            onClick={handleBack}
            className="bg-white/80 hover:bg-white/90 rounded-full p-2 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-neutral-800" />
          </button>
          <div className="flex space-x-3">
            <button 
              onClick={toggleFavorite}
              className="bg-white/80 hover:bg-white/90 rounded-full p-2 transition-colors"
            >
              {isFavorite ? 
                <Heart className="w-6 h-6 text-red-500 fill-red-500" /> : 
                <Heart className="w-6 h-6 text-neutral-800" />
              }
            </button>
            <button 
              onClick={handleShare}
              className="bg-white/80 hover:bg-white/90 rounded-full p-2 transition-colors"
            >
              <Share2 className="w-6 h-6 text-neutral-800" />
            </button>
          </div>
        </div>

        {/* Location and Rating */}
        <div className="absolute bottom-6 left-6 text-white z-20">
          <h1 className="text-3xl font-bold drop-shadow-lg mb-2">{title}</h1>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="font-semibold text-sm">4.7</span>
            </div>
            <div className="flex items-center text-sm space-x-2">
              <MapPin className="w-5 h-5" />
              <span>{city}, {stateAcronym}</span>
            </div>
          </div>
        </div>

        {/* Gallery Images in Bottom Right */}
        <div className="absolute bottom-6 right-6 z-20 flex space-x-2">
          <div className="h-20 w-20 relative rounded-lg overflow-hidden border-2 border-white">
            <Image 
              src={galleryImages?.[0] || imageSrc || '/placeholder.jpg'} 
              alt="Gallery preview 1"
              fill
              className="object-cover" 
            />
          </div>
          {galleryImages?.[1] && (
            <div className="h-20 w-20 relative rounded-lg overflow-hidden border-2 border-white">
              <Image 
                src={galleryImages[1]} 
                alt="Gallery preview 2"
                fill
                className="object-cover" 
              />
            </div>
          )}
          {galleryImages && galleryImages.length > 2 && (
            <div className="h-20 w-20 relative rounded-lg overflow-hidden border-2 border-white">
              <Image 
                src={galleryImages[2]} 
                alt="Gallery preview 3"
                fill
                className="object-cover" 
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-medium">+{galleryImages.length - 2}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar with Open Hours, Phone Number and Website */}
      <div className="flex justify-between items-center pt-6 px-6">
        <div className="flex items-center space-x-2 text-neutral-600">
   
          {storeHours && storeHours.length > 0 ? (
            <OpenStatus storeHours={storeHours} />
          ) : (
            <span>Open Now • Closes 8 PM</span>
          )}
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Phone className="w-5 h-5 text-green-600" />
            <span className="text-neutral-600 text-sm">phone #</span>
          </div>
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-green-600" />
            <span className="text-neutral-600 text-sm">
              {website ? 
                website.replace(/^https?:\/\/(www\.)?/, '') : 
                'www.wellnessstudio.com'}
            </span>
          </div>
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