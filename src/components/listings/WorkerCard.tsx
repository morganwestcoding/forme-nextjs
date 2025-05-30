'use client';

import React from 'react';
import Image from 'next/image';
import { SafeEmployee } from '@/app/types';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

interface WorkerCardProps {
  employee: SafeEmployee & { followerCount?: number; followingCount?: number };
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
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg p-4 w-full h-[335px] relative flex flex-col justify-between">
      {/* Top Row: Profile + Buttons */}
      <div className="flex justify-between items-start">
        <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200">
          <Image
            src={employee.profileImage || '/people/headshot-3.png'}
            alt={employee.fullName}
            width={64}
            height={64}
            className="object-cover"
          />
        </div>
        <div className="flex gap-2">
          <button
         
            className="rounded-full p-3 bg-neutral-100 text-gray-500 border hover:bg-neutral-200"
            onClick={onFollow}
          >
            <UserPlus size={16} />
          </button>
          <button
        
            className="rounded-full p-3 bg-[#60A5FA]/50 backdrop-blur-md text-white border border-white/10 hover:bg-white/10"
            onClick={onBook}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none">
              <path d="M16 2V6M8 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13 4H11C7.22876 4 5.34315 4 4.17157 5.17157C3 6.34315 3 8.22876 3 12V14C3 17.7712 3 19.6569 4.17157 20.8284C5.34315 22 7.22876 22 11 22H13C16.7712 22 18.6569 22 19.8284 20.8284C21 19.6569 21 17.7712 21 14V12C21 8.22876 21 6.34315 19.8284 5.17157C18.6569 4 16.7712 4 13 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 10H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M11.9955 14H12.0045M11.9955 18H12.0045M15.991 14H16M8 14H8.00897M8 18H8.00897" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-4">
        <h2 className="text-xl font-bold text-gray-900 truncate">{employee.fullName}</h2>
        <p className="text-sm text-gray-500 truncate">{employee.jobTitle || 'Team Member'}</p>
        <p className="text-xs text-gray-400 truncate">at {listingTitle}</p>
        <div className="text-xs text-gray-400 mt-2 space-y-1">
          <p>Passionate about delivering quality care.</p>
          <p>Loves working with people and learning new skills.</p>
          <p>Available for appointments Mon–Fri.</p>
        </div>
      </div>

      {/* Followers/Following Section */}
      <div className="mt-4 bg-neutral-100 border rounded-lg px-4 py-2 text-neutral-600 flex items-center justify-between text-sm">
        <div className="flex flex-col items-center justify-center text-center w-full">
          <span className="font-semibold">{employee.followerCount || 0}</span>
          <span className="text-xs">Followers</span>
        </div>
        <div className="w-px h-6 bg-neutral-300" />
        <div className="flex flex-col items-center justify-center text-center w-full">
          <span className="font-semibold">{employee.followingCount || 0}</span>
          <span className="text-xs">Following</span>
        </div>
      </div>
    </div>
  );
};

export default WorkerCard;
