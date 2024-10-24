'use client';

import React from 'react';
import { SafeListing, SafeUser } from '@/app/types';
import useFavorite from "@/app/hooks/useFavorite";
import { categories } from "../Categories";
import ListingGalleryImage from "./ListingGalleryImage";

interface ListingHeadProps {
  listing: SafeListing;
  currentUser?: SafeUser | null;
}

const ListingHead: React.FC<ListingHeadProps> = ({ listing, currentUser }) => {
  const { title, location, description, category, id, address, website, phoneNumber } = listing;
  const { hasFavorited, toggleFavorite } = useFavorite({
    listingId: id,
    currentUser
  });



  const getColorByCategory = (categoryName: string) => {
    const firstLevelCategory = categoryName.split('/')[0].trim();
    const categoryItem = categories.find(cat => cat.label === firstLevelCategory);
    if (!categoryItem) return { bgColorClass: 'bg-gray-200', textColorClass: 'text-gray-200' };

    switch (categoryItem.color) {
      case 'bg-yellow-200':
        return { bgColorClass: 'bg-yellow-200', textColorClass: 'text-white' };
      case 'bg-rose-200':
        return { bgColorClass: 'bg-rose-200', textColorClass: 'text-white' };
      case 'bg-orange-300':
        return { bgColorClass: 'bg-orange-300', textColorClass: 'text-white' };
      case 'bg-teal-500':
        return { bgColorClass: 'bg-teal-500', textColorClass: 'text-white' };
      case 'bg-emerald-600':
        return { bgColorClass: 'bg-emerald-600', textColorClass: 'text-white' };
      case 'bg-cyan-600':
        return { bgColorClass: 'bg-cyan-600', textColorClass: 'text-white' };
      case 'bg-blue-800':
        return { bgColorClass: 'bg-blue-800', textColorClass: 'text-white' };
      case 'bg-indigo-800':
        return { bgColorClass: 'bg-indigo-800', textColorClass: 'text-white' };
      default:
        return { bgColorClass: 'bg-gray-200', textColorClass: 'text-white' };
    }
  };

  const categoryColors = getColorByCategory(category);


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

  return (
    <div className="w-full pl-4 pr-[1.5%]">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden relative">
        <div className="px-6 pt-6 flex justify-between items-start">
          <div className="flex flex-col items-start">
            <div className="flex items-center">
              <h1 className="text-xl font-black text-gray-800 mr-2">{title}</h1>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="#a2a2a2" fill="none" className='mr-2'>
                <path d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="#a2a2a2" fill="none">
                <path d="M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex items-center mb-6 font-mono">
              <p className="text-sm text-gray-600">
                {city}, {stateAcronym}
              </p>
              <div 
                className={`w-8 h-5 ${categoryColors.bgColorClass} shadow-sm rounded-md flex items-center justify-center ml-2`} 
                title={category}
              >
                <span className={`${categoryColors.textColorClass} text-xs font-extralight`}>
                  {category.charAt(0).toUpperCase()}
                </span>
                </div>
            </div>
          </div>
          
          <button
            className="flex bg-[#ffffff] cursor-pointer"
            onClick={() => console.log('Options clicked')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" color="#a2a2a2" fill="none">
              <path d="M11.9959 12H12.0049" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M17.9998 12H18.0088" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5.99981 12H6.00879" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        
        <ListingGalleryImage listing={listing} currentUser={currentUser} />
        
        <div className="px-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">About Us</h2>
          <p className="text-xs text-gray-700 mb-6 line-clamp-3 overflow-hidden">
            {description}
          </p>
          
          <div className="flex justify-between items-center mb-6 mt-4">
  {address && (
    <div className="flex items-center pb-2 pt-2 rounded-lg shadow-sm bg-white border flex-grow mt-2.5">

      <span className="text-xs font-light text-[#a2a2a2] truncate flex-grow text-center p-2">{listing.address}</span>
    </div>
  )}

</div>
        </div>
      </div>
    </div>
  );
};

export default ListingHead;