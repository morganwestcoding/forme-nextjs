// components/listings/WorkerCard.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { SafeListing, SafeUser, SafeEmployee } from '@/app/types';
import SmartBadgeWorker from './SmartBadgeWorker';
import HeartButton from '../HeartButton';

interface WorkerCardProps {
  employee: SafeEmployee & {
    followerCount?: number;
    followingCount?: number;
    profileImage?: string | null;
    jobTitle?: string | null;
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
  listing: SafeListing;
  currentUser?: SafeUser | null;
  onFollow?: () => void;
  onBook?: () => void;
}

/** ---------- Helpers ---------- */
const getInitials = (fullName?: string) => {
  if (!fullName) return 'U';
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    const a = parts[0][0]?.toUpperCase() ?? 'U';
    const b = parts[0][1]?.toUpperCase() ?? '';
    return (a + b).slice(0, 2);
  }
  const first = parts[0][0]?.toUpperCase() ?? '';
  const last = parts[parts.length - 1][0]?.toUpperCase() ?? '';
  return (first + last) || 'U';
};

const stringToColor = (seed: string, s = 70, l = 45) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    // eslint-disable-next-line no-bitwise
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, ${s}%, ${l}%)`;
};

const WorkerCard: React.FC<WorkerCardProps> = ({
  employee,
  listingTitle,
  data,
  listing,
  currentUser,
}) => {
  const [/*isFollowing*/, setIsFollowing] = useState(false);
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/listings/${listing.id}`);
  };

  // Memoize initials + bg for perf
  const initials = useMemo(() => getInitials(employee.fullName), [employee.fullName]);
  const avatarBg = useMemo(
    () => stringToColor(`${employee.id}${employee.fullName}`),
    [employee.id, employee.fullName]
  );

  const jobLabel = employee.jobTitle
    ? `${employee.jobTitle} at ${listingTitle}`
    : `Specialist at ${listingTitle}`;

  return (
    <div
      onClick={handleCardClick}
      className="cursor-pointer bg-white rounded-2xl shadow hover:shadow-xl  overflow-hidden relative transition-all duration-300 hover:scale-[1.02] max-w-[250px]"
    >
      {/* Match ListingCard height structure */}
      <div className="relative h-[350px]">
        {/* Heart - Using HeartButton component */}
        <div className="absolute top-4 right-4 z-20">
          <HeartButton
            listingId={employee.id}
            currentUser={currentUser}
            variant="worker"
          />
        </div>

        {/* Avatar - Centered towards middle-top */}
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-white font-semibold shadow-lg ring-4 ring-white/50"
              style={{ backgroundColor: avatarBg }}
              aria-label="Employee initials"
              title={employee.fullName}
            >
              {initials}
            </div>
            
            {/* Verified badge */}
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="#60A5FA"
                className="shrink-0"
              >
                <path
                  d="M18.9905 19H19M18.9905 19C18.3678 19.6175 17.2393 19.4637 16.4479 19.4637C15.4765 19.4637 15.0087 19.6537 14.3154 20.347C13.7251 20.9374 12.9337 22 12 22C11.0663 22 10.2749 20.9374 9.68457 20.347C8.99128 19.6537 8.52349 19.4637 7.55206 19.4637C6.76068 19.4637 5.63218 19.6175 5.00949 19C4.38181 18.3776 4.53628 17.2444 4.53628 16.4479C4.53628 15.4414 4.31616 14.9786 3.59938 14.2618C2.53314 13.1956 2.00002 12.6624 2 12C2.00001 11.3375 2.53312 10.8044 3.59935 9.73817C4.2392 9.09832 4.53628 8.46428 4.53628 7.55206C4.53628 6.76065 4.38249 5.63214 5 5.00944C5.62243 4.38178 6.7556 4.53626 7.55208 4.53626C8.46427 4.53626 9.09832 4.2392 9.73815 3.59937C10.8044 2.53312 11.3375 2 12 2C12.6625 2 13.1956 2.53312 14.2618 3.59937C14.9015 4.23907 15.5355 4.53626 16.4479 4.53626C17.2393 4.53626 18.3679 4.38247 18.9906 5C19.6182 5.62243 19.4637 6.75559 19.4637 7.55206C19.4637 8.55858 19.6839 9.02137 20.4006 9.73817C21.4669 10.8044 22 11.3375 22 12C22 12.6624 21.4669 13.1956 20.4006 14.2618C19.6838 14.9786 19.4637 15.4414 19.4637 16.4479C19.4637 17.2444 19.6182 18.3776 18.9905 19Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M9 12.8929L10.8 14.5L15 9.5"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Bottom info - positioned like ListingCard */}
        <div className="absolute bottom-5 left-5 right-5 z-20">
          {/* Name and Title */}
          <div className="mb-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {employee.fullName}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {jobLabel}
            </p>
          </div>

          {/* SmartBadge */}
          <div className="flex items-center">
            <SmartBadgeWorker
              employee={employee}
              listingTitle={listingTitle}
              followerCount={employee.followerCount || 1247}
            />
          </div>
        </div>
      </div>

      {/* Match ListingCard bottom padding */}
      <div className="pb-2" />
    </div>
  );
};

export default WorkerCard;