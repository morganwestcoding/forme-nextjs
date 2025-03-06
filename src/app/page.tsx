import React from 'react';
import getCurrentUser from './actions/getCurrentUser';
import getPosts, { IPostsParams } from './actions/getPost';
import getListings, { IListingsParams } from './actions/getListings';
import { useCategoryStore } from './hooks/useCategoryStore';
import NewsfeedClient from '@/components/NewsfeedClient';

interface PostProps {
  searchParams: IPostsParams & {
    filter?: 'following' | 'for-you' | 'likes' | 'bookmarks';
  }
}

export const dynamic = 'force-dynamic';

const Newsfeed = async ({ searchParams }: PostProps) => {
  const store = useCategoryStore.getState();
  const categoryToUse = searchParams.category || store.selectedCategory;
  
  // Get filter from searchParams or default to 'for-you'
  const filter = searchParams.filter || 'for-you';
  
  // Create listing params object
  const listingParams: IListingsParams = {
    order: 'desc' // Default to newest listings
  };

  // Fetch all data in parallel
  const [posts, currentUser, listings] = await Promise.all([
    getPosts({ 
      ...searchParams, 
      category: categoryToUse,
      filter: filter as 'following' | 'for-you' | 'likes' | 'bookmarks'
    }),
    getCurrentUser(),
    getListings(listingParams)
  ]);

  return (
    <NewsfeedClient 
      initialPosts={posts}
      currentUser={currentUser}
      categoryToUse={categoryToUse}
      listings={listings}
    />
  );
};

export default Newsfeed;