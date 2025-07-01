'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { SafeListing, SafeReservation, SafeUser, SafeEmployee, SafeService } from '@/app/types';
import SmartBadgeRating from '../SmartBadgeRating'; // Import the white background version
import { 
Heart, Clock, Star, User, Scissors, Droplet, SprayCan, Waves, Palette, Flower, Dumbbell 
} from 'lucide-react';

interface WorkerCardProps {
  employee: SafeEmployee & { 
    followerCount?: number; 
    followingCount?: number;
    profileImage?: string;
    jobTitle?: string;
    rating?: number;
    isTrending?: boolean;
    storeHours?: Array<{
      dayOfWeek: string;
      openTime: string;
      closeTime: string;
      isClosed: boolean;
    }>;
  };
  listingTitle: string;
  data: {
    title: string;
    imageSrc: string;
    category: string; // Add this line
  };
  onFollow?: () => void;
  onBook?: () => void;
}

const WorkerCard: React.FC<WorkerCardProps> = ({
  employee,
  listingTitle,
  data,
  onFollow, 
  onBook,
}) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const getCategoryConfig = (category: string) => {
  const configs: { [key: string]: { icon: React.ReactElement } } = {
    'Spa': { icon: <Waves className="w-3 h-3" /> },
    'Beauty': { icon: <Palette className="w-3 h-3" /> },
    'Barber': { icon: <Scissors className="w-3 h-3" /> },
    'Fitness': { icon: <Dumbbell className="w-3 h-3" /> },
    'Salon': { icon: <SprayCan className="w-3 h-3" /> },
    'Wellness': { icon: <Flower className="w-3 h-3" /> },
    'Skincare': { icon: <Droplet className="w-3 h-3" /> }
  };
  return configs[category] || { icon: <Star className="w-3 h-3" /> };
};

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    onFollow?.();
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  // Default store hours for employee (could be passed as prop or fetched)
  const defaultStoreHours = [
    { dayOfWeek: 'Monday', openTime: '09:00', closeTime: '21:00', isClosed: false },
    { dayOfWeek: 'Tuesday', openTime: '09:00', closeTime: '21:00', isClosed: false },
    { dayOfWeek: 'Wednesday', openTime: '09:00', closeTime: '21:00', isClosed: false },
    { dayOfWeek: 'Thursday', openTime: '09:00', closeTime: '21:00', isClosed: false },
    { dayOfWeek: 'Friday', openTime: '09:00', closeTime: '22:00', isClosed: false },
    { dayOfWeek: 'Saturday', openTime: '08:00', closeTime: '22:00', isClosed: false },
    { dayOfWeek: 'Sunday', openTime: '10:00', closeTime: '20:00', isClosed: false }
  ];

  return (
    <div className="cursor-pointer bg-white rounded-2xl shadow-sm hover:shadow-2xl overflow-hidden relative">
      <div className="relative z-10">
        {/* Full height container matching ListingCard */}
        <div className="relative h-[345px] overflow-hidden">
          {/* Gradient background - starts from middle of profile picture */}
          <div className="absolute top-0 left-0 right-0 h-[115px] overflow-hidden">
            <Image
              src={data.imageSrc || '/placeholder.jpg'}
              alt={data.title}
              fill
              className="w-full h-full object-cover"
            />
            {/* Add overlay for better text readability */}
            <div className="absolute inset-0 bg-black/20" />
          </div>
          
          {/* White background for bottom section */}
          <div className="absolute bottom-0 left-0 right-0 h-[155px] bg-white"></div>

          {/* Top badge */}
          <div className="absolute top-4 left-4 z-20">
  <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-center px-3 py-2 shadow-lg hover:bg-white/30 transition-all duration-300">
    <div className="flex items-center justify-center gap-1.5">
      {getCategoryConfig(data.category).icon}
      <span className="text-xs font-semibold text-white tracking-wide">{data.category}</span>
    </div>
  </div>
          </div>

          {/* Action buttons */}
{/* Action buttons */}
<div className="absolute top-4 right-4 flex gap-2 z-20">
  {/* Follow/Add User Button */}
  <button 
    onClick={(e) => {
      e.stopPropagation();
      handleFollow();
    }}
    className={`p-2.5 rounded-full border border-white/20 backdrop-blur-md transition-all duration-200 ${
      isFollowing 
        ? 'bg-blue-500/30 text-blue-200 border-blue-300/30' 
        : 'bg-white/10 text-white hover:bg-white/30'
    }`}
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" color="currentColor" fill="none">
      <path d="M12 7.5C12 9.433 10.433 11 8.5 11C6.567 11 5 9.433 5 7.5C5 5.567 6.567 4 8.5 4C10.433 4 12 5.567 12 7.5Z" stroke="currentColor" strokeWidth="1.5"></path>
      <path d="M13.5 11C15.433 11 17 9.433 17 7.5C17 5.567 15.433 4 13.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
      <path d="M13.1429 20H3.85714C2.83147 20 2 19.2325 2 18.2857C2 15.9188 4.07868 14 6.64286 14H10.3571C11.4023 14 12.3669 14.3188 13.1429 14.8568" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
      <path d="M19 14V20M22 17L16 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
    </svg>
  </button>

  {/* Like/Heart Button */}
  <button 
    onClick={(e) => {
      e.stopPropagation();
      // Handle like functionality
    }}
    className="p-2.5 rounded-full border border-white/20 backdrop-blur-md transition-all duration-200 bg-white/10 text-white hover:bg-white/30 hover:text-red-300"
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" color="currentColor" fill="none">
      <path d="M10.4107 19.9677C7.58942 17.858 2 13.0348 2 8.69444C2 5.82563 4.10526 3.5 7 3.5C8.5 3.5 10 4 12 6C14 4 15.5 3.5 17 3.5C19.8947 3.5 22 5.82563 22 8.69444C22 13.0348 16.4106 17.858 13.5893 19.9677C12.6399 20.6776 11.3601 20.6776 10.4107 19.9677Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </button>
</div>

          {/* Content on white background */}
          <div className="absolute bottom-5 left-5 right-5 z-20">
            {/* Profile image - positioned above name */}
            <div className="mb-3">
              <div className="relative w-20 h-20">
                <Image
                  src={employee.profileImage || '/people/headshot-3.png'}
                  alt={employee.fullName}
                  width={75}
                  height={75}
                  className="w-full h-full border border-white rounded-full object-cover"
                />
              </div>
            </div> 

            {/* Name and title - positioned below profile image */}
            <div className="mb-3">
              <div className="flex items-center space-x-2 mb-1">
                <h1 className="text-xl font-medium text-gray-900">{employee.fullName}</h1>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#60A5FA" className='text-white'>
                  <path d="M18.9905 19H19M18.9905 19C18.3678 19.6175 17.2393 19.4637 16.4479 19.4637C15.4765 19.4637 15.0087 19.6537 14.3154 20.347C13.7251 20.9374 12.9337 22 12 22C11.0663 22 10.2749 20.9374 9.68457 20.347C8.99128 19.6537 8.52349 19.4637 7.55206 19.4637C6.76068 19.4637 5.63218 19.6175 5.00949 19C4.38181 18.3776 4.53628 17.2444 4.53628 16.4479C4.53628 15.4414 4.31616 14.9786 3.59938 14.2618C2.53314 13.1956 2.00002 12.6624 2 12C2.00001 11.3375 2.53312 10.8044 3.59935 9.73817C4.2392 9.09832 4.53628 8.46428 4.53628 7.55206C4.53628 6.76065 4.38249 5.63214 5 5.00944C5.62243 4.38178 6.7556 4.53626 7.55208 4.53626C8.46427 4.53626 9.09832 4.2392 9.73815 3.59937C10.8044 2.53312 11.3375 2 12 2C12.6625 2 13.1956 2.53312 14.2618 3.59937C14.9015 4.23907 15.5355 4.53626 16.4479 4.53626C17.2393 4.53626 18.3679 4.38247 18.9906 5C19.6182 5.62243 19.4637 6.75559 19.4637 7.55206C19.4637 8.55858 19.6839 9.02137 20.4006 9.73817C21.4669 10.8044 22 11.3375 22 12C22 12.6624 21.4669 13.1956 20.4006 14.2618C19.6838 14.9786 19.4637 15.4414 19.4637 16.4479C19.4637 17.2444 19.6182 18.3776 18.9905 19Z" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M9 12.8929L10.8 14.5L15 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-xs text-gray-600 font-light">
                Specialist at {listingTitle}
              </p>
            </div>

            {/* SmartBadgeRating Component - White Background Version */}
            <SmartBadgeRating 
              rating={employee.rating || 4.7}
              isTrending={employee.isTrending || false}
              onRatingClick={() => {
                console.log('Employee rating clicked');
              }}
              onTimeClick={() => {
                console.log('Employee availability clicked');
              }}
              storeHours={employee.storeHours || defaultStoreHours}
            />
          </div>
        </div>

        {/* Bottom action section on white background */}
        <div className="px-5 pb-4 bg-white relative pt-2 -mt-3 z-20">
          <div className="flex gap-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleFollow();
              }}
              className={`flex-1 p-3 rounded-xl border transition-all duration-200 shadow-sm ${
                isFollowing
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-[#60A5FA] text-white hover:bg-[#4F93E8]'
              }`}
            >
              <div className="flex items-center text-center justify-center gap-2">
                <span className="font-medium text-sm">
                  {isFollowing ? 'Following' : 'Follow'}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerCard;