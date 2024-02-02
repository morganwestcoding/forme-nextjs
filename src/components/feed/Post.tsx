'use client'
import React from 'react';
import Avatar from '../ui/avatar'; // Adjust the import based on your project structure
import { SafeUser } from '@/app/types';
import { Button } from '../ui/button';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface PostData {
  user: SafeUser; // Assuming SafeUser has a name or username field
  createdAt: string; // Date string
  content: string;
  imageSrc: string | undefined;// Optional image source
  category: string; // Category name
  location?:string
}

interface PostProps {
  post: PostData;
  currentUser: SafeUser | null;
}


const Post: React.FC<PostProps> = ({ post, currentUser }) => {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    const formatCreatedAt = (createdAt: string) => {
      const postDate = new Date(createdAt);
      const now = new Date();
      const differenceInSeconds = (now.getTime() - postDate.getTime()) / 1000;

      if (differenceInSeconds < 60) {
        return `${differenceInSeconds} seconds ago`;
      } else if (differenceInSeconds < 3600) {
        return `${Math.floor(differenceInSeconds / 60)} minutes ago`;
      } else if (differenceInSeconds < 86400) {
        return `${Math.floor(differenceInSeconds / 3600)} hours ago`;
      } else {
        // Format date to "Month Day"
        return postDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
      }
    };

    setFormattedDate(formatCreatedAt(post.createdAt));
  }, [post.createdAt]);

  return (
    <div className='w-full h-auto rounded-lg drop-shadow bg-[#ffffff] bg-opacity-80 p-6 mr-8 my-6 relative'>
      <div className="flex items-center">
        <Button variant="outline" size="icon" className='bg-white drop-shadow-sm bg-opacity-100'>
          <Avatar src={post.user.image} />
        </Button>
        <div className="ml-2 flex flex-col">
          <div className="ml-2 flex items-center">
            <div className="font-semibold pr-1 text-sm">{post.user.name}</div>
            <div className="text-sm text-gray-500">{formattedDate || 'Loading time...'}</div>
          </div>
          <div className="text-sm text-gray-500 ml-2">{post.location}</div>
        </div>
      </div>

      {/*Image*/}
      <div className=" pl-1 mt-3">
        <p className='text-sm'>{post.content}</p>
        {post.imageSrc && (
          <div className="mt-3 mb-4 rounded-md drop-shadow-sm " style={{ maxWidth: '100%', overflow: 'hidden', position: 'relative' }}>
          <Image src={post.imageSrc} alt="Post Image" layout='responsive' objectFit="contain" width={500} height={300} />
        </div>
        )}

        {/* Bottom */}
        <div className="flex justify-start items-center"> {/* Adjusted class here for left alignment */}
          <div className="flex items-center bg-white p-2 rounded-lg drop-shadow-sm">
            <Image src="/icons/arrow-up-3.svg" alt="camera" width={26} height={26} className='mr-2 drop-shadow-sm'/>
            <Image src="/icons/arrow-down-1.svg" alt="camera" width={26} height={26} className=' drop-shadow-sm'/>
          </div>
          <div className="relative inline-block ml-4"> {/* Added margin left for spacing */}
            <div className='rounded-xl text-sm bg-white drop-shadow-sm border border-black p-3 py-1'>
                {post.category}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;
