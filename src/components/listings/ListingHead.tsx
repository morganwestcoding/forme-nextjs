'use client';

import React, { useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import ServiceCard from './ServiceCard';
import WorkerCard from './WorkerCard';
import PostCard from '../feed/PostCard';
import QRModal from '../modals/QRModal';
import ListingLocalSearch from './ListingLocalSearch';
import { SafePost, SafeUser, SafeListing } from '@/app/types';
import useReservationModal from '@/app/hooks/useReservationModal';
import useRentModal from '@/app/hooks/useListingModal';
import useFavorite from '@/app/hooks/useFavorite';
import SectionHeader from '@/app/market/SectionHeader';

interface ServiceItem {
  id: string;
  serviceName: string;
  price: number;
  category: string;
  imageSrc?: string | null;
  description?: string;
  popular?: boolean;
}

type TabKey = 'About' | 'Services' | 'Team' | 'Posts' | 'Reviews';

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

  const isFollowing = !!currentUser?.id && followers.includes(currentUser.id);
  const [activeTab, setActiveTab] = useState<TabKey | null>(null);
  const [scrollY, setScrollY] = useState(0);

  // Parallax effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const reservationModal = useReservationModal();
  const rentModal = useRentModal();
  const { hasFavorited, toggleFavorite } = useFavorite({
    listingId: listing.id,
    currentUser
  });

  const [searchQuery, setSearchQuery] = useState('');

  const mainImage = imageSrc || galleryImages?.[0] || '/placeholder.jpg';

  const handleReserveClick = () => {
    if (!currentUser) return;
    reservationModal.onOpen(listing, currentUser);
  };

  const isOwner = !!currentUser?.id && currentUser.id === user?.id;

  // Check if current user is an employee of this listing
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

  // Filter services based on search query
  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return validServices;
    const query = searchQuery.toLowerCase();
    return validServices.filter(
      (service) =>
        service.serviceName?.toLowerCase().includes(query) ||
        service.category?.toLowerCase().includes(query) ||
        service.description?.toLowerCase().includes(query) ||
        service.price?.toString().includes(query)
    );
  }, [validServices, searchQuery]);

  // Filter employees based on search query
  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) return employees;
    const query = searchQuery.toLowerCase();
    return employees.filter((employee: any) =>
      employee.name?.toLowerCase().includes(query) ||
      employee.specialty?.toLowerCase().includes(query) ||
      employee.bio?.toLowerCase().includes(query)
    );
  }, [employees, searchQuery]);

  // Filter posts based on search query
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const query = searchQuery.toLowerCase();
    return posts.filter((post) =>
      post.content?.toLowerCase().includes(query)
    );
  }, [posts, searchQuery]);

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

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: 'About', label: 'About Us' },
    { key: 'Services', label: 'Services' },
    { key: 'Team', label: 'Team' },
    { key: 'Posts', label: 'Posts' },
    { key: 'Reviews', label: 'Reviews' },
  ];

  return (
    <>
      {/* QR Modal - Outside main flow */}
      <QRModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        listing={listing}
      />

      {/* Dropdown backdrop - closes dropdown when clicked - Outside main flow */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}

      {/* Dropdown Menu - Fixed position to escape overflow */}
      {showDropdown && (
        <div
          className="fixed top-20 right-6 md:right-24 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50"
          style={{ maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}
        >
          {/* Owner and Employee options */}
          {(isOwner || isEmployee) && (
            <>
              {/* QR Code option for owners and employees */}
              <button
                onClick={() => {
                  setShowDropdown(false);
                  handleQRClick();
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" className="text-gray-500">
                  <path d="M3 6C3 4.58579 3 3.87868 3.43934 3.43934C3.87868 3 4.58579 3 6 3C7.41421 3 8.12132 3 8.56066 3.43934C9 3.87868 9 4.58579 9 6C9 7.41421 9 8.12132 8.56066 8.56066C8.12132 9 7.41421 9 6 9C4.58579 9 3.87868 9 3.43934 8.56066C3 8.12132 3 7.41421 3 6Z" strokeWidth="1.5"></path>
                  <path d="M3 18C3 16.5858 3 15.8787 3.43934 15.4393C3.87868 15 4.58579 15 6 15C7.41421 15 8.12132 15 8.56066 15.4393C9 15.8787 9 16.5858 9 18C9 19.4142 9 20.1213 8.56066 20.5607C8.12132 21 7.41421 21 6 21C4.58579 21 3.87868 21 3.43934 20.5607C3 20.1213 3 19.4142 3 18Z" strokeWidth="1.5"></path>
                  <path d="M3 12L9 12" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                  <path d="M12 3V8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                  <path d="M15 6C15 4.58579 15 3.87868 15.4393 3.43934C15.8787 3 16.5858 3 18 3C19.4142 3 20.1213 3 20.5607 3.43934C21 3.87868 21 4.58579 21 6C21 7.41421 21 8.12132 20.5607 8.56066C20.1213 9 19.4142 9 18 9C16.5858 9 15.8787 9 15.4393 8.56066C15 8.12132 15 7.41421 15 6Z" strokeWidth="1.5"></path>
                  <path d="M21 12H15C13.5858 12 12.8787 12 12.4393 12.4393C12 12.8787 12 13.5858 12 15M12 17.7692V20.5385M15 15V16.5C15 17.9464 15.7837 18 17 18C17.5523 18 18 18.4477 18 19M16 21H15M18 15C19.4142 15 20.1213 15 20.5607 15.44C21 15.8799 21 16.5881 21 18.0043C21 19.4206 21 20.1287 20.5607 20.5687C20.24 20.8898 19.7767 20.9766 19 21" strokeWidth="1.5" strokeLinecap="round"></path>
                </svg>
                Show QR Code
              </button>
              {isOwner && (
                <>
                  <hr className="my-1 border-gray-200" />
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
            </>
          )}

          {/* Non-owner options */}
          {!isOwner && !isEmployee && currentUser && (
            <>
              <button
                onClick={() => {
                  handleToggleFollow();
                  setShowDropdown(false);
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
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
              <button
                onClick={(e: any) => {
                  toggleFavorite(e);
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={hasFavorited ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={hasFavorited ? "text-rose-500" : "text-gray-500"}>
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                </svg>
                {hasFavorited ? 'Saved' : 'Save Listing'}
              </button>
              <hr className="my-1 border-gray-200" />
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

      {/* Hero Section */}
      <div className="-mx-6 md:-mx-24 -mt-2 md:-mt-8">
        <div
          className="relative px-6 md:px-24 pt-10 overflow-hidden"
        >
          {/* Background Image with Parallax Effect */}
          <div className="absolute inset-0 -mx-6 md:-mx-24 overflow-hidden">
            <img
              src={mainImage}
              alt={title}
              className="absolute w-full object-cover will-change-transform"
              style={{
                top: '-20%',
                height: '140%',
                transform: `translateY(${scrollY * 0.3}px)`
              }}
            />
            {/* Gradient overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(to top,' +
                  'rgba(0,0,0,0.65) 0%,' +
                  'rgba(0,0,0,0.55) 15%,' +
                  'rgba(0,0,0,0.40) 35%,' +
                  'rgba(0,0,0,0.25) 55%,' +
                  'rgba(0,0,0,0.15) 75%,' +
                  'rgba(0,0,0,0.08) 100%)',
              }}
            />
          </div>

          {/* Three-dot menu button - top right */}
          <div className="absolute top-6 right-6 md:right-24 z-50">
            <button
              onClick={handleDropdownToggle}
              className="p-1 hover:bg-white/5 rounded-xl transition-colors relative z-50"
              type="button"
              aria-label="Options menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none">
                <path d="M21 12C21 11.1716 20.3284 10.5 19.5 10.5C18.6716 10.5 18 11.1716 18 12C18 12.8284 18.6716 13.5 19.5 13.5C20.3284 13.5 21 12.8284 21 12Z" stroke="white" strokeWidth="1.5" fill='white'></path>
                <path d="M13.5 12C13.5 11.1716 12.8284 10.5 12 10.5C11.1716 10.5 10.5 11.1716 10.5 12C10.5 12.8284 11.1716 13.5 12 13.5C12.8284 13.5 13.5 12.8284 13.5 12Z" stroke="white" strokeWidth="1.5" fill='white'></path>
                <path d="M6 12C6 11.1716 5.32843 10.5 4.5 10.5C3.67157 10.5 3 11.1716 3 12C3 12.8284 3.67157 13.5 4.5 13.5C5.32843 13.5 6 12.8284 6 12Z" stroke="white" strokeWidth="1.5" fill='white'></path>
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="relative z-10 pb-6">
            {/* Single Column Layout */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-4xl font-bold text-white">
                  {title}
                </h1>
                {/* Verified Badge */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  fill="#60A5FA"
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

              <div className="flex items-center gap-3 text-white/80 mb-6">
                <span className="text-sm">
                  {address && location ? `${address}, ${location}` : address || location}
                </span>
                {/* Operating Status */}
                {storeHours && storeHours.length > 0 && (() => {
                  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                  const todayHours = storeHours.find(h => h.dayOfWeek === today);
                  const isOpen = todayHours && !todayHours.isClosed;

                  return (
                    <>
                      <span className="text-white/40">·</span>
                      <span className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-emerald-400' : 'bg-red-400'}`} />
                        <span className="text-sm">
                          {isOpen ? `We're open until ${todayHours.closeTime}` : `We're closed today`}
                        </span>
                      </span>
                    </>
                  );
                })()}
              </div>

              {/* Search Bar and Buttons Row */}
              <div className="flex gap-3">
                <div className="flex-grow">
                  <ListingLocalSearch
                    placeholder="Search..."
                    onSearchChange={setSearchQuery}
                  />
                </div>

                {/* Action Buttons - Side by Side */}
                {currentUser && (
                  <>
                    {/* Reserve Button */}
                    <button
                      onClick={handleReserveClick}
                      className="bg-transparent border border-white/30 hover:border-white/50 text-white hover:text-white py-2.5 px-4 rounded-xl transition-all duration-300 text-sm flex items-center justify-center space-x-2"
                      type="button"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M18 2V4M6 2V4" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M11.9955 13H12.0045M11.9955 17H12.0045M15.991 13H16M8 13H8.00897M8 17H8.00897" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3.5 8H20.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2.5 12.2432C2.5 7.88594 2.5 5.70728 3.75212 4.35364C5.00424 3 7.01949 3 11.05 3H12.95C16.9805 3 18.9958 3 20.2479 4.35364C21.5 5.70728 21.5 7.88594 21.5 12.2432V12.7568C21.5 17.1141 21.5 19.2927 20.2479 20.6464C18.9958 22 16.9805 22 12.95 22H11.05C7.01949 22 5.00424 22 3.75212 20.6464C2.5 19.2927 2.5 17.1141 2.5 12.7568V12.2432Z" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3 8H21" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>Reserve</span>
                    </button>

                    {/* Follow Button for non-owners/non-employees OR Edit Button for owners/employees */}
                    {isOwner || isEmployee ? (
                      <button
                        onClick={handleEditListing}
                        className="bg-transparent border border-white/30 hover:border-white/50 text-white hover:text-white py-2.5 px-4 rounded-xl transition-all duration-300 text-sm flex items-center justify-center space-x-2"
                        type="button"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M16.4249 4.60509L17.4149 3.6151C18.2351 2.79497 19.5648 2.79497 20.3849 3.6151C21.205 4.43524 21.205 5.76493 20.3849 6.58507L19.3949 7.57506M16.4249 4.60509L9.76558 11.2644C9.25807 11.772 8.89804 12.4078 8.72397 13.1041L8 16L10.8959 15.276C11.5922 15.102 12.228 14.7419 12.7356 14.2344L19.3949 7.57506M16.4249 4.60509L19.3949 7.57506" strokeLinejoin="round"/>
                          <path d="M18.9999 13.5C18.9999 16.7875 18.9999 18.4312 18.092 19.5376C17.9258 19.7401 17.7401 19.9258 17.5375 20.092C16.4312 21 14.7874 21 11.4999 21H11C7.22876 21 5.34316 21 4.17159 19.8284C3.00003 18.6569 3 16.7712 3 13V12.5C3 9.21252 3 7.56879 3.90794 6.46244C4.07417 6.2599 4.2599 6.07417 4.46244 5.90794C5.56879 5 7.21252 5 10.5 5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>Edit</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleToggleFollow}
                        className="bg-transparent border border-white/30 hover:border-white/50 text-white hover:text-white py-2.5 px-4 rounded-xl transition-all duration-300 text-sm flex items-center justify-center space-x-2"
                        type="button"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                          <circle cx="9" cy="7" r="4"/>
                          <line x1="19" y1="8" x2="19" y2="14"/>
                          <line x1="22" y1="11" x2="16" y2="11"/>
                        </svg>
                        <span>{isFollowing ? 'Following' : 'Follow'}</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>


          </div>
          {/* Navigation Tabs */}
          <div className="-mx-6 md:-mx-24 pb-3 relative z-10">
            <div className="flex items-center justify-center">
              {tabs.map(({ key, label }, index) => {
                const isSelected = activeTab === key;
                const selectedIndex = tabs.findIndex(t => t.key === activeTab);
                const hasSelection = selectedIndex !== -1;

                // Toggle behavior: click to select, click again to deselect (show all)
                const handleTabClick = () => {
                  setActiveTab(activeTab === key ? null : key);
                };

                // Determine divider state: adjacent to selected rotates horizontal, others disappear
                const getDividerState = () => {
                  if (!hasSelection) return 'vertical';
                  if (index === selectedIndex - 1 || index === selectedIndex) return 'horizontal';
                  return 'hidden';
                };
                const dividerState = getDividerState();

                return (
                  <div key={key} className="relative flex items-center">
                    <button
                      onClick={handleTabClick}
                      className={`
                        px-8 py-3.5 text-sm transition-all duration-200
                        ${isSelected
                          ? 'text-[#60A5FA] font-medium'
                          : 'text-white/80 hover:text-white'
                        }
                      `}
                      type="button"
                    >
                      {label}
                    </button>

                    {/* Divider: vertical by default, rotates horizontal when adjacent to selected, disappears otherwise */}
                    {index < tabs.length - 1 && (
                      <span
                        className={`
                          bg-white/60 transition-all duration-300 ease-out
                          ${dividerState === 'horizontal' ? 'w-3 h-[0.5px] bg-[#60A5FA]' : ''}
                          ${dividerState === 'vertical' ? 'w-[0.5px] h-4' : ''}
                          ${dividerState === 'hidden' ? 'w-[0.5px] h-4 opacity-0' : ''}
                        `}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {/* About Section */}
        {(activeTab === null || activeTab === 'About') && (
          <>
            {/* Description Section */}
            {description && (
              <>
                <SectionHeader title="What We're All About" />
                <div className="mb-6">
                  <p className="text-gray-700 leading-relaxed text-[15px]">{description}</p>
                </div>

                {/* Engagement Metrics - Only show if there's meaningful data */}
                {(followers.length > 0 || (posts?.length || 0) > 0) && (
                  <div className="flex items-center gap-6 pb-8 mb-8 text-sm border-b border-gray-100">
                    {/* Followers - only show if > 0 */}
                    {followers.length > 0 && (
                      <>
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-semibold text-gray-700">{followers.length}</span>
                          <span className="text-gray-500">followers</span>
                        </div>
                        <span className="text-gray-300">·</span>
                      </>
                    )}

                    {/* Posts - only show if > 0 */}
                    {(posts?.length || 0) > 0 && (
                      <>
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-semibold text-gray-700">{posts?.length || 0}</span>
                          <span className="text-gray-500">posts</span>
                        </div>
                        <span className="text-gray-300">·</span>
                      </>
                    )}

                    {/* Rating - always show with star icon */}
                    <div className="flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="#FBBF24" stroke="#FBBF24" strokeWidth="1.5">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                      </svg>
                      <span className="font-semibold text-gray-700">4.8</span>
                      <span className="text-gray-500">rating</span>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Store Hours Section */}
            {storeHours && storeHours.length > 0 && (
              <div className="mb-12">
                <SectionHeader title="Store Hours" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl">
                  {storeHours.map((hours, index) => {
                    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                    const isToday = hours.dayOfWeek === today;

                    return (
                      <div
                        key={index}
                        className={`
                          rounded-lg border transition-all duration-200
                          ${isToday
                            ? 'bg-gray-900 border-gray-900 text-white shadow-sm'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                          }
                        `}
                      >
                        <div className="px-3 py-2.5">
                          {/* Day */}
                          <div className={`text-xs font-semibold mb-1 uppercase tracking-wide ${isToday ? 'text-white/70' : 'text-gray-500'}`}>
                            {hours.dayOfWeek}
                          </div>

                          {/* Hours */}
                          {hours.isClosed ? (
                            <div className={`text-sm font-medium ${isToday ? 'text-white/80' : 'text-gray-400'}`}>
                              Closed
                            </div>
                          ) : (
                            <div className={`text-sm font-semibold tabular-nums ${isToday ? 'text-white' : 'text-gray-900'}`}>
                              {hours.openTime}
                              <span className={`text-xs mx-1 ${isToday ? 'text-white/50' : 'text-gray-400'}`}>→</span>
                              {hours.closeTime}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="mb-12">
              <SectionHeader title="Get In Touch" />
              <div>
              {/* Contact info - simple inline badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {phoneNumber && (
                  <a
                    href={`tel:${phoneNumber}`}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors text-sm text-gray-700 hover:text-gray-900"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <span className="font-medium">{phoneNumber}</span>
                  </a>
                )}

                {website && (
                  <a
                    href={website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors text-sm text-gray-700 hover:text-gray-900"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" x2="22" y1="12" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                    <span className="font-medium">{website.replace(/^https?:\/\/(www\.)?/, '')}</span>
                  </a>
                )}

                {(address || location) && (
                  <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className="font-medium">{address && location ? `${address}, ${location}` : address || location}</span>
                  </span>
                )}
              </div>

              {/* Social Links - inline badges */}
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href="#"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-50 hover:bg-pink-50 border border-gray-200 hover:border-pink-300 transition-colors text-sm text-gray-600 hover:text-pink-600"
                  aria-label="Instagram"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none">
                    <path d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M16.5 12C16.5 14.4853 14.4853 16.5 12 16.5C9.51472 16.5 7.5 14.4853 7.5 12C7.5 9.51472 9.51472 7.5 12 7.5C14.4853 7.5 16.5 9.51472 16.5 12Z" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M17.5078 6.5L17.4988 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="font-medium">Instagram</span>
                </a>

                <a
                  href="#"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-400 transition-colors text-sm text-gray-600 hover:text-gray-900"
                  aria-label="X (Twitter)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none">
                    <path d="M3 21L10.5484 13.4516M21 3L13.4516 10.5484M13.4516 10.5484L8 3H3L10.5484 13.4516M13.4516 10.5484L21 21H16L10.5484 13.4516" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="font-medium">X</span>
                </a>

                <a
                  href="#"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 transition-colors text-sm text-gray-600 hover:text-blue-600"
                  aria-label="Facebook"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none">
                    <path d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M15.9655 12H13.9999V20.5M13.9999 12V8.82143C13.9999 7.81583 14.8035 7 15.7942 7H16.5M13.9999 12H10.9999" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="font-medium">Facebook</span>
                </a>

                <a
                  href="#"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-400 transition-colors text-sm text-gray-600 hover:text-blue-700"
                  aria-label="LinkedIn"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none">
                    <path d="M7 10V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M11 13V17M11 13C11 11.3431 12.3431 10 14 10C15.6569 10 17 11.3431 17 13V17M11 13V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M7.00801 7L6.99902 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  </svg>
                  <span className="font-medium">LinkedIn</span>
                </a>
              </div>
              </div>
            </div>
          </>
        )}

        {/* Services Section */}
        {(activeTab === null || activeTab === 'Services') && (
          <div className="mb-12">
            <SectionHeader title="Available Services" />

            {validServices.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-base font-medium text-gray-600 mb-1">No services yet</p>
                <p className="text-sm text-gray-500">Services will be listed here once added</p>
              </div>
            ) : filteredServices.length === 0 && searchQuery.trim() ? (
              <div className="text-center py-16">
                <p className="text-base font-medium text-gray-600 mb-1">No services found</p>
                <p className="text-sm text-gray-500">Try a different search term</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredServices.map(service => (
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
                  className="group relative h-[350px] max-w-[250px] rounded-xl border-2 border-dashed border-neutral-300 bg-gradient-to-br from-neutral-50 to-neutral-100 hover:border-neutral-400 hover:shadow-sm hover:from-neutral-100 hover:to-neutral-200 transition-all duration-300 ease-out"
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6">
                    <div className="rounded-full bg-white p-2 shadow-sm transition-all duration-300 group-hover:shadow group-hover:scale-105">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 text-neutral-500 transition-transform duration-300 ease-out group-hover:rotate-90 transform-gpu"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </div>

                    <span className="text-xs font-medium leading-tight text-neutral-600 group-hover:text-neutral-800 transform-gpu text-center">
                      Add Service
                    </span>
                  </div>
                </button>
              )}
            </div>
            )}
          </div>
        )}

        {/* Team Section */}
        {(activeTab === null || activeTab === 'Team') && (
          <div className="mb-12">
            <SectionHeader title="Our Team" />

            {employees.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-base font-medium text-gray-600 mb-1">No team members yet</p>
                <p className="text-sm text-gray-500">Team members will appear here once added</p>
              </div>
            ) : filteredEmployees.length === 0 && searchQuery.trim() ? (
              <div className="text-center py-16">
                <p className="text-base font-medium text-gray-600 mb-1">No team members found</p>
                <p className="text-sm text-gray-500">Try a different search term</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredEmployees.map((employee: any, index: number) => (
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
                  className="group relative max-w-[250px] rounded-xl border-2 border-dashed border-neutral-300 bg-gradient-to-br from-neutral-50 to-neutral-100 hover:border-neutral-400 hover:shadow-sm hover:from-neutral-100 hover:to-neutral-200 transition-all duration-300 ease-out"
                  style={{ height: '358px' }}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6">
                    <div className="rounded-full bg-white p-2 shadow-sm transition-all duration-300 group-hover:shadow group-hover:scale-105">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 text-neutral-500 transition-transform duration-300 ease-out group-hover:rotate-90 transform-gpu"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </div>

                    <span className="text-xs font-medium leading-tight text-neutral-600 group-hover:text-neutral-800 transform-gpu text-center">
                      Add Team Member
                    </span>
                  </div>
                </button>
              )}
            </div>
            )}
          </div>
        )}

        {/* Posts Section */}
        {(activeTab === null || activeTab === 'Posts') && (
          <div className="mb-12">
            <SectionHeader title="Gallery" />

            {(!galleryImages || galleryImages.length === 0) && (!posts || posts.length === 0) ? (
              <>
                {isOwner ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    <button
                      onClick={handleAddMedia}
                      type="button"
                      className="group relative rounded-xl border-2 border-dashed border-neutral-300 bg-gradient-to-br from-neutral-50 to-neutral-100 hover:border-neutral-400 hover:shadow-sm hover:from-neutral-100 hover:to-neutral-200 transition-all duration-300 ease-out"
                      style={{ aspectRatio: '1 / 1' }}
                    >
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 p-4">
                        <div className="rounded-full bg-white p-2 shadow-sm transition-all duration-300 group-hover:shadow group-hover:scale-105">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4 text-neutral-500 transition-transform duration-300 ease-out group-hover:rotate-90 transform-gpu"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          >
                            <path d="M12 5v14M5 12h14" />
                          </svg>
                        </div>

                        <span className="text-xs font-medium leading-tight text-neutral-600 group-hover:text-neutral-800 transform-gpu text-center">
                          Add Media
                        </span>
                      </div>
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <p className="text-base font-medium text-gray-600 mb-1">No posts yet</p>
                    <p className="text-sm text-gray-500">Share photos and videos to showcase your work</p>
                  </div>
                )}
              </>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Gallery Images */}
                {galleryImages && galleryImages.length > 0 && (
                  galleryImages.map((image, index) => (
                    <div
                      key={`image-${index}`}
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
                )}

                {/* Post Cards */}
                {filteredPosts && filteredPosts.length > 0 && (
                  filteredPosts.map(post => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUser={currentUser}
                      categories={categories}
                      variant="listing"
                    />
                  ))
                )}

                {/* Add Media Button */}
                {isOwner && (
                  <button
                    onClick={handleAddMedia}
                    type="button"
                    className="group relative rounded-xl border-2 border-dashed border-neutral-300 bg-gradient-to-br from-neutral-50 to-neutral-100 hover:border-neutral-400 hover:shadow-sm hover:from-neutral-100 hover:to-neutral-200 transition-all duration-300 ease-out"
                    style={{ aspectRatio: '1 / 1' }}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 p-4">
                      <div className="rounded-full bg-white p-2 shadow-sm transition-all duration-300 group-hover:shadow group-hover:scale-105">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4 text-neutral-500 transition-transform duration-300 ease-out group-hover:rotate-90 transform-gpu"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        >
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </div>

                      <span className="text-xs font-medium leading-tight text-neutral-600 group-hover:text-neutral-800 transform-gpu text-center">
                        Add Media
                      </span>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Reviews Section */}
        {(activeTab === null || activeTab === 'Reviews') && (
          <div className="mb-12">
            <SectionHeader title="Reviews" />
            <div className="text-center py-16">
              <p className="text-base font-medium text-gray-600 mb-1">No reviews yet</p>
              <p className="text-sm text-gray-500">Reviews from customers will appear here</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ListingHead;