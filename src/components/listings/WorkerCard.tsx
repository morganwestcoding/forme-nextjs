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
    <div className="cursor-pointer bg-white rounded-xl shadow-sm hover:shadow-2xl overflow-hidden relative">
      <div className="relative z-10">
        {/* Full height container matching ListingCard */}
        <div className="relative h-[345px] overflow-hidden">
          {/* Gradient background - starts from middle of profile picture */}
          <div className="absolute top-0 left-0 right-0 h-[130px] bg-gradient-to-br from-[#60A5FA] via-[#89bcfb] to-[#60A5FA]"></div>
          
          {/* White background for bottom section */}
          <div className="absolute bottom-0 left-0 right-0 h-[155px] bg-white"></div>

          {/* Top badge */}
          <div className="absolute top-4 left-4 z-20">
            <div className="bg-neutral-100 text-neutral-600 border rounded-lg text-center w-20 py-1.5">
              <span className="text-xs text-center font-medium">{employee.jobTitle || 'Team'}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="absolute top-4 right-4 flex gap-2 z-20">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleBookmark();
              }}
              className={`p-2.5 rounded-full border border-white/20 backdrop-blur-md transition-all duration-200 ${
                isBookmarked 
                  ? 'bg-white/30 text-yellow-400' 
                  : 'bg-white/10  text-white hover:bg-white/30'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" color="currentColor" fill="none">
    <path d="M4 17.9808V9.70753C4 6.07416 4 4.25748 5.17157 3.12874C6.34315 2 8.22876 2 12 2C15.7712 2 17.6569 2 18.8284 3.12874C20 4.25748 20 6.07416 20 9.70753V17.9808C20 20.2867 20 21.4396 19.2272 21.8523C17.7305 22.6514 14.9232 19.9852 13.59 19.1824C12.8168 18.7168 12.4302 18.484 12 18.484C11.5698 18.484 11.1832 18.7168 10.41 19.1824C9.0768 19.9852 6.26947 22.6514 4.77285 21.8523C4 21.4396 4 20.2867 4 17.9808Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
</svg>
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onBook?.();
              }}
              className="p-2.5 rounded-full bg-white/10 text-white border border-white/20 hover:bg-white/30 backdrop-blur-md transition-all duration-200"
            >
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" color="currentColor" fill="none">
    <path d="M16 2V6M8 2V6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M13 4H11C7.22876 4 5.34315 4 4.17157 5.17157C3 6.34315 3 8.22876 3 12V14C3 17.7712 3 19.6569 4.17157 20.8284C5.34315 22 7.22876 22 11 22H13C16.7712 22 18.6569 22 19.8284 20.8284C21 19.6569 21 17.7712 21 14V12C21 8.22876 21 6.34315 19.8284 5.17157C18.6569 4 16.7712 4 13 4Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M3 10H21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M11.9955 14H12.0045M11.9955 18H12.0045M15.991 14H16M8 14H8.00897M8 18H8.00897" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
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
                    className="w-full h-full border-4 border-white rounded-xl object-cover"
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

            {/* Stats section with white background styling */}
<div className="relative bg-gray-50 rounded-2xl p-1 border border-gray-200">
  <div className="flex items-center">
    {/* Likes and Rating - Grouped closer */}
    <div className="flex items-center flex-[2]">
      {/* Likes - Interactive */}
      <button 
        onClick={() => {
          // Handle like toggle with null checks
          const likesElement = document.querySelector('.likes-count');
          if (likesElement && likesElement.textContent) {
            const currentLikes = parseInt(likesElement.textContent.replace('k', '').replace('K', ''));
            const newCount = currentLikes === 3.8 ? 3.9 : 3.8;
            likesElement.textContent = newCount + 'K';
          }
        }}
        className="flex-1 flex flex-col items-center py-3 hover:bg-gray-100 transition-colors duration-200 group rounded-xl"
      >
        <div className="w-2 h-2 bg-pink-500 rounded-full mb-3 likes-dot group-hover:animate-pulse opacity-70 group-hover:opacity-100 transition-all duration-200"></div>
        <div className="text-xs font-medium text-gray-900 leading-none mb-1 likes-count">3.8K</div>
        <div className="text-xs text-neutral-400  font-medium">Likes</div>
      </button>

      {/* Divider between likes and rating */}
      <div className="w-px h-7 bg-gray-300 mx-1.5"></div>

      {/* Rating - Interactive */}
      <button 
        onClick={() => {
          // Handle rating interaction (could open rating modal)
          console.log('Rating clicked');
        }}
        className="flex-1 flex flex-col items-center py-3 hover:bg-gray-100 transition-colors duration-200 group rounded-xl"
      >
        <div className="w-2 h-2 bg-yellow-500 rounded-full mb-3 group-hover:animate-pulse opacity-70 group-hover:opacity-100 transition-all duration-200"></div>
        <div className="text-xs font-medium text-gray-900 leading-none mb-1">4.7</div>
        <div className="text-xs text-neutral-400  font-medium">Rating</div>
      </button>
    </div>

    {/* Main divider between groups */}
    <div className="w-px h-7 bg-gray-300 mx-1.5"></div>

    {/* Hours - Interactive with time range */}
    <button 
      onClick={() => {
        // Handle hours interaction (could show detailed hours)
        console.log('Hours clicked');
      }}
      className="flex-1 flex flex-col items-center py-3 hover:bg-gray-100 transition-colors duration-200 group rounded-xl"
    >
      <div className="w-2 h-2 bg-green-500 rounded-full mb-3 group-hover:animate-pulse opacity-70 group-hover:opacity-100 transition-all duration-200"></div>
      <div className="text-xs font-medium text-gray-900 leading-none mb-1">5:00/9:00</div>
      <div className="text-xs text-neutral-400  font-medium">Open</div>
    </button>
  </div>
</div>
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
<button 
  onClick={(e) => {
    e.stopPropagation();
  }}
  className="bg-neutral-100 text-neutral-600 p-3 rounded-xl hover:bg-gray-200 transition-all duration-200 flex items-center justify-center"
>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" color="currentColor" fill="none">
    <path d="M2 6L8.91302 9.91697C11.4616 11.361 12.5384 11.361 15.087 9.91697L22 6" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
    <path d="M2.01577 13.4756C2.08114 16.5412 2.11383 18.0739 3.24496 19.2094C4.37608 20.3448 5.95033 20.3843 9.09883 20.4634C11.0393 20.5122 12.9607 20.5122 14.9012 20.4634C18.0497 20.3843 19.6239 20.3448 20.7551 19.2094C21.8862 18.0739 21.9189 16.5412 21.9842 13.4756C22.0053 12.4899 22.0053 11.5101 21.9842 10.5244C21.9189 7.45886 21.8862 5.92609 20.7551 4.79066C19.6239 3.65523 18.0497 3.61568 14.9012 3.53657C12.9607 3.48781 11.0393 3.48781 9.09882 3.53656C5.95033 3.61566 4.37608 3.65521 3.24495 4.79065C2.11382 5.92608 2.08114 7.45885 2.01576 10.5244C1.99474 11.5101 1.99475 12.4899 2.01577 13.4756Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
</svg>
</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerCard;