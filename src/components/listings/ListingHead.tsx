'use client';

import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { ArrowBigUpDash } from 'lucide-react';
import ServiceCard from './ServiceCard';
import WorkerCard from './WorkerCard';
import PostCard from '../feed/PostCard';
import QRModal from '../modals/QRModal';
import { SafePost, SafeUser, SafeListing } from '@/app/types';
import useReservationModal from '@/app/hooks/useReservationModal';
import useRentModal from '@/app/hooks/useListingModal';
import useFavorite from '@/app/hooks/useFavorite';

interface ServiceItem {
  id: string;
  serviceName: string;
  price: number;
  category: string;
  imageSrc?: string | null;
  description?: string;
  popular?: boolean;
}

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

  const { title, location, galleryImages, imageSrc, employees = [], user, storeHours = [], description, phoneNumber, website } = listing;
  const address = (listing as any).address;

  const initialFollowers = useMemo<string[]>(
    () => (Array.isArray((listing as any).followers) ? (listing as any).followers : []),
    [listing]
  );
  const [followers, setFollowers] = useState<string[]>(initialFollowers);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isFollowing = !!currentUser?.id && followers.includes(currentUser.id);

  const reservationModal = useReservationModal();
  const rentModal = useRentModal();
  const { hasFavorited, toggleFavorite } = useFavorite({
    listingId: listing.id,
    currentUser
  });

  const mainImage = imageSrc || galleryImages?.[0] || '/placeholder.jpg';

  const handleReserveClick = () => {
    if (!currentUser) return;
    reservationModal.onOpen(listing, currentUser);
  };

  const isOwner = !!currentUser?.id && currentUser.id === user?.id;
  const isEmployee = !!currentUser?.id && employees.some(emp => emp.userId === currentUser.id);

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
    } catch {
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

  const handleAddMedia = () => {
    if (!isOwner) return;
    const url = new URL(window.location.href);
    url.searchParams.set('addMedia', '1');
    router.push(`${url.pathname}?${url.searchParams.toString()}`, { scroll: false });
  };

  // Get operating status
  const getOperatingStatus = () => {
    if (!storeHours || storeHours.length === 0) return null;
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todayHours = storeHours.find(h => h.dayOfWeek === today);
    if (!todayHours) return null;

    const isOpen = !todayHours.isClosed;
    return {
      isOpen,
      closeTime: todayHours.closeTime,
      openTime: todayHours.openTime
    };
  };

  const operatingStatus = getOperatingStatus();

  // AI chat submit handler
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isLoading) return;
    setIsLoading(true);
    // TODO: Integrate with AI endpoint
    console.log('Chat query:', chatInput);
    setTimeout(() => {
      setIsLoading(false);
      setChatInput('');
    }, 500);
  };

  // Quick action suggestions based on listing content
  const quickActions = useMemo(() => {
    const actions: string[] = [];
    if (validServices.length > 0) actions.push('What services do you offer?');
    if (employees.length > 0) actions.push('Who should I book with?');
    if (storeHours.length > 0) actions.push('What are your hours?');
    actions.push('Help me book an appointment');
    return actions.slice(0, 4);
  }, [validServices.length, employees.length, storeHours.length]);

  return (
    <>
      {/* QR Modal */}
      <QRModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        listing={listing}
      />

      {/* Dropdown backdrop */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}

      {/* Dropdown Menu */}
      {showDropdown && (
        <div
          className="fixed top-20 right-6 md:right-24 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50"
          style={{ maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}
        >
          {(isOwner || isEmployee) && (
            <>
              <button
                onClick={() => { setShowDropdown(false); handleQRClick(); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" className="text-gray-500" strokeWidth="1.5">
                  <path d="M3 6C3 4.58579 3 3.87868 3.43934 3.43934C3.87868 3 4.58579 3 6 3C7.41421 3 8.12132 3 8.56066 3.43934C9 3.87868 9 4.58579 9 6C9 7.41421 9 8.12132 8.56066 8.56066C8.12132 9 7.41421 9 6 9C4.58579 9 3.87868 9 3.43934 8.56066C3 8.12132 3 7.41421 3 6Z" />
                  <path d="M3 18C3 16.5858 3 15.8787 3.43934 15.4393C3.87868 15 4.58579 15 6 15C7.41421 15 8.12132 15 8.56066 15.4393C9 15.8787 9 16.5858 9 18C9 19.4142 9 20.1213 8.56066 20.5607C8.12132 21 7.41421 21 6 21C4.58579 21 3.87868 21 3.43934 20.5607C3 20.1213 3 19.4142 3 18Z" />
                  <path d="M15 6C15 4.58579 15 3.87868 15.4393 3.43934C15.8787 3 16.5858 3 18 3C19.4142 3 20.1213 3 20.5607 3.43934C21 3.87868 21 4.58579 21 6C21 7.41421 21 8.12132 20.5607 8.56066C20.1213 9 19.4142 9 18 9C16.5858 9 15.8787 9 15.4393 8.56066C15 8.12132 15 7.41421 15 6Z" />
                </svg>
                Show QR Code
              </button>
              {isOwner && (
                <>
                  <hr className="my-1 border-gray-200" />
                  <button onClick={handleEditListing} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3" type="button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/>
                    </svg>
                    Edit Listing
                  </button>
                  <button onClick={() => { setShowDropdown(false); handleAddService(); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3" type="button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                    Add Service
                  </button>
                  <button onClick={() => { setShowDropdown(false); handleAddWorker(); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3" type="button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
                    </svg>
                    Add Team Member
                  </button>
                </>
              )}
            </>
          )}

          {!isOwner && !isEmployee && currentUser && (
            <>
              <button onClick={() => { handleToggleFollow(); setShowDropdown(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
                </svg>
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
              <button onClick={(e: any) => { toggleFavorite(e); setShowDropdown(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={hasFavorited ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={hasFavorited ? "text-rose-500" : "text-gray-500"}>
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                </svg>
                {hasFavorited ? 'Saved' : 'Save Listing'}
              </button>
            </>
          )}
        </div>
      )}

      {/* ========== LISTING HEADER ========== */}
      <div className="-mx-6 md:-mx-24 -mt-2 md:-mt-8">
        <div className="relative bg-white px-6 md:px-24 pt-8 pb-4">

          {/* Title Section - Market-inspired */}
          <div className="text-center mb-5">
            <div className="flex items-center justify-center gap-2.5 mb-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight tracking-tight">
                {title}
              </h1>
              {/* Verified Badge */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="flex-shrink-0">
                <path
                  d="M18.9905 19H19M18.9905 19C18.3678 19.6175 17.2393 19.4637 16.4479 19.4637C15.4765 19.4637 15.0087 19.6537 14.3154 20.347C13.7251 20.9374 12.9337 22 12 22C11.0663 22 10.2749 20.9374 9.68457 20.347C8.99128 19.6537 8.52349 19.4637 7.55206 19.4637C6.76068 19.4637 5.63218 19.6175 5.00949 19C4.38181 18.3776 4.53628 17.2444 4.53628 16.4479C4.53628 15.4414 4.31616 14.9786 3.59938 14.2618C2.53314 13.1956 2.00002 12.6624 2 12C2.00001 11.3375 2.53312 10.8044 3.59935 9.73817C4.2392 9.09832 4.53628 8.46428 4.53628 7.55206C4.53628 6.76065 4.38249 5.63214 5 5.00944C5.62243 4.38178 6.7556 4.53626 7.55208 4.53626C8.46427 4.53626 9.09832 4.2392 9.73815 3.59937C10.8044 2.53312 11.3375 2 12 2C12.6625 2 13.1956 2.53312 14.2618 3.59937C14.9015 4.23907 15.5355 4.53626 16.4479 4.53626C17.2393 4.53626 18.3679 4.38247 18.9906 5C19.6182 5.62243 19.4637 6.75559 19.4637 7.55206C19.4637 8.55858 19.6839 9.02137 20.4006 9.73817C21.4669 10.8044 22 11.3375 22 12C22 12.6624 21.4669 13.1956 20.4006 14.2618C19.6838 14.9786 19.4637 15.4414 19.4637 16.4479C19.4637 17.2444 19.6182 18.3776 18.9905 19Z"
                  fill="url(#verifiedGrad)"
                />
                <path d="M9 12.8929C9 12.8929 10.2 13.5447 10.8 14.5C10.8 14.5 12.6 10.75 15 9.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <defs>
                  <linearGradient id="verifiedGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#60A5FA" />
                    <stop offset="100%" stopColor="#4A90E2" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <p className="text-gray-500 text-base">
              {address && location ? `${address}, ${location}` : address || location}
            </p>
          </div>

          {/* Search Bar with integrated actions */}
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleChatSubmit}>
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="flex items-center gap-1.5 px-3 py-2.5">
                  {/* Book Button */}
                  {currentUser && (
                    <button
                      onClick={handleReserveClick}
                      className="p-2 rounded-xl hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-all"
                      type="button"
                      title="Book Appointment"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M18 2V4M6 2V4" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M11.9955 13H12.0045M11.9955 17H12.0045M15.991 13H16M8 13H8.00897M8 17H8.00897" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3.5 8H20.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2.5 12.2432C2.5 7.88594 2.5 5.70728 3.75212 4.35364C5.00424 3 7.01949 3 11.05 3H12.95C16.9805 3 18.9958 3 20.2479 4.35364C21.5 5.70728 21.5 7.88594 21.5 12.2432V12.7568C21.5 17.1141 21.5 19.2927 20.2479 20.6464C18.9958 22 16.9805 22 12.95 22H11.05C7.01949 22 5.00424 22 3.75212 20.6464C2.5 19.2927 2.5 17.1141 2.5 12.7568V12.2432Z" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  )}

                  {/* Call Button */}
                  {phoneNumber && (
                    <a
                      href={`tel:${phoneNumber}`}
                      className="p-2 rounded-xl hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-all"
                      title="Call"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                    </a>
                  )}

                  <div className="w-px h-5 bg-gray-200" />

                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={`Ask ${title} anything...`}
                    className="flex-1 text-[14px] bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 font-normal px-2"
                  />

                  {/* Inline quick prompts - only show when input is empty */}
                  {!chatInput && quickActions.length > 0 && (
                    <div className="hidden md:flex items-center gap-1.5 mr-2">
                      {quickActions.slice(0, 2).map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => setChatInput(action)}
                          className="px-2.5 py-1 text-xs text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all whitespace-nowrap"
                          type="button"
                        >
                          {action.length > 20 ? action.slice(0, 20) + '...' : action}
                        </button>
                      ))}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!chatInput.trim() || isLoading}
                    className={`group flex-shrink-0 p-2 rounded-xl border transition-all duration-500 ease-out active:scale-[0.97] ${
                      chatInput.trim()
                        ? 'bg-gradient-to-b from-[#60A5FA] to-[#4A90E2] border-[#4A90E2]'
                        : 'bg-gradient-to-b from-white to-gray-100 border-gray-200'
                    }`}
                  >
                    {isLoading ? (
                      <div className="w-[22px] h-[22px] border-2 border-[#60A5FA] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ArrowBigUpDash
                        className={`w-[22px] h-[22px] transition-all duration-500 ease-out group-hover:-translate-y-0.5 ${
                          chatInput.trim() ? 'text-white' : 'text-gray-400'
                        }`}
                        strokeWidth={1.5}
                      />
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Compact Stats & Actions Row */}
          <div className="flex items-center justify-center gap-4 mt-4">
            {/* Stats */}
            <div className="flex items-center gap-4 text-sm">
              {operatingStatus && (
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${operatingStatus.isOpen ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <span className={operatingStatus.isOpen ? 'text-emerald-600' : 'text-rose-600'}>
                    {operatingStatus.isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
              )}
              {validServices.length > 0 && (
                <span className="text-gray-500">
                  <span className="font-medium text-gray-700">{validServices.length}</span> services
                </span>
              )}
              {employees.length > 0 && (
                <span className="text-gray-500">
                  <span className="font-medium text-gray-700">{employees.length}</span> team
                </span>
              )}
              <div className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="#FBBF24" stroke="#FBBF24" strokeWidth="1.5">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
                <span className="font-medium text-gray-700">4.8</span>
                <span className="text-gray-400">(128)</span>
              </div>
            </div>

            <div className="w-px h-4 bg-gray-200" />

            {/* Action buttons */}
            <div className="flex items-center gap-1.5">
              {currentUser && !isOwner && !isEmployee && (
                <button
                  onClick={handleToggleFollow}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all active:scale-[0.97] ${
                    isFollowing
                      ? 'bg-gray-100 border-gray-200 text-gray-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                  type="button"
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              )}

              <button
                onClick={(e: any) => toggleFavorite(e)}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={hasFavorited ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className={hasFavorited ? "text-rose-500" : "text-gray-500"}>
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                </svg>
              </button>

              <button
                onClick={handleDropdownToggle}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
                  <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========== SIMPLE CONTENT SECTIONS ========== */}
      <div className="pt-8 space-y-12">

        {/* Services */}
        {validServices.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Services</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {validServices.slice(0, 8).map((service, idx) => (
                <div
                  key={service.id}
                  style={{
                    opacity: 0,
                    animation: `fadeInUp 520ms ease-out forwards`,
                    animationDelay: `${Math.min(idx * 30, 300)}ms`,
                  }}
                >
                  <ServiceCard
                    service={service}
                    listing={listing}
                    currentUser={currentUser}
                    storeHours={storeHours}
                  />
                </div>
              ))}
              {isOwner && (
                <button
                  onClick={handleAddService}
                  type="button"
                  className="group relative h-[350px] max-w-[250px] rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100 transition-all"
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                        <path d="M12 5v14M5 12h14"/>
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-500">Add Service</span>
                  </div>
                </button>
              )}
            </div>
          </section>
        )}

        {/* Team */}
        {employees.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Team</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {employees.slice(0, 8).map((employee: any, idx: number) => (
                <div
                  key={employee.id || idx}
                  style={{
                    opacity: 0,
                    animation: `fadeInUp 520ms ease-out forwards`,
                    animationDelay: `${Math.min(idx * 30, 300)}ms`,
                  }}
                >
                  <WorkerCard
                    employee={employee}
                    listingTitle={title}
                    data={{ title, imageSrc: mainImage, category: (listing as any).category }}
                    listing={listing}
                    currentUser={currentUser}
                    onFollow={() => {}}
                    onBook={() => {}}
                  />
                </div>
              ))}
              {isOwner && (
                <button
                  onClick={handleAddWorker}
                  type="button"
                  className="group relative rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100 transition-all"
                  style={{ height: '358px' }}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                        <path d="M12 5v14M5 12h14"/>
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-500">Add Team Member</span>
                  </div>
                </button>
              )}
            </div>
          </section>
        )}

        {/* Gallery */}
        {((galleryImages && galleryImages.length > 0) || (posts && posts.length > 0) || isOwner) && (
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Gallery</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {galleryImages && galleryImages.map((image, idx) => (
                <div
                  key={`image-${idx}`}
                  className="relative rounded-xl overflow-hidden bg-gray-100 aspect-square group cursor-pointer"
                  style={{
                    opacity: 0,
                    animation: `fadeInUp 520ms ease-out forwards`,
                    animationDelay: `${Math.min(idx * 30, 300)}ms`,
                  }}
                >
                  <img
                    src={image}
                    alt={`${title} - Image ${idx + 1}`}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}

              {posts && posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUser={currentUser}
                  categories={categories}
                  variant="listing"
                />
              ))}

              {isOwner && (
                <button
                  onClick={handleAddMedia}
                  type="button"
                  className="group relative rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100 transition-all aspect-square"
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                        <path d="M12 5v14M5 12h14"/>
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-500">Add Media</span>
                  </div>
                </button>
              )}
            </div>
          </section>
        )}

        {/* About & Hours */}
        {(description || (storeHours && storeHours.length > 0)) && (
          <section>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {description && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">About</h2>
                  <p className="text-gray-600 leading-relaxed">{description}</p>

                  {/* Contact Links */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {phoneNumber && (
                      <a href={`tel:${phoneNumber}`} className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                        {phoneNumber}
                      </a>
                    )}
                    {website && (
                      <a href={website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                          <circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                        </svg>
                        Website
                      </a>
                    )}
                  </div>
                </div>
              )}

              {storeHours && storeHours.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Hours</h2>
                  <div className="space-y-1.5">
                    {storeHours.map((hours, idx) => {
                      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                      const isToday = hours.dayOfWeek === today;

                      return (
                        <div
                          key={idx}
                          className={`flex items-center justify-between py-2 px-3 rounded-lg ${isToday ? 'bg-gray-900 text-white' : ''}`}
                        >
                          <span className={`text-sm font-medium ${isToday ? 'text-white' : 'text-gray-700'}`}>
                            {hours.dayOfWeek}
                          </span>
                          <span className={`text-sm ${isToday ? 'text-white/80' : 'text-gray-500'}`}>
                            {hours.isClosed ? 'Closed' : `${hours.openTime} - ${hours.closeTime}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Empty States for owner */}
        {validServices.length === 0 && employees.length === 0 && isOwner && (
          <section className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Get started with your listing</h3>
              <p className="text-gray-500 mb-6">Add services and team members so customers can book with you.</p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleAddService}
                  className="px-4 py-2 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
                  type="button"
                >
                  Add Service
                </button>
                <button
                  onClick={handleAddWorker}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  type="button"
                >
                  Add Team Member
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default ListingHead;
