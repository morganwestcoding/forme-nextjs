'use client';

import React from 'react';
import Image from 'next/image';
import { SafeListing, SafeUser } from '@/app/types';
import { categories } from "../Categories";
import ListingGalleryImage from "./ListingGalleryImage";
import HeartButton from '../HeartButton';

interface ListingHeadProps {
  listing: SafeListing & {
    user: SafeUser;
  };
  currentUser?: SafeUser | null;
}

const ListingHead: React.FC<ListingHeadProps> = ({ listing, currentUser }) => {
  const { title, location, description, category, id, address, website, phoneNumber, userId } = listing;

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
                <p className="text-gray-500 text-sm mb-14">
                  {address}, {city}, {stateAcronym} {listing.zipCode}
                </p>
                
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
                
             {/*  
                <div className="flex items-center gap-2">
               
                  <button className="flex items-center justify-center gap-2 py-2 px-4 bg-gray-100 hover:bg-gray-200 transition rounded-full text-sm font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5z"/>
                    </svg>
                    Share
                  </button>
                  
               
                  <button className="flex items-center justify-center gap-2 py-2 px-4 bg-gray-100 hover:bg-gray-200 transition rounded-full text-sm font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z"/>
                    </svg>
                    Save
                  </button>
                  
            
                  <button className="flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 transition rounded-full text-sm font-medium text-white ml-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                      <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                    </svg>
                    Schedule
                  </button>
                </div>
                */}
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