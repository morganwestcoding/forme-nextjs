'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Image from 'next/image';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';
import { Tick02Icon as Check } from 'hugeicons-react';
import { SafeUser } from '@/app/types';
import Container from '@/components/Container';
import Skeleton from '@/components/ui/Skeleton';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { categories as ALL_CATEGORIES } from '@/components/Categories';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
mapboxgl.accessToken = MAPBOX_TOKEN;

interface MapsClientProps {
  currentUser?: SafeUser | null;
}

interface MapWorker {
  id: string;
  fullName: string;
  jobTitle: string | null;
  image: string | null;
}

interface MapItem {
  id: string;
  title: string;
  image: string;
  category: string;
  location: string;
  lng: number;
  lat: number;
  rating?: number | null;
  ratingCount?: number;
  distance?: number;
  workers: MapWorker[];
  // Discriminates a real business storefront from an independent provider.
  // Independents render as their own pin/row but route to /profile, not /listings.
  kind: 'listing' | 'worker';
  // Only set when kind === 'worker' — the user's profile id for the detail link.
  userId?: string;
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const SOURCE_ID = 'listings';
const CLUSTER_HALO_LAYER_ID = 'listings-cluster-halo';
const CLUSTER_LAYER_ID = 'listings-clusters';
const CLUSTER_COUNT_LAYER_ID = 'listings-cluster-count';
const POINT_LAYER_ID = 'listings-points';
const WORKER_BADGE_BG_LAYER_ID = 'listings-worker-badge-bg';
const WORKER_BADGE_TEXT_LAYER_ID = 'listings-worker-badge-text';
const PIN_ICON_ID = 'listing-pin';

const PIN_W = 44;
const PIN_H = 44;
const PIN_RATIO = 2; // raster the SVG at 2× so it stays crisp on retina

// Build the unclustered marker — flag-style pin with a 2px line-art stroke.
function buildPinDataUrl(): string {
  const pinSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${PIN_W * PIN_RATIO}" height="${PIN_H * PIN_RATIO}" viewBox="0 0 24 24" fill="none" stroke="#141B34" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <defs>
      <linearGradient id="listingPinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#2a2a2a"/>
        <stop offset="100%" stop-color="#000000"/>
      </linearGradient>
    </defs>
    <path d="M12 16V21"/>
    <path d="M8 5.2918C8 5.02079 8 4.88529 8.01312 4.77132C8.1194 3.84789 8.84789 3.1194 9.77133 3.01312C9.88529 3 10.0208 3 10.2918 3H13.7082C13.9792 3 14.1147 3 14.2287 3.01312C15.1521 3.1194 15.8806 3.84789 15.9869 4.77132C16 4.88529 16 5.02079 16 5.2918C16 5.37885 16 5.42237 15.9967 5.46264C15.9708 5.78281 15.7927 6.07104 15.5179 6.2374C15.4834 6.25832 15.4444 6.27779 15.3666 6.31672L15.1055 6.44726C14.7021 6.64897 14.5003 6.74983 14.3681 6.90564C14.26 7.03286 14.1856 7.18509 14.1515 7.34846C14.1097 7.54854 14.1539 7.76968 14.2424 8.21197L15 12H15.3333C15.9533 12 16.2633 12 16.5176 12.0681C17.2078 12.2531 17.7469 12.7922 17.9319 13.4824C18 13.7367 18 14.0467 18 14.6667C18 14.9767 18 15.1317 17.9659 15.2588C17.8735 15.6039 17.6039 15.8735 17.2588 15.9659C17.1317 16 16.9767 16 16.6667 16H7.33333C7.02334 16 6.86835 16 6.74118 15.9659C6.39609 15.8735 6.12654 15.6039 6.03407 15.2588C6 15.1317 6 14.9767 6 14.6667C6 14.0467 6 13.7367 6.06815 13.4824C6.25308 12.7922 6.79218 12.2531 7.48236 12.0681C7.73669 12 8.04669 12 8.66667 12H9L9.75761 8.21197C9.84606 7.76968 9.89029 7.54854 9.84852 7.34846C9.81441 7.18509 9.73995 7.03286 9.63194 6.90564C9.49965 6.74983 9.29794 6.64897 8.89452 6.44726L8.63344 6.31672C8.55558 6.27779 8.51665 6.25832 8.48208 6.2374C8.20731 6.07104 8.02917 5.78281 8.00326 5.46264C8 5.42237 8 5.37885 8 5.2918Z" fill="url(#listingPinGradient)"/>
  </svg>`;

  return `data:image/svg+xml;base64,${btoa(pinSvg)}`;
}

function loadPinImage(map: mapboxgl.Map): Promise<void> {
  return new Promise((resolve) => {
    if (map.hasImage(PIN_ICON_ID)) return resolve();
    const url = buildPinDataUrl();
    const img = new window.Image(PIN_W * PIN_RATIO, PIN_H * PIN_RATIO);
    img.onload = () => {
      if (!map.hasImage(PIN_ICON_ID)) map.addImage(PIN_ICON_ID, img, { pixelRatio: PIN_RATIO });
      resolve();
    };
    img.onerror = () => resolve();
    img.src = url;
  });
}

const MapsClient: React.FC<MapsClientProps> = ({ currentUser }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const itemsRef = useRef<MapItem[]>([]);
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  // Hydrate filter + search state from URL on first render — makes the page shareable.
  const [search, setSearchState] = useState(() => params?.get('q') || '');
  const [filterCategories, setFilterCategoriesState] = useState<string[]>(
    () => params?.get('cat')?.split(',').filter(Boolean) || []
  );
  const [filterRadius, setFilterRadiusState] = useState<number | null>(() => {
    const v = params?.get('r');
    return v ? Number(v) : null;
  });
  const [filterMinRating, setFilterMinRatingState] = useState<number | null>(() => {
    const v = params?.get('rating');
    return v ? Number(v) : null;
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [ratingHover, setRatingHover] = useState<number | null>(null);

  // Single setter that mirrors state into the URL (replace, no scroll).
  const updateUrl = useCallback((updates: Record<string, string | null>) => {
    const next = new URLSearchParams(params?.toString() || '');
    Object.entries(updates).forEach(([k, v]) => {
      if (v == null || v === '') next.delete(k);
      else next.set(k, v);
    });
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname || '/maps', { scroll: false });
  }, [params, router, pathname]);

  const setSearch = (v: string) => { setSearchState(v); updateUrl({ q: v || null }); };
  const setFilterCategories = (v: string[]) => {
    setFilterCategoriesState(v);
    updateUrl({ cat: v.length ? v.join(',') : null });
  };
  const setFilterRadius = (v: number | null) => {
    setFilterRadiusState(v);
    updateUrl({ r: v != null ? String(v) : null });
  };
  const setFilterMinRating = (v: number | null) => {
    setFilterMinRatingState(v);
    updateUrl({ rating: v != null ? String(v) : null });
  };
  const clearFilters = () => {
    setFilterCategoriesState([]);
    setFilterRadiusState(null);
    setFilterMinRatingState(null);
    updateUrl({ cat: null, r: null, rating: null });
  };
  const activeFilterCount =
    filterCategories.length + (filterRadius != null ? 1 : 0) + (filterMinRating != null ? 1 : 0);

  const [items, setItems] = useState<MapItem[]>([]);
  const [itemsLoaded, setItemsLoaded] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selected, setSelected] = useState<MapItem | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [showSearchArea, setShowSearchArea] = useState(false);
  const [refetching, setRefetching] = useState(false);

  const fetchListings = useCallback(async (bbox?: string): Promise<MapItem[]> => {
    const url = bbox ? `/api/listings/map?bbox=${encodeURIComponent(bbox)}` : '/api/listings/map';
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Map fetch failed (${r.status})`);
    const data = await r.json();
    const listingRows = (data.listings || []) as Array<{
      id: string; title: string; category: string;
      location: string | null; address: string | null;
      imageSrc: string; lat: number; lng: number;
      rating: number | null; ratingCount: number;
      employees?: MapWorker[];
    }>;
    const workerRows = (data.workers || []) as Array<{
      id: string; userId: string; fullName: string;
      jobTitle: string | null; image: string | null;
      location: string; lat: number; lng: number;
      rating: number | null; ratingCount: number;
    }>;

