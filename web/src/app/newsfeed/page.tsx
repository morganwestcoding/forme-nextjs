import React from 'react';
import getCurrentUser from '@/app/actions/getCurrentUser';
import getPosts, { IPostsParams } from '@/app/actions/getPost';
import NewsfeedClient from './NewsfeedClient';

interface NewsfeedPageProps {
  searchParams: IPostsParams & {
    postId?: string;
  };
}

export const dynamic = 'force-dynamic';

const NewsfeedPage = async ({ searchParams }: NewsfeedPageProps) => {
  const [posts, currentUser] = await Promise.all([
    getPosts({ ...searchParams, filter: 'for-you' }),
    getCurrentUser(),
  ]);

  return (
    <NewsfeedClient
      posts={posts}
      currentUser={currentUser}
      initialPostId={searchParams.postId}
    />
  );
};

export default NewsfeedPage;
