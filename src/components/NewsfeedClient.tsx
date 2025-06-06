'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import qs from 'query-string';
import Share from '@/components/feed/Share';
import ClientProviders from '@/components/ClientProviders';
import Post from '@/components/feed/Post';
import { categories } from '@/components/Categories';
import { SafePost, SafeUser, SafeListing } from '@/app/types';
import { usePostStore } from '@/app/hooks/usePostStore';
import { useCategory } from '@/CategoryContext';
import { useFilter } from '@/FilterContext';
import Container from './Container';
import NewsfeedFilter from './feed/NewsfeedFilter';
import EmptyState from '@/components/EmptyState';
import NewsfeedHeader from './feed/NewsfeedHeader';
import PostCard from './feed/PostCard';
import ListingCard from '@/components/listings/ListingCard';

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

const NewsfeedClient: React.FC<NewsfeedClientProps> = ({ 
  initialPosts, 
  currentUser, 
  categoryToUse,
  listings 
}) => {
  const setPosts = usePostStore((state) => state.setPosts);
  const storePosts = usePostStore((state) => state.posts);
  const { selectedCategory } = useCategory();
  const { filters } = useFilter();
  const [loading, setLoading] = useState(false);
  
  // Updated ViewState for horizontal/vertical toggle
  const [viewState, setViewState] = useState<ViewState>({
    mode: 'horizontal',
    filters: {
      category: 'featured',
      sortBy: 'date',
      sortOrder: 'desc'
    }
  });
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const filterParam = searchParams?.get('filter') || 'for-you';
  
  // Create searchParams object for NewsfeedHeader
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

  // Fetch posts whenever filter or category changes
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        
        // Construct query parameters
        const params: any = {};
        
        // Get category from URL parameters instead of selectedCategory context
        const categoryParam = searchParams?.get('category');
        if (categoryParam) {
          params.category = categoryParam;
        } else if (selectedCategory && selectedCategory !== 'Default') {
          // Fall back to selectedCategory from context if not in URL
          params.category = selectedCategory;
        }
        
        if (filterParam) params.filter = filterParam;
        
        // Apply location filters
        if (filters.location?.state) params.state = filters.location.state;
        if (filters.location?.city) params.city = filters.location.city;
        
        // Apply sort filter
        if (filters.sort?.order) params.order = filters.sort.order;
        
        // IMPORTANT: Using the correct API path - '/api/post' (singular) not '/api/posts' (plural)
        const { data } = await axios.get('/api/post', { params });
        setPosts(data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [selectedCategory, filterParam, filters, setPosts, searchParams]);

  // Helper function to get appropriate empty state message
  const getEmptyStateMessage = () => {
    if (filterParam === 'following') {
      return {
        title: "You're not following anyone yet",
        subtitle: "Follow users to see their posts here"
      };
    } else if (filterParam === 'likes') {
      return {
        title: "No liked posts yet",
        subtitle: "Posts you like will appear here"
      };
    } else if (filterParam === 'bookmarks') {
      return {
        title: "No bookmarked posts yet",
        subtitle: "Posts you bookmark will appear here"
      };
    } else {
      return {
        title: "No posts found",
        subtitle: "Be the first one to post!"
      };
    }
  };

  return (
    <ClientProviders>
      <Container>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover</h1>
          <p className="text-gray-600">Share whats new with you and your business</p>
        </div>

        {/* NewsfeedHeader Component */}
        <NewsfeedHeader 
          searchParams={headerSearchParams}
          viewState={viewState}
          setViewState={setViewState}
        />
        {/* Posts Feed */}
        {storePosts.length === 0 ? (
  <EmptyState 
    title={getEmptyStateMessage().title}
    subtitle={getEmptyStateMessage().subtitle}
  />
        ) : (
          <>
  
            {/* Horizontal Grid View */}
            {viewState.mode === 'horizontal' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4 group/grid">
                {storePosts.map((post, index) => {
                  const items = [];
                  
                  // Add the post card
                  items.push(
                    <div key={post.id} className="group/card hover:z-10 relative group-hover/grid:opacity-50 hover:!opacity-100 transition-opacity duration-300">
                      <PostCard 
                        post={post}
                        currentUser={currentUser}
                        categories={categories}
                      />
                    </div>
                  );
                  
                  // Every 9th item (end of 3rd row), add a listing card
                  if ((index + 1) % 3 === 0 && listings.length > 0) {
                    const listingIndex = Math.floor((index + 1) / 3) - 1;
                    const listing = listings[listingIndex % listings.length];
                    
                    items.push(
                      <div key={`listing-${listing.id}-${listingIndex}`} className="group/card hover:z-10 relative group-hover/grid:opacity-50 hover:!opacity-100 transition-opacity duration-300">
                        <ListingCard
                          currentUser={currentUser}
                          data={listing}
                          categories={categories}
                         
                        />
                      </div>
                    );
                  }
                  
                  return items;
                }).flat()}
              </div>
            )}
            

            {/* Vertical Scroll View - Theatre Mode */}
            {viewState.mode === 'vertical' && (
              <div className="max-w-2xl mx-auto space-y-4">
                {storePosts.map((post) => (
                  <Post 
                    key={post.id}
                    post={post}
                    currentUser={currentUser}
                    categories={categories}
                  />
                ))}
              </div>
            )}
          </>
          
        )}
      </Container>
    </ClientProviders>
  );
};

export default NewsfeedClient;