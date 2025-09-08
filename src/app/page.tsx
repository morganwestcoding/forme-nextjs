import React from 'react';
import getCurrentUser from './actions/getCurrentUser';
import getPosts, { IPostsParams } from './actions/getPost';
import getListings, { IListingsParams } from './actions/getListings';
import getShops, { IShopsParams } from './actions/getShops';
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
  
  // Create params objects
  const listingParams: IListingsParams = {
    order: 'desc' // Default to newest listings
  };

  const shopsParams: IShopsParams = {
    order: 'desc',
    isVerified: undefined, // Get all shops
    limit: 20 // Limit for performance
  };

  // Fetch all data in parallel
  const [posts, currentUser, listings, shops] = await Promise.all([
    getPosts({ 
      ...searchParams, 
      category: categoryToUse,
      filter: filter as 'following' | 'for-you' | 'likes' | 'bookmarks'
    }),
    getCurrentUser(),
    getListings(listingParams),
    getShops(shopsParams)
  ]);

  // Extract employees from listings
  const employees = listings.flatMap(listing => 
    listing.employees.map(employee => ({
      ...employee,
      listingId: listing.id,
      listingTitle: listing.title,
      listingCategory: listing.category
    }))
  );

  return (
    <NewsfeedClient 
      initialPosts={posts}
      currentUser={currentUser}
      categoryToUse={categoryToUse}
      listings={listings}
      employees={employees} // Pass extracted employees
      shops={shops} // Pass shops
    />
  );
};

export default Newsfeed;