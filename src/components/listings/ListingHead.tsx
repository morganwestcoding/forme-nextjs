'use client';

import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import ServiceCard from './ServiceCard';
import WorkerCard from './WorkerCard';
import PostCard from '../feed/PostCard';
import SmartBadgeListing from './SmartBadgeListing';
import { SafePost, SafeUser, SafeListing } from '@/app/types';
import useReservationModal from '@/app/hooks/useReservationModal';
import useRentModal from '@/app/hooks/useListingModal';
import OpenStatus from './OpenStatus';

interface ServiceItem {
  id: string;
  serviceName: string;
  price: number;
  category: string;
  imageSrc?: string | null;
  description?: string;
  popular?: boolean;
}

type TabKey = 'Services' | 'Team' | 'Reviews' | 'Images' | 'Reels';

interface ListingHeadProps {
  listing: SafeListing & { user: SafeUser };
  currentUser?: SafeUser | null;
  Services: ServiceItem[];
  posts?: SafePost[];
  categories?: any[];
}

const ListingHead: React.FC<ListingHeadProps> = ({
  listing,
  currentUser,
  Services,
  posts = [],
  categories = []
}) => {
  const router = useRouter();

  const { title, location, galleryImages, imageSrc, description, employees = [], user, storeHours = [] } = listing;

  const initialFollowers = useMemo<string[]>(
    () => (Array.isArray((listing as any).followers) ? (listing as any).followers : []),
    [listing]
  );
  const [followers, setFollowers] = useState<string[]>(initialFollowers);

  const isFollowing = !!currentUser?.id && followers.includes(currentUser.id);
  const [activeTab, setActiveTab] = useState<TabKey>('Services');
  const [city, state] = location?.split(',').map(s => s.trim()) || [];

  const reservationModal = useReservationModal();
  const rentModal = useRentModal();

  const mainImage = imageSrc || galleryImages?.[0] || '/placeholder.jpg';

  const handleReserveClick = () => {
    if (!currentUser) return;
    reservationModal.onOpen(listing, currentUser);
  };

  const isOwner = !!currentUser?.id && currentUser.id === user?.id;

  const handleToggleFollow = async () => {
    if (isOwner) return;
    if (!currentUser?.id) return;

    setFollowers(prev =>
      prev.includes(currentUser.id)
        ? prev.filter(id => id !== currentUser.id)
        : [...prev, currentUser.id]
    );

    try {
      const res = await axios.post(`/api/follow/${listing.id}?type=listing`);
      const updated = res.data as { followers?: string[] };
      if (Array.isArray(updated?.followers)) {
        setFollowers(updated.followers);
      }
    } catch (err) {
      setFollowers(prev =>
        prev.includes(currentUser.id)
          ? prev.filter(id => id !== currentUser.id)
          : [...prev, currentUser.id]
      );
    }
  };

  const validServices = useMemo(
    () =>
      (Services || []).filter(
        (s) => (s.serviceName?.trim()?.length ?? 0) > 0 && Number(s.price) > 0
      ),
    [Services]
  );

  const handleAddService = () => {
    if (!isOwner) return;
    const url = new URL(window.location.href);
    url.searchParams.set('addService', '1');
    router.push(`${url.pathname}?${url.searchParams.toString()}`, { scroll: false });
    rentModal.onOpen(listing);
  };

  const handleAddWorker = () => {
    if (!isOwner) return;
    const url = new URL(window.location.href);
    url.searchParams.set('addWorker', '1');
    router.push(`${url.pathname}?${url.searchParams.toString()}`, { scroll: false });
  };

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: 'Services', label: 'Services' },
    { key: 'Team', label: 'Team' },
    { key: 'Reviews', label: 'Reviews' },
    { key: 'Images', label: 'Images' },
    { key: 'Reels', label: 'Reels' },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Header - Full Width */}
      <div className="w-full relative">
        <div className="flex gap-6 items-center">
          {/* Left: Image with Gallery Icon */}
          <div className="flex-shrink-0">
            <div className="w-[192px] h-[192px] rounded-xl overflow-hidden relative hover:shadow-md transition-shadow group">
              <img
                src={mainImage}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Gallery icon overlay - bottom right */}
{/* Gallery icon overlay - bottom right */}
<button
  onClick={() => setActiveTab('Images')}
  className="absolute bottom-3 right-3 hover:scale-105 transition-transform cursor-pointer"
  type="button"
  aria-label="View gallery"
