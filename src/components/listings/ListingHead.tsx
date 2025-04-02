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
          <div className="p-6">
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
                  {address}<br/>{city}, {stateAcronym} {listing.zipCode}
                </p>
                
                {/* Open Status with more spacing */}
                <div className="mb-6">
                  <OpenStatus storeHours={storeHours || []} />
                </div>
                
                {/* Reviews and Statistics Section - Card Style */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Rating Card */}
                  <div className="bg-gray-50 rounded-lg p-3 shadow-sm flex flex-col items-center">
                    <div className="flex items-center mb-1">
                      <span className=" font-bold mr-1">5.0</span>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" color="#000000" fill="none">
    <path d="M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
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