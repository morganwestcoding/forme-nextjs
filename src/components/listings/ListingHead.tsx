'use client';

import React from 'react';
import Image from 'next/image';
import { SafeListing, SafeUser } from '@/app/types';
import useFavorite from "@/app/hooks/useFavorite";
import { categories } from "../Categories";

interface ListingHeadProps {
  listing: SafeListing;
  currentUser?: SafeUser | null;
}

const ListingHead: React.FC<ListingHeadProps> = ({ listing, currentUser }) => {
  const { title, location, description, category, id } = listing;
  const { hasFavorited, toggleFavorite } = useFavorite({
    listingId: id,
    currentUser
  });

  const getColorByCategory = (categoryName: string) => {
    const firstLevelCategory = categoryName.split('/')[0].trim();
    const categoryItem = categories.find(cat => cat.label === firstLevelCategory);
    return categoryItem ? categoryItem.color : 'bg-gray-200';
  };

  const categoryColor = getColorByCategory(category);
  const firstLevelCategory = category.split('/')[0].trim();

  return (
    <div className="w-full pl-4 pr-[1.5%]">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden relative">
        <div className="px-6 pt-6 flex justify-between items-start">
          <div className="w-2/3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                <div 
                  className={`w-10 h-7 ${categoryColor} shadow-sm rounded-md flex items-center justify-center`}
                  title={firstLevelCategory}
                >
                  <span className="text-white text-sm font-medium">
                    {firstLevelCategory.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4"><i>{location}</i></p>
            <p className="text-xs text-gray-700 mb-6 line-clamp-4 overflow-hidden">
              {description}
            </p>
          </div>
          <div className="w-1/3 flex flex-col items-end">
            <div className="w-36 h-20 relative shadow rounded-lg mb-4">
              <Image
                src="/assets/8KmHl.png"
                alt="Map Placeholder"
                layout="fill"
                objectFit="cover"
                className='rounded-lg'
              />
            </div>
            <div className="flex space-x-2 mb-5 mt-2">
              <button
                className="flex items-center justify-center bg-[#ffffff] p-3 cursor-pointer shadow-sm border rounded-full"
                onClick={() => console.log('Share clicked')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" color="#a2a2a2"  fill="none">
                  <path d="M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                className="flex items-center justify-center bg-[#ffffff] p-3 cursor-pointer shadow-sm border rounded-full"
                onClick={() => console.log('Share clicked')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" color="#a2a2a2" fill="none">
                  <path d="M5 9C5 5.70017 5 4.05025 6.02513 3.02513C7.05025 2 8.70017 2 12 2C15.2998 2 16.9497 2 17.9749 3.02513C19 4.05025 19 5.70017 19 9V15C19 18.2998 19 19.9497 17.9749 20.9749C16.9497 22 15.2998 22 12 22C8.70017 22 7.05025 22 6.02513 20.9749C5 19.9497 5 18.2998 5 15V9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M11 19H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 2L9.089 2.53402C9.28188 3.69129 9.37832 4.26993 9.77519 4.62204C10.1892 4.98934 10.7761 5 12 5C13.2239 5 13.8108 4.98934 14.2248 4.62204C14.6217 4.26993 14.7181 3.69129 14.911 2.53402L15 2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                className="flex items-center justify-center bg-[#ffffff] p-3 cursor-pointer shadow-sm border rounded-full"
                onClick={() => console.log('Share clicked')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" color="#a2a2a2" fill="none">
                  <path d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12Z" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M20 5.69899C19.0653 5.76636 17.8681 6.12824 17.0379 7.20277C15.5385 9.14361 14.039 9.30556 13.0394 8.65861C11.5399 7.6882 12.8 6.11636 11.0401 5.26215C9.89313 4.70542 9.73321 3.19045 10.3716 2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M2 11C2.7625 11.6621 3.83046 12.2682 5.08874 12.2682C7.68843 12.2682 8.20837 12.7649 8.20837 14.7518C8.20837 16.7387 8.20837 16.7387 8.72831 18.2288C9.06651 19.1981 9.18472 20.1674 8.5106 21" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M22 13.4523C21.1129 12.9411 20 12.7308 18.8734 13.5405C16.7177 15.0898 15.2314 13.806 14.5619 15.0889C13.5765 16.9775 17.0957 17.5711 14 22" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingHead;