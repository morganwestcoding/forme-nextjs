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
import { useFilter } from '@/FilterContext';
import Container from './Container';

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
  const { filters } = useFilter();

  useEffect(() => {
    let filteredPosts = [...initialPosts];

    // Apply category filter
    if (selectedCategory) {
      filteredPosts = filteredPosts.filter(post => post.category === selectedCategory);
    }

    // Apply location filters
    if (filters.location.state || filters.location.city) {
      filteredPosts = filteredPosts.filter(post => {
        if (!post.location) return false;
        
        const postLocation = post.location.toLowerCase();
        const stateMatches = !filters.location.state || 
          postLocation.includes(filters.location.state.toLowerCase());
        const cityMatches = !filters.location.city || 
          postLocation.includes(filters.location.city.toLowerCase());
        
        return stateMatches && cityMatches;
      });
    }

    // Apply sort filter
    if (filters.sort.order) {
      filteredPosts.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return filters.sort.order === 'asc' ? dateA - dateB : dateB - dateA;
      });
    }

    setPosts(filteredPosts);
  }, [initialPosts, setPosts, selectedCategory, filters]);

  return (
    <ClientProviders>
     
      <Container>
      <div className="flex w-full">
      <div className={`
    flex-none 
    w-full 
    md:w-[55%]  
    ${currentUser ? 'mt-8' : 'mt-4'} 
    space-y-4
    px-4       
    md:pr-8 
    md:pl-0
  `}>
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
  <div className="flex-grow w-[45%] ml-4">
    <Rightbar />
  </div>
</div>
      </Container>
     
    </ClientProviders>
  );
};


export default NewsfeedClient;