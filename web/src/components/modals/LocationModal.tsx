'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Location01Icon,
  GpsSignal01Icon,
  Search01Icon,
  Clock04Icon,
  Cancel01Icon,
  Tick02Icon,
} from 'hugeicons-react';

const SERIF_ITALIC: React.CSSProperties = {
  fontFamily: "'Georgia', 'Times New Roman', serif",
  fontStyle: 'italic',
};
import Modal from './Modal';
import useLocationModal from '@/app/hooks/useLocationModal';

type Region = 'All' | 'West' | 'South' | 'Northeast' | 'Midwest';

interface CityEntry {
  city: string;
  state: string;
  region: Exclude<Region, 'All'>;
}

const POPULAR_CITIES: CityEntry[] = [
  { city: 'Los Angeles', state: 'CA', region: 'West' },
  { city: 'San Francisco', state: 'CA', region: 'West' },
  { city: 'San Diego', state: 'CA', region: 'West' },
  { city: 'Seattle', state: 'WA', region: 'West' },
  { city: 'Portland', state: 'OR', region: 'West' },
  { city: 'Denver', state: 'CO', region: 'West' },
  { city: 'Phoenix', state: 'AZ', region: 'West' },
  { city: 'Las Vegas', state: 'NV', region: 'West' },
  { city: 'Miami', state: 'FL', region: 'South' },
  { city: 'Houston', state: 'TX', region: 'South' },
  { city: 'Atlanta', state: 'GA', region: 'South' },
  { city: 'Dallas', state: 'TX', region: 'South' },
  { city: 'Austin', state: 'TX', region: 'South' },
  { city: 'Nashville', state: 'TN', region: 'South' },
  { city: 'Charlotte', state: 'NC', region: 'South' },
  { city: 'New York', state: 'NY', region: 'Northeast' },
  { city: 'Philadelphia', state: 'PA', region: 'Northeast' },
  { city: 'Chicago', state: 'IL', region: 'Midwest' },
  { city: 'Minneapolis', state: 'MN', region: 'Midwest' },
  { city: 'Detroit', state: 'MI', region: 'Midwest' },
];

const TRENDING = new Set(['Los Angeles, CA', 'Miami, FL', 'New York, NY', 'Austin, TX']);

const REGIONS: Region[] = ['All', 'West', 'South', 'Northeast', 'Midwest'];

interface MapboxFeature {
  place_name: string;
  text: string;
  context?: Array<{ id: string; text: string; short_code?: string }>;
}

const formatCity = (entry: CityEntry) => `${entry.city}, ${entry.state}`;

const splitLabel = (label: string): { city: string; state: string } => {
  const [city, state] = label.split(',').map((p) => p.trim());
  return { city: city ?? label, state: state ?? '' };
};

const HighlightMatch: React.FC<{ text: string; query: string }> = ({ text, query }) => {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <span className="font-semibold text-stone-900 dark:text-stone-50 underline decoration-stone-300 dark:decoration-stone-600 underline-offset-2">
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </>
  );
};

