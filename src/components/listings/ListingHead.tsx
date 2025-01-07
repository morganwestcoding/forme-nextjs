'use client';

import React, { useState, useCallback } from 'react';
import { SafeListing, SafeUser } from '@/app/types';
import useFavorite from "@/app/hooks/useFavorite";
import { categories } from "../Categories";
import ListingGalleryImage from "./ListingGalleryImage";
import StoreHours from './StoreHours';
import HeartButton from '../HeartButton';
import useRentModal from "@/app/hooks/useRentModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  const handleEditClick = useCallback(() => {
    console.log('Editing listing:', listing);  // Debug log
    rentModal.onOpen(listing);
    setShowDropdown(false);
  }, [rentModal, listing]);

  // Split location into city and state
  const [city, state] = location?.split(',').map(s => s.trim()) || [];
  
  // Function to get state acronym
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

  const stateAcronym = state ? getStateAcronym(state) : '';

  // Click outside handler
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDropdown && !(event.target as HTMLElement).closest('.dropdown-container')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showDropdown]);

  return (
    <div className="w-full">
      <div className="overflow-hidden relative">
        <div className="px-6 pt-6 flex justify-between items-start">
          <div className="flex flex-col items-start">
            <div className="flex items-center">
              <h1 className="text-xl font-black text-white mr-2">{title}</h1>
              <HeartButton 
                listingId={id} 
                currentUser={currentUser} 
                variant="listingHead" 
              />
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="#a2a2a2" fill="none">
                <path d="M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex items-center mb-6 font-mono">
              <p className="text-sm text-white">
              {listing.address} {city}, {stateAcronym} {listing.zipCode}
              </p>
              <div 
                className={`w-8 h-5 ${categoryColor} shadow-sm rounded-md flex items-center justify-center ml-2`} 
                title={category}
              >
                <span className={`${categoryColor} text-xs text-[#ffffff] font-extralight`}>
                  {category.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
          
          {isOwner && (
  <div className="absolute top-4 right-6">
    <DropdownMenu>
      <DropdownMenuTrigger>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" color="#5E6365" fill="none">
          <path d="M11.9959 12H12.0049" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M17.9998 12H18.0088" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5.99981 12H6.00879" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem 
          onClick={handleEditClick} 
          className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
        >
          Edit Listing
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
)}
        </div>
        <StoreHours/>
        <ListingGalleryImage listing={listing} currentUser={currentUser} />
        
        <div className="px-6">
          <h2 className="text-xl font-bold text-white mb-2">About Us</h2>
          <p className="text-xs text-white mb-6 line-clamp-4 overflow-hidden">
            {description}
          </p>
          
        </div>
      </div>
    </div>
  );
};

export default ListingHead;