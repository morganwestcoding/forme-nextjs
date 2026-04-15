'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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

interface MapboxFeature {
  place_name: string;
  text: string;
  context?: Array<{ id: string; text: string; short_code?: string }>;
}

const LocationModal = () => {
  const locationModal = useLocationModal();
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!token) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?types=place&country=us&limit=6&access_token=${token}`
      );
      const data = await res.json();

      const cities = (data.features || []).map((f: MapboxFeature) => {
        const state = f.context?.find((c) => c.id.startsWith('region'))?.short_code?.replace('US-', '');
        return state ? `${f.text}, ${state}` : f.place_name;
      });

      setSuggestions(cities);
    } catch {
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (search.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(search.trim());
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, fetchSuggestions]);

  const handleSelect = (loc: string) => {
    locationModal.setLocation(loc);
    setSearch('');
    setSuggestions([]);
  };

  const handleClear = () => {
    locationModal.setLocation('');
    setSearch('');
    setSuggestions([]);
  };

  // Show suggestions when searching, popular locations otherwise
  const hasQuery = search.trim().length >= 2;
  const displayList = hasQuery ? suggestions : POPULAR_LOCATIONS.filter((loc) =>
    !search.trim() || loc.toLowerCase().includes(search.toLowerCase())
  );

  const body = (
    <div className="flex flex-col">
      <div className="px-6 pb-4">
        <div className="relative">
          <Location01Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search cities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200  rounded-xl pl-10 pr-4 py-3 text-[14px] text-stone-900 dark:text-stone-100 placeholder-stone-400 outline-none focus:border-stone-300 dark:border-stone-700 focus:bg-white  transition-all"
            autoFocus
          />
        </div>
      </div>

      {/* Section label */}
      <div className="px-6 pb-2">
        <p className="text-[11px] font-medium text-stone-400 dark:text-stone-500 uppercase tracking-wider">
          {hasQuery ? 'Results' : 'Popular Cities'}
        </p>
      </div>

      <div className="max-h-[320px] overflow-y-auto">
        {isSearching && (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-stone-200 dark:border-stone-800 border-t-stone-500 rounded-full animate-spin" />
          </div>
        )}

        {!isSearching && displayList.map((loc) => (
          <button
            key={loc}
            onClick={() => handleSelect(loc)}
            className={`w-full flex items-center gap-3 px-6 py-3 text-[14px] transition-colors ${
              locationModal.selectedLocation === loc
                ? 'text-stone-900 dark:text-stone-100 font-medium bg-stone-50 dark:bg-stone-900'
                : 'text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 dark:bg-stone-900'
            }`}
          >
            <Location01Icon className="w-4 h-4 text-stone-400 dark:text-stone-500 shrink-0" strokeWidth={1.5} />
            {loc}
            {locationModal.selectedLocation === loc && (
              <svg className="w-4 h-4 ml-auto text-stone-900 dark:text-stone-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
        ))}

        {!isSearching && hasQuery && displayList.length === 0 && (
          <p className="px-6 py-8 text-center text-[13px] text-stone-400 dark:text-stone-500">
            No cities found
          </p>
        )}
      </div>

      {/* Clear location button */}
      {locationModal.selectedLocation && (
        <div className="px-6 pt-3 pb-1 border-t border-stone-100 dark:border-stone-800">
          <button
            onClick={handleClear}
            className="w-full py-2.5 text-[13px] text-stone-500   hover:text-stone-700 dark:hover:text-stone-300 dark:text-stone-200 transition-colors"
          >
            Clear location filter
          </button>
        </div>
      )}
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
