// components/NewsfeedClient.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import ClientProviders from '@/components/ClientProviders';
import { categories } from '@/components/Categories';
import { SafePost, SafeUser, SafeListing } from '@/app/types';
import { usePostStore } from '@/app/hooks/usePostStore';
import { useCategory } from '@/CategoryContext';
import { useFilter } from '@/FilterContext';
import Container from './Container';
import NewsfeedHeader from './feed/NewsfeedHeader';
import PostCard from './feed/PostCard';
import ListingCard from '@/components/listings/ListingCard';
import PropagateLoaderWrapper from '@/components/loaders/PropagateLoaderWrapper';
import SectionHeader from '@/app/market/SectionHeader';

interface ViewState {
  mode: 'horizontal' | 'vertical';
  filters: {
    category: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'price' | 'date' | 'name';
    sortOrder?: 'asc' | 'desc';
    city?: string;
    state?: string;
  };
}

interface NewsfeedClientProps {
  initialPosts: SafePost[];
  currentUser: SafeUser | null;
  categoryToUse?: string;
  listings: SafeListing[];
}

/** Animation timing (aligned with MarketContent/ShopClient) */
const MIN_LOADER_MS = 1800;
const FADE_DURATION_MS = 520;
const FADE_STAGGER_BASE_MS = 140;
const FADE_STAGGER_STEP_MS = 30;
const CONTAINER_FADE_MS = 700;

