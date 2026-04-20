'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Image from 'next/image';
import Logo from '@/components/ui/Logo';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';
import { SafeUser } from '@/app/types';
import Skeleton from '@/components/ui/Skeleton';
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
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const SOURCE_ID = 'listings';
const CLUSTER_LAYER_ID = 'listings-clusters';
const CLUSTER_COUNT_LAYER_ID = 'listings-cluster-count';
const POINT_LAYER_ID = 'listings-points';
const WORKER_BADGE_BG_LAYER_ID = 'listings-worker-badge-bg';
const WORKER_BADGE_TEXT_LAYER_ID = 'listings-worker-badge-text';
const PIN_ICON_ID = 'listing-pin';

// Inline SVG used as the unclustered marker. Rendered to an Image and registered with Mapbox via addImage.
const PIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44">
  <circle cx="22" cy="22" r="17" fill="#18181b" stroke="#ffffff" stroke-width="2.5"/>
  <path d="M14 22l8-7 8 7v9a2 2 0 0 1-2 2h-12a2 2 0 0 1-2-2z" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <polyline points="20 32 20 25 24 25 24 32" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

function loadPinImage(map: mapboxgl.Map): Promise<void> {
  return new Promise((resolve) => {
    if (map.hasImage(PIN_ICON_ID)) return resolve();
    const url = `data:image/svg+xml;base64,${btoa(PIN_SVG)}`;
    const img = new window.Image(44, 44);
    img.onload = () => {
      if (!map.hasImage(PIN_ICON_ID)) map.addImage(PIN_ICON_ID, img, { pixelRatio: 2 });
      resolve();
    };
    img.onerror = () => resolve(); // graceful fallback — points still render via paint props if needed
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
  const [exiting, setExiting] = useState(false);
  const [showSearchArea, setShowSearchArea] = useState(false);
  const [refetching, setRefetching] = useState(false);

  // Mobile bottom-sheet snap points. 'peek' on first paint so the map is the hero on phones.
  type SheetSnap = 'peek' | 'half' | 'full';
  const [sheetSnap, setSheetSnap] = useState<SheetSnap>('peek');
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartY = useRef<number | null>(null);
  const isDragging = useRef(false);

  const SHEET_HEIGHTS: Record<SheetSnap, string> = {
    peek: '136px',
    half: '52vh',
    full: '88vh',
  };

  const handleSheetTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    isDragging.current = false;
  };
  const handleSheetTouchMove = (e: React.TouchEvent) => {
    if (dragStartY.current == null) return;
    const dy = e.touches[0].clientY - dragStartY.current;
    if (Math.abs(dy) > 4) isDragging.current = true;
    setDragOffset(dy);
  };
  const handleSheetTouchEnd = () => {
    const dy = dragOffset;
    if (dragStartY.current == null) return;
    let next: SheetSnap = sheetSnap;
    if (Math.abs(dy) > 40) {
      if (dy < 0) next = sheetSnap === 'peek' ? 'half' : 'full';
      else next = sheetSnap === 'full' ? 'half' : 'peek';
    }
    setSheetSnap(next);
    setDragOffset(0);
    dragStartY.current = null;
    // Defer reset so the click handler below sees isDragging
    setTimeout(() => { isDragging.current = false; }, 0);
  };
  const cycleSheet = () => {
    if (isDragging.current) return; // suppress click after drag
    setSheetSnap((s) => (s === 'peek' ? 'half' : s === 'half' ? 'full' : 'peek'));
  };

  const fetchListings = useCallback(async (bbox?: string): Promise<MapItem[]> => {
    const url = bbox ? `/api/listings/map?bbox=${encodeURIComponent(bbox)}` : '/api/listings/map';
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Map fetch failed (${r.status})`);
    const data = await r.json();
    const rows = (data.listings || []) as Array<{
      id: string; title: string; category: string;
      location: string | null; address: string | null;
      imageSrc: string; lat: number; lng: number;
      rating: number | null; ratingCount: number;
      employees?: MapWorker[];
    }>;
    return rows.map((l) => ({
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
    }));
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

  const navigateAway = useCallback((href: string) => {
    setExiting(true);
    setTimeout(() => router.push(href), 400);
  }, [router]);
  const [sort, setSort] = useState<'nearest' | 'name'>('nearest');
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  // 'denied' surfaces a banner so the user knows why we can't center on them.
  const [permissionState, setPermissionState] = useState<'unknown' | 'granted' | 'denied' | 'prompt'>('unknown');

  const requestLocation = useCallback((opts: { silent?: boolean } = {}) => {
    if (!navigator.geolocation) {
      if (!opts.silent) toast.error('Geolocation isn\u2019t available in this browser.');
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
          toast.error('Couldn\u2019t get your location. Try again.');
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

        map.current.addLayer({
          id: CLUSTER_LAYER_ID,
          type: 'circle',
          source: SOURCE_ID,
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': '#18181b',
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': 3,
            'circle-radius': [
              'step', ['get', 'point_count'],
              18,
              10, 22,
              50, 28,
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
            'icon-size': 0.85,
            'icon-allow-overlap': true,
            'icon-anchor': 'center',
          },
        });

        // Worker count badge — small white circle at the upper-right of each pin.
        map.current.addLayer({
          id: WORKER_BADGE_BG_LAYER_ID,
          type: 'circle',
          source: SOURCE_ID,
          filter: ['all', ['!', ['has', 'point_count']], ['>', ['coalesce', ['get', 'workerCount'], 0], 0]],
          paint: {
            'circle-color': '#ffffff',
            'circle-radius': 8,
            'circle-stroke-color': '#18181b',
            'circle-stroke-width': 1.5,
            'circle-translate': [12, -12],
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
            'text-offset': [0.95, -1.0],
            'text-allow-overlap': true,
          'text-ignore-placement': true,
        },
        paint: {
          'text-color': '#18181b',
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
    setSheetSnap('peek'); // collapse mobile sheet so the popup card is visible
    map.current?.flyTo({ center: [item.lng, item.lat], zoom: 14, duration: 800 });
  };

  // Sidebar shows as soon as items are loaded — never wait on the map.
  // The map fades in separately when mapReady fires (or the failsafe trips).
  const [showUI, setShowUI] = useState(false);
  useEffect(() => {
    if (!itemsLoaded) return;
    let cancelled = false;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cancelled) setShowUI(true);
      });
    });
    return () => { cancelled = true; };
  }, [itemsLoaded]);
  const ready = showUI;

  if (!MAPBOX_TOKEN) {
    return (
      <div className="fixed inset-0 bg-stone-950 text-stone-100 flex items-center justify-center px-6">
        <div className="max-w-sm text-center">
          <p className="text-[15px] font-medium mb-1">Map unavailable</p>
          <p className="text-[12px] text-stone-400">
            <code>NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code> isn&apos;t set. Add it to your environment to enable the map.
          </p>
        </div>
      </div>
    );
  }

  if (!itemsLoaded) {
    return (
      <div className="fixed inset-0 bg-stone-950">
        {/* Sidebar skeleton (desktop only — mobile shows just the map shimmer) */}
        <div className="hidden md:flex absolute top-4 left-8 bottom-4 w-[370px] flex-col bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl z-10 shadow-2xl shadow-black/10 overflow-hidden px-8 pb-5 pt-7 gap-4">
          {/* Back + Logo row */}
          <div className="flex items-center justify-between">
            <Skeleton rounded="full" className="h-8 w-8" />
            <Skeleton rounded="full" className="h-8 w-8" />
          </div>
          {/* Search input */}
          <Skeleton rounded="xl" className="h-10 w-full" />
          {/* Filters row */}
          <div className="grid grid-cols-3 gap-2">
            <Skeleton rounded="xl" className="h-9 w-full" />
            <Skeleton rounded="xl" className="h-9 w-full" />
            <Skeleton rounded="xl" className="h-9 w-full" />
          </div>
          {/* Divider */}
          <div className="h-px bg-stone-200 dark:bg-stone-800" />
          {/* Results list */}
          <div className="flex-1 overflow-hidden -mx-8 px-8 space-y-0.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-full flex items-center gap-3 py-3">
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
          {/* Footer count */}
          <div className="px-4 py-3 border-t border-stone-200 dark:border-stone-800">
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        {/* Map placeholder */}
        <div className="absolute inset-0 bg-stone-800 dark:bg-stone-900 animate-pulse" />
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-stone-950"
      style={{ opacity: exiting ? 0 : 1, transition: 'opacity 0.4s ease-out' }}
    >
      {/* Sidebar (desktop) / Bottom sheet (mobile) */}
      <div
        className="
          fixed bottom-0 left-0 right-0 z-10
          flex flex-col bg-white dark:bg-stone-900
          rounded-t-2xl border-t border-stone-200/80 dark:border-stone-800
          shadow-2xl shadow-black/20 overflow-hidden
          md:absolute md:top-4 md:left-8 md:bottom-4 md:right-auto
          md:w-[370px] md:!h-auto md:!translate-y-0
          md:rounded-2xl md:border md:border-stone-200/80
          md:shadow-2xl md:shadow-black/10
        "
        style={{
          height: SHEET_HEIGHTS[sheetSnap],
          transform: `translateY(${Math.max(0, dragOffset)}px)`,
          opacity: ready ? 1 : 0,
          transition: dragStartY.current != null
            ? 'opacity 0.4s ease-out'
            : 'height 0.3s ease-out, transform 0.3s ease-out, opacity 0.4s ease-out',
        }}
      >
        {/* Drag handle (mobile only) */}
        <div
          className="md:hidden flex justify-center pt-2.5 pb-1.5 cursor-grab active:cursor-grabbing select-none"
          onTouchStart={handleSheetTouchStart}
          onTouchMove={handleSheetTouchMove}
          onTouchEnd={handleSheetTouchEnd}
          onClick={cycleSheet}
          role="button"
          aria-label={`Sheet position: ${sheetSnap}. Tap to change.`}
        >
          <div className="w-10 h-1 rounded-full bg-stone-300 dark:bg-stone-700" />
        </div>

        {/* Inner padded wrapper — holds all the original sidebar content */}
        <div className="flex flex-col flex-1 min-h-0 px-6 md:px-8 pb-5 pt-3 md:pt-7 gap-4">

        {/* Back + Logo */}
        <div
          className="flex items-center justify-between"
          style={{
            opacity: ready ? 1 : 0,
            transition: 'opacity 0.4s ease-out',
          }}
        >
          <Logo className="opacity-90 shrink-0 mt-[1.2px]" />
          <button onClick={() => navigateAway('/')} className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400  hover:text-stone-700 dark:hover:text-stone-300 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M5 12l7-7M5 12l7 7"/>
            </svg>
          </button>
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
            aria-label="Search listings"
            className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-3.5 py-2.5 text-[13px] text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-stone-400 transition-colors"
          />
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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
          <div className="relative col-span-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as 'nearest' | 'name')}
              className="w-full appearance-none bg-transparent border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-2 pr-7 text-[13px] text-stone-600 dark:text-stone-300 focus:outline-none focus:border-stone-400 transition-colors cursor-pointer"
            >
              <option value="nearest">Nearest</option>
              <option value="name">Name</option>
            </select>
            <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 dark:text-stone-500 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </div>
          <div className="relative">
            <button
              onClick={() => setFiltersOpen((o) => !o)}
              aria-expanded={filtersOpen}
              className={`w-full flex items-center justify-between gap-1 appearance-none border rounded-xl px-3 py-2 text-[13px] text-left transition-colors ${
                activeFilterCount > 0 || filtersOpen
                  ? 'bg-stone-900 text-white border-stone-900 dark:bg-stone-100 dark:text-stone-900 dark:border-stone-100'
                  : 'bg-transparent text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:border-stone-400'
              }`}
            >
              <span>Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}</span>
              <svg className="w-3.5 h-3.5 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d={filtersOpen ? 'm18 15-6-6-6 6' : 'm6 9 6 6 6-6'}/>
              </svg>
            </button>
          </div>
        </div>

        {/* Filter panel — slide-down */}
        {filtersOpen && (
          <div className="-mx-6 md:-mx-8 px-6 md:px-8 py-3 border-t border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-950/30 flex flex-col gap-3.5">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400 font-medium mb-1.5">Category</p>
              <div className="flex flex-wrap gap-1.5">
                {ALL_CATEGORIES.map((c) => {
                  const on = filterCategories.includes(c.label);
                  return (
                    <button
                      key={c.label}
                      onClick={() => setFilterCategories(
                        on ? filterCategories.filter((x) => x !== c.label) : [...filterCategories, c.label]
                      )}
                      className={`px-2.5 py-1 rounded-full text-[11px] border transition-colors ${
                        on
                          ? 'bg-stone-900 text-white border-stone-900 dark:bg-stone-100 dark:text-stone-900 dark:border-stone-100'
                          : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-stone-400'
                      }`}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <p className="text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400 font-medium">Distance</p>
                {!userLoc && (
                  <button onClick={handleUseMyLocation} className="text-[10px] text-stone-500 dark:text-stone-400 underline hover:text-stone-700">
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
                      className={`px-2 py-1 rounded-md text-[11px] border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                        on
                          ? 'bg-stone-900 text-white border-stone-900 dark:bg-stone-100 dark:text-stone-900 dark:border-stone-100'
                          : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                      }`}
                    >
                      {r}mi
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400 font-medium mb-1.5">Min rating</p>
              <div className="grid grid-cols-4 gap-1.5">
                {([null, 3, 4, 4.5] as Array<number | null>).map((r) => {
                  const on = filterMinRating === r;
                  return (
                    <button
                      key={r ?? 'any'}
                      onClick={() => setFilterMinRating(r)}
                      className={`px-2 py-1 rounded-md text-[11px] border transition-colors ${
                        on
                          ? 'bg-stone-900 text-white border-stone-900 dark:bg-stone-100 dark:text-stone-900 dark:border-stone-100'
                          : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                      }`}
                    >
                      {r == null ? 'Any' : `${r}\u2605+`}
                    </button>
                  );
                })}
              </div>
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="self-start text-[12px] text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-stone-200 dark:bg-stone-700" style={{ opacity: ready ? 1 : 0, transition: 'opacity 0.5s ease-out 0.45s' }} />

        {/* Results list */}
        <div
          className="flex-1 overflow-y-auto -mx-1 px-1 py-0.5 space-y-1"
          style={{
            opacity: ready ? 1 : 0,
            transition: 'opacity 0.5s ease-out 0.5s',
          }}
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
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-all duration-150 group focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-300 dark:focus-visible:ring-stone-600 ${
                  selected?.id === item.id
                    ? 'bg-stone-100 dark:bg-stone-800 ring-1 ring-stone-200 dark:ring-stone-700'
                    : 'hover:bg-stone-50 dark:hover:bg-stone-800'
                }`}
              >
                {/* Image */}
                <div className="w-11 h-11 rounded-full overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0 ring-1 ring-stone-200/80">
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
                  <p className="text-[13px] font-medium text-stone-800 dark:text-stone-200 truncate">{item.title}</p>
                  <p className="text-[12px] text-stone-500  dark:text-stone-500 truncate">{item.category}</p>
                  <p className="text-[11px] text-stone-400 dark:text-stone-500 truncate">{item.location}</p>
                </div>

                {/* Distance */}
                <span className="text-[11px] text-stone-400 dark:text-stone-500 shrink-0">
                  {item.distance != null ? `${item.distance} mi` : '—'}
                </span>
              </button>
            ))
          )}
        </div>

        {/* Footer count */}
        {!fetchError && (
          <div className="px-4 py-3 border-t border-stone-200 dark:border-stone-800">
            <p className="text-[11px] text-stone-400 dark:text-stone-500">
              {searchFiltered.length} {searchFiltered.length === 1 ? 'result' : 'results'}
            </p>
          </div>
        )}
        </div>{/* /inner padded wrapper */}
      </div>

      {/* Map — full screen behind sidebar. Container itself is always mounted so mapboxgl can attach. */}
      <div className="absolute inset-0">
        <div
          ref={mapContainer}
          className="w-full h-full"
          style={{
            opacity: mapReady ? 1 : 0,
            transition: 'opacity 0.6s ease-out',
          }}
        />

        {/* Permission-denied banner — top center, only when the user has previously blocked location */}
        {permissionState === 'denied' && !showSearchArea && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none px-4 max-w-md w-full">
            <div className="pointer-events-auto flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-lg shadow-black/10">
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

        {/* Use my location — small FAB top-right, sits below the Mapbox NavigationControl */}
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
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <button
              onClick={handleSearchArea}
              disabled={refetching}
              className="pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-lg shadow-black/10 text-[13px] font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 disabled:opacity-60 disabled:cursor-wait transition-colors"
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

        {/* Selected popup on map — sits above the bottom sheet on mobile */}
        {selected && (
          <div
            className="absolute bottom-[160px] md:bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-sm px-4"
            role="dialog"
            aria-label={`Listing: ${selected.title}`}
          >
            <div className="bg-stone-950/95 backdrop-blur-md rounded-2xl border border-stone-800 overflow-hidden">
              <div className="flex items-center gap-3 p-3.5">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-800 shrink-0">
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
                  <p className="text-[12px] text-stone-400 dark:text-stone-500 truncate">
                    {selected.category}
                    {selected.rating != null && (
                      <span className="ml-1.5">· {selected.rating.toFixed(1)}\u2605{selected.ratingCount ? ` (${selected.ratingCount})` : ''}</span>
                    )}
                  </p>
                  <p className="text-[11px] text-stone-500 truncate">{selected.location}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelected(null); }}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-stone-500  dark:text-stone-500 hover:text-white hover:bg-stone-800 transition-colors shrink-0"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              {/* Worker list — 2 per row, avatar left + name/jobTitle right */}
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
                  onClick={(e) => { e.stopPropagation(); navigateAway(`/listings/${selected.id}`); }}
                  className="flex-1 py-2 rounded-xl bg-white text-stone-900 hover:bg-stone-100 text-[13px] font-medium transition-colors"
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
  );
};

export default MapsClient;
