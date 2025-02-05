// app/page.tsx
import React from 'react';
import getCurrentUser from './actions/getCurrentUser';
import getPosts, { IPostsParams } from './actions/getPost';
import getListings, { IListingsParams } from './actions/getListings'; // Update import
import { useCategoryStore } from './hooks/useCategoryStore';
import NewsfeedClient from '@/components/NewsfeedClient';

interface PostProps {
  searchParams: IPostsParams
}

export const dynamic = 'force-dynamic';

const Newsfeed = async ({ searchParams }: PostProps) => {
  const store = useCategoryStore.getState();
  const categoryToUse = searchParams.category || store.selectedCategory;
  
  // Create listing params object
  const listingParams: IListingsParams = {
    // You can add specific filters here if needed
    order: 'desc' // Default to newest listings
  };

  // Fetch all data in parallel
  const [posts, currentUser, listings] = await Promise.all([
    getPosts({ ...searchParams, category: categoryToUse }),
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