const LocationModal = () => {
  const locationModal = useLocationModal();
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [region, setRegion] = useState<Region>('All');
  const [geoStatus, setGeoStatus] = useState<'idle' | 'locating' | 'error'>('idle');
  const [activeIndex, setActiveIndex] = useState(0);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

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

  // Reset transient state when modal closes
  useEffect(() => {
    if (!locationModal.isOpen) {
      setSearch('');
      setSuggestions([]);
      setActiveIndex(0);
      setGeoStatus('idle');
      setRegion('All');
    }
  }, [locationModal.isOpen]);

  const handleSelect = useCallback(
    (loc: string) => {
      locationModal.setLocation(loc);
    },
    [locationModal]
  );

  const handleClear = () => {
    locationModal.setLocation('');
  };

  const handleUseCurrentLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setGeoStatus('error');
      return;
    }
    setGeoStatus('locating');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
        if (!token) {
          setGeoStatus('error');
          return;
        }
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?types=place&access_token=${token}`
          );
          const data = await res.json();
          const f: MapboxFeature | undefined = data.features?.[0];
          if (!f) {
            setGeoStatus('error');
            return;
          }
          const state = f.context?.find((c) => c.id.startsWith('region'))?.short_code?.replace('US-', '');
          handleSelect(state ? `${f.text}, ${state}` : f.place_name);
        } catch {
          setGeoStatus('error');
        }
      },
      () => setGeoStatus('error'),
      { timeout: 8000, maximumAge: 60_000 }
    );
  }, [handleSelect]);

  const hasQuery = search.trim().length >= 2;

  const filteredPopular = useMemo(() => {
    if (region === 'All') return POPULAR_CITIES;
    return POPULAR_CITIES.filter((c) => c.region === region);
  }, [region]);

  // Flat list used for keyboard navigation
  const navigable = useMemo(() => {
    if (hasQuery) return suggestions;
    const recents = locationModal.recentLocations;
    const popular = filteredPopular.map(formatCity);
    return [...recents, ...popular];
  }, [hasQuery, suggestions, locationModal.recentLocations, filteredPopular]);

  useEffect(() => {
    setActiveIndex(0);
  }, [search, region, hasQuery]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!navigable.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % navigable.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + navigable.length) % navigable.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const pick = navigable[activeIndex];
      if (pick) handleSelect(pick);
    }
  };

  const renderRow = (label: string, opts: { kind: 'recent' | 'popular' | 'suggestion'; navIndex: number }) => {
    const { city, state } = splitLabel(label);
    const selected = locationModal.selectedLocation === label;
    const active = opts.navIndex === activeIndex;
    const trending = TRENDING.has(label);

    return (
      <button
        key={`${opts.kind}-${label}`}
        onClick={() => handleSelect(label)}
        onMouseEnter={() => setActiveIndex(opts.navIndex)}
        className={`group w-full flex items-center gap-3 px-6 py-3 text-left transition-colors ${
          active
            ? 'bg-stone-100 dark:bg-stone-800/60'
            : 'hover:bg-stone-50 dark:hover:bg-stone-900'
        }`}
      >
        <div
          className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
            selected
              ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900'
              : 'bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400'
          }`}
        >
          {opts.kind === 'recent' ? (
            <Clock04Icon className="w-4 h-4" strokeWidth={1.5} />
          ) : (
            <Location01Icon className="w-4 h-4" strokeWidth={1.5} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <p
              className={`text-[14px] truncate ${
                selected
                  ? 'font-medium text-stone-900 dark:text-stone-100'
                  : 'text-stone-900 dark:text-stone-100'
              }`}
            >
              <HighlightMatch text={city} query={hasQuery ? search.trim() : ''} />
            </p>
            {trending && !hasQuery && (
              <span
                className="text-[11px] text-stone-400 dark:text-stone-500 leading-none"
                style={SERIF_ITALIC}
              >
                trending
              </span>
            )}
          </div>
          {state && (
            <p className="text-[12px] text-stone-500 dark:text-stone-400 truncate mt-0.5">
              <HighlightMatch text={state} query={hasQuery ? search.trim() : ''} />
            </p>
          )}
        </div>

        {selected && (
          <Tick02Icon className="w-4 h-4 text-stone-900 dark:text-stone-100 shrink-0" strokeWidth={2.5} />
        )}
      </button>
    );
  };

  let cursor = 0;
  const recentRows = !hasQuery
    ? locationModal.recentLocations.map((loc) => renderRow(loc, { kind: 'recent', navIndex: cursor++ }))
    : [];
  const popularRows = !hasQuery
    ? filteredPopular.map((c) => renderRow(formatCity(c), { kind: 'popular', navIndex: cursor++ }))
    : [];
  const suggestionRows = hasQuery
    ? suggestions.map((s) => renderRow(s, { kind: 'suggestion', navIndex: cursor++ }))
    : [];

  const body = (
    <div className="flex flex-col">
      {/* Search */}
      <div className="px-6 pb-3">
        <div className="relative">
          <Search01Icon
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500"
            strokeWidth={1.75}
          />
          <input
            type="text"
            placeholder="Search any U.S. city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl pl-10 pr-10 py-3 text-[14px] text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 outline-none focus:border-stone-400 dark:focus:border-stone-500 focus:bg-white dark:focus:bg-stone-900 transition-all"
            autoFocus
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
              aria-label="Clear search"
            >
              <Cancel01Icon className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      {/* Use my current location */}
      {!hasQuery && (
        <div className="px-6 pb-3">
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={geoStatus === 'locating'}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 hover:border-stone-900 dark:hover:border-stone-300 hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors group disabled:opacity-60 disabled:cursor-wait"
          >
            <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-700 dark:text-stone-200 group-hover:bg-stone-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-stone-900 transition-colors">
              <GpsSignal01Icon className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-[14px] text-stone-900 dark:text-stone-100">
                {geoStatus === 'locating' ? 'Finding your city…' : 'Use my current location'}
              </p>
              <p
                className="text-[11px] text-stone-400 dark:text-stone-500 leading-none mt-1"
                style={SERIF_ITALIC}
              >
                {geoStatus === 'error'
                  ? 'could not detect — try searching instead'
                  : 'detect nearby pros automatically'}
              </p>
            </div>
            {geoStatus === 'locating' && (
              <div className="w-4 h-4 border-2 border-stone-200 dark:border-stone-700 border-t-stone-700 dark:border-t-stone-200 rounded-full animate-spin" />
            )}
          </button>
        </div>
      )}

      {/* Region chips — only when browsing popular */}
      {!hasQuery && (
        <div className="px-6 pb-2">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide -mx-1 px-1">
            {REGIONS.map((r) => {
              const active = region === r;
              return (
                <button
                  key={r}
                  onClick={() => setRegion(r)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-[12px] transition-colors ${
                    active
                      ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900'
                      : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  {r}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Body list */}
      <div ref={listRef} className="max-h-[380px] overflow-y-auto">
        {/* Recent */}
        {!hasQuery && locationModal.recentLocations.length > 0 && (
          <>
            <div className="px-6 pt-2 pb-1 flex items-baseline justify-between">
              <p
                className="text-[12px] text-stone-400 dark:text-stone-500"
                style={SERIF_ITALIC}
              >
                recent
              </p>
              <button
                onClick={locationModal.clearRecents}
                className="text-[11px] text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                style={SERIF_ITALIC}
              >
                clear
              </button>
            </div>
            {recentRows}
            <div className="h-px bg-stone-100 dark:bg-stone-800 mx-6 my-2" />
          </>
        )}

        {/* Popular */}
        {!hasQuery && (
          <>
            <div className="px-6 pt-2 pb-1">
              <p
                className="text-[12px] text-stone-400 dark:text-stone-500"
                style={SERIF_ITALIC}
              >
                {region === 'All' ? 'popular cities' : `popular · ${region.toLowerCase()}`}
              </p>
            </div>
            {popularRows}
            {filteredPopular.length === 0 && (
              <div className="px-6 py-6 text-center text-[12px] text-stone-400 dark:text-stone-500" style={SERIF_ITALIC}>
                no cities in this region yet
              </div>
            )}
          </>
        )}

        {/* Search results */}
        {hasQuery && (
          <>
            <div className="px-6 pt-2 pb-1 flex items-baseline gap-2">
              <p
                className="text-[12px] text-stone-400 dark:text-stone-500"
                style={SERIF_ITALIC}
              >
                results
              </p>
              {!isSearching && suggestions.length > 0 && (
                <span className="text-[11px] text-stone-400 dark:text-stone-500">
                  · {suggestions.length}
                </span>
              )}
            </div>

            {isSearching && (
              <div className="flex items-center justify-center py-10">
                <div className="w-5 h-5 border-2 border-stone-200 dark:border-stone-800 border-t-stone-500 rounded-full animate-spin" />
              </div>
            )}

            {!isSearching && suggestionRows}

            {!isSearching && suggestions.length === 0 && (
              <div className="px-6 py-10 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                  <Search01Icon className="w-5 h-5 text-stone-400 dark:text-stone-500" strokeWidth={1.5} />
                </div>
                <p className="text-[14px] text-stone-900 dark:text-stone-100">
                  No matches for &ldquo;{search.trim()}&rdquo;
                </p>
                <p
                  className="mt-1 text-[12px] text-stone-400 dark:text-stone-500"
                  style={SERIF_ITALIC}
                >
                  try a different city or check the spelling
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="mt-2 px-6 py-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
        <p
          className="text-[12px] text-stone-400 dark:text-stone-500"
          style={SERIF_ITALIC}
        >
          {locationModal.selectedLocation
            ? `filtering · ${locationModal.selectedLocation}`
            : 'showing all locations'}
        </p>
        {locationModal.selectedLocation && (
          <button
            onClick={handleClear}
            className="text-[12px] text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
          >
            Clear
          </button>
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
