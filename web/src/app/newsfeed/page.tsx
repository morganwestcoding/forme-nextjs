import React from 'react';
import getCurrentUser from '@/app/actions/getCurrentUser';
import NewsfeedClient from './NewsfeedClient';

export const dynamic = 'force-dynamic';

const NewsfeedPage = async ({ searchParams }: { searchParams: { postId?: string } }) => {
  const currentUser = await getCurrentUser();

  return (
    <NewsfeedClient
      currentUser={currentUser}
      initialPostId={searchParams.postId}
    />
  );
};

export default NewsfeedPage;
