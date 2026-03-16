'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Image from 'next/image';
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
}

const MapsClient: React.FC<MapsClientProps> = ({ listings }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const router = useRouter();

  const [items, setItems] = useState<GeocodedItem[]>([]);
  const [selected, setSelected] = useState<GeocodedItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'listing' | 'worker'>('all');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Sync with sidebar state
  useEffect(() => {
    const check = () => {
      setSidebarCollapsed(localStorage.getItem('sidebarCollapsed') === 'true');
      // Resize map after sidebar animation
      setTimeout(() => map.current?.resize(), 350);
    };
    check();
    window.addEventListener('sidebarToggle', check);
    return () => window.removeEventListener('sidebarToggle', check);
  }, []);

  // Geocode a location string via Mapbox
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

  // Geocode all listings and workers
  useEffect(() => {
    async function geocodeAll() {
      setLoading(true);

      // Dedupe locations to minimize API calls
      const locationMap = new Map<string, { lng: number; lat: number }>();
      const uniqueLocations = Array.from(new Set(
        listings
          .map(l => l.address || l.location)
          .filter(Boolean) as string[]
      ));

      await Promise.all(
        uniqueLocations.map(async (loc) => {
          const coords = await geocode(loc);
          if (coords) locationMap.set(loc, coords);
        })
      );

      const geocoded: GeocodedItem[] = [];

      for (const listing of listings) {
        const loc = listing.address || listing.location;
        if (!loc) continue;
        const coords = locationMap.get(loc);
        if (!coords) continue;

        // Add the listing itself
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

        // Add individual workers from this listing
        if (listing.employees?.length) {
          for (const emp of listing.employees) {
            geocoded.push({
              type: 'worker',
              id: emp.id,
              title: emp.fullName,
              image: emp.user?.imageSrc || emp.user?.image || listing.imageSrc,
              category: emp.jobTitle || listing.category,
              location: loc,
              // Slightly offset workers so they don't overlap the listing pin
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
      geocodeAll();
    } else {
      setLoading(false);
    }
  }, [listings, geocode]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-98.5795, 39.8283],
      zoom: 3.5,
      attributionControl: false,
    });

    map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

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

    const filtered = filter === 'all' ? items : items.filter(i => i.type === filter);

    if (!filtered.length) return;

    for (const item of filtered) {
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
    if (filtered.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      filtered.forEach(i => bounds.extend([i.lng, i.lat]));
      map.current.fitBounds(bounds, { padding: 80, maxZoom: 13, duration: 1000 });
    } else if (filtered.length === 1) {
      map.current.flyTo({ center: [filtered[0].lng, filtered[0].lat], zoom: 12, duration: 1000 });
    }
  }, [items, filter]);

  const filteredCount = filter === 'all' ? items.length : items.filter(i => i.type === filter).length;

  return (
    <div className="fixed inset-0 bg-white">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center gap-3 px-6 py-4">
        <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md rounded-full border border-zinc-200 shadow-sm px-1 py-1">
          {(['all', 'listing', 'worker'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200 ${
                filter === f
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              {f === 'all' ? 'All' : f === 'listing' ? 'Businesses' : 'Workers'}
            </button>
          ))}
        </div>

        {!loading && (
          <span className="text-[13px] text-zinc-400 font-medium">
            {filteredCount} {filteredCount === 1 ? 'result' : 'results'}
          </span>
        )}
      </div>

      {/* Map */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm z-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-800 rounded-full animate-spin" />
            <p className="text-sm text-zinc-500">Loading map...</p>
          </div>
        </div>
      )}

      {/* Selected card */}
      {selected && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 w-full max-w-sm px-4">
          <div
            className="bg-white rounded-2xl shadow-xl border border-zinc-100 overflow-hidden cursor-pointer hover:shadow-2xl transition-shadow duration-200"
            onClick={() => {
              if (selected.type === 'listing') {
                router.push(`/listings/${selected.id}`);
              } else if (selected.listing) {
                router.push(`/listings/${selected.listing.id}`);
              }
            }}
          >
            <div className="relative h-40">
              <Image
                src={selected.image}
                alt={selected.title}
                fill
                className="object-cover"
              />
              <button
                onClick={(e) => { e.stopPropagation(); setSelected(null); }}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
              <div className="absolute bottom-3 left-3">
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase backdrop-blur-md ${
                  selected.type === 'listing'
                    ? 'bg-zinc-900/70 text-white'
                    : 'bg-white/80 text-zinc-800'
                }`}>
                  {selected.type === 'listing' ? 'Business' : 'Worker'}
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-[15px] font-semibold text-zinc-900 truncate">{selected.title}</h3>
              <p className="text-[13px] text-zinc-500 mt-0.5 truncate">{selected.category}</p>
              <p className="text-[12px] text-zinc-400 mt-1 truncate">{selected.location}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapsClient;
