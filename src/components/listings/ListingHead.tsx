'use client';

import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import ServiceCard from './ServiceCard';
import WorkerCard from './WorkerCard';
import PostCard from '../feed/PostCard';
import QRModal from '../modals/QRModal';
import HeartButton from '../HeartButton';
import OpenStatus from './OpenStatus';
import { SafePost, SafeUser, SafeListing } from '@/app/types';
import useReservationModal from '@/app/hooks/useReservationModal';
import useRentModal from '@/app/hooks/useListingModal';

interface ServiceItem {
  id: string;
  serviceName: string;
  price: number;
  category: string;
  imageSrc?: string | null;
  description?: string;
  popular?: boolean;
}

type TabKey = 'Services' | 'Team' | 'Posts' | 'Reviews';

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

  const { title, location, galleryImages, imageSrc, employees = [], user, storeHours = [] } = listing;
  const address = (listing as any).address;

  const initialFollowers = useMemo<string[]>(
    () => (Array.isArray((listing as any).followers) ? (listing as any).followers : []),
    [listing]
  );
  const [followers, setFollowers] = useState<string[]>(initialFollowers);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const isFollowing = !!currentUser?.id && followers.includes(currentUser.id);
  const [activeTab, setActiveTab] = useState<TabKey>('Services');

  const reservationModal = useReservationModal();
  const rentModal = useRentModal();

  const mainImage = imageSrc || galleryImages?.[0] || '/placeholder.jpg';

  const handleReserveClick = () => {
    if (!currentUser) return;
    reservationModal.onOpen(listing, currentUser);
  };

  const isOwner = !!currentUser?.id && currentUser.id === user?.id;
  
  // Check if current user is an employee of this listing
  const isEmployee = !!currentUser?.id && employees.some(emp => emp.userId === currentUser.id);
  
  // Show QR button if user is owner OR employee
  const canShowQR = isOwner || isEmployee;

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

  const handleQRClick = () => {
    setShowQRModal(true);
  };

  const handleDropdownToggle = () => {
    setShowDropdown(!showDropdown);
  };

  const handleEditListing = () => {
    setShowDropdown(false);
    rentModal.onOpen(listing);
  };

  const handleGalleryClick = () => {
    setActiveTab('Posts');
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
    { key: 'Posts', label: 'Posts' },
    { key: 'Reviews', label: 'Reviews' },
  ];

  return (
    <div className="w-full space-y-6">
      {/* QR Modal */}
      <QRModal 
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        listing={listing}
      />

      {/* Dropdown backdrop - closes dropdown when clicked */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setShowDropdown(false)}
        />
      )}

      {/* Header - Everything in ONE DIV */}
      <div className="w-full relative">
        {/* SINGLE CONTAINER: Image and content all in one div */}
        <div className="w-full rounded-xl p-6 border border-gray-300 bg-white relative min-h-[151px]">
          {/* Image positioned on the left */}
          <div className="absolute left-6 top-6">
            <div className="w-[140px] h-[140px] shadow-sm rounded-xl overflow-hidden relative hover:shadow-md transition-shadow group border border-gray-300">
              <img
                src={mainImage}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
{/* Gallery Icon - Bottom Right Corner */}
<div className="absolute bottom-3 right-2.5">
  <div
    onClick={handleGalleryClick}
    className="hover:scale-105 transition-transform cursor-pointer"
    aria-label="View gallery"
    role="button"
    title="View gallery"
  >
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      width="28" 
      height="28" 
      className="drop-shadow-lg"
    >
      <path 
        d="M3.88884 9.66294C4.39329 10 5.09552 10 6.49998 10C7.90445 10 8.60668 10 9.11113 9.66294C9.32951 9.51702 9.51701 9.32952 9.66292 9.11114C9.99998 8.60669 9.99998 7.90446 9.99998 6.5C9.99998 5.09554 9.99998 4.39331 9.66292 3.88886C9.51701 3.67048 9.32951 3.48298 9.11113 3.33706C8.60668 3 7.90445 3 6.49998 3C5.09552 3 4.39329 3 3.88884 3.33706C3.67046 3.48298 3.48296 3.67048 3.33705 3.88886C2.99998 4.39331 2.99998 5.09554 2.99998 6.5C2.99998 7.90446 2.99998 8.60669 3.33705 9.11114C3.48296 9.32952 3.67046 9.51702 3.88884 9.66294Z" 
        fill="rgba(255,255,255,0.25)"
        stroke="rgba(255,255,255,0.6)" 
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path 
        d="M14.8888 9.66294C15.3933 10 16.0955 10 17.5 10C18.9044 10 19.6067 10 20.1111 9.66294C20.3295 9.51702 20.517 9.32952 20.6629 9.11114C21 8.60669 21 7.90446 21 6.5C21 5.09554 21 4.39331 20.6629 3.88886C20.517 3.67048 20.3295 3.48298 20.1111 3.33706C19.6067 3 18.9044 3 17.5 3C16.0955 3 15.3933 3 14.8888 3.33706C14.6705 3.48298 14.483 3.67048 14.337 3.88886C14 4.39331 14 5.09554 14 6.5C14 7.90446 14 8.60669 14.337 9.11114C14.483 9.32952 14.6705 9.51702 14.8888 9.66294Z" 
        fill="rgba(255,255,255,0.25)"
        stroke="rgba(255,255,255,0.6)" 
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path 
        d="M3.88884 20.6629C4.39329 21 5.09552 21 6.49998 21C7.90445 21 8.60668 21 9.11113 20.6629C9.32951 20.517 9.51701 20.3295 9.66292 20.1111C9.99998 19.6067 9.99998 18.9045 9.99998 17.5C9.99998 16.0955 9.99998 15.3933 9.66292 14.8889C9.51701 14.6705 9.32951 14.483 9.11113 14.3371C8.60668 14 7.90445 14 6.49998 14C5.09552 14 4.39329 14 3.88884 14.3371C3.67046 14.483 3.48296 14.6705 3.33705 14.8889C2.99998 15.3933 2.99998 16.0955 2.99998 17.5C2.99998 18.9045 2.99998 19.6067 3.33705 20.1111C3.48296 20.3295 3.67046 20.517 3.88884 20.6629Z" 
        fill="rgba(255,255,255,0.25)"
        stroke="rgba(255,255,255,0.6)" 
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path 
        d="M14.8888 20.6629C15.3933 21 16.0955 21 17.5 21C18.9044 21 19.6067 21 20.1111 20.6629C20.3295 20.517 20.517 20.3295 20.6629 20.1111C21 19.6067 21 18.9045 21 17.5C21 16.0955 21 15.3933 20.6629 14.8889C20.517 14.6705 20.3295 14.483 20.1111 14.3371C19.6067 14 18.9044 14 17.5 14C16.0955 14 15.3933 14 14.8888 14.3371C14.6705 14.483 14.483 14.6705 14.337 14.8889C14 15.3933 14 16.0955 14 17.5C14 18.9045 14 19.6067 14.337 20.1111C14.483 20.3295 14.6705 20.517 14.8888 20.6629Z" 
        fill="rgba(255,255,255,0.25)"
        stroke="rgba(255,255,255,0.6)" 
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  </div>
</div>
            </div>
          </div>

          {/* Content area with left margin to account for image */}
          <div className="ml-[163px] relative flex items-center min-h-[140px]">
            {/* Three-dot menu - top right */}
            <div className="absolute top-0 right-0">
              <button
                onClick={handleDropdownToggle}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                type="button"
                aria-label="Options menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#6b7280" fill="none">
                  <path d="M21 12C21 11.1716 20.3284 10.5 19.5 10.5C18.6716 10.5 18 11.1716 18 12C18 12.8284 18.6716 13.5 19.5 13.5C20.3284 13.5 21 12.8284 21 12Z" stroke="currentColor" strokeWidth="1.5" fill='#6b7280'></path>
                  <path d="M13.5 12C13.5 11.1716 12.8284 10.5 12 10.5C11.1716 10.5 10.5 11.1716 10.5 12C10.5 12.8284 11.1716 13.5 12 13.5C12.8284 13.5 13.5 12.8284 13.5 12Z" stroke="currentColor" strokeWidth="1.5" fill='#6b7280'></path>
                  <path d="M6 12C6 11.1716 5.32843 10.5 4.5 10.5C3.67157 10.5 3 11.1716 3 12C3 12.8284 3.67157 13.5 4.5 13.5C5.32843 13.5 6 12.8284 6 12Z" stroke="currentColor" strokeWidth="1.5" fill='#6b7280'></path>
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {isOwner && (
                    <>
                      <button
                        onClick={handleEditListing}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                        type="button"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/>
                        </svg>
                        Edit Listing
                      </button>
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          handleAddService();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                        type="button"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                          <path d="M12 5v14M5 12h14"/>
                        </svg>
                        Add Service
                      </button>
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          handleAddWorker();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                        type="button"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                          <circle cx="9" cy="7" r="4"/>
                          <line x1="19" y1="8" x2="19" y2="14"/>
                          <line x1="22" y1="11" x2="16" y2="11"/>
                        </svg>
                        Add Team Member
                      </button>
                      <hr className="my-1 border-gray-200" />
                      <button
                        onClick={() => setShowDropdown(false)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                        type="button"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                          <path d="M3 6h18l-2 13H5L3 6z"/>
                          <path d="M8 10v6"/>
                          <path d="M16 10v6"/>
                          <path d="M12 10v6"/>
                        </svg>
                        View Analytics
                      </button>
                      <button
                        onClick={() => setShowDropdown(false)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                        type="button"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                          <circle cx="12" cy="12" r="3"/>
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                        </svg>
                        Listing Settings
                      </button>
                    </>
                  )}
                  
                  {/* Non-owner options */}
                  {!isOwner && (
                    <>
                      <button
                        onClick={() => setShowDropdown(false)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                        type="button"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                          <line x1="4" x2="4" y1="22" y2="15"/>
                        </svg>
                        Report Listing
                      </button>
                      <button
                        onClick={() => setShowDropdown(false)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                        type="button"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                        </svg>
                        Copy Link
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="space-y-3">
                {/* Title with Badge and Heart */}
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-bold tracking-tight text-black">
                    {title}
                  </h1>

                  {/* Verified Badge */}
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      fill="#60A5FA"
                      className="shrink-0 text-white drop-shadow-sm"
                      aria-label="Verified"
                    >
                      <path
                        d="M18.9905 19H19M18.9905 19C18.3678 19.6175 17.2393 19.4637 16.4479 19.4637C15.4765 19.4637 15.0087 19.6537 14.3154 20.347C13.7251 20.9374 12.9337 22 12 22C11.0663 22 10.2749 20.9374 9.68457 20.347C8.99128 19.6537 8.52349 19.4637 7.55206 19.4637C6.76068 19.4637 5.63218 19.6175 5.00949 19C4.38181 18.3776 4.53628 17.2444 4.53628 16.4479C4.53628 15.4414 4.31616 14.9786 3.59938 14.2618C2.53314 13.1956 2.00002 12.6624 2 12C2.00001 11.3375 2.53312 10.8044 3.59935 9.73817C4.2392 9.09832 4.53628 8.46428 4.53628 7.55206C4.53628 6.76065 4.38249 5.63214 5 5.00944C5.62243 4.38178 6.7556 4.53626 7.55208 4.53626C8.46427 4.53626 9.09832 4.2392 9.73815 3.59937C10.8044 2.53312 11.3375 2 12 2C12.6625 2 13.1956 2.53312 14.2618 3.59937C14.9015 4.23907 15.5355 4.53626 16.4479 4.53626C17.2393 4.53626 18.3679 4.38247 18.9906 5C19.6182 5.62243 19.4637 6.75559 19.4637 7.55206C19.4637 8.55858 19.6839 9.02137 20.4006 9.73817C21.4669 10.8044 22 11.3375 22 12C22 12.6624 21.4669 13.1956 20.4006 14.2618C19.6838 14.9786 19.4637 15.4414 19.4637 16.4479C19.4637 17.2444 19.6182 18.3776 18.9905 19Z"
                        stroke="white"
                        strokeWidth="1"
                        fill="#60A5FA"
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

                  {/* Open Status Indicator */}
                  <div className="flex items-center">
                    <OpenStatus storeHours={storeHours} />
                  </div>

                  {/* Heart Button */}
                  <div className="flex items-center" style={{ width: '24px', height: '24px' }}>
                    <HeartButton
                      listingId={listing.id}
                      currentUser={currentUser}
                      variant="listingHead"
                    />
                  </div>
                </div>

                {/* Address, City, State with Radius */}
                <div className="text-sm text-gray-500">
                  {address && location ? `${address}, ${location}` : address || location}
                  <span className="text-gray-400 ml-1">
                    · {(listing as any).radius ? `${(listing as any).radius} miles` : '2.3 miles away'}
                  </span>
                </div>

                {/* Counter and Buttons Row */}
                <div className="flex items-center justify-between">
                  {/* Counter */}
                  <div className="flex items-center gap-8">
                    {/* Rating Counter */}
                    <button
                      onClick={() => setActiveTab('Reviews')}
                      className="flex flex-col items-center justify-center group cursor-pointer transition-all duration-200 hover:scale-105"
                      type="button"
                    >
                      <span className="text-xl font-bold text-black group-hover:text-[#60A5FA] transition-colors leading-none">4.8</span>
                      <span className="text-xs text-gray-400 group-hover:text-[#60A5FA] transition-colors mt-0.5">rating</span>
                    </button>

                    {/* Posts Counter */}
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-xl font-bold text-black leading-none">{posts?.length || 0}</span>
                      <span className="text-xs text-gray-400 mt-0.5">posts</span>
                    </div>

                    {/* Followers Counter */}
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-xl font-bold text-black leading-none">{followers.length}</span>
                      <span className="text-xs text-gray-400 mt-0.5">followers</span>
                    </div>
                  </div>

                  {/* Buttons - Right Side */}
                  <div className="flex items-center gap-1.5">
                    {/* QR Code Button - Show for owners and employees ONLY */}
                    {canShowQR ? (
                      <button
                        onClick={handleQRClick}
                        className="h-12 px-4 rounded-lg transition-all duration-300 flex items-center justify-center border-[#60A5FA] border bg-blue-50 hover:shadow-lg hover:shadow-blue-100/50 hover:border-[#60A5FA] hover:bg-blue-50 [transition:background_400ms_ease-in-out,border-color_300ms_ease,box-shadow_300ms_ease]"
                        type="button"
                        aria-label="Show QR Code"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" className="text-[#60A5FA]" fill="none">
                          <path d="M3 6C3 4.58579 3 3.87868 3.43934 3.43934C3.87868 3 4.58579 3 6 3C7.41421 3 8.12132 3 8.56066 3.43934C9 3.87868 9 4.58579 9 6C9 7.41421 9 8.12132 8.56066 8.56066C8.12132 9 7.41421 9 6 9C4.58579 9 3.87868 9 3.43934 8.56066C3 8.12132 3 7.41421 3 6Z" stroke="currentColor" strokeWidth="1.5"></path>
                          <path d="M3 18C3 16.5858 3 15.8787 3.43934 15.4393C3.87868 15 4.58579 15 6 15C7.41421 15 8.12132 15 8.56066 15.4393C9 15.8787 9 16.5858 9 18C9 19.4142 9 20.1213 8.56066 20.5607C8.12132 21 7.41421 21 6 21C4.58579 21 3.87868 21 3.43934 20.5607C3 20.1213 3 19.4142 3 18Z" stroke="currentColor" strokeWidth="1.5"></path>
                          <path d="M3 12L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                          <path d="M12 3V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                          <path d="M15 6C15 4.58579 15 3.87868 15.4393 3.43934C15.8787 3 16.5858 3 18 3C19.4142 3 20.1213 3 20.5607 3.43934C21 3.87868 21 4.58579 21 6C21 7.41421 21 8.12132 20.5607 8.56066C20.1213 9 19.4142 9 18 9C16.5858 9 15.8787 9 15.4393 8.56066C15 8.12132 15 7.41421 15 6Z" stroke="currentColor" strokeWidth="1.5"></path>
                          <path d="M21 12H15C13.5858 12 12.8787 12 12.4393 12.4393C12 12.8787 12 13.5858 12 15M12 17.7692V20.5385M15 15V16.5C15 17.9464 15.7837 18 17 18C17.5523 18 18 18.4477 18 19M16 21H15M18 15C19.4142 15 20.1213 15 20.5607 15.44C21 15.8799 21 16.5881 21 18.0043C21 19.4206 21 20.1287 20.5607 20.5687C20.24 20.8898 19.7767 20.9766 19 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
                        </svg>
                      </button>
                    ) : (
                      /* Follow Button - Show for everyone else who is logged in */
                      currentUser && (
                        <button
                          onClick={handleToggleFollow}
                          className={`group w-28 px-4 py-3 rounded-lg border transition-all duration-300 flex items-center justify-center text-sm [transition:background_400ms_ease-in-out,border-color_300ms_ease,box-shadow_300ms_ease] ${
                            isFollowing
                              ? 'bg-blue-50 border-[#60A5FA] text-[#60A5FA] hover:shadow-lg hover:shadow-blue-100/50 hover:bg-blue-50'
                              : 'bg-gray-50 border-gray-300 text-gray-500 hover:shadow-lg hover:shadow-blue-100/50 hover:border-[#60A5FA] hover:text-[#60A5FA] hover:bg-blue-50'
                          }`}
                          type="button"
                          aria-label={isFollowing ? 'Unfollow' : 'Follow'}
                        >
                          <span>{isFollowing ? 'Following' : 'Follow'}</span>
                        </button>
                      )
                    )}

                    {/* Reserve Button - Show for all current users */}
                    {currentUser && (
                      <button
                        onClick={handleReserveClick}
                        className="w-28 px-4 py-3 rounded-lg border border-gray-300 transition-all duration-300 bg-gray-50 text-gray-500 hover:shadow-lg hover:shadow-blue-100/50 hover:border-[#60A5FA] hover:text-[#60A5FA] hover:bg-blue-50 [transition:background_400ms_ease-in-out,border-color_300ms_ease,box-shadow_300ms_ease] flex items-center justify-center text-sm"
                        type="button"
                      >
                        Reserve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - MarketExplorer Style */}
      <div className="py-5 border-y border-gray-300">
        <div className="flex items-center justify-center">
          {tabs.map(({ key, label }, index) => {
            const isSelected = activeTab === key;
            const isLast = index === tabs.length - 1;

            return (
              <div key={key} className="relative flex items-center">
                <button
                  onClick={() => setActiveTab(key)}
                  className={`
                    px-6 py-2.5 text-sm transition-colors duration-200 
                    ${isSelected
                      ? 'text-[#60A5FA] hover:text-[#60A5FA]'
                      : 'text-gray-500 hover:text-gray-700'
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
                      <div className="w-24 h-24 rounded-full flex items-center justify-center text-gray-500 bg-gray-50 border-2 border-gray-300 ring-4 ring-white/50 transition-all duration-300 group-hover:border-[#60A5FA] group-hover:bg-blue-50 group-hover:text-[#60A5FA]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-5 left-5 right-5 z-20">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-500 mb-1 text-center">
                        Add Service
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed text-center">
                        Create a new service offering
                      </p>
                      <div className="opacity-90 mt-0.5 text-xs text-gray-500 font-light text-center">
                        Click to get started
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <div className="bg-gray-100 text-gray-500 px-3 py-2 border rounded-lg text-xs font-medium group-hover:bg-blue-100 group-hover:text-[#60A5FA] group-hover:border-[#60A5FA] transition-all duration-200">
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
                      <div className="w-24 h-24 rounded-full flex items-center justify-center text-gray-500 bg-gray-50 border-2 border-gray-300 ring-4 ring-white/50 transition-all duration-300 group-hover:border-[#60A5FA] group-hover:bg-blue-50 group-hover:text-[#60A5FA]">
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
                      <p className="text-xs text-gray-300 leading-relaxed text-center">
                        Invite a new team member
                      </p>
                      <div className="opacity-90 mt-0.5 text-xs text-gray-300 font-light text-center">
                        Click to get started
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <div className="bg-gray-100 text-gray-500 px-3 py-2 border rounded-lg text-xs font-medium group-hover:bg-blue-100 group-hover:text-[#60A5FA] group-hover:border-[#60A5FA] transition-all duration-200">
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
            <div className="bg-white rounded-2xl p-8 border border-gray-100">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <p className="font-medium text-lg mb-2">No reviews yet</p>
              <p className="text-gray-300">Reviews from customers will appear here</p>
            </div>
          </div>
        )}

        {activeTab === 'Posts' && (
          <div className="space-y-6">
            {/* Images Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">Images</h3>
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
                    <div className="bg-white rounded-2xl p-8 border border-gray-100">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="9" cy="9" r="2" />
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                        </svg>
                      </div>
                      <p className="font-medium text-lg mb-2">No images yet</p>
                      <p className="text-gray-300">Photos will be displayed here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Reels Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">Reels</h3>
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
                    <div className="bg-white rounded-2xl p-8 border border-gray-100">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
                          <polygon points="23 7 16 12 23 17 23 7" />
                          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                        </svg>
                      </div>
                      <p className="font-medium text-lg mb-2">No reels yet</p>
                      <p className="text-gray-300">Video content will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingHead;