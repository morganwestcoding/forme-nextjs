'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { SafeEmployee } from '@/app/types';
import { 
  Calendar, 
  Bookmark, 
  Users, 
  UserPlus, 
  MessageCircle, 
  Clock,
  CheckCircle,
  Star,
  Heart
} from 'lucide-react';

interface WorkerCardProps {
  employee: SafeEmployee & { 
    followerCount?: number; 
    followingCount?: number;
    profileImage?: string;
    jobTitle?: string;
  };
  listingTitle: string;
  onFollow?: () => void;
  onBook?: () => void;
}

const WorkerCard: React.FC<WorkerCardProps> = ({
  employee,
  listingTitle,
  onFollow,
  onBook,
}) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    onFollow?.();
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  return (
    <div className="cursor-pointer rounded-xl shadow-lg hover:shadow-2xl overflow-hidden relative bg-gradient-to-br from-[#60A5FA] via-[#89bcfb] to-[#60A5FA]">
      <div className="relative z-10">
        {/* Full height container matching ListingCard */}
        <div className="relative h-[345px] overflow-hidden">
          {/* Top badge */}
          <div className="absolute top-4 left-4 z-20">
            <div className="bg-white/90 text-[#60A5FA] border rounded-lg text-center px-3 py-1.5 backdrop-blur-sm">
              <span className="text-xs text-center font-medium">{employee.jobTitle || 'Team Member'}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="absolute top-4 right-4 flex gap-2 z-20">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleBookmark();
              }}
              className={`p-2 rounded-full backdrop-blur-md transition-all duration-200 ${
                isBookmarked 
                  ? 'bg-white/30 text-yellow-400' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onBook?.();
              }}
              className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-md transition-all duration-200"
            >
              <Calendar size={18} />
            </button>
          </div>

          {/* Bottom content */}
          <div className="absolute bottom-5 left-5 right-5 text-white z-20">
            {/* Profile image - above name, left aligned */}
            <div className="mb-4">
              <div className="relative w-20 h-20">
                <div className="w-full h-full rounded-full bg-white p-1 shadow-2xl">
                  <Image
                    src={employee.profileImage || '/people/headshot-3.png'}
                    alt={employee.fullName}
                    width={72}
                    height={72}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                {/* Online indicator */}
                <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
            </div>

            <div className="flex items-center space-x-2 mb-1">
              <h1 className="text-xl font-medium drop-shadow-lg">{employee.fullName}</h1>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="white">
                <path d="M18.9905 19H19M18.9905 19C18.3678 19.6175 17.2393 19.4637 16.4479 19.4637C15.4765 19.4637 15.0087 19.6537 14.3154 20.347C13.7251 20.9374 12.9337 22 12 22C11.0663 22 10.2749 20.9374 9.68457 20.347C8.99128 19.6537 8.52349 19.4637 7.55206 19.4637C6.76068 19.4637 5.63218 19.6175 5.00949 19C4.38181 18.3776 4.53628 17.2444 4.53628 16.4479C4.53628 15.4414 4.31616 14.9786 3.59938 14.2618C2.53314 13.1956 2.00002 12.6624 2 12C2.00001 11.3375 2.53312 10.8044 3.59935 9.73817C4.2392 9.09832 4.53628 8.46428 4.53628 7.55206C4.53628 6.76065 4.38249 5.63214 5 5.00944C5.62243 4.38178 6.7556 4.53626 7.55208 4.53626C8.46427 4.53626 9.09832 4.2392 9.73815 3.59937C10.8044 2.53312 11.3375 2 12 2C12.6625 2 13.1956 2.53312 14.2618 3.59937C14.9015 4.23907 15.5355 4.53626 16.4479 4.53626C17.2393 4.53626 18.3679 4.38247 18.9906 5C19.6182 5.62243 19.4637 6.75559 19.4637 7.55206C19.4637 8.55858 19.6839 9.02137 20.4006 9.73817C21.4669 10.8044 22 11.3375 22 12C22 12.6624 21.4669 13.1956 20.4006 14.2618C19.6838 14.9786 19.4637 15.4414 19.4637 16.4479C19.4637 17.2444 19.6182 18.3776 18.9905 19Z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M9 12.8929L10.8 14.5L15 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-xs drop-shadow-md font-thin flex items-center mb-3">
              Specialist at {listingTitle}
            </p>

            {/* Stats section matching ListingCard */}
            <div className="flex items-center justify-between bg-white/20 border-white/30 border backdrop-blur-md rounded-lg px-4 py-3 text-white mb-3">
              {/* Followers */}
              <div className="flex flex-col items-center justify-between min-h-[40px] space-y-1 text-center">
                <div className="flex items-center space-x-1 h-[20px]">
                  <Users size={16} />
                  <span className="text-xs font-medium">{employee.followerCount || '1.2k'}</span>
                </div>
                <span className="text-xs opacity-70">Followers</span>
              </div>

              <div className="w-px h-8 bg-white/30"></div>

              {/* Rating */}
              <div className="flex flex-col items-center justify-between min-h-[40px] space-y-1 text-center">
                <div className="flex items-center space-x-1 h-[20px]">
                  <Star size={16} />
                  <span className="text-xs font-medium">4.9</span>
                </div>
                <span className="text-xs opacity-70">Rating</span>
              </div>

              <div className="w-px h-8 bg-white/30"></div>

              {/* Availability */}
              <div className="flex flex-col items-center justify-between min-h-[40px] space-y-1 text-center">
                <div className="flex items-center space-x-1 h-[20px]">
                  <Clock size={15} className="text-white/80" />
                  <span className="text-xs font-medium">Available</span>
                </div>
                <span className="text-xs opacity-70">Mon-Fri</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom action section integrated into gradient background */}
        <div className="px-5 pb-4 pt-2 -mt-3 relative z-20">
          <div className="flex gap-3">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleFollow();
              }}
              className={`flex-1 p-3 rounded-xl transition-all duration-200 shadow-sm backdrop-blur-md ${
                isFollowing
                  ? 'bg-white/20 text-white hover:bg-white/30'
                  : 'bg-white/30 text-white hover:bg-white/40'
              }`}
            >
              <div className="flex items-center text-center justify-center gap-2">
                <UserPlus size={18} />
                <span className="font-medium text-sm">
                  {isFollowing ? 'Following' : 'Follow'}
                </span>
              </div>
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="bg-white/20 text-white p-3 rounded-xl hover:bg-white/30 transition-all duration-200 shadow-sm backdrop-blur-md"
            >
              <MessageCircle size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerCard;