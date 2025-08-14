'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface BookingTabsProps {
  reservationsCount?: number; // optional badge
  tripsCount?: number;        // optional badge
}

const BookingTabs: React.FC<BookingTabsProps> = ({
  reservationsCount,
  tripsCount,
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const isTripsActive = pathname === '/bookings/trips';
  const isReservationsActive = pathname === '/bookings/reservations';

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex bg-gray-100 p-1 rounded-xl">
        <button
          onClick={() => router.push('/bookings/reservations')}
          className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
            isReservationsActive
              ? 'bg-white shadow-sm text-gray-900'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <span>Bookings</span>
            {typeof reservationsCount === 'number' && (
              <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-700">
                {reservationsCount}
              </span>
            )}
          </span>
          <div className="mt-1 text-[11px] text-gray-500">
            Received for your listings
          </div>
        </button>

        <button
          onClick={() => router.push('/bookings/trips')}
          className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
            isTripsActive
              ? 'bg-white shadow-sm text-gray-900'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <span>Trips</span>
            {typeof tripsCount === 'number' && (
              <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-700">
                {tripsCount}
              </span>
            )}
          </span>
          <div className="mt-1 text-[11px] text-gray-500">
            Your outgoing bookings
          </div>
        </button>
      </div>
    </div>
  );
};

export default BookingTabs;
