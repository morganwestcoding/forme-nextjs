'use client';

import React, { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import ClientProviders from '@/components/ClientProviders';
import { categories } from '@/components/Categories';
import { SafePost, SafeUser, SafeListing, SafeEmployee, SafeShop } from '@/app/types';
import { usePostStore } from '@/app/hooks/usePostStore';
import { useCategory } from '@/CategoryContext';
import { useFilter } from '@/FilterContext';
import { useViewMode } from '@/app/hooks/useViewMode';
import useCreatePostModal from '@/app/hooks/useCreatePostModal';
import Container from './Container';
import MarketSearch from '@/app/market/MarketSearch';
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
const ITEMS_PER_PAGE = 8;

const DiscoverClient: React.FC<DiscoverClientProps> = ({
  initialPosts,
  currentUser,
  categoryToUse,
  listings,
  employees = [],
  shops = [],
}) => {
  const setPosts = usePostStore((state) => state.setPosts);
  const storePosts = usePostStore((state) => state.posts);
  const { selectedCategory } = useCategory();
  const { filters } = useFilter();
  const { viewMode, setViewMode } = useViewMode();
  const createPostModal = useCreatePostModal();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isPending, startTransition] = useTransition();

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

  // Content fade state for filter changes
  const [isContentReady, setIsContentReady] = useState(true);


  // View all mode
  const [viewAllMode, setViewAllMode] = useState<'posts' | 'listings' | 'professionals' | 'shops' | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const filterParam = searchParams?.get('filter') || 'for-you';

  const handleNavigation = (url: string) => {
    router.push(url, { scroll: false });
  };

  // Sidebar collapse detection
  useEffect(() => {
    const checkSidebarState = () => {
      const collapsed = localStorage.getItem('sidebarCollapsed') === 'true';
      setIsSidebarCollapsed(collapsed);
    };

    checkSidebarState();
    window.addEventListener('sidebarToggle', checkSidebarState);
    return () => window.removeEventListener('sidebarToggle', checkSidebarState);
  }, []);

  // Reset pagination on sidebar change
  useEffect(() => {
    setPostsIndex(0);
    setListingsIndex(0);
    setEmployeesIndex(0);
    setShopsIndex(0);
  }, [isSidebarCollapsed]);

  // Sticky nav border effect on scroll
  useEffect(() => {
    const handleScroll = () => {
      const navWrapper = document.getElementById('discover-category-nav-wrapper');
      if (navWrapper) {
        if (window.scrollY > 100) {
          navWrapper.style.borderBottomColor = 'rgb(229 231 235 / 0.5)';
        } else {
          navWrapper.style.borderBottomColor = 'transparent';
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
    : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';

  const filterInfo = useMemo(() => {
    const currentCategory = headerSearchParams?.category || '';
    const categoryIsActive = currentCategory !== '' && currentCategory !== 'featured' && currentCategory !== 'all';
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
    } else if (categoryIsActive && currentCategory) {
      const categoryName = currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1);
      resultsHeaderText = `${categoryName} Feed`;
    } else if (hasPriceFilter || hasLocationFilter) {
      resultsHeaderText = 'Feed Results';
    }

    return { isFiltered, categoryIsActive, resultsHeaderText, currentCategory, typeFilter: hasTypeFilter ? typeFilter : null };
  }, [headerSearchParams, typeFilter]);


  useEffect(() => {
    const fetchPosts = async () => {
      setIsContentReady(false);

      try {
        const params: Record<string, string | number> = {};
        const categoryParam = searchParams?.get('category');

        if (categoryParam) {
          params.category = categoryParam;
        } else if (selectedCategory && selectedCategory !== 'Default') {
          params.category = selectedCategory;
        }

        if (filterParam) params.filter = filterParam;
        if (filters.location?.state) params.state = filters.location.state;
        if (filters.location?.city) params.city = filters.location.city;
        if (filters.sort?.order) params.order = filters.sort.order;

        const { data } = await axios.get('/api/post', { params });
        startTransition(() => {
          setPosts(data);
          // Small delay to let React batch the state update before showing content
          setTimeout(() => setIsContentReady(true), 50);
        });
      } catch (error) {
        console.error('Error fetching posts:', error);
        setIsContentReady(true);
      }
    };

    fetchPosts();
  }, [selectedCategory, filterParam, filters, setPosts, searchParams]);

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

  // Paginated items
  const currentPosts = useMemo(() => {
    if ((storePosts?.length || 0) <= ITEMS_PER_PAGE) return storePosts || [];
    const start = postsIndex * ITEMS_PER_PAGE;
    return (storePosts || []).slice(start, start + ITEMS_PER_PAGE);
  }, [storePosts, postsIndex]);

  const currentListings = useMemo(() => {
    const visibleListings = listings.filter(l => l.category !== 'Personal');
    if (visibleListings.length <= ITEMS_PER_PAGE) return visibleListings;
    const start = listingsIndex * ITEMS_PER_PAGE;
    return visibleListings.slice(start, start + ITEMS_PER_PAGE);
  }, [listings, listingsIndex]);

  const currentEmployees = useMemo(() => {
    if (employees.length <= ITEMS_PER_PAGE) return employees;
    const start = employeesIndex * ITEMS_PER_PAGE;
    return employees.slice(start, start + ITEMS_PER_PAGE);
  }, [employees, employeesIndex]);

  const currentShops = useMemo(() => {
    if (shops.length <= ITEMS_PER_PAGE) return shops;
    const start = shopsIndex * ITEMS_PER_PAGE;
    return shops.slice(start, start + ITEMS_PER_PAGE);
  }, [shops, shopsIndex]);

  // Total pages
  const totalPostsPages = Math.max(1, Math.ceil((storePosts?.length || 0) / ITEMS_PER_PAGE));
  const totalListingsPages = Math.max(1, Math.ceil(listings.filter(l => l.category !== 'Personal').length / ITEMS_PER_PAGE));
  const totalEmployeesPages = Math.max(1, Math.ceil(employees.length / ITEMS_PER_PAGE));
  const totalShopsPages = Math.max(1, Math.ceil(shops.length / ITEMS_PER_PAGE));

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

  const hasContent = useMemo(() => Array.isArray(storePosts) && storePosts.length > 0, [storePosts]);

  const allContentItems = useMemo(() => {
    let items: Array<{type: 'post' | 'listing' | 'employee' | 'shop', data: any, listingContext?: any}> = [];

    if (filterInfo.typeFilter) {
      if (filterInfo.typeFilter === 'posts') {
        items = (storePosts || []).map(post => ({ type: 'post' as const, data: post }));
      } else if (filterInfo.typeFilter === 'listings') {
        items = (listings || []).map(listing => ({ type: 'listing' as const, data: listing }));
      } else if (filterInfo.typeFilter === 'professionals') {
        items = (employees || []).map(employee => {
          const listing = listings.find(l => l.id === employee.listingId) || listings[0];
          return { type: 'employee' as const, data: employee, listingContext: listing };
        });
      } else if (filterInfo.typeFilter === 'shops') {
        items = (shops || []).map(shop => ({ type: 'shop' as const, data: shop }));
      }
    } else {
      items = [
        ...(storePosts || []).map(post => ({ type: 'post' as const, data: post })),
        ...(listings || []).map(listing => ({ type: 'listing' as const, data: listing })),
        ...(employees || []).map(employee => {
          const listing = listings.find(l => l.id === employee.listingId) || listings[0];
          return { type: 'employee' as const, data: employee, listingContext: listing };
        }),
        ...(shops || []).map(shop => ({ type: 'shop' as const, data: shop })),
      ];
    }

    return items;
  }, [storePosts, listings, employees, shops, filterInfo.typeFilter]);

  return (
    <ClientProviders>
      <div className="min-h-screen">
        <Container>
          {/* Hero Section - Clean minimal design (matching Market) */}
          <div className="-mx-4 sm:-mx-6 lg:-mx-8 xl:-mx-12 -mt-4 sm:-mt-6 lg:-mt-8">
            <div className="relative px-4 sm:px-6 lg:px-8 xl:px-12 pt-8 sm:pt-10 lg:pt-12 pb-6 sm:pb-8 bg-white">

              {/* Content */}
              <div className="relative z-10 pb-6">
                {/* Main Discover Title */}
                <div className="text-center">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
                    Discover
                  </h1>
                  <p className="text-gray-500 text-sm sm:text-base mt-2 sm:mt-3 max-w-2xl mx-auto px-4">Share what&apos;s new with you and your business</p>
                </div>

                {/* Search and Controls */}
                <div className="mt-6 sm:mt-8 max-w-3xl mx-auto px-2 sm:px-0">
                  <MarketSearch
                    isHeroMode={false}
                    basePath="/"
                    onCreateClick={() => createPostModal.onOpen()}
                  />
                </div>

                {/* Category Navigation - Sticky */}
                <div className="mt-4 sm:mt-5 -mx-4 sm:-mx-6 lg:-mx-8 xl:-mx-12">
                  <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-transparent transition-all duration-300" id="discover-category-nav-wrapper">
                    <div className="px-4 sm:px-6 lg:px-8 xl:px-12">
                      <CategoryNav searchParams={headerSearchParams} basePath="/" />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Content */}
          <div className="relative -mt-[69px]">
            <div
              style={{
                opacity: isContentReady ? 1 : 0,
                transition: 'opacity 200ms ease-out',
              }}
            >
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
                    <div className={`grid ${gridColsClass} gap-5 transition-all duration-300`}>
                      {(storePosts || []).map((post, idx) => (
                        <div
                          key={post.id}
                          style={{
                            opacity: 0,
                            animation: `fadeInUp 520ms ease-out forwards`,
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
                      title="All Storefronts"
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
                            animation: `fadeInUp 520ms ease-out forwards`,
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
                      title="All Teammates"
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
                              animation: `fadeInUp 520ms ease-out forwards`,
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
                      title="All Vendors"
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
                            animation: `fadeInUp 520ms ease-out forwards`,
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
                          title="Curated for You"
                          onPrev={() => scrollPosts('left')}
                          onNext={() => scrollPosts('right')}
                          onViewAll={handleViewAllPosts}
                        />
                        <div id="posts-rail">
                          <div className={`grid ${gridColsClass} gap-5 transition-all duration-300`}>
                            {currentPosts.map((post, idx) => (
                              <div
                                key={`${post.id}-${postsIndex}`}
                                style={{
                                  opacity: postsVisible ? 0 : 0,
                                  animation: postsVisible ? `fadeInUp 520ms ease-out forwards` : 'none',
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
                          title="Handpicked Experiences"
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
                                  animation: listingsVisible ? `fadeInUp 520ms ease-out forwards` : 'none',
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
                                    animation: employeesVisible ? `fadeInUp 520ms ease-out forwards` : 'none',
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
                          title="Recommended Vendors"
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
                                  animation: shopsVisible ? `fadeInUp 520ms ease-out forwards` : 'none',
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
                              animation: `fadeInUp 520ms ease-out forwards`,
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