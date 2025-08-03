'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { SafeListing, SafeReservation, SafeUser, SafeEmployee, SafeService } from '@/app/types';
import SmartBadgeWorker from './SmartBadgeWorker';
import useReservationModal from '@/app/hooks/useReservationModal';
import useLoginModal from '@/app/hooks/useLoginModal';
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
    availabilityStatus?: 'free' | 'busy' | 'booked';
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
    category: string;
  };
  listing: SafeListing; // Add full listing data
  currentUser?: SafeUser | null; // Add current user
  onFollow?: () => void;
  onBook?: () => void;
}

const WorkerCard: React.FC<WorkerCardProps> = ({
  employee,
  listingTitle,
  data,
  listing,
  currentUser,
  onFollow, 
  onBook,
}) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const reservationModal = useReservationModal();
  const loginModal = useLoginModal();

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

  // Handle reserve button click
  const handleReserveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!currentUser) {
      loginModal.onOpen();
      return;
    }
    
    // Open reservation modal with this employee pre-selected
    // Order: employeeId is 4th parameter, serviceId is 3rd (undefined in this case)
    reservationModal.onOpen(listing, currentUser, undefined, employee.id);
  };

  // Default store hours for employee
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
    <div className="cursor-pointer bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden relative">
      {/* Full background image - same as ServiceCard and ListingCard */}
      <div className="absolute inset-0 z-0">
        <Image
          src={data.imageSrc || '/placeholder.jpg'}
          alt={data.title}
          fill
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 card__overlay" />
      </div>

      <div className="relative z-10">
        <div className="relative h-[345px] overflow-hidden">
          {/* Category badge - top left (same as other cards) */}
          <div className="absolute top-4 left-6 z-20">
            <div className="bg-white/90 backdrop-blur-md border border-white/30 rounded-xl text-center w-24 py-2 shadow-lg hover:bg-white/30 transition-all duration-300">
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-xs font-normal text-black tracking-wide">{data.category}</span>
              </div>
            </div>
          </div>

          {/* Action buttons - top right */}
          <div className="absolute top-4 right-6 flex gap-2 z-20">
            {/* Follow/Add User Button */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleFollow();
              }}
              className={`p-2.5 rounded-full border border-white/20 backdrop-blur-md transition-all duration-200 ${
                isFollowing 
                  ? 'bg-blue-500/30 text-blue-200 border-blue-300/30' 
                  : 'bg-white/90 text-black hover:bg-white/30'
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
              className="p-2.5 rounded-full border border-white/20 backdrop-blur-md transition-all duration-200 bg-white/90 text-black hover:bg-white/30 hover:text-red-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" color="currentColor" fill="none">
                <path d="M10.4107 19.9677C7.58942 17.858 2 13.0348 2 8.69444C2 5.82563 4.10526 3.5 7 3.5C8.5 3.5 10 4 12 6C14 4 15.5 3.5 17 3.5C19.8947 3.5 22 5.82563 22 8.69444C22 13.0348 16.4106 17.858 13.5893 19.9677C12.6399 20.6776 11.3601 20.6776 10.4107 19.9677Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Main content at bottom with SmartBadgeWorker */}
          <div className="absolute bottom-5 left-5 right-5 text-white z-20">
            <SmartBadgeWorker
              employee={employee}
              listingTitle={listingTitle}
              followerCount={employee.followerCount || 1247}
              onFollowerClick={() => {
                console.log('Followers clicked for:', employee.fullName);
              }}
            />
          </div>
        </div>

        {/* Bottom action section (same as other cards) */}
        <div className="px-5 pb-4 pt-2 -mt-3">
          <button
            onClick={handleReserveClick}
            className="w-full bg-[#60A5FA]/50 backdrop-blur-md text-white p-3 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all shadow-lg border border-white/10"
          >
            <div className="flex items-center text-center gap-3">
              <div className="flex flex-col items-center text-center">
                <span className="font-medium text-sm">Reserve</span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkerCard;