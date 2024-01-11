// Feed.tsx
'use client'

import React, { useEffect, useState } from 'react';
import Post from "./Post";
import Share from "./Share";
import axios from 'axios'; // Make sure axios is installed

export default function Feed() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    axios.get('/api/post') // Adjust the endpoint as needed
      .then(response => setPosts(response.data))
      .catch(error => console.error('Error fetching posts:', error));
  }, []);

  return (
    <div className="bg-transparent pt-8 pl-16">
      <div className="padding: 20px">
        <Share />
        {posts.map((post, index) => (
          <Post key={post.id || index} post={post} /> // Fallback to index if id is not present
        ))}
      </div>
    </div>
  );
}