>
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    width="28" 
    height="28" 
    className="drop-shadow-lg"
    fill="none"
  >
    <path 
      d="M3 16L7.46967 11.5303C7.80923 11.1908 8.26978 11 8.75 11C9.23022 11 9.69077 11.1908 10.0303 11.5303L14 15.5M15.5 17L14 15.5M21 16L18.5303 13.5303C18.1908 13.1908 17.7302 13 17.25 13C16.7698 13 16.3092 13.1908 15.9697 13.5303L14 15.5" 
      stroke="rgba(255,255,255,0.6)" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M15.5 8C15.7761 8 16 7.77614 16 7.5C16 7.22386 15.7761 7 15.5 7M15.5 8C15.2239 8 15 7.77614 15 7.5C15 7.22386 15.2239 7 15.5 7M15.5 8V7" 
      stroke="rgba(255,255,255,0.6)" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M3.69797 19.7472C2.5 18.3446 2.5 16.2297 2.5 12C2.5 7.77027 2.5 5.6554 3.69797 4.25276C3.86808 4.05358 4.05358 3.86808 4.25276 3.69797C5.6554 2.5 7.77027 2.5 12 2.5C16.2297 2.5 18.3446 2.5 19.7472 3.69797C19.9464 3.86808 20.1319 4.05358 20.302 4.25276C21.5 5.6554 21.5 7.77027 21.5 12C21.5 16.2297 21.5 18.3446 20.302 19.7472C20.1319 19.9464 19.9464 20.1319 19.7472 20.302C18.3446 21.5 16.2297 21.5 12 21.5C7.77027 21.5 5.6554 21.5 4.25276 20.302C4.05358 20.1319 3.86808 19.9464 3.69797 19.7472Z" 
      stroke="rgba(255,255,255,0.6)" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
