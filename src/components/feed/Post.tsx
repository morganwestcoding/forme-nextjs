// Post.tsx
import React from 'react';
import Avatar from '../ui/avatar'; // Adjust the import based on your project structure

interface PostProps {
    post: {
      id: string;
      user?: {
        name: string;
        image: string;
      };
      createdAt: string;
      content: string;
      photo?: string;
      location?: string;
    };
  }

  const Post: React.FC<PostProps> = ({ post }) => {
    // ... rest of your component
 
  return (
    <div className='w-full rounded-lg shadow-md bg-[#ffffff] bg-opacity-70 dark:shadow-lg dark:border dark:border-gray-600 p-4'>
      <div className="flex items-center">
        <Avatar src={post.user?.image} /> {/* Adjust as per your user data structure */}
        <div className="ml-4">
          <div className="font-semibold">{post.user?.name}</div>
          <div className="text-sm text-gray-500">{post.createdAt}</div>
        </div>
      </div>
      <div className="mt-4">
        <p>{post.content}</p>
        {post.photo && <img src={post.photo} alt="Post" className="mt-2 max-h-60 w-full object-cover rounded-lg" />}
        {post.location && <div className="text-sm mt-2">Location: {post.location}</div>}

      </div>
    </div>
  );
};

export default Post;
