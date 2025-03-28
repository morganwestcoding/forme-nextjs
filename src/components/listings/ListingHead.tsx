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
        <div className="flex flex-col bg-white rounded-lg border shadow-sm hover:shadow-md transition-all duration-300">
          <div className="p-5">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Left Column - Info */}
              <div className="flex-1 space-y-3 min-w-0">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {/* Rating button - standalone */}
                    <div className="flex items-center gap-1.5 rounded-md px-2 py-1 bg-white border border-neutral-300 shadow-sm">
                      <span className="text-xs font-medium text-gray-900">5.0</span>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        width="12" 
                        height="12" 
                        className="text-[#F9AE8B]"
                        fill="currentColor"
                      > 
                        <path d="M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z" />
                      </svg>
                    </div>
                    
                    {/* Category button - standalone */}
                    <div 
                      className="py-1 px-2 rounded-md text-white text-xs font-medium shadow-sm"
                      style={{ backgroundColor: badgeColor }}
                    >
                      {category}
                    </div>
                  </div>

                  <h1 className="text-lg font-semibold text-gray-900 capitalize mb-1">
                    {title}
                  </h1>
                  <p className="text-gray-500 text-xs font-light">
                    <span>{address}, {city}, {stateAcronym} {listing.zipCode}</span> 
                  </p>
                </div>
                
                {/* Review avatars */}
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full border-2 border-white relative overflow-hidden">
                      <Image 
                        src="https://images.unsplash.com/photo-1589729132389-8f0e0b55b91e" 
                        alt="Reviewer"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="w-6 h-6 rounded-full border-2 border-white relative overflow-hidden">
                      <Image 
                        src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04" 
                        alt="Reviewer"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="w-6 h-6 rounded-full border-2 border-white relative overflow-hidden">
                      <Image 
                        src="https://images.unsplash.com/photo-1523477800337-966dbabe060b" 
                        alt="Reviewer"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    1M+ reviews
                  </span>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {/* Heart Button */}
                  <HeartButton 
                    variant='listingHead' 
                    listingId={id} 
                    currentUser={currentUser}
                    favoriteIds={listing.favoriteIds} 
                  />
                  
                  {/* Share Button */}
                  <div className="flex items-center justify-center p-2 rounded-full cursor-pointer transition-all duration-300
                    bg-gray-50 border border-gray-100
                    hover:shadow-[0_0_12px_rgba(0,0,0,0.05)]">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" color="#52525B" fill="#ffffff">
                      <path d="M18 7C18.7745 7.16058 19.3588 7.42859 19.8284 7.87589C21 8.99181 21 10.7879 21 14.38C21 17.9721 21 19.7681 19.8284 20.8841C18.6569 22 16.7712 22 13 22H11C7.22876 22 5.34315 22 4.17157 20.8841C3 19.7681 3 17.9721 3 14.38C3 10.7879 3 8.99181 4.17157 7.87589C4.64118 7.42859 5.2255 7.16058 6 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M12.0253 2.00052L12 14M12.0253 2.00052C11.8627 1.99379 11.6991 2.05191 11.5533 2.17492C10.6469 2.94006 9 4.92886 9 4.92886M12.0253 2.00052C12.1711 2.00657 12.3162 2.06476 12.4468 2.17508C13.3531 2.94037 15 4.92886 15 4.92886" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>

                  {/* Clock Button */}
                  <div className="flex items-center justify-center p-2 rounded-full cursor-pointer transition-all duration-300
                    bg-gray-50 border border-gray-100
                    hover:shadow-[0_0_12px_rgba(0,0,0,0.05)]">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" color="#52525B" fill="#ffffff">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M12 8V12L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
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