'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();

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

  // Handle card click (navigate to listing page)
  const handleCardClick = () => {
    router.push(`/listings/${listing.id}`);
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
    <div 
      onClick={handleCardClick}
      className="cursor-pointer bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden relative"
    >
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