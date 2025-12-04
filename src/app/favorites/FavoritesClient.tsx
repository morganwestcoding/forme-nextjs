'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Container from '@/components/Container';
import ListingCard from '@/components/listings/ListingCard';
import WorkerCard from '@/components/listings/WorkerCard';
import ShopCard from '@/components/shop/ShopCard';
import PostCard from '@/components/feed/PostCard';
import { categories } from '@/components/Categories';
import { SafeListing, SafeUser, SafeEmployee, SafeShop, SafePost } from '@/app/types';
import MarketSearch from '../market/MarketSearch';
import CategoryNav from '@/components/favorites/CategoryNav';
import SectionHeader from '../market/SectionHeader';

type FavoriteTab = 'Market' | 'Professionals' | 'Shops' | 'Posts';

interface FavoritesClientProps {
  listings: SafeListing[];
  workers: SafeEmployee[];
  shops: SafeShop[];
  posts: SafePost[];
  currentUser?: SafeUser | null;
}

const FADE_OUT_DURATION = 200;
const ITEMS_PER_PAGE = 8;

const FavoritesClient: React.FC<FavoritesClientProps> = ({
  listings,
  workers,
  shops,
  posts,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<FavoriteTab | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Pagination state for each section
  const [listingsIndex, setListingsIndex] = useState(0);
  const [workersIndex, setWorkersIndex] = useState(0);
  const [shopsIndex, setShopsIndex] = useState(0);
  const [postsIndex, setPostsIndex] = useState(0);

  // Animation visibility state
  const [listingsVisible, setListingsVisible] = useState(true);
  const [workersVisible, setWorkersVisible] = useState(true);
  const [shopsVisible, setShopsVisible] = useState(true);
  const [postsVisible, setPostsVisible] = useState(true);

  const [isAnimating, setIsAnimating] = useState(false);

  // View all mode
  const [viewAllMode, setViewAllMode] = useState<'listings' | 'workers' | 'shops' | 'posts' | null>(null);

  // Safely handle potentially undefined arrays
  const safeListings = useMemo(() => listings || [], [listings]);
  const safeWorkers = useMemo(() => workers || [], [workers]);
  const safeShops = useMemo(() => shops || [], [shops]);
  const safePosts = useMemo(() => posts || [], [posts]);

  // Responsive grid - adds 1 column when sidebar is collapsed
  const gridColsClass = isSidebarCollapsed
    ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
    : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';

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
    setListingsIndex(0);
    setWorkersIndex(0);
    setShopsIndex(0);
    setPostsIndex(0);
  }, [isSidebarCollapsed]);

  // Sticky nav border effect on scroll
  useEffect(() => {
    const handleScroll = () => {
      const navWrapper = document.getElementById('favorites-category-nav-wrapper');
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

  // Check content availability
  const hasListings = safeListings.length > 0;
  const hasWorkers = safeWorkers.length > 0;
  const hasShops = safeShops.length > 0;
  const hasPosts = safePosts.length > 0;
  const hasContent = hasListings || hasWorkers || hasShops || hasPosts;

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
  const currentListings = useMemo(() => {
    if (safeListings.length <= ITEMS_PER_PAGE) return safeListings;
    const start = listingsIndex * ITEMS_PER_PAGE;
    return safeListings.slice(start, start + ITEMS_PER_PAGE);
  }, [safeListings, listingsIndex]);

  const currentWorkers = useMemo(() => {
    if (safeWorkers.length <= ITEMS_PER_PAGE) return safeWorkers;
    const start = workersIndex * ITEMS_PER_PAGE;
    return safeWorkers.slice(start, start + ITEMS_PER_PAGE);
  }, [safeWorkers, workersIndex]);

  const currentShops = useMemo(() => {
    if (safeShops.length <= ITEMS_PER_PAGE) return safeShops;
    const start = shopsIndex * ITEMS_PER_PAGE;
    return safeShops.slice(start, start + ITEMS_PER_PAGE);
  }, [safeShops, shopsIndex]);

  const currentPosts = useMemo(() => {
    if (safePosts.length <= ITEMS_PER_PAGE) return safePosts;
    const start = postsIndex * ITEMS_PER_PAGE;
    return safePosts.slice(start, start + ITEMS_PER_PAGE);
  }, [safePosts, postsIndex]);

  // Total pages
  const totalListingsPages = Math.max(1, Math.ceil(safeListings.length / ITEMS_PER_PAGE));
  const totalWorkersPages = Math.max(1, Math.ceil(safeWorkers.length / ITEMS_PER_PAGE));
  const totalShopsPages = Math.max(1, Math.ceil(safeShops.length / ITEMS_PER_PAGE));
  const totalPostsPages = Math.max(1, Math.ceil(safePosts.length / ITEMS_PER_PAGE));

  // Scroll handlers
  const scrollListings = (dir: 'left' | 'right') =>
    animateTransition(setListingsVisible, setListingsIndex, listingsIndex, totalListingsPages, dir);

  const scrollWorkers = (dir: 'left' | 'right') =>
    animateTransition(setWorkersVisible, setWorkersIndex, workersIndex, totalWorkersPages, dir);

  const scrollShops = (dir: 'left' | 'right') =>
    animateTransition(setShopsVisible, setShopsIndex, shopsIndex, totalShopsPages, dir);

  const scrollPosts = (dir: 'left' | 'right') =>
    animateTransition(setPostsVisible, setPostsIndex, postsIndex, totalPostsPages, dir);

  // View all handlers
  const handleViewAllListings = () => {
    setViewAllMode('listings');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewAllWorkers = () => {
    setViewAllMode('workers');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewAllShops = () => {
    setViewAllMode('shops');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewAllPosts = () => {
    setViewAllMode('posts');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToMain = () => {
    setViewAllMode(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper to get associated listing for a worker
  const getAssociatedListing = (worker: SafeEmployee) => {
    return safeListings.find(listing =>
      listing.employees?.some(emp => emp.id === worker.id)
    ) || safeListings[0];
  };

  // Determine if we should show sections based on active tab
  const shouldShowListings = !activeTab || activeTab === 'Market';
  const shouldShowWorkers = !activeTab || activeTab === 'Professionals';
  const shouldShowShops = !activeTab || activeTab === 'Shops';
  const shouldShowPosts = !activeTab || activeTab === 'Posts';

  return (
    <Container>
      {/* Hero Section - Clean minimal design (matching Market) */}
      <div className="-mx-6 md:-mx-24 -mt-2 md:-mt-8">
        <div className="relative px-6 md:px-24 pt-12 pb-8 bg-white">

          {/* Content */}
          <div className="relative z-10 pb-6">
            {/* Main Favorites Title */}
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
                Favorites
              </h1>
              <p className="text-gray-500 text-base mt-3 max-w-2xl mx-auto">A one stop shop for all of your favorite things</p>
            </div>

            {/* Search and Controls */}
            <div className="mt-8 max-w-3xl mx-auto">
              <MarketSearch
                isHeroMode={false}
                basePath="/favorites"
              />
            </div>

            {/* Category Navigation - Sticky */}
            <div className="mt-5 -mx-6 md:-mx-24">
              <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-transparent transition-all duration-300" id="favorites-category-nav-wrapper">
                <div className="px-6 md:px-24">
                  <CategoryNav activeTab={activeTab} setActiveTab={setActiveTab} />
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
              {/* View All Listings Mode */}
              {viewAllMode === 'listings' && (
                <>
                  <SectionHeader
                    title="All Favorite Listings"
                    className="mb-6"
                    onViewAll={handleBackToMain}
                    viewAllLabel="Back to Favorites"
                  />
                  <div className={`grid ${gridColsClass} gap-5 transition-all duration-300`}>
                    {safeListings.map((listing, idx) => (
                      <div
                        key={listing.id}
                        style={{
                          opacity: 0,
                          animation: `fadeInUp 520ms ease-out forwards`,
                          animationDelay: `${Math.min(idx * 30, 300)}ms`,
                          willChange: 'transform, opacity',
                        }}
                      >
                        <ListingCard
                          categories={categories}
                          currentUser={currentUser}
                          data={listing}
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* View All Workers Mode */}
              {viewAllMode === 'workers' && (
                <>
                  <SectionHeader
                    title="All Favorite Professionals"
                    className="mb-6"
                    onViewAll={handleBackToMain}
                    viewAllLabel="Back to Favorites"
                  />
                  <div className={`grid ${gridColsClass} gap-5 transition-all duration-300`}>
                    {safeWorkers.map((worker, idx) => {
                      const associatedListing = getAssociatedListing(worker);
                      return (
                        <div
                          key={worker.id}
                          style={{
                            opacity: 0,
                            animation: `fadeInUp 520ms ease-out forwards`,
                            animationDelay: `${Math.min(idx * 30, 300)}ms`,
                            willChange: 'transform, opacity',
                          }}
                        >
                          <WorkerCard
                            employee={worker}
                            listingTitle={associatedListing?.title || 'Professional'}
                            data={{
                              title: associatedListing?.title || '',
                              imageSrc: associatedListing?.imageSrc || '',
                              category: associatedListing?.category || ''
                            }}
                            listing={associatedListing}
                            currentUser={currentUser}
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
                    title="All Favorite Shops"
                    className="mb-6"
                    onViewAll={handleBackToMain}
                    viewAllLabel="Back to Favorites"
                  />
                  <div className={`grid ${gridColsClass} gap-5 transition-all duration-300`}>
                    {safeShops.map((shop, idx) => (
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

              {/* View All Posts Mode */}
              {viewAllMode === 'posts' && (
                <>
                  <SectionHeader
                    title="All Favorite Posts"
                    className="mb-6"
                    onViewAll={handleBackToMain}
                    viewAllLabel="Back to Favorites"
                  />
                  <div className={`grid ${gridColsClass} gap-5 transition-all duration-300`}>
                    {safePosts.map((post, idx) => (
                      <div
                        key={post.id}
                        style={{
                          opacity: 0,
                          animation: `fadeInUp 520ms ease-out forwards`,
                          animationDelay: `${Math.min(idx * 30, 300)}ms`,
                          willChange: 'transform, opacity',
                        }}
                      >
                        <PostCard
                          post={post}
                          currentUser={currentUser}
                          categories={categories}
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Normal View - Show sections with pagination */}
              {!viewAllMode && (
                <>
                  {/* ===== Favorite Listings Section ===== */}
                  {shouldShowListings && hasListings && (
                    <>
                      <SectionHeader
                        title="Favorite Listings"
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
                              <ListingCard
                                categories={categories}
                                currentUser={currentUser}
                                data={listing}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* ===== Favorite Professionals Section ===== */}
                  {shouldShowWorkers && hasWorkers && (
                    <>
                      <SectionHeader
                        title="Favorite Professionals"
                        onPrev={() => scrollWorkers('left')}
                        onNext={() => scrollWorkers('right')}
                        onViewAll={handleViewAllWorkers}
                      />
                      <div id="workers-rail">
                        <div className={`grid ${gridColsClass} gap-5 transition-all duration-300`}>
                          {currentWorkers.map((worker, idx) => {
                            const associatedListing = getAssociatedListing(worker);
                            return (
                              <div
                                key={`${worker.id}-${workersIndex}`}
                                style={{
                                  opacity: workersVisible ? 0 : 0,
                                  animation: workersVisible ? `fadeInUp 520ms ease-out forwards` : 'none',
                                  animationDelay: workersVisible ? `${140 + idx * 30}ms` : '0ms',
                                  willChange: 'transform, opacity',
                                  transition: !workersVisible ? `opacity ${FADE_OUT_DURATION}ms ease-out` : 'none',
                                }}
                                className={!workersVisible ? 'opacity-0' : ''}
                              >
                                <WorkerCard
                                  employee={worker}
                                  listingTitle={associatedListing?.title || 'Professional'}
                                  data={{
                                    title: associatedListing?.title || '',
                                    imageSrc: associatedListing?.imageSrc || '',
                                    category: associatedListing?.category || ''
                                  }}
                                  listing={associatedListing}
                                  currentUser={currentUser}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}

                  {/* ===== Favorite Shops Section ===== */}
                  {shouldShowShops && hasShops && (
                    <>
                      <SectionHeader
                        title="Favorite Shops"
                        onPrev={() => scrollShops('left')}
                        onNext={() => scrollShops('right')}
                        onViewAll={handleViewAllShops}
                      />
                      <div id="shops-rail">
                        <div className={`grid ${gridColsClass} gap-5 transition-all duration-300`}>
                          {currentShops.map((shop, idx) => (
                            <div
                              key={`${shop.id}-${shopsIndex}`}
                              style={{
                                opacity: shopsVisible ? 0 : 0,
                                animation: shopsVisible ? `fadeInUp 520ms ease-out forwards` : 'none',
                                animationDelay: shopsVisible ? `${140 + idx * 30}ms` : '0ms',
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

                  {/* ===== Favorite Posts Section ===== */}
                  {shouldShowPosts && hasPosts && (
                    <>
                      <SectionHeader
                        title="Favorite Posts"
                        onPrev={() => scrollPosts('left')}
                        onNext={() => scrollPosts('right')}
                        onViewAll={handleViewAllPosts}
                      />
                      <div id="posts-rail">
                        <div className={`grid ${gridColsClass} gap-5 pb-8 transition-all duration-300`}>
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
                              <PostCard
                                post={post}
                                currentUser={currentUser}
                                categories={categories}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Empty state for filtered tab */}
                  {activeTab === 'Market' && !hasListings && (
                    <div className="px-8 pt-32 text-center text-gray-500">
                      No favorite listings yet
                    </div>
                  )}
                  {activeTab === 'Professionals' && !hasWorkers && (
                    <div className="px-8 pt-32 text-center text-gray-500">
                      No favorite professionals yet
                    </div>
                  )}
                  {activeTab === 'Shops' && !hasShops && (
                    <div className="px-8 pt-32 text-center text-gray-500">
                      No favorite shops yet
                    </div>
                  )}
                  {activeTab === 'Posts' && !hasPosts && (
                    <div className="px-8 pt-32 text-center text-gray-500">
                      No favorite posts yet
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <div className="px-8 pt-32 text-center text-gray-500">
              No favorites yet. Start hearting items to build your collection.
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};

export default FavoritesClient;
