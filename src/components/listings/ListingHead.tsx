// components/ListingHead.tsx
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
import useRentModal from '@/app/hooks/useRentModal';

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

  const truncatedDescription = description && description.length > 230
    ? description.substring(0, 230) 
    : description;

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

  // Filter out empty services (no name or price <= 0)
  const validServices = useMemo(
    () =>
      (Services || []).filter(
        (s) => (s.serviceName?.trim()?.length ?? 0) > 0 && Number(s.price) > 0
      ),
    [Services]
  );

  /** 🔗 Always trigger the RentModal -> ServiceSelector (new row) */
  const handleAddService = () => {
    if (!isOwner) return;
    const url = new URL(window.location.href);
    url.searchParams.set('addService', '1');
    router.push(`${url.pathname}?${url.searchParams.toString()}`, { scroll: false });
    rentModal.onOpen(listing);
  };

  /** 🔗 Handle adding new worker */
  const handleAddWorker = () => {
    if (!isOwner) return;
    // You can customize this to open a worker modal or navigate to add worker page
    const url = new URL(window.location.href);
    url.searchParams.set('addWorker', '1');
    router.push(`${url.pathname}?${url.searchParams.toString()}`, { scroll: false });
    // If you have a worker modal, you can call it here instead
    // workerModal.onOpen(listing);
    console.log('Add worker functionality - customize as needed');
  };

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: 'Services', label: 'Services' },
    { key: 'Team',     label: 'Team' },
    { key: 'Reviews',  label: 'Reviews' },
    { key: 'Images',   label: 'Images' },
    { key: 'Reels',    label: 'Reels' },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="w-full relative">
        <div>
          <div 
            className="rounded-2xl p-6 border border-gray-100/50 backdrop-blur-sm shadow-sm"
            style={{ background: 'linear-gradient(145deg, #ffffff 0%, #fafbfc 100%)' }}
          >
            <div className="flex items-start gap-6 mb-4">
              {/* Left: Image */}
              <div className="relative flex-shrink-0">
                <div className="w-[130px] h-[130px] rounded-xl overflow-hidden relative shadow-sm">
                  <img
                    src={mainImage}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* SmartBadgeListing under the image */}
                <div className="mt-3 flex justify-center">
                  <SmartBadgeListing
                    rating={4.8} // You can make this dynamic from your listing data
                    followerCount={followers.length}
                    onRatingClick={() => {
                      // Handle rating click - scroll to reviews tab
                      setActiveTab('Reviews');
                    }}
                    onFollowerClick={() => {
                      // Handle follower click - maybe show followers list or analytics
                      console.log('Show followers list');
                    }}
                  />
                </div>
              </div>

              {/* Right */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h1
                      className="text-xl font-bold tracking-tight text-gray-900 leading-tight"
                      style={{ letterSpacing: '-0.025em' }}
                    >
                      {title}
                    </h1>

                    {/* Verified SVG next to the title */}
                    <div className="drop-shadow-sm text-white inline-flex -mr-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="26"
                        height="26"
                        fill="#60A5FA"
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

                  <div className="flex items-center gap-2">
                    {/* Styled Action Buttons - matching Create/Filter style */}
                    {isOwner ? (
                      <button
                        onClick={() => rentModal.onOpen(listing)}
                        className="flex items-center justify-center py-3 space-x-2 px-4 shadow-sm rounded-xl transition-all bg-white text-gray-500 hover:bg-neutral-200"
                        type="button"
                      >
                        <span className="text-sm">Edit</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleToggleFollow}
                          className="flex items-center justify-center py-3 space-x-2 px-4 shadow-sm rounded-xl transition-all bg-white text-gray-500 hover:bg-neutral-200"
                          type="button"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" color="currentColor" fill="none">
                            <path d="M15 9C15 7.34315 13.6569 6 12 6C10.3431 6 9 7.34315 9 9C9 10.6569 10.3431 12 12 12C13.6569 12 15 10.6569 15 9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                            <path d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                            <path d="M17 17C17 14.2386 14.7614 12 12 12C9.23858 12 7 14.2386 7 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                          </svg>
                          <span className="text-sm">{isFollowing ? 'Following' : 'Follow'}</span>
                        </button>
                        <button 
                          onClick={handleReserveClick}
                          className="flex items-center justify-center py-3 space-x-2 px-4 shadow-sm rounded-xl transition-all bg-white text-gray-500 hover:bg-neutral-200"
                          type="button"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" color="currentColor" fill="none">
                            <path d="M16 2V6M8 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                            <path d="M13 4H11C7.22876 4 5.34315 4 4.17157 5.17157C3 6.34315 3 8.22876 3 12V14C3 17.7712 3 19.6569 4.17157 20.8284C5.34315 22 7.22876 22 11 22H13C16.7712 22 18.6569 22 19.8284 20.8284C21 19.6569 21 17.7712 21 14V12C21 8.22876 21 6.34315 19.8284 5.17157C18.6569 4 16.7712 4 13 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                            <path d="M3 10H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                            <path d="M11 14H16M8 14H8.00898M13 18H8M16 18H15.991" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                          </svg>
                          <span className="text-sm">Reserve</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <span className="inline-flex items-center -mt-1 text-sm font-light text-black">
                    {city}{state ? `, ${state}` : ''}
                  </span>
                </div>
                
                <div className="text-gray-700 text-sm leading-relaxed">
                  {truncatedDescription}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - Market Explorer Style */}
      <div className="py-5 border-y border-gray-200">
        <div className="flex flex-wrap justify-center items-center gap-3">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`w-28 h-10 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center border ${
                activeTab === key
                  ? 'bg-blue-50 text-[#60A5FA] border-[#60A5FA]'
                  : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
              }`}
              type="button"
            >
              <span className="px-2">{label}</span>
            </button>
          ))}
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

            {/* Add Service tile — matches the ServiceCard structure exactly */}
            {isOwner && (
              <button
                onClick={handleAddService}
                type="button"
                className="cursor-pointer bg-white rounded-2xl shadow hover:shadow-xl overflow-hidden relative transition-all duration-300 hover:scale-[1.02] max-w-[250px] border-2 border-gray-200 border-dashed hover:border-blue-500"
              >
                {/* Match ServiceCard height structure */}
                <div className="relative h-[350px]">
                  {/* Icon - Centered towards middle-top like ServiceCard */}
                  <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="relative">
                      {/* Dashed circular background with plus icon */}
                      <div className="w-24 h-24 rounded-full flex items-center justify-center text-gray-500 bg-gray-50 border-2 border-gray-300 border-dashed shadow-md ring-4 ring-white/50 transition-all duration-300 group-hover:border-blue-500 group-hover:bg-blue-50 group-hover:text-blue-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 5v14M5 12h14"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Bottom info - positioned like ServiceCard */}
                  <div className="absolute bottom-5 left-5 right-5 z-20">
                    {/* Service Name and Details */}
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-500 mb-1 text-center">
                        Add Service
                      </h3>
                      <p className="text-xs text-gray-400 leading-relaxed text-center">
                        Create a new service offering
                      </p>
                      <div className="opacity-90 mt-0.5 text-xs text-gray-400 font-light text-center">
                        Click to get started
                      </div>
                    </div>

                    {/* Action Badge */}
                    <div className="flex items-center justify-center">
                      <div className="bg-gray-100 text-gray-500 px-3 py-1.5 rounded-lg text-xs font-medium border border-dashed group-hover:bg-blue-100 group-hover:text-blue-500 group-hover:border-blue-500 transition-all duration-200">
                        Get Started
                      </div>
                    </div>
                  </div>
                </div>

                {/* Match ServiceCard bottom padding */}
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
                onFollow={() => {}}
                onBook={() => {}}
              />
            ))}

            {/* Add Worker tile — matches the WorkerCard structure */}
            {isOwner && (
              <button
                onClick={handleAddWorker}
                type="button"
                className="cursor-pointer bg-white rounded-2xl shadow hover:shadow-xl overflow-hidden relative transition-all duration-300 hover:scale-[1.02] max-w-[250px] border-2 border-gray-200 border-dashed hover:border-blue-500"
              >
                {/* Match WorkerCard height structure */}
                <div className="relative h-[350px]">
                  {/* Icon - Centered towards middle-top like WorkerCard */}
                  <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="relative">
                      {/* Dashed circular background with user plus icon */}
                      <div className="w-24 h-24 rounded-full flex items-center justify-center text-gray-500 bg-gray-50 border-2 border-gray-300 border-dashed shadow-md ring-4 ring-white/50 transition-all duration-300 group-hover:border-blue-500 group-hover:bg-blue-50 group-hover:text-blue-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                          <circle cx="9" cy="7" r="4"/>
                          <line x1="19" y1="8" x2="19" y2="14"/>
                          <line x1="22" y1="11" x2="16" y2="11"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Bottom info - positioned like WorkerCard */}
                  <div className="absolute bottom-5 left-5 right-5 z-20">
                    {/* Worker Name and Details */}
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-500 mb-1 text-center">
                        Add Team Member
                      </h3>
                      <p className="text-xs text-gray-400 leading-relaxed text-center">
                        Invite a new team member
                      </p>
                      <div className="opacity-90 mt-0.5 text-xs text-gray-400 font-light text-center">
                        Click to get started
                      </div>
                    </div>

                    {/* Action Badge */}
                    <div className="flex items-center justify-center">
                      <div className="bg-gray-100 text-gray-500 px-3 py-1.5 rounded-lg text-xs font-medium border border-dashed group-hover:bg-blue-100 group-hover:text-blue-500 group-hover:border-blue-500 transition-all duration-200">
                        Add Member
                      </div>
                    </div>
                  </div>
                </div>

                {/* Match WorkerCard bottom padding */}
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
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
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
                  className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group"
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
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="9" cy="9" r="2"/>
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
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
                      <polygon points="23 7 16 12 23 17 23 7"/>
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
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