</button>
            </div>
          </div>

          {/* Right: Content - Flex to fill remaining space */}
          <div className="flex-1 rounded-xl p-8 border border-gray-200 bg-white relative">
            {/* Three-dot menu - top right */}
            <button
              onClick={() => console.log('Menu clicked')}
              className="absolute top-7 right-8 p-1 hover:bg-gray-100 rounded-lg transition-colors"
              type="button"
              aria-label="Options menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#6b7280" fill="none">
                <path d="M21 12C21 11.1716 20.3284 10.5 19.5 10.5C18.6716 10.5 18 11.1716 18 12C18 12.8284 18.6716 13.5 19.5 13.5C20.3284 13.5 21 12.8284 21 12Z" stroke="currentColor" strokeWidth="1.5" fill='#6b7280'></path>
                <path d="M13.5 12C13.5 11.1716 12.8284 10.5 12 10.5C11.1716 10.5 10.5 11.1716 10.5 12C10.5 12.8284 11.1716 13.5 12 13.5C12.8284 13.5 13.5 12.8284 13.5 12Z" stroke="currentColor" strokeWidth="1.5" fill='#6b7280'></path>
                <path d="M6 12C6 11.1716 5.32843 10.5 4.5 10.5C3.67157 10.5 3 11.1716 3 12C3 12.8284 3.67157 13.5 4.5 13.5C5.32843 13.5 6 12.8284 6 12Z" stroke="currentColor" strokeWidth="1.5" fill='#6b7280'></path>
              </svg>
            </button>

            <div className="flex flex-col h-full justify-between">
              {/* Title Row */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h1
                    className="text-2xl font-bold tracking-tight text-gray-900 leading-tight"
                    style={{ letterSpacing: '-0.025em' }}
                  >
                    {title}
                  </h1>

                  {/* Verified SVG next to the title */}
                  <div className=" text-[#60A5FA] inline-flex -mr-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      fill="#EFF6FF"
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
                </div>

                {/* Location & Status */}
{/* Location & Status */}
<div className="mb-4">
  <span className="inline-flex items-center gap-6 text-sm font-light text-black">
    {city}{state ? `, ${state}` : ''}
    <OpenStatus 
      storeHours={storeHours}
      className="text-emerald-500 font-medium"
    />
  </span>
</div>
              </div>

              {/* Stats Counters with Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  {/* Rating Counter */}
                  <div className="flex flex-col">
                    <button
                      onClick={() => setActiveTab('Reviews')}
                      className="flex items-center gap-1 hover:opacity-70 transition-opacity"
                      type="button"
                    >
                      <span className="text-xl font-bold text-gray-900">4.8</span>
                    </button>
                    <span className="text-xs text-gray-500 font-medium">Rating</span>
                  </div>

                  {/* Middot Divider */}
                  <span className="text-gray-400 text-lg">·</span>

                  {/* Posts Counter */}
                  <div className="flex flex-col">
                    <span className="text-xl font-bold text-gray-900">{posts?.length || 0}</span>
                    <span className="text-xs text-gray-500 font-medium">Posts</span>
                  </div>

                  {/* Middot Divider */}
                  <span className="text-gray-400 text-lg">·</span>

                  {/* Followers Counter */}
                  <div className="flex flex-col">
                    <span className="text-xl font-bold text-gray-900">{followers.length}</span>
                    <span className="text-xs text-gray-500 font-medium">Followers</span>
                  </div>
                </div>

                {/* Follow & Reserve Buttons - Right Side - Only for non-owners */}
                {!isOwner && (
                  <div className="flex items-center gap-2">
<button
  onClick={handleToggleFollow}
  className={`h-12 px-4 rounded-xl transition-all duration-500 flex items-center justify-center ${
    isFollowing
      ? 'bg-gradient-to-br from-blue-100/90 via-blue-50 to-blue-100/90 border border-[#60A5FA] shadow-sm hover:shadow-md hover:from-blue-100/80 hover:via-blue-50 hover:to-blue-100'
      : 'bg-gradient-to-br from-blue-50/20 via-white to-blue-50/20 border border-gray-200 hover:from-blue-50/30 hover:via-white hover:to-purple-50/30 hover:border-blue-200/50 hover:shadow-sm'
  }`}
  type="button"
  aria-label={isFollowing ? 'Unfollow' : 'Follow'}
>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="1.75" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        className={isFollowing ? 'text-blue-600' : 'text-gray-500'}
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <line x1="19" x2="19" y1="8" y2="14"/>
                        <line x1="22" x2="16" y1="11" y2="11"/>
                      </svg>
                    </button>
                    <button
                      onClick={handleReserveClick}
                      className="w-28 px-4 py-3 border border-gray-200 rounded-xl transition-all duration-300 bg-gradient-to-br from-blue-50/20 via-white to-blue-50/20 text-gray-500 hover:from-blue-50/30 hover:via-white hover:to-purple-50/30 hover:border-blue-200/50 flex items-center justify-center text-sm hover:shadow-sm"
                      type="button"
                    >
                      Reserve
                    </button>
                  </div>
                )}

                {/* Edit Button - Right Side - Only for owners */}
                {isOwner && (
                  <button
                    onClick={() => rentModal.onOpen(listing)}
                    className="w-28 px-4 py-3 rounded-xl transition-all duration-500 bg-gradient-to-br from-blue-100/90 via-blue-50 to-blue-100/90 border border-[#60A5FA] text-[#60A5FA] hover:shadow-md hover:from-blue-100/80 hover:via-blue-50 hover:to-blue-100 flex items-center justify-center text-sm"
                    type="button"
                  >
                    Edit Listing
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - MarketExplorer Style */}
      <div className="py-5 border-y border-gray-200">
        <div className="flex items-center justify-center">
          {tabs.map(({ key, label }, index) => {
            const isSelected = activeTab === key;
            const isLast = index === tabs.length - 1;

            return (
              <div key={key} className="relative flex items-center">
                <button
                  onClick={() => setActiveTab(key)}
                  className={`
                    px-6 py-2.5 text-sm transition-colors duration-200 rounded-lg
                    ${isSelected
                      ? 'text-[#60A5FA] hover:text-[#4F94E5]'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }
                  `}
                  type="button"
                >
                  {label}
                </button>

                {!isLast && (
                  <div className="h-6 w-px bg-gray-300 mx-3" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'Services' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {validServices.map(service => (
              <ServiceCard
                key={service.id}
                service={service}
                listing={listing}
                currentUser={currentUser}
                storeHours={storeHours}
              />
            ))}

            {isOwner && (
              <button
                onClick={handleAddService}
                type="button"
                className="cursor-pointer bg-white rounded-xl hover:shadow-md overflow-hidden relative transition-all duration-300 hover:scale-[1.02] max-w-[250px] border border-gray-200"
              >
                <div className="relative h-[350px]">
                  <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full flex items-center justify-center text-gray-500 bg-gray-50 border-2 border-gray-300 ring-4 ring-white/50 transition-all duration-300 group-hover:border-blue-500 group-hover:bg-blue-50 group-hover:text-blue-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-5 left-5 right-5 z-20">
                    <div className="mb-4">
                      <h3 className="text-lg  text-gray-500 mb-1 text-center">
                        Add Service
                      </h3>
                      <p className="text-xs text-gray-400 leading-relaxed text-center">
                        Create a new service offering
                      </p>
                      <div className="opacity-90 mt-0.5 text-xs text-gray-400 font-light text-center">
                        Click to get started
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <div className="bg-gray-100 text-gray-500 px-3 py-1.5 rounded-lg text-xs font-medium group-hover:bg-blue-100 group-hover:text-blue-500 group-hover:border-blue-500 transition-all duration-200">
                        Get Started
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pb-2" />
              </button>
            )}
          </div>
        )}

        {activeTab === 'Team' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {employees.map((employee: any, index: number) => (
              <WorkerCard
                key={employee.id || index}
                employee={employee}
                listingTitle={title}
                data={{ title, imageSrc: mainImage, category: (listing as any).category }}
                listing={listing}
                currentUser={currentUser}
                onFollow={() => { }}
                onBook={() => { }}
              />
            ))}

            {isOwner && (
              <button
                onClick={handleAddWorker}
                type="button"
                className="cursor-pointer bg-white rounded-xl hover:shadow-md overflow-hidden relative transition-all duration-300 hover:scale-[1.02] max-w-[250px] border border-gray-200"
              >
                <div className="relative h-[350px]">
                  <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full flex items-center justify-center text-gray-500 bg-gray-50 border-2 border-gray-300 ring-4 ring-white/50 transition-all duration-300 group-hover:border-blue-500 group-hover:bg-blue-50 group-hover:text-blue-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <line x1="19" y1="8" x2="19" y2="14" />
                          <line x1="22" y1="11" x2="16" y2="11" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-5 left-5 right-5 z-20">
                    <div className="mb-4">
                      <h3 className="text-lg  text-gray-500 mb-1 text-center">
                        Add Team Member
                      </h3>
                      <p className="text-xs text-gray-400 leading-relaxed text-center">
                        Invite a new team member
                      </p>
                      <div className="opacity-90 mt-0.5 text-xs text-gray-400 font-light text-center">
                        Click to get started
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <div className="bg-gray-100 text-gray-500 px-3 py-1.5 rounded-lg text-xs font-medium group-hover:bg-blue-100 group-hover:text-blue-500 group-hover:border-blue-500 transition-all duration-200">
                        Add Member
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pb-2" />
              </button>
            )}
          </div>
        )}

        {activeTab === 'Reviews' && (
          <div className="text-center text-gray-500 py-12">
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <p className="font-medium text-lg mb-2">No reviews yet</p>
              <p className="text-gray-400">Reviews from customers will appear here</p>
            </div>
          </div>
        )}

        {activeTab === 'Images' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryImages && galleryImages.length > 0 ? (
              galleryImages.map((image, index) => (
                <div
                  key={index}
                  className="relative rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-200 group"
                  style={{ aspectRatio: '1 / 1' }}
                >
                  <img
                    src={image}
                    alt={`${title} - Image ${index + 1}`}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 py-12">
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    </svg>
                  </div>
                  <p className="font-medium text-lg mb-2">No images yet</p>
                  <p className="text-gray-400">Photos will be displayed here</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Reels' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {posts && posts.length > 0 ? (
              posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUser={currentUser}
                  categories={categories}
                />
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 py-12">
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                      <polygon points="23 7 16 12 23 17 23 7" />
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                    </svg>
                  </div>
                  <p className="font-medium text-lg mb-2">No reels yet</p>
                  <p className="text-gray-400">Video content will appear here</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingHead;