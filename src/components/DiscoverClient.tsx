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
import Container from './Container';
import DiscoverSearch from './feed/DiscoverSearch';
import CategoryNav from './feed/CategoryNav';
import PostCard from './feed/PostCard';
import TikTokView from './feed/TikTokView';
import ListingCard from '@/components/listings/ListingCard';
import WorkerCard from '@/components/listings/WorkerCard';
import ShopCard from '@/components/shop/ShopCard';
import PropagateLoaderWrapper from '@/components/loaders/PropagateLoaderWrapper';
import SectionHeader from '@/app/market/SectionHeader';

interface DiscoverClientProps {
  initialPosts: SafePost[];
  currentUser: SafeUser | null;
  categoryToUse?: string;
  listings: SafeListing[];
  employees?: SafeEmployee[];
  shops?: SafeShop[];
}

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

  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [postsOffset, setPostsOffset] = useState(0);
  const [listingsOffset, setListingsOffset] = useState(0);
  const [employeesOffset, setEmployeesOffset] = useState(0);
  const [shopsOffset, setShopsOffset] = useState(0);

  const router = useRouter();
  const searchParams = useSearchParams();
  const filterParam = searchParams?.get('filter') || 'for-you';

  const handleNavigation = (url: string) => {
    router.push(url, { scroll: false });
  };

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
    const t = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
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
        startTransition(() => setPosts(data));
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, [selectedCategory, filterParam, filters, setPosts, searchParams]);

  const getPaginatedItems = <T,>(array: T[], offset: number, count: number = 4): T[] => {
    const start = offset * count;
    return array.slice(start, start + count);
  };

  const scrollTrendingPosts = (dir: 'left' | 'right') => {
    setPostsOffset(prev => {
      const maxOffset = Math.max(0, Math.ceil((storePosts?.length || 0) / 4) - 1);
      if (dir === 'left') return Math.max(0, prev - 1);
      return Math.min(maxOffset, prev + 1);
    });
  };

  const scrollTrendingListings = (dir: 'left' | 'right') => {
    setListingsOffset(prev => {
      const maxOffset = Math.max(0, Math.ceil(listings.length / 4) - 1);
      if (dir === 'left') return Math.max(0, prev - 1);
      return Math.min(maxOffset, prev + 1);
    });
  };

  const scrollTrendingEmployees = (dir: 'left' | 'right') => {
    setEmployeesOffset(prev => {
      const maxOffset = Math.max(0, Math.ceil(employees.length / 4) - 1);
      if (dir === 'left') return Math.max(0, prev - 1);
      return Math.min(maxOffset, prev + 1);
    });
  };

  const scrollTrendingShops = (dir: 'left' | 'right') => {
    setShopsOffset(prev => {
      const maxOffset = Math.max(0, Math.ceil(shops.length / 4) - 1);
      if (dir === 'left') return Math.max(0, prev - 1);
      return Math.min(maxOffset, prev + 1);
    });
  };

  const trendingPosts = useMemo(() => getPaginatedItems(storePosts || [], postsOffset, 4), [storePosts, postsOffset]);
  const trendingListings = useMemo(() => getPaginatedItems(listings, listingsOffset, 4), [listings, listingsOffset]);
  const trendingEmployees = useMemo(() => getPaginatedItems(employees, employeesOffset, 4), [employees, employeesOffset]);
  const trendingShops = useMemo(() => getPaginatedItems(shops, shopsOffset, 4), [shops, shopsOffset]);
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
          {/* Hero Section - Frosted Glass Effect */}
          <div className="-mx-6 md:-mx-24 -mt-2 md:-mt-8">
          <div
            className="relative px-6 md:px-24 pt-10 overflow-hidden"
            style={{
              background: 'linear-gradient(to bottom, #FFFFFF 0%, #F8F8F8 100%)'
            }}
          >

            {/* Content */}
            <div className="relative z-10 pb-6">
              {/* Main Discover Title */}
              <div className="">
                <h1 className="text-4xl md:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight">
                  Discover
                </h1>
                <p className="text-gray-600 text-lg mt-1">Share whats new with you and your business</p>
              </div>

              {/* Search and Controls */}
              <div className="mt-5">
                <DiscoverSearch isHeroMode={false} />
              </div>
                    {/* Category Navigation */}

            </div>
              <CategoryNav
                searchParams={headerSearchParams}
                onNavigate={handleNavigation}
              />
          </div>
        </div>



          <div className="relative">
            {isLoading && (
              <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center">
                <div className="mt-40 md:mt-40">
                  <PropagateLoaderWrapper size={12} speedMultiplier={1.15} />
                </div>
              </div>
            )}

            <div
              className={`transition-opacity duration-700 ease-out ${
                isLoading ? 'opacity-0' : 'opacity-100'
              }`}
            >
            {hasContent ? (
              <>
                {/* Grid View Mode */}
                {viewMode === 'grid' ? (
                  <>
                    {/* Trending Sections - Only show when not filtered */}
                    {!filterInfo.isFiltered && (
                  <>
                    {/* Trending Posts */}
                    {trendingPosts.length > 0 && (
                      <div className="mb-8">
                        <SectionHeader
                          title="Curated for You"
                          onPrev={() => scrollTrendingPosts('left')}
                          onNext={() => scrollTrendingPosts('right')}
                          onViewAll={() => handleNavigation('/?type=posts')}
                        />
                        <div className="grid grid-cols-4 gap-4">
                          {trendingPosts.map((post, idx) => (
                            <div
                              key={`trending-post-${post.id}`}
                              style={{
                                opacity: 0,
                                animation: `fadeInUp 520ms ease-out forwards`,
                                animationDelay: `${idx * 30}ms`,
                                willChange: 'transform, opacity',
                              }}
                              className="group/card relative"
                            >
                              <PostCard post={post} currentUser={currentUser} categories={categories} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Trending Listings */}
                    {trendingListings.length > 0 && (
                      <div className="mb-8">
                        <SectionHeader
                          title="Handpicked Experiences"
                          onPrev={() => scrollTrendingListings('left')}
                          onNext={() => scrollTrendingListings('right')}
                          onViewAll={() => handleNavigation('/?type=listings')}
                        />
                        <div className="grid grid-cols-4 gap-4">
                          {trendingListings.map((listing, idx) => (
                            <div
                              key={`trending-listing-${listing.id}`}
                              style={{
                                opacity: 0,
                                animation: `fadeInUp 520ms ease-out forwards`,
                                animationDelay: `${idx * 30}ms`,
                                willChange: 'transform, opacity',
                              }}
                              className="group/card relative"
                            >
                              <ListingCard currentUser={currentUser} data={listing} categories={categories} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Trending Teammates */}
                    {trendingEmployees.length > 0 && (
                      <div className="mb-8">
                        <SectionHeader
                          title="Your Perfect Match"
                          onPrev={() => scrollTrendingEmployees('left')}
                          onNext={() => scrollTrendingEmployees('right')}
                          onViewAll={() => handleNavigation('/?type=professionals')}
                        />
                        <div className="grid grid-cols-4 gap-4">
                          {trendingEmployees.map((employee, idx) => {
                            const listing = listings[idx % listings.length] || listings[0];
                            return (
                              <div
                                key={`trending-employee-${employee.id}`}
                                style={{
                                  opacity: 0,
                                  animation: `fadeInUp 520ms ease-out forwards`,
                                  animationDelay: `${idx * 30}ms`,
                                  willChange: 'transform, opacity',
                                }}
                                className="group/card relative"
                              >
                                <WorkerCard
                                  employee={employee}
                                  listingTitle={listing?.title || 'Professional'}
                                  data={{
                                    title: listing?.title || '',
                                    imageSrc: listing?.imageSrc || '',
                                    category: listing?.category || ''
                                  }}
                                  listing={listing}
                                  currentUser={currentUser}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Trending Vendors */}
                    {trendingShops.length > 0 && (
                      <div className="mb-8">
                        <SectionHeader
                          title="Recommended Vendors"
                          onPrev={() => scrollTrendingShops('left')}
                          onNext={() => scrollTrendingShops('right')}
                          onViewAll={() => handleNavigation('/?type=shops')}
                        />
                        <div className="grid grid-cols-4 gap-4">
                          {trendingShops.map((shop, idx) => (
                            <div
                              key={`trending-shop-${shop.id}`}
                              style={{
                                opacity: 0,
                                animation: `fadeInUp 520ms ease-out forwards`,
                                animationDelay: `${idx * 30}ms`,
                                willChange: 'transform, opacity',
                              }}
                              className="group/card relative"
                            >
                              <ShopCard data={shop} currentUser={currentUser} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Filtered Results Section - Unified Grid */}
                {filterInfo.isFiltered && (() => {
                  // Combine all items into a single array with type information
                  let allItems: Array<{type: 'post' | 'listing' | 'employee' | 'shop', data: any, listingContext?: any}> = [];

                  // If type filter is active, only include items of that type
                  if (filterInfo.typeFilter) {
                    if (filterInfo.typeFilter === 'posts') {
                      allItems = (storePosts || []).map(post => ({ type: 'post' as const, data: post }));
                    } else if (filterInfo.typeFilter === 'listings') {
                      allItems = (listings || []).map(listing => ({ type: 'listing' as const, data: listing }));
                    } else if (filterInfo.typeFilter === 'professionals') {
                      allItems = (employees || []).map(employee => {
                        const listing = listings.find(l => l.id === employee.listingId) || listings[0];
                        return { type: 'employee' as const, data: employee, listingContext: listing };
                      });
                    } else if (filterInfo.typeFilter === 'shops') {
                      allItems = (shops || []).map(shop => ({ type: 'shop' as const, data: shop }));
                    }
                  } else {
                    // Otherwise, show all types mixed together
                    allItems = [
                      ...(storePosts || []).map(post => ({ type: 'post' as const, data: post })),
                      ...(listings || []).map(listing => ({ type: 'listing' as const, data: listing })),
                      ...(employees || []).map(employee => {
                        const listing = listings.find(l => l.id === employee.listingId) || listings[0];
                        return { type: 'employee' as const, data: employee, listingContext: listing };
                      }),
                      ...(shops || []).map(shop => ({ type: 'shop' as const, data: shop })),
                    ];
                  }

                  if (allItems.length === 0) return null;

                  return (
                    <div key={`${filterInfo.currentCategory}-${filterInfo.typeFilter}`}>
                      {/* Results Section Header */}
                      {filterInfo.resultsHeaderText && (
                        <SectionHeader
                          title={filterInfo.resultsHeaderText}
                          className="mb-6"
                          onViewAll={() => handleNavigation('/')}
                          viewAllLabel="← Back to Discover"
                        />
                      )}

                      {/* Unified Grid */}
                      <div className="mb-8">
                        <div className="grid grid-cols-4 gap-4">
                          {allItems.map((item, idx) => (
                            <div
                              key={`${item.type}-${item.data.id}`}
                              style={{
                                opacity: 0,
                                animation: `fadeInUp 520ms ease-out forwards`,
                                animationDelay: `${idx * 30}ms`,
                                willChange: 'transform, opacity',
                              }}
                              className="group/card relative"
                            >
                              {item.type === 'post' && (
                                <PostCard post={item.data} currentUser={currentUser} categories={categories} />
                              )}
                              {item.type === 'listing' && (
                                <ListingCard currentUser={currentUser} data={item.data} categories={categories} />
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
                      </div>
                    </div>
                  );
                })()}
                  </>
                ) : null}
              </>
            ) : (
              <div className="px-8 pt-32 text-center text-gray-500 ">
                No posts found. Try adjusting your filters.
              </div>
            )
          }
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