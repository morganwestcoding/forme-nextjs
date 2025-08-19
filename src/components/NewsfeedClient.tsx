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
import EmptyState from '@/components/EmptyState';
import NewsfeedHeader from './feed/NewsfeedHeader';
import PostCard from './feed/PostCard';
import ListingCard from '@/components/listings/ListingCard';
import PropagateLoaderWrapper from '@/components/loaders/PropagateLoaderWrapper';

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

  const getEmptyStateMessage = () => {
    if (filterParam === 'following') {
      return { title: "You're not following anyone yet", subtitle: 'Follow users to see their posts here' };
    } else if (filterParam === 'likes') {
      return { title: 'No liked posts yet', subtitle: 'Posts you like will appear here' };
    } else if (filterParam === 'bookmarks') {
      return { title: 'No bookmarked posts yet', subtitle: 'Posts you bookmark will appear here' };
    } else {
      return { title: 'No posts found', subtitle: 'Be the first one to post!' };
    }
  };

  return (
    <ClientProviders>
      <Container>
        <div className="pt-4 mb-4">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Discover</h1>
          <p className="text-gray-600">Share whats new with you and your business</p>
        </div>

        <NewsfeedHeader
          searchParams={headerSearchParams}
          viewState={viewState}
          setViewState={setViewState}
        />

        {/* Loader overlay */}
        {uiLoading && (
          <div className="relative">
            <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center">
              <div className="mt-40 md:mt-40">
                <PropagateLoaderWrapper size={12} speedMultiplier={1.15} />
              </div>
            </div>
          </div>
        )}

        {/* Feed */}
        {(!storePosts || storePosts.length === 0) ? (
          <EmptyState
            title={getEmptyStateMessage().title}
            subtitle={getEmptyStateMessage().subtitle}
          />
        ) : (
          <div
            className={`transition-opacity ease-out ${uiLoading ? 'opacity-0' : 'opacity-100'}`}
            style={{ transitionDuration: `${CONTAINER_FADE_MS}ms` }}
          >
    {viewState.mode === 'horizontal' && (
  <div className="group/grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
    {animatedItems}
  </div>
)}
            {/* If you add a 'vertical' mode later, render animatedItems there too */}
          </div>
        )}
      </Container>
    </ClientProviders>
  );
};

export default NewsfeedClient;
