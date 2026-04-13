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
import PageHeader from '@/components/PageHeader';

interface DiscoverClientProps {
  initialPosts: SafePost[];
  currentUser: SafeUser | null;
  categoryToUse?: string;
  listings: SafeListing[];
  // Superset of `listings` used purely for employee→listing lookups in the
  // worker rails. Includes academy-owned listings (which are hidden from the
  // bookable listings rail) so that student WorkerCards can resolve their
  // true listing for routing/booking links.
  allListingsForLookup?: SafeListing[];
  employees?: SafeEmployee[];
  shops?: SafeShop[];
}

const FADE_OUT_DURATION = 200;

const BANNERS = [
  {
    src: '/assets/people/banner-5.png',
    alt: 'Near You',
    tag: 'Local',
    title: 'Near You',
    subtitle: 'Top-rated in your area',
    href: '/maps',
  },
  {
    src: '/assets/people/banner-6.png',
    alt: 'New on ForMe',
    tag: 'Curated',
    title: 'New on ForMe',
    subtitle: 'Fresh brands joining our community',
    href: '/shops',
  },
  {
    src: '/assets/people/banner-7.png',
    alt: 'Most Popular',
    tag: 'Trending',
    title: 'Most Popular',
    subtitle: 'What everyone is booking',
    href: '/shops?category=Wellness',
  },
];

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
  initialPosts,
  currentUser,
  categoryToUse,
  listings,
  allListingsForLookup,
  employees = [],
  shops = [],
}) => {
  // Used by the worker rails to resolve `employee.listingId → listing`.
  // Falls back to `listings` if the lookup superset isn't provided so older
  // callers keep working.
  const listingsForLookup = allListingsForLookup ?? listings;

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
    if (currentCategories.length > 0) {
      filtered = filtered.filter(emp => {
        const empListing = listings.find(l => l.employees?.some(e => e.id === emp.id));
        return empListing && currentCategories.includes(empListing.category);
      });
    }
    if (selectedLocation) {
      filtered = filtered.filter(emp => {
        const empListing = listings.find(l => l.employees?.some(e => e.id === emp.id));
        return empListing && matchesLocation(empListing.location);
      });
    }
    return shuffleArray(filtered, shuffleSeed + 2);
  }, [employees, listings, shuffleSeed, currentCategories, selectedLocation]);

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

  // Banner state — auto-rotate every 12 seconds
  const [activeBanner, setActiveBanner] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % BANNERS.length);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

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
    ? 'grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    : 'grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4';

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

  // Check all content types
  const hasContent = useMemo(() => {
    const hasPosts = (initialPosts?.length || 0) > 0;
    const hasListings = listings.length > 0;
    const hasEmployees = employees.length > 0;
    const hasShops = shops.length > 0;
    return hasPosts || hasListings || hasEmployees || hasShops;
  }, [initialPosts, listings, employees, shops]);

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
          <PageHeader currentUser={currentUser} currentCategories={currentCategories} />

          {/* Editorial Banner — fades out when filtered */}
          <div
            style={{
              opacity: filterInfo.isFiltered ? 0 : 1,
              maxHeight: filterInfo.isFiltered ? 0 : '600px',
              marginTop: filterInfo.isFiltered ? 0 : '2rem',
              overflow: 'hidden',
              pointerEvents: filterInfo.isFiltered ? 'none' : 'auto',
              transition: 'all 900ms ease-in-out',
            }}
          >
            <div
              className="relative group overflow-hidden rounded-2xl"
            >
              <div className="aspect-[4/1] bg-stone-900 relative">
                {BANNERS.map((banner, i) => (
                  <div
                    key={i}
                    className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
                    style={{ opacity: i === activeBanner ? 1 : 0 }}
                  >
                    <Image
                      src={banner.src}
                      alt={banner.alt}
                      fill
                      className="object-contain"
                      priority={i === 0}
                    />
                  </div>
                ))}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent" />
                {/* Forme wordmark icon — top right */}
                <div className="absolute top-4 right-4 text-white/75">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30" color="currentColor" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5.50586 16.9916L8.03146 10.0288C8.49073 9.06222 9.19305 8.26286 9.99777 10.18C10.7406 11.9497 11.8489 15.1903 12.5031 16.9954M6.65339 14.002H11.3215" />
                    <path d="M3.46447 5.31802C2 6.63604 2 8.75736 2 13C2 17.2426 2 19.364 3.46447 20.682C4.92893 22 7.28596 22 12 22C16.714 22 19.0711 22 20.5355 20.682C22 19.364 22 17.2426 22 13C22 8.75736 22 6.63604 20.5355 5.31802C19.0711 4 16.714 4 12 4C7.28596 4 4.92893 4 3.46447 5.31802Z" />
                    <path d="M18.4843 9.98682V12.9815M18.4843 12.9815V16.9252M18.4843 12.9815H16.466C16.2263 12.9815 15.9885 13.0261 15.7645 13.113C14.0707 13.7702 14.0707 16.2124 15.7645 16.8696C15.9885 16.9565 16.2263 17.0011 16.466 17.0011H18.4843" />
                  </svg>
                </div>
                <div className="absolute bottom-0 left-0 p-5">
                  <p className="text-xs tracking-wide text-white/80 mb-0.5 transition-opacity duration-700" style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontStyle: 'italic' }}>{BANNERS[activeBanner].tag}</p>
                  <h3 className="text-xl font-bold text-white leading-snug transition-opacity duration-700">{BANNERS[activeBanner].title}</h3>
                  <p className="text-sm text-white/70 mt-0.5 transition-opacity duration-700">{BANNERS[activeBanner].subtitle}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-1.5 mt-3 justify-center items-center">
              {BANNERS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveBanner(i)}
                  className={`rounded-full transition-all duration-300 ${
                    activeBanner === i
                      ? 'w-4 h-1.5 bg-stone-900 dark:bg-white'
                      : 'w-1.5 h-1.5 bg-stone-300 dark:bg-zinc-600 hover:bg-stone-400 dark:hover:bg-zinc-500'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Shop By Category */}
          <div>
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
                        className={`w-[100px] h-[100px] rounded-full overflow-hidden flex items-center justify-center bg-black transition-all duration-500 ease-out border-2 ${
                          isSelected
                            ? 'border-zinc-900 dark:border-white shadow-lg'
                            : 'border-stone-200 dark:border-zinc-700 group-hover:border-stone-400 dark:group-hover:border-zinc-500 group-hover:shadow-md'
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
                          ? 'text-gray-900 dark:text-white font-medium'
                          : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-0.5 rounded-xl overflow-hidden transition-all duration-300">
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
                    {!filterInfo.isFiltered && currentPosts.length > 0 && (
                      <>
                        <SectionHeader
                          title="Posts We Think You'll Love"
                          onPrev={() => scrollPosts('left')}
                          onNext={() => scrollPosts('right')}
                          onViewAll={handleViewAllPosts}
                        />
                        <div id="posts-rail">
                          <div className="grid grid-cols-7 grid-rows-2 gap-0.5 rounded-xl overflow-hidden transition-all duration-300">
                            {currentPosts.slice(0, 14).map((post, idx) => (
                              <div
                                key={`${post.id}-${postsIndex}`}
                                style={{
                                  opacity: postsVisible ? 0 : 0,
                                  animation: postsVisible ? `fadeInUp 520ms ease-out both` : 'none',
                                  animationDelay: postsVisible ? `${140 + idx * 30}ms` : '0ms',
                                  willChange: 'transform, opacity',
                                  transition: !postsVisible ? `opacity ${FADE_OUT_DURATION}ms ease-out` : 'none',
                                }}
                                className={!postsVisible ? 'opacity-0' : ''}
                              >
                                <PostCard post={post} currentUser={currentUser} categories={categories} />
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* ===== Trending Listings Section ===== */}
                    {!filterInfo.isFiltered && currentListings.length > 0 && (
                      <>
                        <SectionHeader
                          title="Local Businesses Worth Checking Out"
                          onPrev={() => scrollListings('left')}
                          onNext={() => scrollListings('right')}
                          onViewAll={handleViewAllListings}
                        />
                        <div id="listings-rail">
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
                                <ListingCard currentUser={currentUser} data={listing} />
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* ===== Trending Professionals Section ===== */}
                    {!filterInfo.isFiltered && currentEmployees.length > 0 && (
                      <>
                        <SectionHeader
                          title="Trending Professionals"
                          onPrev={() => scrollEmployees('left')}
                          onNext={() => scrollEmployees('right')}
                          onViewAll={handleViewAllProfessionals}
                        />
                        <div id="employees-rail">
                          <div className={`grid ${gridColsClass} gap-x-8 gap-y-1 transition-all duration-300`}>
                            {currentEmployees.slice(0, 9).map((employee, idx) => {
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
                        <SectionHeader
                          title="Recommended Shops"
                          onPrev={() => scrollShops('left')}
                          onNext={() => scrollShops('right')}
                          onViewAll={handleViewAllShops}
                        />
                        <div id="shops-rail">
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
                        <h2 className="text-[22px] font-semibold text-gray-900 dark:text-white leading-tight">
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
              <div className="px-8 pt-32 text-center text-gray-500">
                No posts found. Try adjusting your filters.
              </div>
            )}
          </div>
        </div>
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