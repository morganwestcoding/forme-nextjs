'use client';

import React, { useEffect } from 'react';
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

interface NewsfeedClientProps {
  initialPosts: SafePost[];
  currentUser: SafeUser | null;
  categoryToUse?: string;
  listings: SafeListing[]; // Add this
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
    md:w-[57%]  
mt-8
    space-y-4
    px-4       
    md:pr-8 

  `}>
    
                <NewsfeedFilter 
              onFilterChange={(filter) => {
                // Handle filter change logic here
                console.log('Filter changed to:', filter);
              }} 
            />
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
  <div className="flex-grow w-[43%]">
  <Rightbar listings={listings} 
   currentUser={currentUser} />
  </div>
</div>
      </Container>
     
    </ClientProviders>
  );
};


export default NewsfeedClient;