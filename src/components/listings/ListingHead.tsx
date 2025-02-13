'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { SafeListing, SafeUser } from '@/app/types';
import useFavorite from "@/app/hooks/useFavorite";
import { categories } from "../Categories";
import ListingGalleryImage from "./ListingGalleryImage";
import HeartButton from '../HeartButton';
import useRentModal from "@/app/hooks/useRentModal";

interface ListingHeadProps {
  listing: SafeListing;
  currentUser?: SafeUser | null;
}

const ListingHead: React.FC<ListingHeadProps> = ({ listing, currentUser }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const rentModal = useRentModal();
  const { title, location, description, category, id, address, website, phoneNumber, userId } = listing;

  const categoryColor = categories.find(cat => cat.label === category)?.color || 'bg-gray-200';
  const isOwner = currentUser?.id === userId;

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
      <div className="overflow-hidden relative">
        <div className="flex flex-col bg-white rounded-lg shadow-sm">
          {/* Header Section */}
          <div className="p-8">
            <div className="flex justify-between items-start">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {/* Rating Section */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <div className="flex items-center gap-1.5 rounded-l-md px-4 py-2 border border-neutral-500">
                        <span className="font-semibold text-gray-900">5.0</span>
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 24 24" 
                          width="14" 
                          height="14" 
                          className="text-[#F9AE8B]"
                          fill="currentColor"
                        > 
                          <path d="M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z" />
                        </svg>
                      </div>
                      <div className="bg-gray-50 rounded-r-md px-4 py-2 border-y border-r border-neutral-500">
                        <span className="text-sm text-gray-600 font-medium capitalize">{category}</span>
                      </div>
                    </div>

                    {/* Review Count with Avatars */}
                    <div className="flex items-center gap-1">
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full border-2 border-white relative overflow-hidden">
                          <Image 
                            src="https://images.unsplash.com/photo-1589729132389-8f0e0b55b91e" 
                            alt="Reviewer"
                            fill
                            className="object-cover"
                          />
    
                        </div>
                        <div className="w-8 h-8 rounded-full border-2 border-white relative overflow-hidden">
                          <Image 
                            src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04" 
                            alt="Reviewer"
                            fill
                            className="object-cover"
                          />
           
                        </div>
                        <div className="w-8 h-8 rounded-full border-2 border-white relative overflow-hidden">
                          <Image 
                            src="https://images.unsplash.com/photo-1523477800337-966dbabe060b" 
                            alt="Reviewer"
                            fill
                            className="object-cover"
                          />
                       
                        </div>
                      </div>
                      <span className="text-sm text-gray-500 ml-1">
                        1M+ reviews
                      </span>
                    </div>
                  </div>
                </div>

                <div className=''>
                  <h1 className="text-xl font-semibold text-gray-900 capitalize">
                    {title} 
                  </h1>
                  <p className="text-gray-500 text-sm flex items-center gap-2">
                    <span>{address} {city}, {stateAcronym} {listing.zipCode}</span> 
                  </p>
                </div>
              </div>

              {/* Right Column - Action Buttons */}
              <div className="flex items-center gap-2">
                <HeartButton 
                  variant='listingHead' 
                  listingId={id} 
                  currentUser={currentUser} 
                />
                
                <button className="p-3 rounded-full bg-white border border-neutral-500 hover:border-gray-200 hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="21" height="21" color="#71717A" fill="#ffffff">
                    <path d="M18 7C18.7745 7.16058 19.3588 7.42859 19.8284 7.87589C21 8.99181 21 10.7879 21 14.38C21 17.9721 21 19.7681 19.8284 20.8841C18.6569 22 16.7712 22 13 22H11C7.22876 22 5.34315 22 4.17157 20.8841C3 19.7681 3 17.9721 3 14.38C3 10.7879 3 8.99181 4.17157 7.87589C4.64118 7.42859 5.2255 7.16058 6 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M12.0253 2.00052L12 14M12.0253 2.00052C11.8627 1.99379 11.6991 2.05191 11.5533 2.17492C10.6469 2.94006 9 4.92886 9 4.92886M12.0253 2.00052C12.1711 2.00657 12.3162 2.06476 12.4468 2.17508C13.3531 2.94037 15 4.92886 15 4.92886" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                <button className="p-3 rounded-full bg-white border border-neutral-500 hover:border-gray-200 hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="21" height="21" color="#71717A" fill="#ffffff">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M12 8V12L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Gallery Section */}
          <div className="px-8 pb-8">
            <ListingGalleryImage listing={listing} currentUser={currentUser} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingHead;