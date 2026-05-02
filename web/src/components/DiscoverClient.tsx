'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import ClientProviders from '@/components/ClientProviders';
import { categories } from '@/components/Categories';
import { SafePost, SafeUser, SafeListing, SafeEmployee, SafeShop } from '@/app/types';
import { useViewMode } from '@/app/hooks/useViewMode';
import { useSidebarState } from '@/app/hooks/useSidebarState';
import Container from './Container';
import EditorialBanner from './EditorialBanner';
import PageSearch from '@/components/search/PageSearch';
import PostCard from './feed/PostCard';
import TikTokView from './feed/TikTokView';
import ListingCard from '@/components/listings/ListingCard';
import WorkerCard from '@/components/listings/WorkerCard';
import ShopCard from '@/components/shop/ShopCard';
import SectionHeader from '@/app/market/SectionHeader';
import { PlusSignIcon, Notification03Icon, MessageMultiple01Icon } from 'hugeicons-react';
import Image from 'next/image';
import useLoginModal from '@/app/hooks/useLoginModal';
import { placeholderDataUri } from '@/lib/placeholders';
import useInboxModal from '@/app/hooks/useInboxModal';
import useNotificationsModal from '@/app/hooks/useNotificationsModal';
import useLocationModal from '@/app/hooks/useLocationModal';

interface DiscoverClientProps {
  initialPosts?: SafePost[];
  currentUser: SafeUser | null;
  categoryToUse?: string;
  listings?: SafeListing[];
  allListingsForLookup?: SafeListing[];
  employees?: SafeEmployee[];
  shops?: SafeShop[];
}

const FADE_OUT_DURATION = 200;

const BANNERS = [
  {
    src: '/assets/people/v-drip.png',
    alt: 'V Drip Hair Studio',
    tag: 'Featured',
    title: 'Look Like Your Next Level.',
    subtitle: 'Premium cuts, styles, and treatments from top-tier professionals',
    href: '/shops',
  },
];

// Real seeded demo records (see scripts/seed-sample-workers.ts) get a "sample"
// badge in the rails — matched by listing title and worker fullName.
const SAMPLE_LISTING_TITLES = new Set(['Lumière Studio', 'Ironworks Gym', 'Stillwater Wellness']);
const SAMPLE_WORKER_NAMES = new Set(['Jordan Riley', 'Maya Vega', 'Kai Chen']);

// Shuffle array using Fisher-Yates algorithm (seeded for stability during session)
function shuffleArray<T>(array: T[], seed?: number): T[] {
  const shuffled = [...array];
  let currentSeed = seed ?? Date.now();

  const random = () => {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  };

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const DiscoverClient: React.FC<DiscoverClientProps> = ({
  initialPosts: serverPosts,
  currentUser,
  categoryToUse,
  listings: serverListings,
  allListingsForLookup: serverAllListings,
  employees: serverEmployees,
  shops: serverShops,
}) => {
  // Client-side data fetching when no server data provided
  const [fetchedData, setFetchedData] = useState<{
    posts: SafePost[];
    listings: SafeListing[];
    employees: SafeEmployee[];
    shops: SafeShop[];
  } | null>(
    serverPosts ? { posts: serverPosts, listings: serverListings || [], employees: serverEmployees || [], shops: serverShops || [] } : null
  );

  useEffect(() => {
    if (serverPosts) return;
    Promise.all([
      fetch('/api/post/list?filter=for-you').then(r => r.json()),
      fetch('/api/listings?includeAcademy=true').then(r => r.json()),
      fetch('/api/shops?limit=20').then(r => r.json()),
    ])
      .then(([posts, listingsRes, shops]) => {
        const allListings: SafeListing[] = Array.isArray(listingsRes) ? listingsRes : (listingsRes?.listings || []);
        const emps = allListings.flatMap((l: SafeListing) => l.employees || []);
        setFetchedData({ posts, listings: allListings, employees: emps, shops });
      })
      .catch(() => setFetchedData({ posts: [], listings: [], employees: [], shops: [] }));
  }, [serverPosts]);

  const isLoadingData = fetchedData === null;
  const initialPosts = fetchedData?.posts || [];
  // Independent workers don't get a storefront card — their listing is hidden from
  // ListingCard rails; they show up as a WorkerCard only.
  const listings = fetchedData?.listings.filter(
    (l: SafeListing) => !l.academyId && !l.employees?.some(e => e.isIndependent)
  ) || [];
  const employees = fetchedData?.employees || [];
  const shops = fetchedData?.shops || [];

  const listingsForLookup = serverAllListings ?? fetchedData?.listings ?? listings;

  const { viewMode, setViewMode } = useViewMode();
  const isSidebarCollapsed = useSidebarState();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const loginModal = useLoginModal();
  const inboxModal = useInboxModal();
  const notificationsModal = useNotificationsModal();
  const selectedLocation = useLocationModal((s) => s.selectedLocation);

  const isNavActive = (path: string, includes?: string[]) => {
    if (pathname === path) return true;
    if (includes?.some(p => pathname?.startsWith(p))) return true;
    return false;
  };

  const navItems = [
    { label: "Home", href: "/", active: isNavActive("/", ["/post", "/listings"]) },
    { label: "Maps", href: "/maps", active: isNavActive("/maps") },
    { label: "Brands", href: "/shops", active: isNavActive("/shops") },
    ...(currentUser ? [
      { label: "Bookings", href: "/bookings/reservations", active: isNavActive("/bookings/reservations", ["/bookings"]) },
    ] : []),
    { label: "Settings", href: "/settings", active: isNavActive("/settings") },
  ];

  // Support both legacy single category and new multi-select categories
  const currentCategories = searchParams?.get('categories')?.split(',').filter(Boolean) ||
    (searchParams?.get('category') ? [searchParams.get('category')!] : []);

  // Items per page: 14 for posts grid (2x7), others based on sidebar state
  const ITEMS_PER_PAGE = 14;

  // Generate a stable seed for this session (changes on page refresh)
  const [shuffleSeed] = useState(() => Date.now());

  // Location matching helper
  const matchesLocation = (location?: string | null) => {
    if (!selectedLocation) return true;
    if (!location) return false;
    const loc = location.toLowerCase();
    const sel = selectedLocation.toLowerCase();
    // Match city or state portion (e.g., "Brooklyn, NY" matches "New York, NY" by state)
    const [selCity, selState] = sel.split(',').map(s => s.trim());
    const [locCity, locState] = loc.split(',').map(s => s.trim());
    return locCity === selCity || (selState && locState === selState);
  };

  // Filter and randomize data based on selected categories and location
  const shuffledPosts = useMemo(() => {
    let filtered = initialPosts;
    if (currentCategories.length > 0) {
      filtered = filtered.filter(p => currentCategories.includes(p.category ?? ''));
    }
    return shuffleArray(filtered, shuffleSeed);
  }, [initialPosts, shuffleSeed, currentCategories]);

  const shuffledListings = useMemo(() => {
    let filtered = [...listings];
    if (currentCategories.length > 0) {
      filtered = filtered.filter(l => currentCategories.includes(l.category));
    }
    if (selectedLocation) {
      filtered = filtered.filter(l => matchesLocation(l.location));
    }
    return shuffleArray(filtered, shuffleSeed + 1);
  }, [listings, shuffleSeed, currentCategories, selectedLocation]);

  const shuffledEmployees = useMemo(() => {
    let filtered = employees;
    // Look up each employee's listing in the *unfiltered* set so independent
    // workers (whose hidden listings are filtered out of `listings`) still
    // pass the category/location filter.
    if (currentCategories.length > 0) {
      filtered = filtered.filter(emp => {
        const empListing = listingsForLookup.find(l => l.id === emp.listingId);
        return empListing && currentCategories.includes(empListing.category);
      });
    }
    if (selectedLocation) {
      filtered = filtered.filter(emp => {
        const empListing = listingsForLookup.find(l => l.id === emp.listingId);
        return empListing && matchesLocation(empListing.location);
      });
    }
    return shuffleArray(filtered, shuffleSeed + 2);
  }, [employees, listingsForLookup, shuffleSeed, currentCategories, selectedLocation]);

  const shuffledShops = useMemo(() => {
    let filtered = shops;
    if (currentCategories.length > 0) {
      filtered = filtered.filter(s => currentCategories.includes(s.category ?? ''));
    }
    if (selectedLocation) {
      filtered = filtered.filter(s => matchesLocation(s.location));
    }
    return shuffleArray(filtered, shuffleSeed + 3);
  }, [shops, shuffleSeed, currentCategories]);

  // Pagination state
  const [postsIndex, setPostsIndex] = useState(0);
  const [listingsIndex, setListingsIndex] = useState(0);
  const [employeesIndex, setEmployeesIndex] = useState(0);
  const [shopsIndex, setShopsIndex] = useState(0);

  // Animation state
  const [isAnimating, setIsAnimating] = useState(false);
  const [postsVisible, setPostsVisible] = useState(true);
  const [listingsVisible, setListingsVisible] = useState(true);
  const [employeesVisible, setEmployeesVisible] = useState(true);
  const [shopsVisible, setShopsVisible] = useState(true);

  // View all mode
  const [viewAllMode, setViewAllMode] = useState<'posts' | 'listings' | 'professionals' | 'shops' | null>(null);

  // Reset pagination on sidebar change
  useEffect(() => {
    setPostsIndex(0);
    setListingsIndex(0);
    setEmployeesIndex(0);
    setShopsIndex(0);
  }, [isSidebarCollapsed]);

  const headerSearchParams = {
    userId: searchParams?.get('userId') || undefined,
    locationValue: searchParams?.get('locationValue') || undefined,
    category: searchParams?.get('category') || undefined,
    state: searchParams?.get('state') || undefined,
    city: searchParams?.get('city') || undefined,
    minPrice: searchParams?.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams?.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    order: (searchParams?.get('order') as 'asc' | 'desc') || undefined,
    page: searchParams?.get('page') || undefined,
  };

  const typeFilter = searchParams?.get('type') as 'posts' | 'listings' | 'professionals' | 'shops' | null;


  // Responsive grid - adds 1 column when sidebar is collapsed
  const gridColsClass = isSidebarCollapsed
    ? 'grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    : 'grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3';

  const filterInfo = useMemo(() => {
    const categoryIsActive = currentCategories.length > 0;
    const hasPriceFilter = headerSearchParams.minPrice !== undefined || headerSearchParams.maxPrice !== undefined;
    const hasLocationFilter = !!(
      headerSearchParams.city?.toString()?.trim() ||
      headerSearchParams.state?.toString()?.trim()
    );
    const hasTypeFilter = !!typeFilter;
    const isFiltered = categoryIsActive || hasPriceFilter || hasLocationFilter || hasTypeFilter;

    let resultsHeaderText = '';
    if (hasTypeFilter && typeFilter) {
      const typeNames = {
        posts: 'All Posts',
        listings: 'All Listings',
        professionals: 'All Professionals',
        shops: 'All Shops'
      };
      resultsHeaderText = typeNames[typeFilter] || 'All Results';
    } else if (categoryIsActive) {
      if (currentCategories.length === 1) {
        const categoryName = currentCategories[0].charAt(0).toUpperCase() + currentCategories[0].slice(1);
        resultsHeaderText = `${categoryName} Feed`;
      } else {
        resultsHeaderText = `${currentCategories.length} Categories`;
      }
    } else if (hasPriceFilter || hasLocationFilter) {
      resultsHeaderText = 'Feed Results';
    }

    return { isFiltered, categoryIsActive, resultsHeaderText, currentCategories, typeFilter: hasTypeFilter ? typeFilter : null };
  }, [currentCategories, headerSearchParams, typeFilter]);


  // Animated transition helper (matching market pattern)
  const animateTransition = (
    setVisible: (visible: boolean) => void,
    setIndex: (index: number) => void,
    currentIndex: number,
    totalPages: number,
    direction: 'left' | 'right'
  ) => {
    if (totalPages <= 1 || isAnimating) return;

    setIsAnimating(true);
    setVisible(false);

    setTimeout(() => {
      const newIndex = direction === 'right'
        ? (currentIndex + 1) % totalPages
        : currentIndex === 0 ? totalPages - 1 : currentIndex - 1;

      setIndex(newIndex);
      setTimeout(() => {
        setVisible(true);
        setIsAnimating(false);
      }, 50);
    }, FADE_OUT_DURATION);
  };

  // Paginated items - use server-provided data directly (like MarketClient)
  const currentPosts = useMemo(() => {
    if (shuffledPosts.length <= ITEMS_PER_PAGE) return shuffledPosts;
    const start = postsIndex * ITEMS_PER_PAGE;
    return shuffledPosts.slice(start, start + ITEMS_PER_PAGE);
  }, [shuffledPosts, postsIndex, ITEMS_PER_PAGE]);

  const currentListings = useMemo(() => {
    if (shuffledListings.length <= ITEMS_PER_PAGE) return shuffledListings;
    const start = listingsIndex * ITEMS_PER_PAGE;
    return shuffledListings.slice(start, start + ITEMS_PER_PAGE);
  }, [shuffledListings, listingsIndex, ITEMS_PER_PAGE]);

  const currentEmployees = useMemo(() => {
    if (shuffledEmployees.length <= ITEMS_PER_PAGE) return shuffledEmployees;
    const start = employeesIndex * ITEMS_PER_PAGE;
    return shuffledEmployees.slice(start, start + ITEMS_PER_PAGE);
  }, [shuffledEmployees, employeesIndex, ITEMS_PER_PAGE]);

  const currentShops = useMemo(() => {
    if (shuffledShops.length <= ITEMS_PER_PAGE) return shuffledShops;
    const start = shopsIndex * ITEMS_PER_PAGE;
    return shuffledShops.slice(start, start + ITEMS_PER_PAGE);
  }, [shuffledShops, shopsIndex, ITEMS_PER_PAGE]);

  // Total pages
  const totalPostsPages = Math.max(1, Math.ceil(shuffledPosts.length / ITEMS_PER_PAGE));
  const totalListingsPages = Math.max(1, Math.ceil(shuffledListings.length / ITEMS_PER_PAGE));
  const totalEmployeesPages = Math.max(1, Math.ceil(shuffledEmployees.length / ITEMS_PER_PAGE));
  const totalShopsPages = Math.max(1, Math.ceil(shuffledShops.length / ITEMS_PER_PAGE));

  // Scroll handlers
  const scrollPosts = (dir: 'left' | 'right') =>
    animateTransition(setPostsVisible, setPostsIndex, postsIndex, totalPostsPages, dir);

  const scrollListings = (dir: 'left' | 'right') =>
    animateTransition(setListingsVisible, setListingsIndex, listingsIndex, totalListingsPages, dir);

  const scrollEmployees = (dir: 'left' | 'right') =>
    animateTransition(setEmployeesVisible, setEmployeesIndex, employeesIndex, totalEmployeesPages, dir);

  const scrollShops = (dir: 'left' | 'right') =>
    animateTransition(setShopsVisible, setShopsIndex, shopsIndex, totalShopsPages, dir);

  // View all handlers
  const handleViewAllPosts = () => {
    setViewAllMode('posts');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewAllListings = () => {
    setViewAllMode('listings');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewAllProfessionals = () => {
    setViewAllMode('professionals');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewAllShops = () => {
    setViewAllMode('shops');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToMain = () => {
    setViewAllMode(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Check all content types. The Local Businesses and Trending Professionals
  // rails always include sample cards, so on the unfiltered home view we have
  // content to show even when the DB is bare — skip the empty-state fallback.
  const hasContent = useMemo(() => {
    if (!filterInfo.isFiltered) return true;
    const hasPosts = (initialPosts?.length || 0) > 0;
    const hasListings = listings.length > 0;
    const hasEmployees = employees.length > 0;
    const hasShops = shops.length > 0;
    return hasPosts || hasListings || hasEmployees || hasShops;
  }, [initialPosts, listings, employees, shops, filterInfo.isFiltered]);

  const allContentItems = useMemo(() => {
    let items: Array<{type: 'post' | 'listing' | 'employee' | 'shop', data: any, listingContext?: any}> = [];

    // Use category-filtered data when categories are selected
    const postsToUse = shuffledPosts;
    const listingsToUse = shuffledListings;
    const employeesToUse = shuffledEmployees;
    const shopsToUse = shuffledShops;

    if (filterInfo.typeFilter) {
      if (filterInfo.typeFilter === 'posts') {
        items = postsToUse.map(post => ({ type: 'post' as const, data: post }));
      } else if (filterInfo.typeFilter === 'listings') {
        items = listingsToUse.map(listing => ({ type: 'listing' as const, data: listing }));
      } else if (filterInfo.typeFilter === 'professionals') {
        items = employeesToUse.map(employee => {
          const listing = listingsForLookup.find(l => l.id === employee.listingId) || listingsForLookup[0];
          return { type: 'employee' as const, data: employee, listingContext: listing };
        });
      } else if (filterInfo.typeFilter === 'shops') {
        items = shopsToUse.map(shop => ({ type: 'shop' as const, data: shop }));
      }
    } else {
      items = [
        ...postsToUse.map(post => ({ type: 'post' as const, data: post })),
        ...listingsToUse.map(listing => ({ type: 'listing' as const, data: listing })),
        ...employeesToUse.map(employee => {
          const listing = listingsForLookup.find(l => l.id === employee.listingId) || listingsForLookup[0];
          return { type: 'employee' as const, data: employee, listingContext: listing };
        }),
        ...shopsToUse.map(shop => ({ type: 'shop' as const, data: shop })),
      ];
    }

    return items;
  }, [shuffledPosts, shuffledListings, shuffledEmployees, shuffledShops, listingsForLookup, filterInfo.typeFilter]);

  return (
    <ClientProviders>
      <div className="min-h-screen">
        <Container>
          {/* Inline skeleton — renders in same Container as real content */}
          {isLoadingData && (
            <div>
              {/* ── Banner skeleton (matches aspect-[4/1] rounded-2xl + 3 dots) ── */}
              <div className="mt-8">
                <div className="rounded-2xl shadow-elevation-2 animate-pulse bg-stone-200/60 dark:bg-stone-800/60 w-full aspect-[4/1]" />
                <div className="flex gap-1.5 mt-3 justify-center items-center">
                  <div className="h-1.5 w-4 rounded-full animate-pulse bg-stone-300/60 dark:bg-stone-700/60" />
                  <div className="h-1.5 w-1.5 rounded-full animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                  <div className="h-1.5 w-1.5 rounded-full animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                </div>
              </div>

              {/* ── Shop By Category (matches SectionHeader mt-8 mb-6 + 9 circles gap-6) ── */}
              <div className="mt-8 mb-6">
                <div className="flex items-center justify-between">
                  <div className="h-7 w-48 rounded-md animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                </div>
              </div>
              <div className="flex gap-6 overflow-x-hidden pb-2 pl-4 pr-4 -ml-4">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 shrink-0">
                    <div className="w-[100px] h-[100px] rounded-full border-2 border-stone-200 dark:border-stone-700 animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                    <div className="h-3.5 w-14 rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                  </div>
                ))}
              </div>

              {/* ── Posts We Think You'll Love (SectionHeader + grid-cols-7 grid-rows-2 gap-0.5 rounded-xl) ── */}
              <div className="mt-8 mb-6">
                <div className="flex items-center justify-between">
                  <div className="h-7 w-72 rounded-md animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                  <div className="flex items-center gap-1 ml-4">
                    <div className="h-4 w-14 rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-7 grid-rows-2 gap-0.5 rounded-xl overflow-hidden shadow-elevation-1">
                {Array.from({ length: 14 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-full overflow-hidden bg-stone-100 dark:bg-stone-800 animate-pulse"
                    style={{ aspectRatio: '5 / 6', boxShadow: 'inset 0 0 30px rgba(0,0,0,0.08), inset 0 0 6px rgba(0,0,0,0.04)' }}
                  />
                ))}
              </div>

              {/* ── Local Businesses (SectionHeader + ListingCard horizontal grid) ── */}
              <div className="mt-8 mb-6">
                <div className="flex items-center justify-between">
                  <div className="h-7 w-80 rounded-md animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                  <div className="flex items-center gap-1 ml-4">
                    <div className="h-4 w-14 rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-1">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="rounded-2xl p-3 -mx-3 flex flex-row gap-4">
                    {/* 120x120 rounded-xl image */}
                    <div className="relative overflow-hidden rounded-xl flex-shrink-0 w-[120px] h-[120px] animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                    {/* Text column matching ListingCard: category italic (11px) → title (15px 2 lines) → location (11px) → rating row (11px with star) */}
                    <div className="flex flex-col justify-center min-w-0 flex-1">
                      <div className="h-2.5 w-16 rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60" style={{ marginBottom: '3px' }} />
                      <div className="h-4 w-4/5 rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60" style={{ marginBottom: '2px' }} />
                      <div className="h-4 w-3/5 rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60" style={{ marginBottom: '6px' }} />
                      <div className="h-2.5 w-24 rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60" style={{ marginBottom: '8px' }} />
                      <div className="flex items-center gap-1">
                        <div className="h-2.5 w-2.5 rounded-full animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                        <div className="h-2.5 w-8 rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                        <div className="h-2.5 w-px bg-stone-200 dark:bg-stone-800 mx-1" />
                        <div className="h-2.5 w-16 rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Trending Professionals (same grid, same ListingCard shape for WorkerCards) ── */}
              <div className="mt-8 mb-6">
                <div className="flex items-center justify-between">
                  <div className="h-7 w-60 rounded-md animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                  <div className="flex items-center gap-1 ml-4">
                    <div className="h-4 w-14 rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-1">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="rounded-2xl p-3 -mx-3 flex flex-row gap-4">
                    <div className="relative overflow-hidden rounded-xl flex-shrink-0 w-[120px] h-[120px] animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                    <div className="flex flex-col justify-center min-w-0 flex-1">
                      <div className="h-2.5 w-16 rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60" style={{ marginBottom: '3px' }} />
                      <div className="h-4 w-4/5 rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60" style={{ marginBottom: '2px' }} />
                      <div className="h-4 w-3/5 rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60" style={{ marginBottom: '6px' }} />
                      <div className="h-2.5 w-24 rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60" style={{ marginBottom: '8px' }} />
                      <div className="flex items-center gap-1">
                        <div className="h-2.5 w-2.5 rounded-full animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                        <div className="h-2.5 w-8 rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Recommended Shops (same grid, ShopCard shape: 120x120 img + text + 4 product thumbs) ── */}
              <div className="mt-8 mb-6">
                <div className="flex items-center justify-between">
                  <div className="h-7 w-56 rounded-md animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                  <div className="flex items-center gap-1 ml-4">
                    <div className="h-4 w-14 rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-1 pb-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="group">
                    {/* Top row: 120x120 image + info side by side (matches ShopCard) */}
                    <div className="flex flex-row gap-3">
                      <div className="relative overflow-hidden rounded-xl flex-shrink-0 w-[120px] h-[120px] animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                      <div className="flex flex-col justify-center min-w-0">
                        {/* title text-[15px] font-semibold */}
                        <div className="h-4 w-32 rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60" style={{ marginBottom: '4px' }} />
                        {/* location text-[11px] */}
                        <div className="h-2.5 w-24 rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60" style={{ marginBottom: '6px' }} />
                        {/* rating row: star + number */}
                        <div className="flex items-center gap-1">
                          <div className="h-2.5 w-2.5 rounded-full animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                          <div className="h-2.5 w-8 rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                        </div>
                      </div>
                    </div>
                    {/* 4 product circles below — w-9 h-9 rounded-xl, gap-1.5, mt-2.5 */}
                    <div className="flex items-center gap-1.5 mt-2.5">
                      {Array.from({ length: 4 }).map((_, j) => (
                        <div key={j} className="w-9 h-9 rounded-xl flex-shrink-0 animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Editorial Banner — fades out when filtered */}
          {!isLoadingData && (
            <EditorialBanner
              id="wt-banner"
              banners={BANNERS}
              hidden={filterInfo.isFiltered}
            />
          )}

          {!isLoadingData && <>
          {/* Shop By Category */}
          <div id="wt-categories">
            <SectionHeader
              title="Shop By Category"
            />
            <div className="flex gap-6 overflow-x-auto pb-2 pl-4 pr-4 -ml-4 scrollbar-hide">
              {(() => {
                const imageMap: Record<string, string> = {
                  Wellness: '/assets/people/wellness.png',
                  Training: '/assets/people/fitness.png',
                  Barber: '/assets/people/barber.png',
                  Salon: '/assets/people/salon.png',
                  Nails: '/assets/people/nails.png',
                  Skincare: '/assets/people/skincare.png',
                  Lashes: '/assets/people/lashes.png',
                  Brows: '/assets/people/brows.png',
                  Ink: '/assets/people/ink.png',
                };
                return categories.map((cat) => {
                  const isSelected = currentCategories.includes(cat.label);
                  const imageSrc = imageMap[cat.label];
                  return (
                    <button
                      key={cat.label}
                      onClick={() => {
                        const params = new URLSearchParams(searchParams?.toString() || '');
                        if (isSelected) {
                          params.delete('category');
                        } else {
                          params.set('category', cat.label);
                        }
                        router.push(`/?${params.toString()}`);
                      }}
                      className="flex flex-col items-center gap-2 shrink-0 group"
                    >
                      <div
                        className={`w-[100px] h-[100px] rounded-full overflow-hidden flex items-center justify-center bg-black transition-all duration-500 ease-out border-2 shadow-elevation-2 ${
                          isSelected
                            ? 'border-stone-900 dark:border-white shadow-elevation-2'
                            : 'border-stone-200  dark:border-stone-700 group-hover:border-stone-400 dark:group-hover:border-stone-500'
                        }`}
                      >
                        {imageSrc && (
                          <Image
                            src={imageSrc}
                            alt={cat.label}
                            width={100}
                            height={100}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        )}
                      </div>
                      <span className={`text-sm transition-all duration-200 ${
                        isSelected
                          ? 'text-stone-900 dark:text-stone-100 dark:text-white font-medium'
                          : 'text-stone-500     group-hover:text-stone-700 dark:hover:text-stone-300 dark:text-stone-200 dark:group-hover:text-stone-300'
                      }`}>{cat.label}</span>
                    </button>
                  );
                });
              })()}
            </div>
          </div>

          {/* Content */}
          <div className="relative">
            <div>
            {hasContent ? (
              <>
                {/* View All Posts Mode */}
                {viewAllMode === 'posts' && (
                  <>
                    <SectionHeader
                      title="All Posts"
                      className="mb-6"
                      onViewAll={handleBackToMain}
                      viewAllLabel="← Back to Discover"
                    />
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-0.5 rounded-xl overflow-hidden shadow-elevation-1 transition-all duration-300">
                      {(initialPosts || []).map((post, idx) => (
                        <div
                          key={post.id}
                          style={{
                            opacity: 0,
                            animation: `fadeInUp 520ms ease-out both`,
                            animationDelay: `${Math.min(idx * 30, 300)}ms`,
                            willChange: 'transform, opacity',
                          }}
                        >
                          <PostCard post={post} currentUser={currentUser} categories={categories} />
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* View All Listings Mode */}
                {viewAllMode === 'listings' && (
                  <>
                    <SectionHeader
                      title="All Businesses"
                      className="mb-6"
                      onViewAll={handleBackToMain}
                      viewAllLabel="← Back to Discover"
                    />
                    <div className={`grid ${gridColsClass} gap-x-8 gap-y-1 transition-all duration-300`}>
                      {listings.map((listing, idx) => (
                        <div
                          key={listing.id}
                          style={{
                            opacity: 0,
                            animation: `fadeInUp 520ms ease-out both`,
                            animationDelay: `${Math.min(idx * 30, 300)}ms`,
                            willChange: 'transform, opacity',
                          }}
                        >
                          <ListingCard currentUser={currentUser} data={listing} />
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* View All Professionals Mode */}
                {viewAllMode === 'professionals' && (
                  <>
                    <SectionHeader
                      title="All Professionals"
                      className="mb-6"
                      onViewAll={handleBackToMain}
                      viewAllLabel="← Back to Discover"
                    />
                    <div className={`grid ${gridColsClass} gap-x-8 gap-y-1 transition-all duration-300`}>
                      {employees.map((employee, idx) => {
                        const listing = listingsForLookup.find(l => l.id === employee.listingId) || listingsForLookup[0];
                        const imageSrc = listing?.imageSrc || (Array.isArray(listing?.galleryImages) ? listing.galleryImages[0] : undefined) || placeholderDataUri(listing?.title || 'Listing');

                        return (
                          <div
                            key={employee.id}
                            style={{
                              opacity: 0,
                              animation: `fadeInUp 520ms ease-out both`,
                              animationDelay: `${Math.min(idx * 30, 300)}ms`,
                              willChange: 'transform, opacity',
                            }}
                          >
                            <WorkerCard
                              employee={employee}
                              listingTitle={listing?.title || ''}
                              data={{
                                title: listing?.title || '',
                                imageSrc,
                                category: listing?.category ?? 'General',
                              }}
                              listing={listing}
                              currentUser={currentUser ?? undefined}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* View All Shops Mode */}
                {viewAllMode === 'shops' && (
                  <>
                    <SectionHeader
                      title="All Shops"
                      className="mb-6"
                      onViewAll={handleBackToMain}
                      viewAllLabel="← Back to Discover"
                    />
                    <div className={`grid ${gridColsClass} gap-x-8 gap-y-1 transition-all duration-300`}>
                      {shops.map((shop, idx) => (
                        <div
                          key={shop.id}
                          style={{
                            opacity: 0,
                            animation: `fadeInUp 520ms ease-out both`,
                            animationDelay: `${Math.min(idx * 30, 300)}ms`,
                            willChange: 'transform, opacity',
                          }}
                        >
                          <ShopCard data={shop} currentUser={currentUser} />
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Normal View - Show sections with pagination */}
                {!viewAllMode && (
                  <>
                    {/* ===== Trending Posts Section ===== */}
                    {!filterInfo.isFiltered && (
                      currentPosts.length > 0 ? (
                        <div id="posts-rail">
                          <SectionHeader
                            title="Posts We Think You'll Love"
                            onPrev={() => scrollPosts('left')}
                            onNext={() => scrollPosts('right')}
                            onViewAll={handleViewAllPosts}
                          />
                          <div className="grid grid-cols-7 gap-0.5 rounded-xl overflow-hidden shadow-elevation-1 transition-all duration-300">
                            {currentPosts.slice(0, 14).map((post, idx) => {
                              const total = Math.min(currentPosts.length, 14);
                              const singleRow = total <= 7;
                              const roundBL = singleRow && idx === 0;
                              return (
                                <div
                                  key={`${post.id}-${postsIndex}`}
                                  style={{
                                    opacity: postsVisible ? 0 : 0,
                                    animation: postsVisible ? `fadeInUp 520ms ease-out both` : 'none',
                                    animationDelay: postsVisible ? `${140 + idx * 30}ms` : '0ms',
                                    willChange: 'transform, opacity',
                                    transition: !postsVisible ? `opacity ${FADE_OUT_DURATION}ms ease-out` : 'none',
                                  }}
                                  className={`${!postsVisible ? 'opacity-0' : ''} ${roundBL ? 'rounded-bl-xl overflow-hidden' : ''}`}
                                >
                                  <PostCard post={post} currentUser={currentUser} categories={categories} />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div id="posts-rail">
                          <SectionHeader title="Posts We Think You'll Love" />
                          <button
                            type="button"
                            onClick={() => currentUser ? router.push('/post/new') : loginModal.onOpen()}
                            className="w-full flex items-center justify-center py-16 px-6 rounded-2xl border-2 border-dashed border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 hover:border-stone-900 dark:hover:border-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                          >
                            <div className="text-center max-w-[340px]">
                              <h3 className="text-[20px] font-semibold text-stone-900 dark:text-stone-50 tracking-[-0.02em] leading-tight">
                                No posts yet
                              </h3>
                              <p className="mt-2 text-[13.5px] text-stone-500 dark:text-stone-400 leading-relaxed">
                                {currentUser ? 'Be the first to share a look, a moment, or a behind-the-scenes peek with the community.' : 'Sign in to share a look, a moment, or a behind-the-scenes peek with the community.'}
                              </p>
                            </div>
                          </button>
                        </div>
                      )
                    )}

                    {/* ===== Trending Listings Section ===== */}
                    {!filterInfo.isFiltered && (
                      <>
                        <div id="listings-rail">
                          <SectionHeader
                            title="Local Businesses Worth Checking Out"
                            onPrev={() => scrollListings('left')}
                            onNext={() => scrollListings('right')}
                            onViewAll={handleViewAllListings}
                          />
                          <div className={`grid ${gridColsClass} gap-x-8 gap-y-1 transition-all duration-300`}>
                            {currentListings.slice(0, 9).map((listing, idx) => (
                              <div
                                key={`${listing.id}-${listingsIndex}`}
                                style={{
                                  opacity: listingsVisible ? 0 : 0,
                                  animation: listingsVisible ? `fadeInUp 520ms ease-out both` : 'none',
                                  animationDelay: listingsVisible ? `${140 + idx * 30}ms` : '0ms',
                                  willChange: 'transform, opacity',
                                  transition: !listingsVisible ? `opacity ${FADE_OUT_DURATION}ms ease-out` : 'none',
                                }}
                                className={!listingsVisible ? 'opacity-0' : ''}
                              >
                                <ListingCard
                                  currentUser={currentUser}
                                  data={listing}
                                  isSample={SAMPLE_LISTING_TITLES.has(listing.title)}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* ===== Trending Professionals Section ===== */}
                    {!filterInfo.isFiltered && (
                      <>
                        <div id="employees-rail">
                          <SectionHeader
                            title="Trending Professionals"
                            onPrev={() => scrollEmployees('left')}
                            onNext={() => scrollEmployees('right')}
                            onViewAll={handleViewAllProfessionals}
                          />
                          <div className={`grid ${gridColsClass} gap-x-8 gap-y-1 transition-all duration-300`}>
                            {currentEmployees.slice(0, 11).map((employee, idx) => {
                              const listing = listingsForLookup.find(l => l.id === employee.listingId) || listingsForLookup[0];
                              const imageSrc = listing?.imageSrc || (Array.isArray(listing?.galleryImages) ? listing.galleryImages[0] : undefined) || placeholderDataUri(listing?.title || 'Listing');

                              return (
                                <div
                                  key={`${employee.id}-${employeesIndex}`}
                                  style={{
                                    opacity: employeesVisible ? 0 : 0,
                                    animation: employeesVisible ? `fadeInUp 520ms ease-out both` : 'none',
                                    animationDelay: employeesVisible ? `${160 + idx * 30}ms` : '0ms',
                                    willChange: 'transform, opacity',
                                    transition: !employeesVisible ? `opacity ${FADE_OUT_DURATION}ms ease-out` : 'none',
                                  }}
                                  className={!employeesVisible ? 'opacity-0' : ''}
                                >
                                  <WorkerCard
                                    employee={employee}
                                    listingTitle={listing?.title || ''}
                                    data={{
                                      title: listing?.title || '',
                                      imageSrc,
                                      category: listing?.category ?? 'General',
                                    }}
                                    listing={listing}
                                    currentUser={currentUser ?? undefined}
                                    isSample={SAMPLE_WORKER_NAMES.has(employee.fullName)}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}

                    {/* ===== Trending Shops Section ===== */}
                    {!filterInfo.isFiltered && currentShops.length > 0 && (
                      <>
                        <div id="shops-rail">
                          <SectionHeader
                            title="Recommended Shops"
                            onPrev={() => scrollShops('left')}
                            onNext={() => scrollShops('right')}
                            onViewAll={handleViewAllShops}
                          />
                          <div className={`grid ${gridColsClass} gap-x-8 gap-y-1 pb-8 transition-all duration-300`}>
                            {currentShops.map((shop, idx) => (
                              <div
                                key={`${shop.id}-${shopsIndex}`}
                                style={{
                                  opacity: shopsVisible ? 0 : 0,
                                  animation: shopsVisible ? `fadeInUp 520ms ease-out both` : 'none',
                                  animationDelay: shopsVisible ? `${160 + idx * 30}ms` : '0ms',
                                  willChange: 'transform, opacity',
                                  transition: !shopsVisible ? `opacity ${FADE_OUT_DURATION}ms ease-out` : 'none',
                                }}
                                className={!shopsVisible ? 'opacity-0' : ''}
                              >
                                <ShopCard data={shop} currentUser={currentUser} />
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* ===== Results Section Header (when filtered) ===== */}
                    {filterInfo.isFiltered && (
                      <div
                        className="mt-6 mb-4"
                        style={{
                          opacity: 0,
                          animation: 'fadeInUp 600ms ease-out 300ms both',
                        }}
                      >
                        <h2 className="text-[22px] font-semibold text-stone-900 dark:text-stone-100 dark:text-white leading-tight">
                          {allContentItems.length} {allContentItems.length === 1 ? 'Result' : 'Results'}
                          {filterInfo.resultsHeaderText ? ` — ${filterInfo.resultsHeaderText}` : ''}
                        </h2>
                      </div>
                    )}

                    {/* ===== Filtered Results Grid ===== */}
                    {filterInfo.isFiltered && (
                      <div className={`grid ${gridColsClass} gap-x-8 gap-y-1 transition-all duration-300`}>
                        {allContentItems.map((item, idx) => (
                          <div
                            key={`${item.type}-${item.data.id}`}
                            style={{
                              opacity: 0,
                              animation: `fadeInUp 520ms ease-out both`,
                              animationDelay: `${400 + Math.min(idx * 30, 300)}ms`,
                              willChange: 'transform, opacity',
                            }}
                          >
                            {item.type === 'post' && (
                              <PostCard post={item.data} currentUser={currentUser} categories={categories} />
                            )}
                            {item.type === 'listing' && (
                              <ListingCard currentUser={currentUser} data={item.data} />
                            )}
                            {item.type === 'employee' && (
                              <WorkerCard
                                employee={item.data}
                                listingTitle={item.listingContext?.title || 'Professional'}
                                data={{
                                  title: item.listingContext?.title || '',
                                  imageSrc: item.listingContext?.imageSrc || '',
                                  category: item.listingContext?.category || ''
                                }}
                                listing={item.listingContext}
                                currentUser={currentUser}
                              />
                            )}
                            {item.type === 'shop' && (
                              <ShopCard data={item.data} currentUser={currentUser} />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="px-6 pb-24">
                {filterInfo.isFiltered ? (
                  <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center max-w-[360px]">
                      <h3 className="text-[20px] font-semibold text-stone-900 dark:text-stone-50 tracking-[-0.02em] leading-tight">
                        No matches found
                      </h3>
                      <p className="mt-2 text-[13.5px] text-stone-500 dark:text-stone-400 leading-relaxed">
                        Try adjusting your filters or clearing them to see everything we have.
                      </p>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => currentUser ? router.push('/post/new') : loginModal.onOpen()}
                    className="w-full flex items-center justify-center min-h-[60vh] rounded-2xl border-2 border-dashed border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 hover:border-stone-900 dark:hover:border-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                  >
                    <div className="text-center max-w-[360px]">
                      <h3 className="text-[20px] font-semibold text-stone-900 dark:text-stone-50 tracking-[-0.02em] leading-tight">
                        Nothing here yet
                      </h3>
                      <p className="mt-2 text-[13.5px] text-stone-500 dark:text-stone-400 leading-relaxed">
                        {currentUser ? 'Be the first to share a look, a moment, or a behind-the-scenes peek with the community.' : 'Sign in to share a look, a moment, or a behind-the-scenes peek with the community.'}
                      </p>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        </>}
        </Container>
      </div>

      {/* TikTok View Modal Overlay */}
      {viewMode === 'tiktok' && (
        <TikTokView
          items={allContentItems}
          currentUser={currentUser}
          onClose={() => setViewMode('grid')}
        />
      )}
    </ClientProviders>
  );
};

export default DiscoverClient;