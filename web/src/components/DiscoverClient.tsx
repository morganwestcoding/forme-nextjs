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
import { Search01Icon, PlusSignIcon, Notification03Icon, MessageMultiple01Icon, TreatmentIcon, Yoga01Icon, WorkoutRunIcon, BlushBrush01Icon, HotTubeIcon, ChairBarberIcon, PerfumeIcon, HairDryerIcon } from 'hugeicons-react';
import Image from 'next/image';
import useLoginModal from '@/app/hooks/useLoginModal';
import useInboxModal from '@/app/hooks/useInboxModal';
import useNotificationsModal from '@/app/hooks/useNotificationsModal';

interface DiscoverClientProps {
  initialPosts: SafePost[];
  currentUser: SafeUser | null;
  categoryToUse?: string;
  listings: SafeListing[];
  employees?: SafeEmployee[];
  shops?: SafeShop[];
}

const FADE_OUT_DURATION = 200;

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
  employees = [],
  shops = [],
}) => {
  const { viewMode, setViewMode } = useViewMode();
  const isSidebarCollapsed = useSidebarState();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const loginModal = useLoginModal();
  const inboxModal = useInboxModal();
  const notificationsModal = useNotificationsModal();

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

  // Filter and randomize data based on selected categories
  const shuffledPosts = useMemo(() => {
    let filtered = initialPosts;
    if (currentCategories.length > 0) {
      filtered = initialPosts.filter(p => currentCategories.includes((p as any).category));
    }
    return shuffleArray(filtered, shuffleSeed);
  }, [initialPosts, shuffleSeed, currentCategories]);

  const shuffledListings = useMemo(() => {
    let filtered = listings.filter(l => l.category !== 'Personal');
    if (currentCategories.length > 0) {
      filtered = filtered.filter(l => currentCategories.includes(l.category));
    }
    return shuffleArray(filtered, shuffleSeed + 1);
  }, [listings, shuffleSeed, currentCategories]);

  const shuffledEmployees = useMemo(() => {
    let filtered = employees;
    if (currentCategories.length > 0) {
      // Filter employees by their associated listing's category
      filtered = employees.filter(emp => {
        const empListing = listings.find(l => l.employees?.some(e => e.id === emp.id));
        return empListing && currentCategories.includes(empListing.category);
      });
    }
    return shuffleArray(filtered, shuffleSeed + 2);
  }, [employees, listings, shuffleSeed, currentCategories]);

  const shuffledShops = useMemo(() => {
    let filtered = shops;
    if (currentCategories.length > 0) {
      filtered = shops.filter(s => currentCategories.includes((s as any).category));
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
          const listing = listings.find(l => l.id === employee.listingId) || listings[0];
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
          const listing = listings.find(l => l.id === employee.listingId) || listings[0];
          return { type: 'employee' as const, data: employee, listingContext: listing };
        }),
        ...shopsToUse.map(shop => ({ type: 'shop' as const, data: shop })),
      ];
    }

    return items;
  }, [shuffledPosts, shuffledListings, shuffledEmployees, shuffledShops, listings, filterInfo.typeFilter]);

  return (
    <ClientProviders>
      <div className="min-h-screen">
        <Container>
          {/* Hero Section - Clean minimal design (matching Market) */}
          <div className="-mx-6 md:-mx-24 -mt-2 md:-mt-8 overflow-visible">
            <div className="relative px-6 md:px-24 pt-12 pb-0 overflow-visible">

              {/* Content */}
              <div className="relative z-10 pb-0">
                {/* Search and Controls */}
                <div className="flex items-center gap-3 w-full">
                  <Link href="/" className="mr-4">
                    <Image src="/logos/fm-logo.png" alt="Logo" width={72} height={46} className="opacity-90 hover:opacity-100 transition-opacity duration-200 shrink-0" />
                  </Link>
                  <div className="flex-1 max-w-xl">
                    <PageSearch
                      actionContext="discover"
                      showAttach={false}
                      showCreate={false}
                      showFilters={false}
                      showDefaultActions={false}
                      leftIcon={
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6 shrink-0 ml-1.5">
                          <path d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z" fill="currentColor" className="text-stone-500 dark:text-zinc-400" />
                          <path d="M14.8284 14.8284L17 17M16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16C14.2091 16 16 14.2091 16 12Z" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      }
                      actionButtons={
                        <button
                          type="button"
                          className="flex items-center gap-2 px-6 py-1.5 rounded-lg text-stone-500 dark:text-zinc-400 hover:text-stone-700 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors text-[13px] whitespace-nowrap"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" stroke="none">
                            <path d="M12 2C7.58 2 4 5.58 4 10c0 5.25 7 12 8 12s8-6.75 8-12c0-4.42-3.58-8-8-8Zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
                          </svg>
                          New York, NY
                        </button>
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      onClick={() => router.push('/post/new')}
                      className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-stone-400 dark:text-zinc-500 hover:text-stone-600 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <PlusSignIcon className="w-5 h-5 sm:w-[22px] sm:h-[22px]" strokeWidth={1.5} />
                    </button>
                    <button
                      className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-stone-400 dark:text-zinc-500 hover:text-stone-600 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 sm:w-[22px] sm:h-[22px]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.5 8.75L15.0447 19.5532C15.015 19.684 15 19.8177 15 19.9518C15 20.9449 15.8051 21.75 16.7982 21.75H18" />
                        <path d="M19.2192 21.75H4.78078C3.79728 21.75 3 20.9527 3 19.9692C3 19.8236 3.01786 19.6786 3.05317 19.5373L5.24254 10.7799C5.60631 9.32474 5.78821 8.59718 6.33073 8.17359C6.87325 7.75 7.6232 7.75 9.12311 7.75H14.8769C16.3768 7.75 17.1267 7.75 17.6693 8.17359C18.2118 8.59718 18.3937 9.32474 18.7575 10.7799L20.9468 19.5373C20.9821 19.6786 21 19.8236 21 19.9692C21 20.9527 20.2027 21.75 19.2192 21.75Z" />
                        <path d="M15 7.75V5.75C15 4.09315 13.6569 2.75 12 2.75C10.3431 2.75 9 4.09315 9 5.75V7.75" />
                        <path d="M10 10.75H12.5" />
                      </svg>
                    </button>
                    <button
                      onClick={() => notificationsModal.onOpen()}
                      className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-stone-400 dark:text-zinc-500 hover:text-stone-600 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Notification03Icon className="w-5 h-5 sm:w-[22px] sm:h-[22px]" strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => inboxModal.onOpen(currentUser)}
                      className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-stone-400 dark:text-zinc-500 hover:text-stone-600 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <MessageMultiple01Icon className="w-5 h-5 sm:w-[22px] sm:h-[22px]" strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => {
                        if (currentUser?.id) {
                          router.push(`/profile/${currentUser.id}`);
                        } else {
                          loginModal.onOpen();
                        }
                      }}
                      className="shrink-0 w-10 h-10 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
                    >
                    <Image
                      src={currentUser?.image || "/people/rooster.webp"}
                      alt="Profile"
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                    </button>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="flex items-center gap-3 mt-4" style={{ paddingLeft: 'calc(72px + 1rem + 1.25rem)' }}>
                  {navItems.map((item, i) => (
                    <React.Fragment key={item.label}>
                      {i > 0 && <span className="text-gray-300 dark:text-gray-600 text-[13px]">/</span>}
                      <Link
                        href={item.href}
                        className={`text-[14px] transition-colors duration-200 ${
                          item.active
                            ? 'text-gray-900 dark:text-white font-medium'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                      >
                        {item.label}
                      </Link>
                    </React.Fragment>
                  ))}
                </nav>


              </div>
            </div>
          </div>

          {/* Shop By Category */}
          <div className="mt-8 mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">Shop By Category</h2>
            <div className="flex gap-6 overflow-x-auto pb-2 pt-2 pl-4 pr-4 -ml-4 scrollbar-hide">
              {(() => {
                const iconMap: Record<string, React.ElementType> = {
                  Massage: TreatmentIcon,
                  Wellness: Yoga01Icon,
                  Fitness: WorkoutRunIcon,
                  Nails: BlushBrush01Icon,
                  Spa: HotTubeIcon,
                  Barber: ChairBarberIcon,
                  Beauty: PerfumeIcon,
                  Salon: HairDryerIcon,
                };
                const imageMap: Record<string, string> = {
                  Massage: '/assets/massage.jpg',
                  Wellness: '/assets/wellness.jpg',
                  Fitness: '/assets/fitness.jpg',
                  Nails: '/assets/nails.png',
                  Spa: '/assets/spa.png',
                  Barber: '/assets/Barber.png',
                  Beauty: '/assets/Beauty.png',
                  Salon: '/assets/Salon.png',
                };
                return categories.map((cat, catIdx) => {
                  const isSelected = currentCategories.includes(cat.label);
                  const imageSrc = imageMap[cat.label] || '/categories/default.svg';
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
                        className={`w-[78px] h-[78px] rounded-full overflow-hidden relative transition-all duration-300 ease-out border shadow-sm ${
                          isSelected
                            ? 'border-stone-300 dark:border-zinc-500 scale-105 ring-2 ring-stone-300 dark:ring-zinc-500'
                            : 'border-stone-200/80 dark:border-zinc-700/50 group-hover:border-stone-300 dark:group-hover:border-zinc-600'
                        }`}
                      >
                        <Image
                          src={imageSrc}
                          alt={cat.label}
                          fill
                          className="object-cover blur-[2px] scale-110 grayscale group-hover:grayscale-0 transition-all duration-300"
                          sizes="78px"
                        />
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all duration-300" />
                        <div className="absolute inset-0 flex items-center justify-center text-white z-10">
                          {(() => { const Icon = iconMap[cat.label]; return Icon ? <Icon size={24} strokeWidth={1.5} /> : null; })()}
                        </div>
                      </div>
                      <span className={`text-sm font-normal transition-colors duration-300 ${
                        isSelected
                          ? 'text-stone-700 dark:text-zinc-200'
                          : 'text-stone-400 dark:text-zinc-500 group-hover:text-stone-600 dark:group-hover:text-zinc-300'
                      }`}>{cat.label}</span>
                    </button>
                  );
                });
              })()}
              <button
                onClick={() => {/* TODO: show more categories */}}
                className="flex flex-col items-center gap-2 shrink-0 group"
              >
                <div className="w-[78px] h-[78px] rounded-full flex items-center justify-center transition-all duration-300 ease-out border border-stone-200/80 dark:border-zinc-700/50 bg-stone-50 dark:bg-zinc-800/50 group-hover:border-stone-300 dark:group-hover:border-zinc-600 group-hover:bg-stone-100 dark:group-hover:bg-zinc-800 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-5 h-5 text-stone-400 dark:text-zinc-500 group-hover:text-stone-500 dark:group-hover:text-zinc-400 transition-colors duration-300">
                    <circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" />
                    <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
                    <circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" />
                  </svg>
                </div>
                <span className="text-sm font-normal text-stone-400 dark:text-zinc-500 group-hover:text-stone-600 dark:group-hover:text-zinc-300 transition-colors duration-300">More</span>
              </button>
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
                    <div className={`grid ${gridColsClass} gap-4 transition-all duration-300`}>
                      {listings.filter(l => l.category !== 'Personal').map((listing, idx) => (
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
                    <div className={`grid ${gridColsClass} gap-4 transition-all duration-300`}>
                      {employees.map((employee, idx) => {
                        const listing = listings.find(l => l.id === employee.listingId) || listings[0];
                        const li: any = listing as any;
                        const imageSrc = li?.imageSrc || (Array.isArray(li?.galleryImages) ? li.galleryImages[0] : undefined) || '/placeholder.jpg';

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
                                category: (listing as any)?.category ?? 'General',
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
                    <div className={`grid ${gridColsClass} gap-4 transition-all duration-300`}>
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
                          <div className={`grid ${gridColsClass} gap-4 transition-all duration-300`}>
                            {currentListings.map((listing, idx) => (
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
                          <div className={`grid ${gridColsClass} gap-4 transition-all duration-300`}>
                            {currentEmployees.map((employee, idx) => {
                              const listing = listings.find(l => l.id === employee.listingId) || listings[0];
                              const li: any = listing as any;
                              const imageSrc = li?.imageSrc || (Array.isArray(li?.galleryImages) ? li.galleryImages[0] : undefined) || '/placeholder.jpg';

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
                                      category: (listing as any)?.category ?? 'General',
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
                          <div className={`grid ${gridColsClass} gap-4 pb-8 transition-all duration-300`}>
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
                    {filterInfo.isFiltered && filterInfo.resultsHeaderText && (
                      <SectionHeader
                        title={filterInfo.resultsHeaderText}
                        onViewAll={handleBackToMain}
                        viewAllLabel="← Back to Discover"
                      />
                    )}

                    {/* ===== Filtered Results Grid ===== */}
                    {filterInfo.isFiltered && (
                      <div className={`grid ${gridColsClass} gap-4 transition-all duration-300`}>
                        {allContentItems.map((item, idx) => (
                          <div
                            key={`${item.type}-${item.data.id}`}
                            style={{
                              opacity: 0,
                              animation: `fadeInUp 520ms ease-out both`,
                              animationDelay: `${Math.min(idx * 30, 300)}ms`,
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