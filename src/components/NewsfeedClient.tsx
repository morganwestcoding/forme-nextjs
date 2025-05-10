'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import qs from 'query-string';
import Rightbar from '@/components/rightbar/Rightbar';
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
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const filterParam = searchParams?.get('filter') || 'for-you';

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
        <div className="flex w-full">
          <div className={`
            flex-none 
            w-full 
            md:w-[57%]  
            mt-6
            space-y-4
           
            md:pr-8 
          `}>
            {/* Filter Bar */}
            <NewsfeedFilter 
              onFilterChange={(filter) => {
                // Handle filter change logic here
                console.log('Filter changed to:', filter);
              }} 
            />
            
            {/* Share Component - only show in For You and Following tabs */}
            {(filterParam === 'for-you' || filterParam === 'following') && (
            <Share currentUser={currentUser} categoryLabel={selectedCategory || undefined} />
            )}
            
            {/* Posts Feed */}
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : storePosts.length === 0 ? (
              <EmptyState 
                title={getEmptyStateMessage().title}
                subtitle={getEmptyStateMessage().subtitle}
              />
            ) : (
              storePosts.map((post) => (
                <Post 
                  key={post.id}
                  post={post}
                  currentUser={currentUser}
                  categories={categories}
                />
              ))
            )}
          </div>
          <div className="flex-grow w-[43%]">
            <Rightbar listings={listings} currentUser={currentUser} />
          </div>
        </div>
      </Container>
    </ClientProviders>
  );
};

export default NewsfeedClient;