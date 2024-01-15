'use client';

import React, { useEffect, useState } from 'react';
import Post from "./Post";
import Share from "./Share";
import axios from 'axios';

import { SafeUser } from '@/app/types';
import ClientProviders from '../ClientProviders';

interface FeedProps {
  currentUser?: SafeUser | null;
}

const Feed = () => {
  const [currentUser, setCurrentUser] = useState(null); // Adjust according to how you fetch currentUser
  
  useEffect(() => {
  // Fetch currentUser logic here
  // After fetching, update the currentUser state
  }, []);

  return (
    
    <div className="bg-transparent pt-8 pl-16">
      <div className="padding: 20px">
      <Share currentUser={currentUser} />
        {/*{posts.map((post, index) => (
          <Post key={post.id || index} post={post} />
        ))}*/}
      </div>
    </div>
  );
}

export default Feed;