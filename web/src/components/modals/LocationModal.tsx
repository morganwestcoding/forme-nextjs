'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  GpsSignal01Icon,
  Search01Icon,
  Clock04Icon,
  Cancel01Icon,
  Tick02Icon,
} from 'hugeicons-react';

import Modal from './Modal';
import useLocationModal from '@/app/hooks/useLocationModal';

// Set access token at module load — Mapbox can't initialise without it,
// and setting it inside an effect leaves a window where other modules
// reading mapboxgl.accessToken see an empty string.
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

interface PopularCity {
  city: string;
  state: string;
  lng: number;
  lat: number;
}

const POPULAR_CITIES: PopularCity[] = [
  { city: 'Los Angeles', state: 'CA', lng: -118.2437, lat: 34.0522 },
  { city: 'New York', state: 'NY', lng: -74.006, lat: 40.7128 },
  { city: 'Miami', state: 'FL', lng: -80.1918, lat: 25.7617 },
  { city: 'Chicago', state: 'IL', lng: -87.6298, lat: 41.8781 },
  { city: 'Austin', state: 'TX', lng: -97.7431, lat: 30.2672 },
  { city: 'San Francisco', state: 'CA', lng: -122.4194, lat: 37.7749 },
  { city: 'Seattle', state: 'WA', lng: -122.3321, lat: 47.6062 },
  { city: 'Denver', state: 'CO', lng: -104.9903, lat: 39.7392 },
];

interface MapboxFeature {
  place_name: string;
  text: string;
  center: [number, number];
  context?: Array<{ id: string; text: string; short_code?: string }>;
}

interface ResolvedSuggestion {
  label: string;
  city: string;
  state: string;
  lng: number;
  lat: number;
}

const formatLabel = (city: string, state: string) => `${city}, ${state}`;
const splitLabel = (label: string) => {
  const [city, state] = label.split(',').map((p) => p.trim());
  return { city: city ?? label, state: state ?? '' };
};

const US_CENTER: [number, number] = [-96, 38];

