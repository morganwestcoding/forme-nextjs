import React from 'react';
import getCurrentUser from '@/app/actions/getCurrentUser';
import getPosts from '@/app/actions/getPost';
import NewsfeedClient from './NewsfeedClient';

export const dynamic = 'force-dynamic';

const NewsfeedPage = async ({ searchParams }: { searchParams: { postId?: string } }) => {
  const [currentUser, posts] = await Promise.all([
    getCurrentUser(),
    getPosts({ filter: 'for-you' }),
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
