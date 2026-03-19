'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SafeListing, SafeUser } from '@/app/types';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

interface MapsClientProps {
  listings: SafeListing[];
  currentUser?: SafeUser | null;
}

interface GeocodedItem {
  type: 'listing' | 'worker';
  id: string;
  title: string;
  image: string;
  category: string;
  location: string;
  lng: number;
  lat: number;
  listing?: SafeListing;
  workerName?: string;
  workerImage?: string;
  distance?: number;
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const MapsClient: React.FC<MapsClientProps> = ({ listings, currentUser }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const router = useRouter();

  const [items, setItems] = useState<GeocodedItem[]>([]);
  const [selected, setSelected] = useState<GeocodedItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [filter, setFilter] = useState<'all' | 'listing' | 'worker'>('all');
  const [sort, setSort] = useState<'nearest' | 'name'>('nearest');
  const [search, setSearch] = useState('');
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {} // silently fail
      );
    }
  }, []);

  // Compute distances when items or user location changes
  useEffect(() => {
    if (!userLoc || items.length === 0) return;
    setItems(prev => prev.map(item => ({
      ...item,
      distance: Math.round(haversine(userLoc.lat, userLoc.lng, item.lat, item.lng) * 10) / 10,
    })));
  }, [userLoc]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync with sidebar state
  useEffect(() => {
    const check = () => {
      setTimeout(() => {
        if (map.current) {
          map.current.resize();
        }
      }, 350);
    };
    window.addEventListener('sidebarToggle', check);
    return () => window.removeEventListener('sidebarToggle', check);
  }, []);

  // Geocode a location string via Mapbox (fallback for listings without stored coords)
  const geocode = useCallback(async (location: string): Promise<{ lng: number; lat: number } | null> => {
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${mapboxgl.accessToken}&limit=1`
      );
      const data = await res.json();
      if (data.features?.length) {
        const [lng, lat] = data.features[0].center;
        return { lng, lat };
      }
    } catch {}
    return null;
  }, []);

  // Build map items from listings — use stored coords, fallback to geocoding
  useEffect(() => {
    async function buildItems() {
      setLoading(true);

      // Find listings that need geocoding (missing stored coords)
      const needsGeocoding = listings.filter(l => l.lat == null || l.lng == null);

      // Geocode only the ones missing coordinates
      const locationMap = new Map<string, { lng: number; lat: number }>();
      if (needsGeocoding.length > 0) {
        const uniqueLocations = Array.from(new Set(
          needsGeocoding
            .map(l => l.address || l.location)
            .filter(Boolean) as string[]
        ));
        await Promise.all(
          uniqueLocations.map(async (loc) => {
            const coords = await geocode(loc);
            if (coords) locationMap.set(loc, coords);
          })
        );
      }

      const geocoded: GeocodedItem[] = [];

      for (const listing of listings) {
        // Use stored coords or fall back to geocoded
        let coords: { lng: number; lat: number } | null = null;
        if (listing.lat != null && listing.lng != null) {
          coords = { lat: listing.lat, lng: listing.lng };
        } else {
          const loc = listing.address || listing.location;
          if (loc) coords = locationMap.get(loc) || null;
        }
        if (!coords) continue;

        const loc = listing.address || listing.location || '';

        geocoded.push({
          type: 'listing',
          id: listing.id,
          title: listing.title,
          image: listing.imageSrc,
          category: listing.category,
          location: loc,
          lng: coords.lng,
          lat: coords.lat,
          listing,
        });

        if (listing.employees?.length) {
          for (const emp of listing.employees) {
            geocoded.push({
              type: 'worker',
              id: emp.id,
              title: emp.fullName,
              image: emp.user?.imageSrc || emp.user?.image || listing.imageSrc,
              category: emp.jobTitle || listing.category,
              location: loc,
              lng: coords.lng + (Math.random() - 0.5) * 0.002,
              lat: coords.lat + (Math.random() - 0.5) * 0.002,
              workerName: emp.fullName,
              workerImage: emp.user?.imageSrc || emp.user?.image || undefined,
              listing,
            });
          }
        }
      }

      setItems(geocoded);
      setLoading(false);
    }

    if (listings.length) {
      buildItems();
    } else {
      setLoading(false);
    }
  }, [listings, geocode]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/standard',
      center: [-98.5795, 39.8283],
      zoom: 3.5,
      attributionControl: false,
      logoPosition: 'bottom-right',
    });

    map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

    // Hide Mapbox logo and attribution
    const container = mapContainer.current;
    const style = document.createElement('style');
    style.textContent = `
      .mapboxgl-ctrl-logo, .mapboxgl-ctrl-attrib { display: none !important; }
    `;
    container.appendChild(style);

    // Resize once loaded and signal ready
    map.current.on('load', () => {
      map.current?.resize();
      setMapReady(true);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Place markers when items or filter changes
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const visibleItems = filter === 'all' ? items : items.filter(i => i.type === filter);

    if (!visibleItems.length) return;

    for (const item of visibleItems) {
      const el = document.createElement('div');
      el.className = 'map-marker';

      if (item.type === 'listing') {
        el.innerHTML = `
          <div style="
            width: 36px; height: 36px; border-radius: 50%;
            background: #18181b; border: 2.5px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.25);
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; transition: transform 0.15s;
          ">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
        `;
      } else {
        const imgSrc = item.workerImage || item.image;
        el.innerHTML = `
          <div style="
            width: 34px; height: 34px; border-radius: 50%;
            border: 2.5px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            overflow: hidden; cursor: pointer;
            background: #e4e4e7;
            transition: transform 0.15s;
          ">
            ${imgSrc
              ? `<img src="${imgSrc}" style="width:100%;height:100%;object-fit:cover;" />`
              : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;color:#71717a;">${item.title.charAt(0)}</div>`
            }
          </div>
        `;
      }

      el.addEventListener('mouseenter', () => {
        (el.firstElementChild as HTMLElement).style.transform = 'scale(1.2)';
      });
      el.addEventListener('mouseleave', () => {
        (el.firstElementChild as HTMLElement).style.transform = 'scale(1)';
      });

      el.addEventListener('click', () => {
        setSelected(item);
        map.current?.flyTo({ center: [item.lng, item.lat], zoom: 14, duration: 800 });
      });

      const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([item.lng, item.lat])
        .addTo(map.current!);

      markersRef.current.push(marker);
    }

    // Fit bounds if we have items
    if (visibleItems.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      visibleItems.forEach(i => bounds.extend([i.lng, i.lat]));
      map.current.fitBounds(bounds, { padding: 80, maxZoom: 13, duration: 1000 });
    } else if (visibleItems.length === 1) {
      map.current.flyTo({ center: [visibleItems[0].lng, visibleItems[0].lat], zoom: 12, duration: 1000 });
    }
  }, [items, filter]);

  const filtered = filter === 'all' ? items : items.filter(i => i.type === filter);
  const searchMatched = search.trim()
    ? filtered.filter(i => i.title.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase()))
    : filtered;
  const searchFiltered = [...searchMatched].sort((a, b) => {
    if (sort === 'nearest') return (a.distance ?? Infinity) - (b.distance ?? Infinity);
    return a.title.localeCompare(b.title);
  });

  const handleItemClick = (item: GeocodedItem) => {
    setSelected(item);
    map.current?.flyTo({ center: [item.lng, item.lat], zoom: 14, duration: 800 });
  };

  const ready = mapReady;

  return (
    <div className="fixed inset-0 bg-zinc-950">
      {/* Sidebar — floating, detached from edges */}
      <div
        className="absolute top-4 left-8 bottom-4 w-[370px] flex flex-col bg-white border border-stone-200/80 rounded-2xl z-10 shadow-2xl shadow-black/10 overflow-hidden px-8 pb-5 pt-7 gap-4"
        style={{
          opacity: ready ? 1 : 0,
          transition: 'opacity 0.6s ease-out 0.1s',
        }}
      >
        {/* Back + Logo */}
        <div
          className="flex items-center justify-between"
          style={{
            opacity: ready ? 1 : 0,
            transition: 'opacity 0.5s ease-out 0.25s',
          }}
        >
          <Image src="/logos/fm-logo.png" alt="Logo" width={72} height={46} className="opacity-90 shrink-0 mt-[1.2px]" />
          <Link href="/" className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M5 12l7-7M5 12l7 7"/>
            </svg>
          </Link>
        </div>

        {/* Search */}
        <div
          className="relative"
          style={{
            opacity: ready ? 1 : 0,
            transition: 'opacity 0.5s ease-out 0.35s',
          }}
        >
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3.5 py-2.5 text-[13px] text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400 transition-colors"
          />
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.3-4.3"/>
          </svg>
        </div>

        {/* Filters row */}
        <div
          className="grid grid-cols-3 gap-2"
          style={{
            opacity: ready ? 1 : 0,
            transition: 'opacity 0.5s ease-out 0.4s',
          }}
        >
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'listing' | 'worker')}
              className="w-full appearance-none bg-transparent border border-stone-200 rounded-xl px-3 py-2 pr-7 text-[13px] text-stone-600 focus:outline-none focus:border-stone-400 transition-colors cursor-pointer"
            >
              <option value="all">All</option>
              <option value="listing">Businesses</option>
              <option value="worker">Workers</option>
            </select>
            <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </div>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as 'nearest' | 'name')}
              className="w-full appearance-none bg-transparent border border-stone-200 rounded-xl px-3 py-2 pr-7 text-[13px] text-stone-600 focus:outline-none focus:border-stone-400 transition-colors cursor-pointer"
            >
              <option value="nearest">Nearest</option>
              <option value="name">Name</option>
            </select>
            <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </div>
          <div className="relative">
            <button className="w-full appearance-none bg-transparent border border-stone-200 rounded-xl px-3 py-2 pr-7 text-[13px] text-stone-600 text-left hover:border-stone-400 transition-colors cursor-pointer">
              Filters
            </button>
            <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-stone-200" style={{ opacity: ready ? 1 : 0, transition: 'opacity 0.5s ease-out 0.45s' }} />

        {/* Results list */}
        <div
          className="flex-1 overflow-y-auto -mx-8 px-8 space-y-0.5"
          style={{
            opacity: ready ? 1 : 0,
            transition: 'opacity 0.5s ease-out 0.5s',
          }}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-6 h-6 border-2 border-stone-200 border-t-stone-500 rounded-full animate-spin" />
              <p className="text-[12px] text-stone-400">Loading...</p>
            </div>
          ) : searchFiltered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-[13px] text-stone-400">No results found</p>
            </div>
          ) : (
            searchFiltered.map((item) => (
              <button
                key={`${item.type}-${item.id}`}
                onClick={() => handleItemClick(item)}
                className={`w-full flex items-center gap-3 py-3 rounded-xl text-left transition-all duration-150 group ${
                  selected?.id === item.id && selected?.type === item.type
                    ? 'bg-stone-100 ring-1 ring-stone-200'
                    : 'hover:bg-stone-50'
                }`}
              >
                {/* Image */}
                <div className="w-11 h-11 rounded-full overflow-hidden bg-stone-100 shrink-0 ring-1 ring-stone-200/80">
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={44}
                    height={44}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-stone-800 truncate">{item.title}</p>
                  <p className="text-[12px] text-stone-500 truncate">{item.category}</p>
                  <p className="text-[11px] text-stone-400 truncate">{item.location}</p>
                </div>

                {/* Distance */}
                <span className="text-[11px] text-stone-400 shrink-0">
                  {item.distance != null ? `${item.distance} mi` : '—'}
                </span>
              </button>
            ))
          )}
        </div>

        {/* Footer count */}
        {!loading && (
          <div className="px-4 py-3 border-t border-stone-200">
            <p className="text-[11px] text-stone-400">
              {searchFiltered.length} {searchFiltered.length === 1 ? 'result' : 'results'}
            </p>
          </div>
        )}
      </div>

      {/* Map — full screen behind sidebar */}
      <div
        className="absolute inset-0"
        style={{
          opacity: ready ? 1 : 0,
          transition: 'opacity 0.8s ease-out',
        }}
      >
        <div ref={mapContainer} className="w-full h-full" />

        {/* Selected popup on map */}
        {selected && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-sm px-4">
            <div
              className="bg-zinc-950/95 backdrop-blur-md rounded-2xl border border-zinc-800 overflow-hidden cursor-pointer hover:border-zinc-700 transition-colors"
              onClick={() => {
                if (selected.type === 'listing') {
                  router.push(`/listings/${selected.id}`);
                } else if (selected.listing) {
                  router.push(`/listings/${selected.listing.id}`);
                }
              }}
            >
              <div className="flex items-center gap-3 p-3.5">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
                  <Image
                    src={selected.image}
                    alt={selected.title}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[14px] font-semibold text-white truncate">{selected.title}</h3>
                  <p className="text-[12px] text-zinc-400 truncate">{selected.category} · {selected.location}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelected(null); }}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors shrink-0"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              <div className="px-3.5 pb-3.5">
                <button className="w-full py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[13px] font-medium text-zinc-200 transition-colors">
                  More Details
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapsClient;
