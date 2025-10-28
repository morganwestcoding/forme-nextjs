// components/DiscoverClient.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import ClientProviders from '@/components/ClientProviders';
import { categories } from '@/components/Categories';
import { SafePost, SafeUser, SafeListing, SafeEmployee, SafeShop } from '@/app/types';
import { usePostStore } from '@/app/hooks/usePostStore';
import { useCategory } from '@/CategoryContext';
import { useFilter } from '@/FilterContext';
import Container from './Container';
import DiscoverHeader from './feed/DiscoverHeader';
import PostCard from './feed/PostCard';
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
  employees?: SafeEmployee[]; // Back to SafeEmployee[] since it now includes listing context
  shops?: SafeShop[];
}

/** Animation timing */
const MIN_LOADER_MS = 1800;
const CONTAINER_FADE_MS = 700;

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

  const [loading, setLoading] = useState(false);
  const [uiLoading, setUiLoading] = useState(true);

  // State for section offsets
  const [postsOffset, setPostsOffset] = useState(0);
  const [listingsOffset, setListingsOffset] = useState(0);
  const [employeesOffset, setEmployeesOffset] = useState(0);
  const [shopsOffset, setShopsOffset] = useState(0);

  const router = useRouter();
  const searchParams = useSearchParams();
  const filterParam = searchParams?.get('filter') || 'for-you';

  // Build DiscoverHeader props from URL
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

  // Filtering logic
  const filterInfo = useMemo(() => {
    const currentCategory = headerSearchParams?.category || '';
    const categoryIsActive = currentCategory !== '' && currentCategory !== 'featured' && currentCategory !== 'all';

    const hasPriceFilter =
      headerSearchParams.minPrice !== undefined ||
      headerSearchParams.maxPrice !== undefined;

    const hasLocationFilter = !!(
      headerSearchParams.city?.toString()?.trim() ||
      headerSearchParams.state?.toString()?.trim()
    );

    const isFiltered = categoryIsActive || hasPriceFilter || hasLocationFilter;

    let resultsHeaderText = '';
    if (categoryIsActive && currentCategory) {
      const categoryName = currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1);
      resultsHeaderText = `${categoryName} Feed`;
    } else if (hasPriceFilter || hasLocationFilter) {
      resultsHeaderText = 'Feed Results';
    }

    return {
      isFiltered,
      categoryIsActive,
      resultsHeaderText,
      currentCategory
    };
  }, [headerSearchParams]);

  // Fetch posts on category/filter change
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Start fade-out immediately
        setUiLoading(true);

        // Small delay to ensure fade-out completes before starting fetch
        await new Promise(resolve => setTimeout(resolve, CONTAINER_FADE_MS));

        setLoading(true);

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

        const startTime = Date.now();
        const { data } = await axios.get('/api/post', { params });
        setPosts(data);

        // Ensure minimum loader time for smooth animation
        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(0, MIN_LOADER_MS - elapsed);

        await new Promise(resolve => setTimeout(resolve, remainingTime));
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
        setUiLoading(false);
      }
    };

    fetchPosts();
  }, [selectedCategory, filterParam, filters, setPosts, searchParams]);

  // Get paginated items for each section
  const getPaginatedItems = <T,>(array: T[], offset: number, count: number = 4): T[] => {
    const start = offset * count;
    const end = start + count;
    return array.slice(start, end);
  };

  // Scroll functions for each section
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

  const trendingPosts = useMemo(() =>
    getPaginatedItems(storePosts || [], postsOffset, 4),
    [storePosts, postsOffset]
  );

  const trendingListings = useMemo(() =>
    getPaginatedItems(listings, listingsOffset, 4),
    [listings, listingsOffset]
  );

  const trendingEmployees = useMemo(() =>
    getPaginatedItems(employees, employeesOffset, 4),
    [employees, employeesOffset]
  );

  const trendingShops = useMemo(() =>
    getPaginatedItems(shops, shopsOffset, 4),
    [shops, shopsOffset]
  );

  const hasContent = useMemo(
    () => Array.isArray(storePosts) && storePosts.length > 0,
    [storePosts]
  );

  return (
    <ClientProviders>
      <Container>
        {/* Main Discover Title */}
        <div className="pt-2 mb-4">
          <h1 className="text-3xl md:text-3xl font-bold text-black leading-tight tracking-wide">Discover</h1>
          <p className="text-gray-600">Share whats new with you and your business</p>
        </div>

        {/* Search and Category Controls */}
        <DiscoverHeader
          searchParams={headerSearchParams}
        />

        {/* Content + loader overlay */}
        <div className="relative">
          {uiLoading && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center">
              <div className="mt-40 md:mt-40">
                <PropagateLoaderWrapper size={12} speedMultiplier={1.15} />
              </div>
            </div>
          )}

          <div
            className={`transition-opacity ease-out ${uiLoading ? 'opacity-0' : 'opacity-100'}`}
            style={{ transitionDuration: `${CONTAINER_FADE_MS}ms` }}
          >
            {hasContent ? (
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
                          onViewAll={() => router.push('/Discover?category=trending')}
                        />
                        <div className="grid grid-cols-4 gap-4">
                          {trendingPosts.map((post, idx) => (
                            <div key={`trending-post-${post.id}`} className="group/card relative">
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
                          onViewAll={() => router.push('/listings')}
                        />
                        <div className="grid grid-cols-4 gap-4">
                          {trendingListings.map((listing, idx) => (
                            <div key={`trending-listing-${listing.id}`} className="group/card relative">
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
                          onViewAll={() => router.push('/teammates')}
                        />
                        <div className="grid grid-cols-4 gap-4">
                          {trendingEmployees.map((employee, idx) => {
                            const listing = listings[idx % listings.length] || listings[0];
                            return (
                              <div key={`trending-employee-${employee.id}`} className="group/card relative">
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
                          onViewAll={() => router.push('/shops')}
                        />
                        <div className="grid grid-cols-4 gap-4">
                          {trendingShops.map((shop, idx) => (
                            <div key={`trending-shop-${shop.id}`} className="group/card relative">
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
                  const allItems: Array<{type: 'post' | 'listing' | 'employee' | 'shop', data: any, listingContext?: any}> = [
                    ...(storePosts || []).map(post => ({ type: 'post' as const, data: post })),
                    ...(listings || []).map(listing => ({ type: 'listing' as const, data: listing })),
                    ...(employees || []).map(employee => {
                      const listing = listings.find(l => l.id === employee.listingId) || listings[0];
                      return { type: 'employee' as const, data: employee, listingContext: listing };
                    }),
                    ...(shops || []).map(shop => ({ type: 'shop' as const, data: shop })),
                  ];

                  if (allItems.length === 0) return null;

                  return (
                    <div key={filterInfo.currentCategory}>
                      {/* Results Section Header */}
                      {filterInfo.resultsHeaderText && (
                        <SectionHeader
                          title={filterInfo.resultsHeaderText}
                          className="mb-6"
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
                                animationDelay: `${Math.min(idx * 30, 300)}ms`,
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
            ) : (
              <div className="px-8 pt-32 text-center text-gray-500 ">
                No posts found. Try adjusting your filters.
              </div>
            )
          }
          </div>
        </div>
      </Container>
    </ClientProviders>
  );
};

export default DiscoverClient;