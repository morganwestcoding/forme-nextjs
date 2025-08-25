// components/ListingHead.tsx
'use client';

import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import ServiceCard from './ServiceCard';
import WorkerCard from './WorkerCard';
import PostCard from '../feed/PostCard';
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

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: 'Services', label: 'Services' },
    { key: 'Team',     label: 'Team' },
    { key: 'Reviews',  label: 'Reviews' },
    { key: 'Images',   label: 'Images' },
    { key: 'Reels',    label: 'Reels' },
  ];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="w-full relative">
        <div>
          <div 
            className="rounded-2xl p-6 border border-gray-100/50 backdrop-blur-sm shadow-sm"
            style={{ background: 'linear-gradient(145deg, #ffffff 0%, #fafbfc 100%)' }}
          >
            <div className="flex items-start gap-6 mb-8">
              {/* Left: Image */}
              <div className="relative flex-shrink-0">
                <div className="w-[130px] h-[130px] rounded-xl overflow-hidden relative shadow-sm">
                  <img
                    src={mainImage}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Right */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
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

                  <button className="p-1 rounded-full hover:bg-gray-100 transition text-neutral-500" aria-label="More">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="stroke-current fill-current">
                      <path d="M13.5 4.5C13.5 3.67157 12.8284 3 12 3C11.1716 3 10.5 3.67157 10.5 4.5C10.5 5.32843 11.1716 6 12 6C12.8284 6 13.5 5.32843 13.5 4.5Z" strokeWidth="1" />
                      <path d="M13.5 12C13.5 11.1716 12.8284 10.5 12 10.5C11.1716 10.5 10.5 11.1716 10.5 12C10.5 12.8284 11.1716 13.5 12 13.5C12.8284 13.5 13.5 12.8284 13.5 12Z" strokeWidth="1" />
                      <path d="M13.5 19.5C13.5 18.6716 12.8284 18 12 18C11.1716 18 10.5 18.6716 10.5 19.5C10.5 20.3284 11.1716 21 12 21C12.8284 21 13.5 20.3284 13.5 19.5Z" strokeWidth="1" />
                    </svg>
                  </button>
                </div>

                <div className="mb-3">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-[#60A5FA] border border-[#60A5FA]">
                    {city}{state ? `, ${state}` : ''}
                  </span>
                </div>
                
                <div className="mb-3 text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">4.8</span>
                  <span className="text-gray-500">(156 reviews)</span>
                  <span className="mx-2">•</span>
                  <span className="font-semibold text-gray-900">{followers.length}</span>
                  <span className="text-gray-500"> followers</span>
                </div>
                
                <div className="text-gray-700 text-sm leading-relaxed">
                  {truncatedDescription}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center pt-6 border-t border-gray-100">
              <div className="flex gap-4">
                {isOwner ? (
                  <button
                    onClick={() => rentModal.onOpen(listing)}
                    className="group inline-flex items-center justify-center px-24 py-3 rounded-xl text-sm font-medium bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 stransition-all duration-200"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleToggleFollow}
                      className="group inline-flex items-center justify-center px-24 py-3 rounded-xl text-sm font-medium bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm transition-all duration-200"
                    >
                      <span>{isFollowing ? 'Following' : 'Follow'}</span>
                    </button>

                    <button 
                      onClick={handleReserveClick}
                      className="group inline-flex items-center justify-center px-24 py-3 rounded-xl text-sm font-medium text-white shadow-sm hover:shadow-md transition-all duration-200 border border-[#60A5FA] hover:bg-blue-600" 
                      style={{ backgroundColor: '#60A5FA' }}
                    >
                      <span>Reserve</span>
                    </button>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6">
        <div className="flex border-b border-gray-200 relative justify-center">
          <div className="flex gap-8">
            {tabs.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`pb-4 pt-3 px-6 flex items-center justify-center text-sm transition-all duration-200 relative ${
                  activeTab === key ? 'font-semibold' : 'text-gray-500 hover:text-gray-700'
                }`}
                style={activeTab === key ? { color: '#60A5FA' } : {}}
              >
                <span className={`transition-transform duration-200 ${activeTab === key ? '-translate-y-px' : ''}`}>
                  {label}
                </span>
                {activeTab === key && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                    style={{ backgroundColor: '#60A5FA' }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 sm:px-0 mt-6">
        {activeTab === 'Services' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {validServices.map(service => (
              <ServiceCard
                key={service.id}
                service={service}
                listing={listing}
                currentUser={currentUser}
                storeHours={storeHours}
              />
            ))}

            {/* Add Service tile — matches the new ServiceCard style */}
            <button
              onClick={handleAddService}
              type="button"
              className={[
                'group relative w-full',
                'rounded-2xl border-2 border-gray-200 border-dashed bg-white/20 p-4',
                'flex flex-col items-center justify-center text-center gap-2.5',
                'hover:border-[#60A5FA] hover:shadow-md transition-all duration-200',
                'h-[130px]',
              ].join(' ')}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center  text-gray-500 bg-gray-50 border border-dashed group-hover:bg-blue-50 group-hover:text-[#60A5FA]">
                {/* Plus icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M16.4249 4.60509L17.4149 3.6151C18.2351 2.79497 19.5648 2.79497 20.3849 3.6151C21.205 4.43524 21.205 5.76493 20.3849 6.58507L19.3949 7.57506M16.4249 4.60509L9.76558 11.2644C9.25807 11.772 8.89804 12.4078 8.72397 13.1041L8 16L10.8959 15.276C11.5922 15.102 12.228 14.7419 12.7356 14.2344L19.3949 7.57506M16.4249 4.60509L19.3949 7.57506" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"></path>
            <path d="M18.9999 13.5C18.9999 16.7875 18.9999 18.4312 18.092 19.5376C17.9258 19.7401 17.7401 19.9258 17.5375 20.092C16.4312 21 14.7874 21 11.4999 21H11C7.22876 21 5.34316 21 4.17159 19.8284C3.00003 18.6569 3 16.7712 3 13V12.5C3 9.21252 3 7.56879 3.90794 6.46244C4.07417 6.2599 4.2599 6.07417 4.46244 5.90794C5.56879 5 7.21252 5 10.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </div>

              <div className="min-w-0">
                <span className="block text-sm font-medium text-gray-500">Add Service</span>
             
              </div>
            </button>
          </div>
        )}

        {activeTab === 'Team' && employees.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
          </div>
        )}

        {activeTab === 'Reviews' && (
          <div className="text-center text-gray-500 py-12">
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <p className="font-medium">Reviews will be displayed here</p>
            </div>
          </div>
        )}

        {activeTab === 'Images' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryImages && galleryImages.length > 0 ? (
              galleryImages.map((image, index) => (
                <div key={index} className="aspect-square relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group">
                  <img
                    src={image}
                    alt={`${title} - Image ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 py-12">
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                  <p className="font-medium">No images available</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Reels' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  <p className="font-medium">No reels available</p>
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
