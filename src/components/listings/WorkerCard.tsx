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
  CheckCircle
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
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
      {/* Header with gradient background */}
      <div className="relative h-28 bg-gradient-to-br from-[#60A5FA] via-[#9bc7fd] to-[#60A5FA]">
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Action buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button 
            onClick={handleBookmark}
            className={`p-2 rounded-full backdrop-blur-md transition-all duration-200 ${
              isBookmarked 
                ? 'bg-white/30 text-yellow-400' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>
          <button 
            onClick={onBook}
            className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-md transition-all duration-200"
          >
            <Calendar size={18} />
          </button>
        </div>

        {/* Profile image */}
        <div className="absolute -bottom-12 left-6">
          <Image
            src={employee.profileImage || '/people/headshot-3.png'}
            alt={employee.fullName}
            width={96}
            height={96}
            className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg object-cover"
          />
        </div>
      </div>

      {/* Main content */}
      <div className="pt-16 pb-6 px-6">
        {/* Name and verification */}
        <div className="flex items-center text-white gap-2 mb-1">
          <h1 className="text-xl font-bold text-gray-900">{employee.fullName}</h1>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#60A5FA">
                <path d="M18.9905 19H19M18.9905 19C18.3678 19.6175 17.2393 19.4637 16.4479 19.4637C15.4765 19.4637 15.0087 19.6537 14.3154 20.347C13.7251 20.9374 12.9337 22 12 22C11.0663 22 10.2749 20.9374 9.68457 20.347C8.99128 19.6537 8.52349 19.4637 7.55206 19.4637C6.76068 19.4637 5.63218 19.6175 5.00949 19C4.38181 18.3776 4.53628 17.2444 4.53628 16.4479C4.53628 15.4414 4.31616 14.9786 3.59938 14.2618C2.53314 13.1956 2.00002 12.6624 2 12C2.00001 11.3375 2.53312 10.8044 3.59935 9.73817C4.2392 9.09832 4.53628 8.46428 4.53628 7.55206C4.53628 6.76065 4.38249 5.63214 5 5.00944C5.62243 4.38178 6.7556 4.53626 7.55208 4.53626C8.46427 4.53626 9.09832 4.2392 9.73815 3.59937C10.8044 2.53312 11.3375 2 12 2C12.6625 2 13.1956 2.53312 14.2618 3.59937C14.9015 4.23907 15.5355 4.53626 16.4479 4.53626C17.2393 4.53626 18.3679 4.38247 18.9906 5C19.6182 5.62243 19.4637 6.75559 19.4637 7.55206C19.4637 8.55858 19.6839 9.02137 20.4006 9.73817C21.4669 10.8044 22 11.3375 22 12C22 12.6624 21.4669 13.1956 20.4006 14.2618C19.6838 14.9786 19.4637 15.4414 19.4637 16.4479C19.4637 17.2444 19.6182 18.3776 18.9905 19Z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M9 12.8929L10.8 14.5L15 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
        </div>

        {/* Role and business */}
        <div className="flex items-center gap-2 text-xs mb-3">
          <span className="text-gray-600 font-medium">{employee.jobTitle || 'Team Member'} at</span>
          <span className="text-[#60A5FA] font-semibold">{listingTitle}</span>
        </div>

        {/* Bio */}
        <p className="text-gray-700 text-xs mb-4 leading-relaxed">
          Passionate about delivering quality care. Loves working with people and learning new skills.
        </p>

        {/* Availability badge */}
        <div className="inline-flex text-xs items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-full  font-medium mb-6">
          <Clock size={14} />
          Available Mon-Fri
        </div>

        {/* Stats 
        <div className="flex justify-between mb-6 bg-gray-50 rounded-2xl p-4">
          <div className="text-center">
            <div className="text-sm font-bold text-gray-900">{employee.followerCount || 0}</div>
            <div className="text-sm text-gray-600">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-gray-900">{employee.followingCount || 0}</div>
            <div className="text-sm text-gray-600">Following</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-gray-900">342</div>
            <div className="text-sm text-gray-600">Services</div>
          </div>
        </div>
        */}

        {/* Action buttons */}
        <div className="flex gap-3">
          <button 
            onClick={handleFollow}
            className={`flex-1 py-3 px-4 rounded-xl  transition-all duration-200 ${
              isFollowing
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-[#60A5FA] text-white hover:bg-[#89bcfb] shadow-sm'
            }`}
          >
            <div className="flex items-center text-sm justify-center gap-2">
              <UserPlus size={18} />
              {isFollowing ? 'Following' : 'Follow'}
            </div>
          </button>
          <button className="py-3 px-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200">
            <MessageCircle size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkerCard;