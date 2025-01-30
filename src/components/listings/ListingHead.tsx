'use client';

import React, { useState, useCallback } from 'react';
import { SafeListing, SafeUser } from '@/app/types';
import useFavorite from "@/app/hooks/useFavorite";
import { categories } from "../Categories";
import ListingGalleryImage from "./ListingGalleryImage";
import Image from "next/image";
import image from '../../../public/assets/map.jpg';
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
        <div className="flex justify-between items-start bg-white shadow-sm rounded-lg pt-6 pb-5 px-6 mb-5">
          {/* Left Column */}
          <div className="flex flex-col items-start flex-1">
          <div className={`px-3 py-2 ${categoryColor} rounded-sm flex items-center justify-center w-fit mb-2`} title={category}>
  <span className="text-white text-xs capitalize">
    {category}  
  </span>
</div>
            <div className="flex items-center">
              <h1 className="text-xl font-black text-black mr-2 capitalize">{title}</h1>
            </div>
            <div className="flex items-center mt-1 mb-3">
  <p className="text-sm text-neutral-500 font-light capitalize">
    {listing.address} {city}, {stateAcronym} {listing.zipCode}
  </p>
  {/* Replace this div with the new category label below the address */}
</div>
{/* Add the category label here */}

            <div className="flex items-start">
              <div className="flex items-center gap-2">
                {/* Heart Button */}
                <div className="flex items-center justify-center rounded-full p-3  cursor-pointer shadow-sm bg-slate-50 border border-neutral-500 ">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19" color="#71717A" fill="#ffffff">
                    <path d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                
                {/* Close/X Button */}
                <div className="flex items-center justify-center rounded-full p-3  cursor-pointer shadow-sm bg-slate-50 border border-neutral-500 ">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19" color="#71717A" fill="#ffffff">
                    <path d="M18 7C18.7745 7.16058 19.3588 7.42859 19.8284 7.87589C21 8.99181 21 10.7879 21 14.38C21 17.9721 21 19.7681 19.8284 20.8841C18.6569 22 16.7712 22 13 22H11C7.22876 22 5.34315 22 4.17157 20.8841C3 19.7681 3 17.9721 3 14.38C3 10.7879 3 8.99181 4.17157 7.87589C4.64118 7.42859 5.2255 7.16058 6 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M12.0253 2.00052L12 14M12.0253 2.00052C11.8627 1.99379 11.6991 2.05191 11.5533 2.17492C10.6469 2.94006 9 4.92886 9 4.92886M12.0253 2.00052C12.1711 2.00657 12.3162 2.06476 12.4468 2.17508C13.3531 2.94037 15 4.92886 15 4.92886" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                {/* Third Button */}
                <div className="flex items-center justify-center  rounded-full p-3 cursor-pointer  shadow-sm bg-slate-50 border border-neutral-500  ">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    width={19} 
                    height={19} 
                    color="#71717A" 
                    fill="#ffffff"
                  >
           
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" />
    <path d="M12 8V12L14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />

          

                  </svg>
                </div>
                <div className="flex items-center justify-center rounded-full  p-3 cursor-pointer  shadow-sm bg-slate-50 border border-neutral-500">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    width={19} 
                    height={19} 
                    color="#71717A" 
                    fill="#ffffff"
                  >
    <path d="M13.6177 21.367C13.1841 21.773 12.6044 22 12.0011 22C11.3978 22 10.8182 21.773 10.3845 21.367C6.41302 17.626 1.09076 13.4469 3.68627 7.37966C5.08963 4.09916 8.45834 2 12.0011 2C15.5439 2 18.9126 4.09916 20.316 7.37966C22.9082 13.4393 17.599 17.6389 13.6177 21.367Z" stroke="currentColor" stroke-width="1.5" />
    <path d="M15.5 11C15.5 12.933 13.933 14.5 12 14.5C10.067 14.5 8.5 12.933 8.5 11C8.5 9.067 10.067 7.5 12 7.5C13.933 7.5 15.5 9.067 15.5 11Z" stroke="currentColor" stroke-width="1.5" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

{/* Right Column - Rating Stats */}
<div className="flex flex-col items-start w-96 gap-4">
  {/* Top Rating Section */}
  <div className="flex items-center gap-8 w-full pt-5 px-5 bg-slate-100 rounded-md pb-4">
    {/* Average Rating */}
    <div className="flex flex-col items-center">
      <span className="text-4xl font-light text-black">4.8</span>
      <div className="flex items-center gap-1 my-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg 
            key={star}
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            width="16" 
            height="16" 
            color="#71717A"
            fill="#ffffff"
         
          > 
            <path 
              d="M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z" 
              stroke="#71717A" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            /> 
          </svg>
        ))}
      </div>
      <span className="text-xs font-light text-neutral-500">1,014,004 total</span>
    </div>

    {/* Rating Bars */}
    <div className="flex flex-col gap-2 flex-1">
      {[5, 4, 3, 2, 1].map((rating) => (
        <div key={rating} className="flex items-center gap-2 ">
          <span className="text-xs text-gray-500 w-3">{rating}</span>
          <div className="flex-1 h-2 bg-gray-200 overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                rating > 3 ? 'bg-[#F9AE8B]' : 
                rating > 2 ? 'bg-[#F79264]' : 'bg-[#F5773D]'
              }`}
              style={{ width: `${(6 - rating) * 20}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
</div>
        </div>

        <ListingGalleryImage listing={listing} currentUser={currentUser} />
      </div>
    </div>
  );
};

export default ListingHead;