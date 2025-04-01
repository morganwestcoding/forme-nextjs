'use client';

import React from 'react';
import Image from 'next/image';
import { SafeListing, SafeUser } from '@/app/types';
import { categories } from "../Categories";
import ListingGalleryImage from "./ListingGalleryImage";
import HeartButton from '../HeartButton';
import OpenStatus from './OpenStatus'; // Import the new component

interface ListingHeadProps {
  listing: SafeListing & {
    user: SafeUser;
  };
  currentUser?: SafeUser | null;
}

const ListingHead: React.FC<ListingHeadProps> = ({ listing, currentUser }) => {
  const { title, location, description, category, id, address, website, phoneNumber, userId, storeHours } = listing;

  const categoryColor = categories.find(cat => cat.label === category)?.color || 'bg-[#60A5FA]';
  const badgeColor = categoryColor.replace('bg-[', '').replace(']', '') || '#60A5FA';
  
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

  return (
    <div className="w-full">
      <div className="relative">
        <div className="flex flex-col bg-white rounded-lg border hover:shadow-md transition-all duration-300">
          <div className="p-5">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Left Column - Info */}
              <div className="flex-1 min-w-0">
                {/* Header Section with Category Badge */}
                <div className="flex justify-between items-start mb-4">
                  <div 
                    className="py-2 px-3 rounded-md text-white text-xs font-medium shadow-sm"
                    style={{ backgroundColor: badgeColor }}
                  >
                    {category}
                  </div>
         
                </div>
                
                {/* Title and Location */}
                <h1 className="text-xl font-semibold text-gray-900 mb-2">
                  {title}
                </h1>
                
                {/* Location */}
                <p className="text-gray-500 text-sm mb-4">
                  {address}, {city}, {stateAcronym} {listing.zipCode}
                </p>
                
                {/* Open Status with more spacing */}
                <div className="mb-14">
                  <OpenStatus storeHours={storeHours || []} />
                </div>
                
                {/* Reviews and Statistics Section - Card Style */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Rating Card */}
                  <div className="bg-gray-50 rounded-lg p-3 shadow-sm flex flex-col items-center">
                    <div className="flex items-center mb-1">
                      <span className=" font-bold mr-1">5.0</span>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="#FFA570">
                        <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-500">Rating</span>
                  </div>
                  
                  {/* Reviews Card */}
                  <div className="bg-gray-50 rounded-lg p-3 shadow-sm flex flex-col items-center">
                    <div className="font-semibold mb-1">1M+</div>
                    <span className="text-xs text-gray-500">Reviews</span>
                  </div>
                  
                  {/* Booking Stats Card */}
                  <div className="bg-gray-50 rounded-lg p-3 shadow-sm flex flex-col items-center">
                    <div className="font-semibold mb-1">24k</div>
                    <span className="text-xs text-gray-500">Likes</span>
                  </div>
                </div>
              </div> 
              
              {/* Right Column - Gallery */}
              <div className="flex-1 min-w-0 relative">
                <ListingGalleryImage listing={listing} currentUser={currentUser} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingHead;