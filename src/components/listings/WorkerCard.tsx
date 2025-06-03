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
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg p-4 w-full h-[402px] relative flex flex-col justify-between">
      {/* Top Row: Profile + Buttons */}
      <div className="flex justify-between items-start">
        <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
          <Image
            src={employee.profileImage || '/people/headshot-3.png'}
            alt={employee.fullName}
            width={80}
            height={80}
            className="object-cover"
          />
        </div>
        <div className="flex gap-2">
          <button

className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-100 text-gray-500 border border-neutral-100 shadow-sm hover:bg-neutral-200"

            onClick={onFollow}
          >
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" color="currentColor" fill="none">
    <path d="M4 17.9808V9.70753C4 6.07416 4 4.25748 5.17157 3.12874C6.34315 2 8.22876 2 12 2C15.7712 2 17.6569 2 18.8284 3.12874C20 4.25748 20 6.07416 20 9.70753V17.9808C20 20.2867 20 21.4396 19.2272 21.8523C17.7305 22.6514 14.9232 19.9852 13.59 19.1824C12.8168 18.7168 12.4302 18.484 12 18.484C11.5698 18.484 11.1832 18.7168 10.41 19.1824C9.0768 19.9852 6.26947 22.6514 4.77285 21.8523C4 21.4396 4 20.2867 4 17.9808Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
</svg>
          </button>
          <button
            
        className="w-10 h-10 flex items-center justify-center rounded-full bg-[#60A5FA] backdrop-blur-md text-white shadow-sm border-white/10 hover:bg-white/10"
            onClick={onBook}
          >
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" color="currentColor" fill="none">
    <path d="M16 2V6M8 2V6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M13 4H11C7.22876 4 5.34315 4 4.17157 5.17157C3 6.34315 3 8.22876 3 12V14C3 17.7712 3 19.6569 4.17157 20.8284C5.34315 22 7.22876 22 11 22H13C16.7712 22 18.6569 22 19.8284 20.8284C21 19.6569 21 17.7712 21 14V12C21 8.22876 21 6.34315 19.8284 5.17157C18.6569 4 16.7712 4 13 4Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M3 10H21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M11.9955 14H12.0045M11.9955 18H12.0045M15.991 14H16M8 14H8.00897M8 18H8.00897" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
</svg>
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-4">
        <h2 className="text-xl font-bold text-gray-900 truncate flex items-center gap-1">
          {employee.fullName}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#60A5FA" color='#ffffff'>
            <path d="M18.9905 19H19M18.9905 19C18.3678 19.6175 17.2393 19.4637 16.4479 19.4637C15.4765 19.4637 15.0087 19.6537 14.3154 20.347C13.7251 20.9374 12.9337 22 12 22C11.0663 22 10.2749 20.9374 9.68457 20.347C8.99128 19.6537 8.52349 19.4637 7.55206 19.4637C6.76068 19.4637 5.63218 19.6175 5.00949 19C4.38181 18.3776 4.53628 17.2444 4.53628 16.4479C4.53628 15.4414 4.31616 14.9786 3.59938 14.2618C2.53314 13.1956 2.00002 12.6624 2 12C2.00001 11.3375 2.53312 10.8044 3.59935 9.73817C4.2392 9.09832 4.53628 8.46428 4.53628 7.55206C4.53628 6.76065 4.38249 5.63214 5 5.00944C5.62243 4.38178 6.7556 4.53626 7.55208 4.53626C8.46427 4.53626 9.09832 4.2392 9.73815 3.59937C10.8044 2.53312 11.3375 2 12 2C12.6625 2 13.1956 2.53312 14.2618 3.59937C14.9015 4.23907 15.5355 4.53626 16.4479 4.53626C17.2393 4.53626 18.3679 4.38247 18.9906 5C19.6182 5.62243 19.4637 6.75559 19.4637 7.55206C19.4637 8.55858 19.6839 9.02137 20.4006 9.73817C21.4669 10.8044 22 11.3375 22 12C22 12.6624 21.4669 13.1956 20.4006 14.2618C19.6838 14.9786 19.4637 15.4414 19.4637 16.4479C19.4637 17.2444 19.6182 18.3776 18.9905 19Z" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9 12.8929L10.8 14.5L15 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </h2>
        <p className="text-sm text-gray-500 truncate">{employee.jobTitle || 'Team Member'}</p>
        <p className="text-xs font-medium text-[#60A5FA] truncate">{listingTitle}</p>
        <div className="text-xs text-gray-400 mt-2 space-y-1">
          <p>Passionate about delivering quality care.</p>
          <p>Loves working with people and learning new skills.</p>
        </div>
        <div className="mt-3 bg-neutral-100 border rounded-md px-2 py-1 w-fit text-[11px] font-semibold text-neutral-600">
          Available for appointments Mon–Fri.
        </div>
      </div>

      {/* Followers/Following Section */}
      <div className="mt-4 bg-neutral-100 border rounded-lg px-4 py-2 text-neutral-600 flex items-center justify-between text-sm">
        <div className="flex flex-col items-center justify-center w-full">
          <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" className="text-gray-500">
              <path d="M18.5 20V17.9704C18.5 16.7281 17.9407 15.5099 16.8103 14.9946C15.4315 14.3661 13.7779 14 12 14C10.2221 14 8.5685 14.3661 7.18968 14.9946C6.05927 15.5099 5.5 16.7281 5.5 17.9704V20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
              <circle cx="12" cy="7.5" r="3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></circle>
            </svg>
            <span className="font-semibold ml-1">{employee.followerCount || 0}</span>
          </div>
          <span className="text-xs">Followers</span>
        </div>
        <div className="w-px h-6 bg-neutral-300" />
        <div className="flex flex-col items-center justify-center w-full">
          <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" className="text-gray-500">
              <path d="M18.5 20V17.9704C18.5 16.7281 17.9407 15.5099 16.8103 14.9946C15.4315 14.3661 13.7779 14 12 14C10.2221 14 8.5685 14.3661 7.18968 14.9946C6.05927 15.5099 5.5 16.7281 5.5 17.9704V20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
              <circle cx="12" cy="7.5" r="3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></circle>
            </svg>
            <span className="font-semibold ml-1">{employee.followingCount || 0}</span>
          </div>
          <span className="text-xs">Following</span>
        </div>
      </div>
    </div>
  );
};

export default WorkerCard;
