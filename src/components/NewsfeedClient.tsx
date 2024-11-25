'use client';

import React, { useEffect } from 'react';
import Rightbar from '@/components/rightbar/Rightbar';
import Share from '@/components/feed/Share';
import ClientProviders from '@/components/ClientProviders';
import Post from '@/components/feed/Post';
import { categories } from '@/components/Categories';
import { SafePost, SafeUser } from '@/app/types';
import { usePostStore } from '@/app/hooks/usePostStore';
import { useCategory } from '@/CategoryContext';

interface NewsfeedClientProps {
  initialPosts: SafePost[];
  currentUser: SafeUser | null;
  categoryToUse?: string;
}

const NewsfeedClient: React.FC<NewsfeedClientProps> = ({ 
  initialPosts, 
  currentUser, 
  categoryToUse 
}) => {
  const setPosts = usePostStore((state) => state.setPosts);
  const storePosts = usePostStore((state) => state.posts);
  const { selectedCategory } = useCategory();

  useEffect(() => {
    // Filter posts based on selected category
    const filteredPosts = selectedCategory
      ? initialPosts.filter(post => post.category === selectedCategory)
      : initialPosts;
    setPosts(filteredPosts);
  }, [initialPosts, setPosts, selectedCategory]);

  return (
    <ClientProviders>
      <div className="flex w-full">
        <div className="flex-none w-[45%] ml-28 mt-8 mr-1">
          <Share currentUser={currentUser} categoryLabel={selectedCategory || undefined} />
          {storePosts.map((post) => (
            <Post 
              key={post.id}
              post={post}
              currentUser={currentUser}
              categories={categories}
            />
          ))}
        </div>
        <div className="flex-grow w-[55%] ml-4">
          <Rightbar />
        </div>
      </div>
    </ClientProviders>
  );
};

export default NewsfeedClient;