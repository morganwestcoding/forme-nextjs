// app/page.tsx (Server Component)
import React from 'react';
import getCurrentUser from './actions/getCurrentUser';
import getPosts, { IPostsParams } from './actions/getPost';
import { useCategoryStore } from './hooks/useCategoryStore';
import NewsfeedClient from '@/components/NewsfeedClient';

interface PostProps {
  searchParams: IPostsParams
}

export const dynamic = 'force-dynamic';

const Newsfeed = async ({ searchParams }: PostProps) => {
  const store = useCategoryStore.getState();
  const categoryToUse = searchParams.category || store.selectedCategory;
  
  const posts = await getPosts({ ...searchParams, category: categoryToUse });
  const currentUser = await getCurrentUser();

  return (
    <NewsfeedClient 
      initialPosts={posts}
      currentUser={currentUser}
      categoryToUse={categoryToUse}
    />
  );
};

export default Newsfeed;