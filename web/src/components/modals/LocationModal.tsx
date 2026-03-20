'use client';

import React, { useState } from 'react';
import { Location01Icon } from 'hugeicons-react';
import Modal from './Modal';
import useLocationModal from '@/app/hooks/useLocationModal';

const POPULAR_LOCATIONS = [
  'Los Angeles, CA',
  'New York, NY',
  'Miami, FL',
  'Chicago, IL',
  'Houston, TX',
  'Atlanta, GA',
  'Dallas, TX',
  'Phoenix, AZ',
  'San Francisco, CA',
  'Seattle, WA',
  'Denver, CO',
  'Las Vegas, NV',
  'San Diego, CA',
  'Philadelphia, PA',
  'Nashville, TN',
  'Portland, OR',
  'Austin, TX',
  'Charlotte, NC',
  'Detroit, MI',
  'Minneapolis, MN',
];

const LocationModal = () => {
  const locationModal = useLocationModal();
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? POPULAR_LOCATIONS.filter((loc) =>
        loc.toLowerCase().includes(search.toLowerCase())
      )
    : POPULAR_LOCATIONS;

  const body = (
    <div className="flex flex-col">
      <div className="px-6 pb-4">
        <div className="relative">
          <Location01Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search cities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-3 text-[14px] text-stone-900 placeholder-stone-400 outline-none focus:border-stone-300 focus:bg-white transition-all"
            autoFocus
          />
        </div>
      </div>

      <div className="max-h-[320px] overflow-y-auto">
        {filtered.map((loc) => (
          <button
            key={loc}
            onClick={() => locationModal.setLocation(loc)}
            className={`w-full flex items-center gap-3 px-6 py-3 text-[14px] transition-colors ${
              locationModal.selectedLocation === loc
                ? 'text-stone-900 font-medium bg-stone-50'
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <Location01Icon className="w-4 h-4 text-stone-400 shrink-0" strokeWidth={1.5} />
            {loc}
            {locationModal.selectedLocation === loc && (
              <svg className="w-4 h-4 ml-auto text-stone-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="px-6 py-8 text-center text-[13px] text-stone-400">
            No cities found
          </p>
        )}
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={locationModal.isOpen}
      onClose={locationModal.onClose}
      onSubmit={() => {}}
      title="Location"
      body={body}
    />
  );
};

export default LocationModal;