const NewsfeedClient: React.FC<NewsfeedClientProps> = ({
  initialPosts,
  currentUser,
  categoryToUse,
  listings,
}) => {
  const setPosts = usePostStore((state) => state.setPosts);
  const storePosts = usePostStore((state) => state.posts);
  const { selectedCategory } = useCategory();
  const { filters } = useFilter();

  const [loading, setLoading] = useState(false);
  const [uiLoading, setUiLoading] = useState(true);
  const [animatedItems, setAnimatedItems] = useState<JSX.Element[]>([]);

  const [viewState, setViewState] = useState<ViewState>({
    mode: 'horizontal',
    filters: {
      category: 'featured',
      sortBy: 'date',
      sortOrder: 'desc',
    },
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const filterParam = searchParams?.get('filter') || 'for-you';

  // Build NewsfeedHeader props from URL
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

  // Filtering logic to determine when to show section headers (like MarketContent)
  const filterInfo = useMemo(() => {
    // Get the current category from URL params (this is the source of truth)
    const currentCategory = headerSearchParams?.category || '';
    const categoryIsActive = currentCategory !== '' && currentCategory !== 'featured' && currentCategory !== 'all';

    // Check for price filters
    const hasPriceFilter = 
      viewState?.filters?.minPrice !== undefined ||
      viewState?.filters?.maxPrice !== undefined ||
      headerSearchParams.minPrice !== undefined ||
      headerSearchParams.maxPrice !== undefined;

    // Check for location filters
    const hasLocationFilter = !!(
      viewState?.filters?.city?.trim() ||
      viewState?.filters?.state?.trim() ||
      headerSearchParams.city?.toString()?.trim() ||
      headerSearchParams.state?.toString()?.trim()
    );

    const isFiltered = categoryIsActive || hasPriceFilter || hasLocationFilter;

    // Determine results header text
    let resultsHeaderText = '';
    if (categoryIsActive && currentCategory) {
      // Capitalize first letter of category
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
  }, [viewState, headerSearchParams]);

  // Fetch posts on category/filter change
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setUiLoading(true);

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

        // Correct endpoint (singular)
        const { data } = await axios.get('/api/post', { params });
        setPosts(data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
        setTimeout(() => setUiLoading(false), MIN_LOADER_MS);
      }
    };

    fetchPosts();
  }, [selectedCategory, filterParam, filters, setPosts, searchParams]);

  // Build interleaved feed (posts + listings)
  const flatFeedItems = useMemo(() => {
    if (!storePosts || storePosts.length === 0) return [];

    const out: JSX.Element[] = [];

    storePosts.forEach((post, index) => {
      out.push(
        <div
          key={`post-${post.id}`}
          className="group/card relative transition-opacity duration-300 group-hover/grid:opacity-100 hover:z-10 hover:!opacity-100"
        >
          <PostCard post={post} currentUser={currentUser} categories={categories} />
        </div>
      );

      // Inject a ListingCard after every 3 posts (if provided)
      if ((index + 1) % 3 === 0 && listings.length > 0) {
        const listingIndex = Math.floor((index + 1) / 3) - 1;
        const listing = listings[listingIndex % listings.length];

        out.push(
          <div
            key={`listing-${listing.id}-${listingIndex}`}
            className="group/card relative transition-opacity duration-300 group-hover/grid:opacity-100 hover:z-10 hover:!opacity-100"
          >
            <ListingCard currentUser={currentUser} data={listing} categories={categories} />
          </div>
        );
      }
    });

    return out;
  }, [storePosts, listings, currentUser]);

  // Wrap in staggered fade-in containers (runs after uiLoading completes)
  const buildAnimatedItems = () =>
    flatFeedItems.map((el, idx) => {
      const delay = FADE_STAGGER_BASE_MS + (idx % 12) * FADE_STAGGER_STEP_MS;
      return (
        <div
          key={`feedwrap-${idx}`}
          style={{
            opacity: 0,
            animation: `fadeInUp ${FADE_DURATION_MS}ms ease-out forwards`,
            animationDelay: `${delay}ms`,
            willChange: 'transform, opacity',
          }}
        >
          {el}
        </div>
      );
    });

  useEffect(() => {
    if (!uiLoading) {
      setAnimatedItems(buildAnimatedItems());
    }
  }, [uiLoading, flatFeedItems]);

  // Scroll functions for section headers (placeholder implementation)
  const scrollFeaturedFeed = (dir: 'left' | 'right') => {
    console.log('Scroll featured feed', dir);
  };

  const scrollTrendingFeed = (dir: 'left' | 'right') => {
    console.log('Scroll trending feed', dir);
  };

  const hasContent = useMemo(
    () => Array.isArray(storePosts) && storePosts.length > 0,
    [storePosts]
  );

  return (
    <ClientProviders>
      <Container>
        {/* Main Discover Title - Always Visible */}
        <div className="pt-2 mb-4">
     <h1 className="text-3xl md:text-3xl font-bold text-black leading-tight tracking-wide">Discover</h1>
          <p className="text-gray-600">Share whats new with you and your business</p>
        </div>

        {/* Search and Category Controls */}
        <NewsfeedHeader
          searchParams={headerSearchParams}
          viewState={viewState}
          setViewState={setViewState}
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
            {viewState.mode === 'horizontal' ? (
              hasContent ? (
                <>
                  {/* ===== Featured Feed Section ===== */}
                  {!filterInfo.isFiltered && (
                    <SectionHeader
                      title="Featured Feed"
                      onPrev={() => scrollFeaturedFeed('left')}
                      onNext={() => scrollFeaturedFeed('right')}
                      onViewAll={() => router.push('/newsfeed?category=featured')}
                    />
                  )}

                  {/* ===== Results Section Header (when filtered) ===== */}
                  {filterInfo.isFiltered && filterInfo.resultsHeaderText && (
                    <SectionHeader
                      title={filterInfo.resultsHeaderText}
                      // No navigation controls for results section
                    />
                  )}

                  {/* Feed Grid */}
                  <div className="group/grid grid grid-cols-4 gap-4">
                    {animatedItems}
                  </div>

                  {/* ===== Trending Posts Section (when not filtered) ===== */}
                  {!filterInfo.isFiltered && animatedItems.length > 0 && (
                    <div className="mt-8">
                      <SectionHeader
                        title="Trending Posts"
                        onPrev={() => scrollTrendingFeed('left')}
                        onNext={() => scrollTrendingFeed('right')}
                        onViewAll={() => router.push('/newsfeed?category=trending')}
                      />
                      {/* You could add a separate trending posts grid here */}
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-gray-500 shadow-sm">
                  No posts found. Try adjusting your filters.
                </div>
              )
            ) : (
              // Vertical mode - could be implemented later
              <div className="group/grid grid grid-cols-1 gap-4">
                {animatedItems}
              </div>
            )}
          </div>
        </div>
      </Container>
    </ClientProviders>
  );
};

export default NewsfeedClient;