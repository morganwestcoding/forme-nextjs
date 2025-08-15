'use client';

import React, { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, Sparkles, Layers, Inbox, Send } from 'lucide-react';


interface BookingsHeaderProps {
  title?: string;
  subtitle?: string;
  /** Optional counts to show as badges */
  bookingsCount?: number;
  tripsCount?: number;
  /** Routes for tabs */
  bookingsHref?: string; // default: '/bookings/reservations'
  tripsHref?: string;    // default: '/bookings/trips'
  /** Accent color for active tab/underline */
  accentHex?: string;    // default: '#60A5FA'
  /** Optional handlers */
  onSearch?: (q: string) => void;
  onOpenFilters?: () => void;
  onCreate?: () => void;
}

const BookingsHeader: React.FC<BookingsHeaderProps> = ({
  title = 'Appointments',
  subtitle = "Manage reservations you've received and trips you've booked",
  bookingsCount,
  tripsCount,
  bookingsHref = '/bookings/reservations',
  tripsHref = '/bookings/trips',
  accentHex = '#60A5FA',
  onSearch,
  onOpenFilters,
  onCreate,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [query, setQuery] = useState('');

  const isBookingsActive = pathname === bookingsHref;
  const isTripsActive = pathname === tripsHref;

  const handleGo = (href: string) => router.push(href);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(query);
    // If you want URL search params, uncomment:
    // const current = new URLSearchParams(Array.from(params?.entries() || []));
    // query ? current.set('q', query) : current.delete('q');
    // router.push(`${pathname}?${current.toString()}`);
  };

  return (
    <div className="w-full">
      {/* Title + subtitle */}
      <div className="pt-4 mb-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600">{subtitle}</p>
      </div>

      {/* Search & Controls — same layout vibe as MarketExplorer */}
      <div className="flex mt-2 mb-7 gap-2 ">
        {/* Search Bar */}
        <form onSubmit={submitSearch} className="relative flex-grow">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder="Search bookings, guests, listings…"
            className="w-full h-12 pl-12 pr-4 border text-sm border-gray-200 rounded-xl"
          />
          {/* hidden submit to allow Enter */}
          <button type="submit" className="hidden" />
        </form>

        {/* Filters Button (same button style as MarketExplorer) */}
        <button
          onClick={onOpenFilters}
          className="shadow-sm bg-white text-gray-500 py-3 px-4 rounded-xl hover:bg-neutral-100 transition-colors flex items-center space-x-2 text-sm"
        >
          {/* The same filter SVG from your MarketExplorer */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="currentColor" fill="none">
            <path d="M14.5405 2V4.48622C14.5405 6.23417 14.5405 7.10814 14.7545 7.94715C14.9685 8.78616 15.3879 9.55654 16.2267 11.0973L17.3633 13.1852C19.5008 17.1115 20.5696 19.0747 19.6928 20.53L19.6792 20.5522C18.7896 22 16.5264 22 12 22C7.47357 22 5.21036 22 4.3208 20.5522L4.30725 20.53C3.43045 19.0747 4.49918 17.1115 6.63666 13.1852L7.7733 11.0973C8.61209 9.55654 9.03149 8.78616 9.24548 7.94715C9.45947 7.10814 9.45947 6.23417 9.45947 4.48622V2" stroke="currentColor" strokeWidth="1.5"></path>
            <path d="M9 16.002L9.00868 15.9996" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
            <path d="M15 18.002L15.0087 17.9996" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
            <path d="M8 2L16 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
            <path d="M7.5 11.5563C8.5 10.4029 10.0994 11.2343 12 12.3182C14.5 13.7439 16 12.65 16.5 11.6152" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="#F5F5F5"></path>
          </svg>
          <span>Filters</span>
        </button>

        {/* Create Button (same style block) */}
        <button
          onClick={onCreate}
          className="flex items-center justify-center py-3 space-x-2 px-4 shadow-sm rounded-lg transition-all bg-white text-gray-500 hover:bg-neutral-200"
        >
          {/* Same create/edit SVG you used */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="currentColor" fill="none">
            <path d="M16.4249 4.60509L17.4149 3.6151C18.2351 2.79497 19.5648 2.79497 20.3849 3.6151C21.205 4.43524 21.205 5.76493 20.3849 6.58507L19.3949 7.57506M16.4249 4.60509L9.76558 11.2644C9.25807 11.772 8.89804 12.4078 8.72397 13.1041L8 16L10.8959 15.276C11.5922 15.102 12.228 14.7419 12.7356 14.2344L19.3949 7.57506M16.4249 4.60509L19.3949 7.57506" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"></path>
            <path d="M18.9999 13.5C18.9999 16.7875 18.9999 18.4312 18.092 19.5376C17.9258 19.7401 17.7401 19.9258 17.5375 20.092C16.4312 21 14.7874 21 11.4999 21H11C7.22876 21 5.34316 21 4.17159 19.8284C3.00003 18.6569 3 16.7712 3 13V12.5C3 9.21252 3 7.56879 3.90794 6.46244C4.07417 6.2599 4.2599 6.07417 4.46244 5.90794C5.56879 5 7.21252 5 10.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
          <span className="text-sm">Create</span>
        </button>
      </div>

{/* Centered Tabs */}
<div className="flex border-b border-gray-200 relative justify-center">
  <div className="flex gap-8">

    {/* Received (bookings to you) */}
    <button
      onClick={() => handleGo(bookingsHref)}
      className={`pb-4 pt-2 px-4 flex text-sm items-center justify-center gap-2 transition-all duration-150 relative ${
        isBookingsActive ? 'font-medium' : 'text-gray-500 hover:text-gray-700'
      }`}
      style={isBookingsActive ? { color: accentHex } : {}}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="none"
        className={`transition-transform duration-150 ${
          isBookingsActive ? 'transform -translate-y-px' : ''
        }`}
        style={{ color: 'currentColor' }}
      >
        <path d="M7 2.5C5.59269 2.66536 4.62427 3.01488 3.89124 3.75363C2.5 5.15575 2.5 7.41242 2.5 11.9258C2.5 16.4391 2.5 18.6958 3.89124 20.0979C5.28249 21.5 7.52166 21.5 12 21.5C16.4783 21.5 18.7175 21.5 20.1088 20.0979C21.5 18.6958 21.5 16.4391 21.5 11.9258C21.5 7.41242 21.5 5.15575 20.1088 3.75363C19.3757 3.01488 18.4073 2.66536 17 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9.5 8C9.99153 8.5057 11.2998 10.5 12 10.5M14.5 8C14.0085 8.5057 12.7002 10.5 12 10.5M12 10.5V2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M21.5 13.5H16.5743C15.7322 13.5 15.0706 14.2036 14.6995 14.9472C14.2963 15.7551 13.4889 16.5 12 16.5C10.5111 16.5 9.70373 15.7551 9.30054 14.9472C8.92942 14.2036 8.26777 13.5 7.42566 13.5H2.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
      <span className={`transition-transform duration-150 ${
        isBookingsActive ? 'transform -translate-y-px' : ''
      }`}>
Incoming
      </span>
      {typeof bookingsCount === 'number' && (
        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
          {bookingsCount}
        </span>
      )}
      {isBookingsActive && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: accentHex }} />
      )}
    </button>

    {/* Sent (bookings you made) */}
    <button
      onClick={() => handleGo(tripsHref)}
      className={`pb-4 pt-2 px-4 flex text-sm items-center justify-center gap-2 transition-all duration-150 relative ${
        isTripsActive ? 'font-medium' : 'text-gray-500 hover:text-gray-700'
      }`}
      style={isTripsActive ? { color: accentHex } : {}}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="none"
        className={`transition-transform duration-150 ${
          isTripsActive ? 'transform -translate-y-px' : ''
        }`}
        style={{ color: 'currentColor' }}
      >
    <path d="M6.5 2.5C5.3579 2.68817 4.53406 3.03797 3.89124 3.6882C2.5 5.09548 2.5 7.36048 2.5 11.8905C2.5 16.4204 2.5 18.6854 3.89124 20.0927C5.28249 21.5 7.52166 21.5 12 21.5C16.4783 21.5 18.7175 21.5 20.1088 20.0927C21.5 18.6854 21.5 16.4204 21.5 11.8905C21.5 7.36048 21.5 5.09548 20.1088 3.6882C19.4659 3.03797 18.6421 2.68817 17.5 2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M9.5 5C9.99153 4.4943 11.2998 2.5 12 2.5M14.5 5C14.0085 4.4943 12.7002 2.5 12 2.5M12 2.5V10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M21.5 13.5H16.5743C15.7322 13.5 15.0706 14.2036 14.6995 14.9472C14.2963 15.7551 13.4889 16.5 12 16.5C10.5111 16.5 9.70373 15.7551 9.30054 14.9472C8.92942 14.2036 8.26777 13.5 7.42566 13.5H2.5" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"></path>

      </svg>
      <span className={`transition-transform duration-150 ${
        isTripsActive ? 'transform -translate-y-px' : ''
      }`}>
    Outgoing
      </span>
      {typeof tripsCount === 'number' && (
        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
          {tripsCount}
        </span>
      )}
      {isTripsActive && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: accentHex }} />
      )}
    </button>

  </div>
</div>




    </div>
  );
};

export default BookingsHeader;
