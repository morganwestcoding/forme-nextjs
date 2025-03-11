'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';

const BookingTabs = () => {
  const router = useRouter();
  const pathname = usePathname();
  
  const isTripsActive = pathname === '/bookings/trips';
  const isReservationsActive = pathname === '/bookings/reservations';

  return (
    <div className="w-full max-w-3xl mx-auto py-4">
      <div className="flex bg-gray-100 p-1 rounded-xl">
        <button
          onClick={() => router.push('/bookings/reservations')}
          className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
            isReservationsActive 
              ? 'bg-white shadow-sm text-gray-900' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Reservations
          <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-700">
            Received Bookings
          </span>
        </button>
        
        <button
          onClick={() => router.push('/bookings/trips')}
          className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
            isTripsActive 
              ? 'bg-white shadow-sm text-gray-900' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Trips
          <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-700">
            Your Bookings
          </span>
        </button>
      </div>
    </div>
  );
};

export default BookingTabs;