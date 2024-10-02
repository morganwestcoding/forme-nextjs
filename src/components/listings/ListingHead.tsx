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
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="#a2a2a2" fill="#FFE84F">
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
          
          <div className="flex justify-between items-center mb-4">
  {address && (
    <div className="flex items-center pb-2 pt-2 rounded-lg shadow-sm bg-white border px-2 flex-grow mr-2">
      <div className="flex items-center justify-center p-1 cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19" color="#a2a2a2" fill="none">
          <path d="M13.6177 21.367C13.1841 21.773 12.6044 22 12.0011 22C11.3978 22 10.8182 21.773 10.3845 21.367C6.41302 17.626 1.09076 13.4469 3.68627 7.37966C5.08963 4.09916 8.45834 2 12.0011 2C15.5439 2 18.9126 4.09916 20.316 7.37966C22.9082 13.4393 17.599 17.6389 13.6177 21.367Z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M15.5 11C15.5 12.933 13.933 14.5 12 14.5C10.067 14.5 8.5 12.933 8.5 11C8.5 9.067 10.067 7.5 12 7.5C13.933 7.5 15.5 9.067 15.5 11Z" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>
      <span className="ml-2 text-xs font-light text-[#a2a2a2] truncate">{listing.address}</span>
    </div>
  )}
  {website && (
    <div className="flex items-center pb-2 pt-2 rounded-lg shadow-sm bg-white border px-2 flex-grow mr-2">
      <div className="flex items-center justify-center p-1 cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19" color="#a2a2a2" fill="none">
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 12H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2V2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <span className="ml-2 text-xs font-light text-[#a2a2a2] truncate">{listing.website}</span>
    </div>
  )}
  {phoneNumber && (
    <div className="flex items-center pb-2 pt-2 rounded-lg shadow-sm bg-white border px-2 flex-grow">
      <div className="flex items-center justify-center p-1 cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19" color="#a2a2a2" fill="none">
          <path d="M21.97 18.33C21.97 18.69 21.89 19.06 21.72 19.42C21.55 19.78 21.33 20.12 21.04 20.44C20.55 20.98 20.01 21.37 19.4 21.62C18.8 21.87 18.15 22 17.45 22C16.43 22 15.34 21.76 14.19 21.27C13.04 20.78 11.89 20.12 10.75 19.29C9.6 18.45 8.51 17.52 7.47 16.49C6.44 15.45 5.51 14.36 4.68 13.22C3.86 12.08 3.2 10.94 2.72 9.81C2.24 8.67 2 7.58 2 6.54C2 5.86 2.12 5.21 2.36 4.61C2.6 4 2.98 3.44 3.51 2.94C4.15 2.31 4.85 2 5.59 2C5.87 2 6.15 2.06 6.4 2.18C6.66 2.3 6.89 2.48 7.07 2.74L9.39 6.01C9.57 6.26 9.7 6.49 9.79 6.71C9.88 6.92 9.93 7.13 9.93 7.32C9.93 7.56 9.86 7.8 9.72 8.03C9.59 8.26 9.4 8.5 9.16 8.74L8.4 9.53C8.29 9.64 8.24 9.77 8.24 9.93C8.24 10.01 8.25 10.08 8.27 10.16C8.3 10.24 8.33 10.3 8.35 10.36C8.53 10.69 8.84 11.12 9.28 11.64C9.73 12.16 10.21 12.69 10.73 13.22C11.27 13.75 11.79 14.24 12.32 14.69C12.84 15.13 13.27 15.43 13.61 15.61C13.66 15.63 13.72 15.66 13.79 15.69C13.87 15.72 13.95 15.73 14.04 15.73C14.21 15.73 14.34 15.67 14.45 15.56L15.21 14.81C15.46 14.56 15.7 14.37 15.93 14.25C16.16 14.11 16.39 14.04 16.64 14.04C16.83 14.04 17.03 14.08 17.25 14.17C17.46 14.26 17.68 14.39 17.91 14.56L21.26 16.91C21.52 17.09 21.7 17.3 21.81 17.55C21.91 17.8 21.97 18.05 21.97 18.33Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <span className="ml-2 text-xs font-light text-[#a2a2a2] truncate">{listing.phoneNumber}</span>
    </div>
  )}
</div>
        </div>
      </div>
    </div>
  );
};

export default ListingHead;