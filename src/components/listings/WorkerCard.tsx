'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  SafeListing,
  SafeReservation,
  SafeUser,
  SafeEmployee,
  SafeService,
} from '@/app/types';
import SmartBadgeWorker from './SmartBadgeWorker';
import useReservationModal from '@/app/hooks/useReservationModal';
import useLoginModal from '@/app/hooks/useLoginModal';
import {
  Heart,
  Clock,
  Star,
  User,
  Scissors,
  Droplet,
  SprayCan,
  Waves,
  Palette,
  Flower,
  Dumbbell,
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
  listing: SafeListing;
  currentUser?: SafeUser | null;
  onFollow?: () => void;
  onBook?: () => void;
}

/** ---------- Helpers moved here (fixes TS2304) ---------- */
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
/** ------------------------------------------------------- */

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
      Spa: { icon: <Waves className="w-3 h-3" /> },
      Beauty: { icon: <Palette className="w-3 h-3" /> },
      Barber: { icon: <Scissors className="w-3 h-3" /> },
      Fitness: { icon: <Dumbbell className="w-3 h-3" /> },
      Salon: { icon: <SprayCan className="w-3 h-3" /> },
      Wellness: { icon: <Flower className="w-3 h-3" /> },
      Skincare: { icon: <Droplet className="w-3 h-3" /> },
    };
    return configs[category] || { icon: <Star className="w-3 h-3" /> };
  };

  const handleCardClick = () => {
    router.push(`/listings/${listing.id}`);
  };

  const handleFollow = () => {
    setIsFollowing((v) => !v);
    onFollow?.();
  };

  const handleReserveClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!currentUser) {
      loginModal.onOpen();
      return;
    }

    // Open reservation modal with employee pre-selected
    reservationModal.onOpen(listing, currentUser, undefined, employee.id);
  };

  // Memoize initials + bg for perf
  const initials = useMemo(() => getInitials(employee.fullName), [employee.fullName]);
  const avatarBg = useMemo(
    () => stringToColor(`${employee.id}${employee.fullName}`),
    [employee.id, employee.fullName]
  );

  return (
    <div
      onClick={handleCardClick}
      className="cursor-pointer bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden relative"
    >
      {/* Full background image */}
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
          {/* Category badge */}
          <div className="absolute top-4 left-6 z-20">
            <div className="bg-white/90 backdrop-blur-md border border-white/30 rounded-xl text-center w-24 py-2 shadow-lg hover:bg-white/30 transition-all duration-300">
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-xs font-normal text-black tracking-wide">
                  {data.category}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom content */}
          <div className="absolute bottom-5 left-5 right-5 text-white z-20">
            {/* ======= MOVED PROFILE HEADER OUTSIDE THE BADGE ======= */}
            <div className="flex items-center gap-3 mb-3 px-3 pt-3">
              {/* Initials avatar */}
              <div className="relative w-16 h-16 flex-shrink-0">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white font-semibold shadow-lg border-2 border-white/50"
                  style={{ backgroundColor: avatarBg }}
                  aria-label="Employee initials"
                  title={employee.fullName}
                >
                  {initials}
                </div>
              </div>

              {/* Name and title */}
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h1 className="text-lg font-medium text-white drop-shadow-lg">
                    {employee.fullName}
                  </h1>
                  {/* Verified-ish glyph */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="#60A5FA"
                    className="text-white"
                  >
                    <path
                      d="M18.9905 19H19M18.9905 19C18.3678 19.6175 17.2393 19.4637 16.4479 19.4637C15.4765 19.4637 15.0087 19.6537 14.3154 20.347C13.7251 20.9374 12.9337 22 12 22C11.0663 22 10.2749 20.9374 9.68457 20.347C8.99128 19.6537 8.52349 19.4637 7.55206 19.4637C6.76068 19.4637 5.63218 19.6175 5.00949 19C4.38181 18.3776 4.53628 17.2444 4.53628 16.4479C4.53628 15.4414 4.31616 14.9786 3.59938 14.2618C2.53314 13.1956 2.00002 12.6624 2 12C2.00001 11.3375 2.53312 10.8044 3.59935 9.73817C4.2392 9.09832 4.53628 8.46428 4.53628 7.55206C4.53628 6.76065 4.38249 5.63214 5 5.00944C5.62243 4.38178 6.7556 4.53626 7.55208 4.53626C8.46427 4.53626 9.09832 4.2392 9.73815 3.59937C10.8044 2.53312 11.3375 2 12 2C12.6625 2 13.1956 2.53312 14.2618 3.59937C14.9015 4.23907 15.5355 4.53626 16.4479 4.53626C17.2393 4.53626 18.3679 4.38247 18.9906 5C19.6182 5.62243 19.4637 6.75559 19.4637 7.55206C19.4637 8.55858 19.6839 9.02137 20.4006 9.73817C21.4669 10.8044 22 11.3375 22 12C22 12.6624 21.4669 13.1956 20.4006 14.2618C19.6838 14.9786 19.4637 15.4414 19.4637 16.4479C19.4637 17.2444 19.6182 18.3776 18.9905 19Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M9 12.8929L10.8 14.5L15 9.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="text-xs text-white/80 font-light drop-shadow-md">
                  Specialist at {listingTitle}
                </p>
              </div>
            </div>
            {/* ======= Profile header ends ======= */}

            {/* Badge (rating/followers only) */}
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

        {/* Bottom action section */}
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
