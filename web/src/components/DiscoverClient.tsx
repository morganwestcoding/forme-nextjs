'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ClientProviders from '@/components/ClientProviders';
import { categories } from '@/components/Categories';
import { SafePost, SafeUser, SafeListing, SafeEmployee, SafeShop } from '@/app/types';
import { useViewMode } from '@/app/hooks/useViewMode';
import { useSidebarState } from '@/app/hooks/useSidebarState';
import Container from './Container';
import PageSearch from '@/components/search/PageSearch';
import CategoryNav from '@/app/market/CategoryNav';
import PostCard from './feed/PostCard';
import TikTokView from './feed/TikTokView';
import ListingCard from '@/components/listings/ListingCard';
import WorkerCard from '@/components/listings/WorkerCard';
import ShopCard from '@/components/shop/ShopCard';
import SectionHeader from '@/app/market/SectionHeader';

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

  // Support both legacy single category and new multi-select categories
  const currentCategories = searchParams?.get('categories')?.split(',').filter(Boolean) ||
    (searchParams?.get('category') ? [searchParams.get('category')!] : []);

  // Dynamic items per page: 12 when sidebar collapsed, 10 when expanded
  const ITEMS_PER_PAGE = isSidebarCollapsed ? 12 : 10;

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
          <div className="-mx-6 md:-mx-24 -mt-2 md:-mt-8">
            <div className="relative px-6 md:px-24 pt-12 pb-8">

              {/* Content */}
              <div className="relative z-10 pb-6">
                {/* Main Discover Title */}
                <div className="text-center">
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
                    Discover
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 text-base mt-3 max-w-2xl mx-auto">Share what&apos;s new with you and your business</p>
                </div>

                {/* Search and Controls */}
                <div className="mt-8 max-w-3xl mx-auto">
                  <PageSearch actionContext="discover" />
                </div>

                {/* Category Navigation - Sticky */}
                <div className="mt-3 -mx-6 md:-mx-24">
                  <div className="sticky top-0 z-20 transition-all duration-300" id="discover-category-nav-wrapper">
                    <div className="px-6 md:px-24">
                      <CategoryNav searchParams={headerSearchParams} basePath="/" />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Content */}
          <div className="relative -mt-[69px]">
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
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-5 transition-all duration-300">
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
                    <div className={`grid ${gridColsClass} gap-5 transition-all duration-300`}>
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
                    <div className={`grid ${gridColsClass} gap-5 transition-all duration-300`}>
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
                    <div className={`grid ${gridColsClass} gap-5 transition-all duration-300`}>
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
                          <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-5 transition-all duration-300">
                            {currentPosts.map((post, idx) => (
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
                          <div className={`grid ${gridColsClass} gap-5 transition-all duration-300`}>
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
                          <div className={`grid ${gridColsClass} gap-5 transition-all duration-300`}>
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
                          <div className={`grid ${gridColsClass} gap-5 pb-8 transition-all duration-300`}>
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
                      <div className={`grid ${gridColsClass} gap-5 transition-all duration-300`}>
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