const LocationModal: React.FC = () => {
  const locationModal = useLocationModal();
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<ResolvedSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [geoStatus, setGeoStatus] = useState<'idle' | 'locating' | 'error'>('idle');
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  const popularByLabel = useMemo(() => {
    const m = new Map<string, PopularCity>();
    POPULAR_CITIES.forEach((c) => m.set(formatLabel(c.city, c.state), c));
    return m;
  }, []);

  const fetchSuggestions = useCallback(
    async (query: string) => {
      if (!token || query.length < 2) {
        setSuggestions([]);
        setIsSearching(false);
        return;
      }
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?types=place&country=us&limit=6&access_token=${token}`,
        );
        const data = await res.json();
        const cities: ResolvedSuggestion[] = (data.features || []).map(
          (f: MapboxFeature) => {
            const stateShort = f.context
              ?.find((c) => c.id.startsWith('region'))
              ?.short_code?.replace('US-', '');
            const state = stateShort || '';
            return {
              label: state ? `${f.text}, ${state}` : f.place_name,
              city: f.text,
              state,
              lng: f.center[0],
              lat: f.center[1],
            };
          },
        );
        setSuggestions(cities);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    },
    [token],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (search.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    setIsSearching(true);
    debounceRef.current = setTimeout(() => fetchSuggestions(search.trim()), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, fetchSuggestions]);

  useEffect(() => {
    if (!locationModal.isOpen) {
      setSearch('');
      setSuggestions([]);
      setActiveIndex(-1);
      setGeoStatus('idle');
    }
  }, [locationModal.isOpen]);

  // Initialize map when modal opens
  useEffect(() => {
    if (!locationModal.isOpen || !mapContainer.current || !token) return;
    if (mapRef.current) return;

    const initial = locationModal.selectedLocation
      ? popularByLabel.get(locationModal.selectedLocation)
      : null;

    let map: mapboxgl.Map;
    try {
      map = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: initial ? [initial.lng, initial.lat] : US_CENTER,
        zoom: initial ? 10 : 3.4,
        attributionControl: false,
      });
    } catch (err) {
      console.error('LocationModal map init failed:', err);
      return;
    }

    mapRef.current = map;
    map.on('error', (e) => console.error('LocationModal mapbox error:', e?.error || e));

    const popularMarkers: mapboxgl.Marker[] = [];

    const makeDot = (size: number, color: string) => {
      const el = document.createElement('div');
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.borderRadius = '50%';
      el.style.background = color;
      el.style.boxShadow = '0 0 0 2px rgba(255,255,255,1), 0 2px 6px rgba(0,0,0,0.2)';
      return el;
    };

    map.on('load', () => {
      POPULAR_CITIES.forEach((c) => {
        const m = new mapboxgl.Marker({ element: makeDot(8, '#a8a29e') })
          .setLngLat([c.lng, c.lat])
          .addTo(map);
        popularMarkers.push(m);
      });

      markerRef.current = new mapboxgl.Marker({ element: makeDot(14, '#0c0a09') });
      if (initial) {
        markerRef.current.setLngLat([initial.lng, initial.lat]).addTo(map);
      }

      map.resize();
    });

    // Modal mounts mid-animation; ensure mapbox measures the final size.
    const resizeTimers = [
      setTimeout(() => map.resize(), 50),
      setTimeout(() => map.resize(), 250),
      setTimeout(() => map.resize(), 500),
    ];

    return () => {
      resizeTimers.forEach(clearTimeout);
      popularMarkers.forEach((m) => m.remove());
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [locationModal.isOpen, locationModal.selectedLocation, popularByLabel, token]);

  const handleSelect = useCallback(
    (label: string) => {
      locationModal.setLocation(label);
    },
    [locationModal],
  );

  const handleClear = () => locationModal.setLocation('');

  const handleUseCurrentLocation = useCallback(() => {
    if (!('geolocation' in navigator) || !token) {
      setGeoStatus('error');
      return;
    }
    setGeoStatus('locating');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?types=place&access_token=${token}`,
          );
          const data = await res.json();
          const f: MapboxFeature | undefined = data.features?.[0];
          if (!f) {
            setGeoStatus('error');
            return;
          }
          const stateShort = f.context
            ?.find((c) => c.id.startsWith('region'))
            ?.short_code?.replace('US-', '');
          handleSelect(stateShort ? `${f.text}, ${stateShort}` : f.place_name);
        } catch {
          setGeoStatus('error');
        }
      },
      () => setGeoStatus('error'),
      { timeout: 8000, maximumAge: 60_000 },
    );
  }, [handleSelect, token]);

  const hasQuery = search.trim().length >= 2;

  // Combined navigable list for keyboard
  type Row =
    | { kind: 'recent'; label: string }
    | { kind: 'popular'; city: PopularCity }
    | { kind: 'suggestion'; suggestion: ResolvedSuggestion };

  const rows: Row[] = useMemo(() => {
    if (hasQuery) {
      return suggestions.map((s) => ({ kind: 'suggestion' as const, suggestion: s })).slice(0, 6);
    }
    const recent = locationModal.recentLocations.map((label) => ({
      kind: 'recent' as const,
      label,
    }));
    const popular = POPULAR_CITIES.map((c) => ({ kind: 'popular' as const, city: c }));
    return [...recent, ...popular].slice(0, 6);
  }, [hasQuery, suggestions, locationModal.recentLocations]);

  useEffect(() => setActiveIndex(-1), [search, hasQuery, suggestions.length]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!rows.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % rows.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + rows.length) % rows.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const pick = rows[activeIndex];
      if (!pick) return;
      if (pick.kind === 'recent') handleSelect(pick.label);
      if (pick.kind === 'popular')
        handleSelect(formatLabel(pick.city.city, pick.city.state));
      if (pick.kind === 'suggestion') handleSelect(pick.suggestion.label);
    }
  };

  const labelOf = (row: Row) =>
    row.kind === 'recent'
      ? row.label
      : row.kind === 'popular'
      ? formatLabel(row.city.city, row.city.state)
      : row.suggestion.label;

  const renderRow = (row: Row, index: number) => {
    const label = labelOf(row);
    const { city, state } = splitLabel(label);
    const selected = locationModal.selectedLocation === label;
    const active = index === activeIndex;
    const Icon = row.kind === 'recent' ? Clock04Icon : Search01Icon;

    return (
      <button
        key={`${row.kind}-${label}-${index}`}
        onClick={() => handleSelect(label)}
        onMouseEnter={() => setActiveIndex(index)}
        className={`flex items-center gap-2.5 px-3 h-12 rounded-xl border text-left transition-all ${
          selected
            ? 'border-stone-900 dark:border-stone-200 bg-stone-50 dark:bg-stone-800/60'
            : active
            ? 'border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800/40'
            : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-800/40'
        }`}
      >
        <Icon
          className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 shrink-0"
          strokeWidth={1.6}
        />
        <div className="flex-1 min-w-0 flex items-baseline gap-1.5">
          <p className="text-sm text-stone-900 dark:text-stone-100 truncate">
            {city}
          </p>
          {state && (
            <p className="text-xs text-stone-400 dark:text-stone-500 shrink-0">
              {state}
            </p>
          )}
        </div>
        {selected && (
          <Tick02Icon
            className="w-3.5 h-3.5 text-stone-900 dark:text-stone-100 shrink-0"
            strokeWidth={2.4}
          />
        )}
      </button>
    );
  };

  const body = (
    <div className="flex flex-col">
      {/* Header */}
      <div className="pb-4">
        <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 leading-tight tracking-[-0.015em]">
          Choose a location
        </h2>
        <p className="text-sm text-stone-500 dark:text-stone-500 mt-1.5">
          Filter listings to a city near you.
        </p>
      </div>

      {/* Map — contained card */}
      <div className="relative h-[240px] rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-stone-100 dark:bg-stone-800 shadow-elevation-1 overflow-hidden">
        <div ref={mapContainer} className="w-full h-full" />
        {!token && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-stone-400 dark:text-stone-500">
            Map unavailable
          </div>
        )}
        {locationModal.selectedLocation && (
          <div className="absolute top-3 left-3 inline-flex items-center gap-2 px-3 h-8 rounded-full bg-white/90 dark:bg-stone-900/90 backdrop-blur border border-stone-200/70 dark:border-stone-700 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-900 dark:bg-stone-100" />
            <span className="text-xs font-medium text-stone-900 dark:text-stone-100">
              {locationModal.selectedLocation}
            </span>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="mt-3 relative">
        <Search01Icon
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500"
          strokeWidth={1.75}
        />
        <input
          type="text"
          placeholder="Search any U.S. city"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl pl-11 pr-10 h-12 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 outline-none focus:border-stone-400 dark:focus:border-stone-500 transition-colors"
          autoFocus
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            aria-label="Clear search"
          >
            <Cancel01Icon className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Section header + Use my current location pill */}
      <div className="mt-4 mb-2 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-stone-500 dark:text-stone-400">
          {hasQuery
            ? 'Results'
            : locationModal.recentLocations.length > 0
            ? 'Recent & popular'
            : 'Popular cities'}
        </p>
        {!hasQuery && (
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={geoStatus === 'locating'}
            className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full text-xs font-medium text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors disabled:opacity-60"
          >
            {geoStatus === 'locating' ? (
              <div className="w-3 h-3 border-2 border-stone-200 dark:border-stone-700 border-t-stone-600 dark:border-t-stone-200 rounded-full animate-spin" />
            ) : (
              <GpsSignal01Icon className="w-3.5 h-3.5" strokeWidth={1.7} />
            )}
            {geoStatus === 'locating'
              ? 'Locating…'
              : geoStatus === 'error'
              ? 'Try again'
              : 'Use my location'}
          </button>
        )}
      </div>

      {/* List — 2-column grid, 6 max */}
      <div>
        {hasQuery && isSearching && (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-stone-200 dark:border-stone-800 border-t-stone-500 rounded-full animate-spin" />
          </div>
        )}
        {hasQuery && !isSearching && rows.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-sm text-stone-500 dark:text-stone-400">
              No matches for &ldquo;{search.trim()}&rdquo;
            </p>
          </div>
        )}
        {!isSearching && rows.length > 0 && (
          <div className="grid grid-cols-2 gap-2 pb-1">
            {rows.map((row, idx) => renderRow(row, idx))}
          </div>
        )}
      </div>

      {/* Footer */}
      {locationModal.selectedLocation && (
        <div className="-mx-8 px-8 py-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
            Filtering · {locationModal.selectedLocation}
          </p>
          <button
            onClick={handleClear}
            className="text-xs font-medium text-stone-700 dark:text-stone-200 hover:text-stone-900 dark:hover:text-stone-100 transition-colors shrink-0 ml-3"
          >
            Clear
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