    const listings: MapItem[] = listingRows.map((l) => ({
      id: l.id,
      title: l.title,
      image: l.imageSrc,
      category: l.category,
      location: l.address || l.location || '',
      lng: l.lng,
      lat: l.lat,
      rating: l.rating,
      ratingCount: l.ratingCount,
      workers: l.employees || [],
      kind: 'listing',
    }));

    // Independent workers come through with no real listing — surface them
    // directly. We prefix the id so it can never collide with a Listing id.
    const workers: MapItem[] = workerRows.map((w) => ({
      id: `worker:${w.id}`,
      title: w.fullName,
      image: w.image || '',
      category: w.jobTitle || 'Independent',
      location: w.location,
      lng: w.lng,
      lat: w.lat,
      rating: w.rating,
      ratingCount: w.ratingCount,
      workers: [],
      kind: 'worker',
      userId: w.userId,
    }));

    return [...listings, ...workers];
  }, []);

  // Initial load — server returns pre-geocoded rows only. No client-side geocoding fallback.
  useEffect(() => {
    let cancelled = false;
    fetchListings()
      .then((rows) => {
        if (cancelled) return;
        setItems(rows);
        setItemsLoaded(true);
      })
      .catch((err) => {
        if (cancelled) return;
        setFetchError(err?.message || 'Failed to load map');
        setItemsLoaded(true);
      });
    return () => { cancelled = true; };
  }, [fetchListings]);

  const handleSearchArea = useCallback(async () => {
    if (!map.current) return;
    const b = map.current.getBounds();
    if (!b) return;
    const bbox = `${b.getWest()},${b.getSouth()},${b.getEast()},${b.getNorth()}`;
    setRefetching(true);
    try {
      const rows = await fetchListings(bbox);
      setItems(rows);
      setShowSearchArea(false);
      setFetchError(null);
    } catch (err: any) {
      setFetchError(err?.message || 'Failed to load this area');
    } finally {
      setRefetching(false);
    }
  }, [fetchListings]);

  const [sort, setSort] = useState<'nearest' | 'name'>('nearest');
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  // 'denied' surfaces a banner so the user knows why we can't center on them.
  const [permissionState, setPermissionState] = useState<'unknown' | 'granted' | 'denied' | 'prompt'>('unknown');

  const requestLocation = useCallback((opts: { silent?: boolean } = {}) => {
    if (!navigator.geolocation) {
      if (!opts.silent) toast.error('Geolocation isn’t available in this browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
        setPermissionState('granted');
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setPermissionState('denied');
          if (!opts.silent) {
            toast.error('Location permission denied. Enable it in your browser settings to see places near you.');
          }
        } else if (!opts.silent) {
          toast.error('Couldn’t get your location. Try again.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  // Always ask for location when the user lands on /maps. Browsers only show the prompt UI
  // when the permission is in the 'prompt' state — they cache prior decisions, so when it's
  // 'denied' we surface our own banner with a "Try again" button below.
  useEffect(() => {
    if (!navigator.geolocation) return;
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((status) => {
        setPermissionState(status.state as 'granted' | 'denied' | 'prompt');
        if (status.state !== 'denied') requestLocation({ silent: true });
        // Listen for permission changes (e.g. user just allowed it in the browser settings).
        status.onchange = () => {
          setPermissionState(status.state as 'granted' | 'denied' | 'prompt');
          if (status.state === 'granted') requestLocation({ silent: true });
        };
      }).catch(() => requestLocation({ silent: true }));
    } else {
      requestLocation({ silent: true });
    }
  }, [requestLocation]);

  // Track whether we've applied the initial auto-center. Once applied (or the user has panned)
  // we never auto-center again, so nothing yanks the map away from where the user is looking.
  const initialCenterApplied = useRef(false);

  // Priority: browser geolocation > currentUser.location (geocoded) > LA default.
  // Both effects below respect this ref to avoid overriding each other.

  // 1. Browser geolocation — takes top priority.
  useEffect(() => {
    if (!mapReady || !userLoc || showSearchArea || initialCenterApplied.current) return;
    map.current?.easeTo({ center: [userLoc.lng, userLoc.lat], zoom: 12, duration: 800 });
    initialCenterApplied.current = true;
  }, [mapReady, userLoc, showSearchArea]);

  // 2. Fallback: geocode the user's stored location string. Only runs if geolocation
  //    hasn't resolved yet. If geolocation resolves mid-fetch, the .then guard bails out.
  useEffect(() => {
    if (!mapReady || !currentUser?.location || !MAPBOX_TOKEN) return;
    if (userLoc || initialCenterApplied.current || showSearchArea) return;

    let cancelled = false;
    const q = encodeURIComponent(currentUser.location);
    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${q}.json?access_token=${MAPBOX_TOKEN}&limit=1`)
      .then((r) => r.json())
      .then((data) => {
        // Re-check: if geolocation landed while we were fetching, or the user started panning, abort.
        if (cancelled || userLoc || initialCenterApplied.current || showSearchArea) return;
        const feature = data?.features?.[0];
        if (!feature?.center) return;
        const [lng, lat] = feature.center;
        map.current?.easeTo({ center: [lng, lat], zoom: 11, duration: 800 });
        initialCenterApplied.current = true;
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [mapReady, currentUser?.location, userLoc, showSearchArea]);

  // Build a directions URL — Apple Maps on iOS/macOS, Google Maps elsewhere.
  const directionsUrl = useCallback((lat: number, lng: number, label?: string) => {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const isApple = /iPhone|iPad|iPod|Macintosh/.test(ua);
    const q = label ? encodeURIComponent(label) : '';
    if (isApple) {
      return `https://maps.apple.com/?daddr=${lat},${lng}${q ? `&q=${q}` : ''}`;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}${q ? `&destination_place_id=${q}` : ''}`;
  }, []);

  const handleUseMyLocation = useCallback(() => requestLocation(), [requestLocation]);

  // Compute distances when items or user location changes
  useEffect(() => {
    if (!userLoc || items.length === 0) return;
    setItems(prev => prev.map(item => ({
      ...item,
      distance: Math.round(haversine(userLoc.lat, userLoc.lng, item.lat, item.lng) * 10) / 10,
    })));
  }, [userLoc, itemsLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Initialize map. Depends on itemsLoaded because the skeleton render returns early without
  // mounting mapContainer — so we need to re-run after the real container is in the DOM.
  useEffect(() => {
    if (!itemsLoaded) return;
    if (!mapContainer.current || map.current) return;

    // Default to LA so the very first paint isn't a blank globe.
    // We then refine the center based on the user's stored location and (later) browser geolocation.
    const LA: [number, number] = [-118.2437, 34.0522];
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        // streets-v12 is the full-color reference style; supports all the custom symbol/text layers below.
        style: 'mapbox://styles/mapbox/streets-v12',
        center: LA,
        zoom: 11,
        attributionControl: false,
        logoPosition: 'bottom-right',
      });
    } catch (e) {
      console.error('Failed to init map:', e);
      setMapReady(true); // unblock UI even if map can't render
      return;
    }

    map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

    // Hide Mapbox logo and attribution
    const container = mapContainer.current;
    const style = document.createElement('style');
    style.textContent = `
      .mapboxgl-ctrl-logo, .mapboxgl-ctrl-attrib { display: none !important; }
    `;
    container.appendChild(style);

    // Surface mapbox runtime errors instead of swallowing them.
    map.current.on('error', (e) => {
      console.error('Mapbox error:', e?.error || e);
    });

    // Hard fallback: even if 'load' never fires, unblock UI after 4s.
    const failsafe = setTimeout(() => setMapReady(true), 4000);

    map.current.on('load', async () => {
      try {
        if (!map.current) return;
        await loadPinImage(map.current);

        map.current.addSource(SOURCE_ID, {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50,
        });

        // Soft halo behind cluster bubbles — gives them depth without a hard shadow.
        map.current.addLayer({
          id: CLUSTER_HALO_LAYER_ID,
          type: 'circle',
          source: SOURCE_ID,
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': '#18181b',
            'circle-opacity': 0.12,
            'circle-blur': 0.6,
            'circle-radius': [
              'step', ['get', 'point_count'],
              26,
              10, 30,
              50, 38,
            ],
          },
        });

        map.current.addLayer({
          id: CLUSTER_LAYER_ID,
          type: 'circle',
          source: SOURCE_ID,
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': '#0c0a09',
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': 2.5,
            'circle-radius': [
              'step', ['get', 'point_count'],
              17,
              10, 21,
              50, 27,
            ],
          },
        });

        map.current.addLayer({
          id: CLUSTER_COUNT_LAYER_ID,
          type: 'symbol',
          source: SOURCE_ID,
          filter: ['has', 'point_count'],
          layout: {
            'text-field': ['get', 'point_count_abbreviated'],
            'text-font': ['DIN Pro Bold', 'Arial Unicode MS Bold'],
            'text-size': 13,
            'text-anchor': 'center',
            'text-justify': 'center',
            'text-allow-overlap': true,
            'text-ignore-placement': true,
          },
          paint: { 'text-color': '#ffffff' },
        });

        map.current.addLayer({
          id: POINT_LAYER_ID,
          type: 'symbol',
          source: SOURCE_ID,
          filter: ['!', ['has', 'point_count']],
          layout: {
            'icon-image': PIN_ICON_ID,
            'icon-size': 1.0,
            'icon-allow-overlap': true,
            'icon-anchor': 'bottom',
          },
        });

        // Worker count badge — small white circle near the upper-right of the pin head.
        // Pin renders at 44×44 CSS px anchored at the bottom; head curve top-right is at
        // roughly (+11, -35) in viewport pixels relative to the geographic point.
        map.current.addLayer({
          id: WORKER_BADGE_BG_LAYER_ID,
          type: 'circle',
          source: SOURCE_ID,
          filter: ['all', ['!', ['has', 'point_count']], ['>', ['coalesce', ['get', 'workerCount'], 0], 0]],
          paint: {
            'circle-color': '#ffffff',
            'circle-radius': 8,
            'circle-stroke-color': '#0c0a09',
            'circle-stroke-width': 1.5,
            'circle-translate': [11, -35],
            'circle-translate-anchor': 'viewport',
          },
        });
        map.current.addLayer({
          id: WORKER_BADGE_TEXT_LAYER_ID,
          type: 'symbol',
          source: SOURCE_ID,
          filter: ['all', ['!', ['has', 'point_count']], ['>', ['coalesce', ['get', 'workerCount'], 0], 0]],
          layout: {
            'text-field': ['to-string', ['get', 'workerCount']],
            'text-size': 10,
            'text-font': ['DIN Pro Bold', 'Arial Unicode MS Bold'],
            'text-anchor': 'center',
            'text-justify': 'center',
            'text-offset': [1.1, -3.5],
            'text-allow-overlap': true,
            'text-ignore-placement': true,
          },
          paint: {
            'text-color': '#0c0a09',
          },
        });

      // Cluster click → expand
      map.current.on('click', CLUSTER_LAYER_ID, (e) => {
        if (!map.current) return;
        const features = map.current.queryRenderedFeatures(e.point, { layers: [CLUSTER_LAYER_ID] });
        const clusterId = features[0]?.properties?.cluster_id;
        const source = map.current.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource;
        if (clusterId == null || !source) return;
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err || zoom == null) return;
          const geom = features[0].geometry as unknown as { coordinates: [number, number] };
          map.current?.easeTo({ center: geom.coordinates, zoom, duration: 600 });
        });
      });

      // Point click → select (look up from the ref so this closure doesn't capture stale items)
      map.current.on('click', POINT_LAYER_ID, (e) => {
        const f = e.features?.[0];
        if (!f) return;
        const id = (f.properties as { id: string }).id;
        const geom = (f.geometry as unknown as { coordinates: [number, number] });
        const full = itemsRef.current.find((i) => i.id === id);
        if (!full) return;
        setSelected(full);
        map.current?.flyTo({ center: geom.coordinates, zoom: Math.max(map.current.getZoom(), 14), duration: 600 });
      });

      // Cursor affordances
      const setPointer = () => { if (map.current) map.current.getCanvas().style.cursor = 'pointer'; };
      const clearPointer = () => { if (map.current) map.current.getCanvas().style.cursor = ''; };
      map.current.on('mouseenter', CLUSTER_LAYER_ID, setPointer);
      map.current.on('mouseleave', CLUSTER_LAYER_ID, clearPointer);
      map.current.on('mouseenter', POINT_LAYER_ID, setPointer);
      map.current.on('mouseleave', POINT_LAYER_ID, clearPointer);

      // Show "Search this area" only when the user pans/zooms (not programmatic moves)
      map.current.on('moveend', (e) => {
        if (e.originalEvent) setShowSearchArea(true);
      });

        map.current.resize();
      } catch (err) {
        console.error('Map setup failed:', err);
      } finally {
        clearTimeout(failsafe);
        setMapReady(true);
      }
    });

    return () => {
      clearTimeout(failsafe);
      map.current?.remove();
      map.current = null;
    };
  }, [itemsLoaded]);

  // Compose all filters in one pass — search, category, distance, rating.
  // Computed before the effects below so they can depend on it.
  const visibleItems = items.filter((i) => {
    if (filterCategories.length && !filterCategories.includes(i.category)) return false;
    if (filterMinRating != null && (i.rating == null || i.rating < filterMinRating)) return false;
    if (filterRadius != null && userLoc) {
      const d = haversine(userLoc.lat, userLoc.lng, i.lat, i.lng);
      if (d > filterRadius) return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!i.title.toLowerCase().includes(q) && !i.category.toLowerCase().includes(q)) return false;
    }
    return true;
  });
  const searchFiltered = [...visibleItems].sort((a, b) => {
    if (sort === 'nearest') return (a.distance ?? Infinity) - (b.distance ?? Infinity);
    return a.title.localeCompare(b.title);
  });

  // Mirror visible items into a ref so the map's click closures can read them without capture issues.
  useEffect(() => {
    itemsRef.current = visibleItems;
  }, [visibleItems]);

  // Escape closes the popup card.
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  // Push items into the GeoJSON source whenever filters or items change.
  useEffect(() => {
    if (!map.current || !mapReady) return;
    const source = map.current.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
    if (!source) return;

    source.setData({
      type: 'FeatureCollection',
      features: visibleItems.map((i) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [i.lng, i.lat] },
        properties: {
          id: i.id,
          title: i.title,
          category: i.category,
          workerCount: i.workers.length,
        },
      })),
    });

    // Note: deliberately no auto-fit. The map stays centered on the user's location
    // (or LA default), and the "Search this area" pill lets the user re-query a different region.
  }, [visibleItems, mapReady]);

  const handleItemClick = (item: MapItem) => {
    setSelected(item);
    map.current?.flyTo({ center: [item.lng, item.lat], zoom: 14, duration: 800 });
  };

  if (!MAPBOX_TOKEN) {
    return (
      <Container>
        <div className="mt-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-elevation-1 px-6 py-16 text-center">
          <p className="text-[15px] font-medium text-stone-900 dark:text-stone-100 mb-1">Map unavailable</p>
          <p className="text-[12px] text-stone-500 dark:text-stone-400">
            <code>NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code> isn&apos;t set. Add it to your environment to enable the map.
          </p>
        </div>
      </Container>
    );
  }

  // Map keeps a fixed height on mobile so the page can scroll naturally; sidebar grows
  // to fit its content. On desktop both cards lock to the same height and align side-by-side.
  const cardHeight = 'lg:h-[calc(100vh-220px)] lg:min-h-[520px]';
  const mapHeight = 'h-[55vh] lg:h-[calc(100vh-220px)] lg:min-h-[520px]';

  if (!itemsLoaded) {
    return (
      <Container>
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4">
          {/* Sidebar skeleton */}
          <div className={`order-2 lg:order-1 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-elevation-1 overflow-hidden flex flex-col ${cardHeight}`}>
            <div className="px-5 pt-5 pb-3 flex flex-col gap-3 border-b border-stone-200/70 dark:border-stone-800">
              <Skeleton rounded="xl" className="h-10 w-full" />
              <div className="grid grid-cols-2 gap-2">
                <Skeleton rounded="xl" className="h-9 w-full" />
                <Skeleton rounded="xl" className="h-9 w-full" />
              </div>
            </div>
            <div className="flex-1 overflow-hidden px-3 py-2 space-y-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="w-full flex items-center gap-3 py-2.5 px-2">
                  <Skeleton rounded="full" className="h-11 w-11 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-3.5 w-32 mb-1.5" />
                    <Skeleton className="h-3 w-20 mb-1" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <Skeleton className="h-3 w-8 shrink-0" />
                </div>
              ))}
            </div>
          </div>
          {/* Map skeleton */}
          <div className={`order-1 lg:order-2 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-elevation-1 overflow-hidden animate-pulse ${mapHeight}`} />
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4">

        {/* Sidebar — search, filters, results */}
        <div className={`order-2 lg:order-1 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-elevation-1 overflow-hidden flex flex-col ${cardHeight}`}>

          {/* Search + filters header */}
          <div className="px-5 pt-5 pb-3 flex flex-col gap-3 border-b border-stone-200/70 dark:border-stone-800">
            <div className="relative">
              <input
                type="text"
                placeholder="Search businesses, categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search listings"
                className="w-full bg-[#F7F7F6] dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 rounded-xl pl-3.5 pr-9 py-2.5 text-[13px] text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-stone-400 transition-colors"
              />
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.3-4.3"/>
              </svg>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="w-full flex items-center justify-between gap-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-2 text-[13px] text-stone-900 dark:text-stone-100 hover:border-stone-300 dark:hover:border-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-300 dark:focus:ring-stone-600 transition-colors"
                    >
                      <span>{sort === 'nearest' ? 'Nearest' : 'Name'}</span>
                      <svg className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m6 9 6 6 6-6"/>
                      </svg>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="min-w-[var(--radix-dropdown-menu-trigger-width)]">
                    {([
                      { value: 'nearest' as const, label: 'Nearest' },
                      { value: 'name' as const, label: 'Name' },
                    ]).map((opt) => (
                      <DropdownMenuItem
                        key={opt.value}
                        onSelect={() => setSort(opt.value)}
                        className="justify-between"
                      >
                        <span>{opt.label}</span>
                        {sort === opt.value && <Check className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <button
                onClick={() => setFiltersOpen((o) => !o)}
                aria-expanded={filtersOpen}
                className={`w-full flex items-center justify-between gap-1 appearance-none border rounded-xl px-4 py-2 text-[13px] text-left transition-colors focus:outline-none ${
                  activeFilterCount > 0 || filtersOpen
                    ? 'bg-stone-900 text-white border-stone-900 dark:bg-stone-100 dark:text-stone-900 dark:border-stone-100'
                    : 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
                }`}
              >
                <span>Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}</span>
                <svg className="w-3.5 h-3.5 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={filtersOpen ? 'm18 15-6-6-6 6' : 'm6 9 6 6 6-6'}/>
                </svg>
              </button>
            </div>
          </div>

          {/* Filter panel — collapsible. Grid-rows trick gives a smooth height slide; results list below follows naturally because it sits in normal flow. Inner content rises + fades in once the slide is mostly done. */}
          <div
            className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${filtersOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
            aria-hidden={!filtersOpen}
          >
           <div className="overflow-hidden">
            <div className={`px-5 py-4 border-b border-stone-200/70 dark:border-stone-800 bg-[#FAFAF9] dark:bg-stone-950/30 flex flex-col gap-4 transition-[opacity,transform] ease-out motion-reduce:transition-none ${filtersOpen ? 'opacity-100 translate-y-0 duration-500 delay-200' : 'opacity-0 -translate-y-1 duration-150 pointer-events-none'}`}>
              <div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 font-semibold mb-2">Category</p>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_CATEGORIES.map((c) => {
                    const on = filterCategories.includes(c.label);
                    return (
                      <button
                        key={c.label}
                        onClick={() => setFilterCategories(
                          on ? filterCategories.filter((x) => x !== c.label) : [...filterCategories, c.label]
                        )}
                        className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all duration-150 active:scale-[0.97] ${
                          on
                            ? 'bg-stone-900 text-white border-stone-900 dark:bg-stone-100 dark:text-stone-900 dark:border-stone-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]'
                            : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-800/60'
                        }`}
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 font-semibold">Distance</p>
                  {!userLoc && (
                    <button onClick={handleUseMyLocation} className="text-[10px] text-stone-500 dark:text-stone-400 underline hover:text-stone-700 dark:hover:text-stone-200 transition-colors">
                      Set location
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[5, 10, 25, 50, 100].map((r) => {
                    const on = filterRadius === r;
                    return (
                      <button
                        key={r}
                        disabled={!userLoc}
                        onClick={() => setFilterRadius(on ? null : r)}
                        title={!userLoc ? 'Set your location first' : undefined}
                        className={`px-2 py-1.5 rounded-lg text-[11px] font-medium border transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 ${
                          on
                            ? 'bg-stone-900 text-white border-stone-900 dark:bg-stone-100 dark:text-stone-900 dark:border-stone-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]'
                            : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-800/60'
                        }`}
                      >
                        {r}mi
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 font-semibold">Min rating</p>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400 tabular-nums">
                    {filterMinRating == null ? 'Any' : `${filterMinRating.toFixed(1)} & up`}
                  </span>
                </div>
                <div
                  className="flex items-center gap-1"
                  onMouseLeave={() => setRatingHover(null)}
                >
                  {[1, 2, 3, 4, 5].map((n) => {
                    const shown = ratingHover ?? filterMinRating ?? 0;
                    const active = n <= shown;
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setFilterMinRating(filterMinRating === n ? null : n)}
                        onMouseEnter={() => setRatingHover(n)}
                        onFocus={() => setRatingHover(n)}
                        onBlur={() => setRatingHover(null)}
                        aria-label={`Minimum ${n} star${n === 1 ? '' : 's'}`}
                        aria-pressed={filterMinRating === n}
                        className="p-1.5 rounded-lg transition-all duration-150 active:scale-[0.92] hover:bg-stone-100 dark:bg-stone-800 dark:hover:bg-stone-800/60"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" className="block">
                          <defs>
                            <linearGradient id={`filterStarGold-${n}`} x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#f5c842" />
                              <stop offset="100%" stopColor="#d4a017" />
                            </linearGradient>
                          </defs>
                          <path
                            d="M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z"
                            fill={active ? `url(#filterStarGold-${n})` : 'none'}
                            stroke={active ? 'none' : 'currentColor'}
                            strokeWidth={active ? 0 : 1.5}
                            strokeLinejoin="round"
                            className={active ? '' : 'text-stone-300 dark:text-stone-600'}
                          />
                        </svg>
                      </button>
                    );
                  })}
                </div>
              </div>

              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="self-start text-[12px] font-medium text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
           </div>
          </div>

          {/* Results list — page-scrolls on mobile, internal-scrolls on desktop. */}
          <div
            className="flex-1 lg:overflow-y-auto px-3 py-2 space-y-0.5"
            role="region"
            aria-label="Map results"
          >
            {fetchError ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-6">
                <p className="text-[13px] text-stone-700 dark:text-stone-300 font-medium">Couldn&apos;t load the map</p>
                <p className="text-[12px] text-stone-400 dark:text-stone-500">{fetchError}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-1 px-4 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800 text-[12px] text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                >
                  Try again
                </button>
              </div>
            ) : searchFiltered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-[13px] text-stone-400 dark:text-stone-500">
                  {search.trim() ? 'No matches for your search' : 'No nearby listings yet'}
                </p>
              </div>
            ) : (
              searchFiltered.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 group focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-300 dark:focus-visible:ring-stone-600 ${
                    selected?.id === item.id
                      ? 'bg-[#F7F7F6] dark:bg-stone-800 ring-1 ring-stone-200 dark:ring-stone-700'
                      : 'hover:bg-[#FAFAF9] dark:hover:bg-stone-800/60'
                  }`}
                >
                  <div className="w-11 h-11 rounded-full overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0 ring-1 ring-stone-200/80 flex items-center justify-center">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        width={44}
                        height={44}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[13px] font-medium text-stone-500 dark:text-stone-400">
                        {item.title.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-stone-800 dark:text-stone-200 truncate">{item.title}</p>
                    <p className="text-[12px] text-stone-500 dark:text-stone-500 truncate">{item.category}</p>
                    <p className="text-[11px] text-stone-400 dark:text-stone-500 truncate">{item.location}</p>
                  </div>

                  <span className="text-[11px] text-stone-400 dark:text-stone-500 shrink-0">
                    {item.distance != null ? `${item.distance} mi` : '—'}
                  </span>
                </button>
              ))
            )}
          </div>

          {/* Footer count */}
          {!fetchError && (
            <div className="px-5 py-3 border-t border-stone-200/70 dark:border-stone-800">
              <p className="text-[11px] text-stone-400 dark:text-stone-500">
                {searchFiltered.length} {searchFiltered.length === 1 ? 'result' : 'results'}
              </p>
            </div>
          )}
        </div>

        {/* Map — contained lightbox */}
        <div className={`order-1 lg:order-2 relative rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-elevation-1 overflow-hidden bg-stone-100 dark:bg-stone-900 ${mapHeight}`}>
          <div
            ref={mapContainer}
            className="w-full h-full"
            style={{
              opacity: mapReady ? 1 : 0,
              transition: 'opacity 0.6s ease-out',
            }}
          />

          {/* Permission-denied banner */}
          {permissionState === 'denied' && !showSearchArea && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none px-4 max-w-md w-full">
              <div className="pointer-events-auto flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-elevation-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-500 shrink-0">
                  <path d="M12 2 4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-4z"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
                <p className="flex-1 text-[12px] text-stone-600 dark:text-stone-300 leading-snug">
                  Allow location access in your browser to see places near you.
                </p>
                <button
                  onClick={handleUseMyLocation}
                  className="text-[12px] font-medium text-stone-900 dark:text-stone-100 hover:underline shrink-0"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Use my location FAB — sits below the Mapbox NavigationControl */}
          <button
            onClick={handleUseMyLocation}
            disabled={locating}
            aria-label="Center map on my location"
            className="absolute top-[112px] right-2.5 z-20 w-[29px] h-[29px] rounded-[4px] bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow flex items-center justify-center text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 disabled:opacity-60 disabled:cursor-wait transition-colors"
          >
            {locating ? (
              <div className="w-3.5 h-3.5 border-2 border-stone-300 dark:border-stone-700 border-t-stone-700 dark:border-t-stone-200 rounded-full animate-spin" />
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
              </svg>
            )}
          </button>

          {/* Search this area */}
          {showSearchArea && !fetchError && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
              <button
                onClick={handleSearchArea}
                disabled={refetching}
                className="pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-elevation-2 text-[13px] font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 disabled:opacity-60 disabled:cursor-wait transition-colors"
              >
                {refetching ? (
                  <div className="w-3.5 h-3.5 border-2 border-stone-300 dark:border-stone-700 border-t-stone-600 dark:border-t-stone-300 rounded-full animate-spin" />
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
                    <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>
                  </svg>
                )}
                {refetching ? 'Searching...' : 'Search this area'}
              </button>
            </div>
          )}

          {/* Selected popup — anchored to the map card's bottom */}
          {selected && (
            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-full max-w-sm px-4"
              role="dialog"
              aria-label={`Listing: ${selected.title}`}
            >
              <div className="bg-stone-950/95 backdrop-blur-md rounded-2xl border border-stone-800 overflow-hidden shadow-elevation-4">
                <div className="flex items-center gap-3 p-3.5">
                  <div className={`w-12 h-12 ${selected.kind === 'worker' ? 'rounded-full' : 'rounded-xl'} overflow-hidden bg-stone-800 shrink-0 flex items-center justify-center`}>
                    {selected.image ? (
                      <Image
                        src={selected.image}
                        alt={selected.title}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[15px] font-medium text-stone-300">
                        {selected.title.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[14px] font-semibold text-white truncate">{selected.title}</h3>
                    <p className="text-[12px] text-stone-400 dark:text-stone-500 truncate">
                      {selected.category}
                      {selected.rating != null && (
                        <span className="ml-1.5">· {selected.rating.toFixed(1)}★{selected.ratingCount ? ` (${selected.ratingCount})` : ''}</span>
                      )}
                    </p>
                    <p className="text-[11px] text-stone-500 truncate">{selected.location}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelected(null); }}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-stone-500 dark:text-stone-500 hover:text-white hover:bg-stone-800 transition-colors shrink-0"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                </div>

                {/* Worker list */}
                {selected.workers.length > 0 && (() => {
                  const visible = selected.workers.slice(0, 6);
                  const overflow = selected.workers.length - visible.length;
                  return (
                    <div className="pl-5 pr-3.5 pb-4 pt-1">
                      <div className="grid grid-cols-2 gap-x-3 gap-y-3.5">
                        {visible.map((w) => (
                          <div key={w.id} className="flex items-center gap-2 min-w-0">
                            <div className="w-9 h-9 rounded-full overflow-hidden bg-stone-800 ring-1 ring-stone-700 shrink-0">
                              {w.image ? (
                                <Image src={w.image} alt={w.fullName} width={36} height={36} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[12px] font-medium text-stone-300">
                                  {w.fullName.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0 leading-tight">
                              <p className="text-[12px] font-medium text-stone-100 truncate">{w.fullName}</p>
                              {w.jobTitle && (
                                <p className="text-[11px] text-stone-400 truncate">{w.jobTitle}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      {overflow > 0 && (
                        <p className="mt-2 text-[11px] text-stone-500 pl-1">+{overflow} more</p>
                      )}
                    </div>
                  );
                })()}

                <div className="px-3.5 pb-3.5 flex gap-2">
                  <a
                    href={directionsUrl(selected.lat, selected.lng, selected.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-[13px] font-medium text-stone-200 transition-colors text-center inline-flex items-center justify-center gap-1.5"
                    aria-label={`Get directions to ${selected.title}`}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 11l19-9-9 19-2-8-8-2z"/>
                    </svg>
                    Directions
                  </a>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const href = selected.kind === 'worker' && selected.userId
                        ? `/profile/${selected.userId}`
                        : `/listings/${selected.id}`;
                      router.push(href);
                    }}
                    className="flex-1 py-2 rounded-xl bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 hover:bg-stone-100 text-[13px] font-medium transition-colors"
                    aria-label={`View details for ${selected.title}`}
                  >
                    View details
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};

export default MapsClient;
