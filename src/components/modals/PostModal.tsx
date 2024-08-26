'use client';

import { useState, useCallback } from 'react';
import Modal from './Modal';
import Image from 'next/image';
import Avatar from '../ui/avatar';
import { SafeUser } from '@/app/types';
import Link from 'next/link';

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: string;
    user: SafeUser;
    createdAt: string;
    content: string;
    imageSrc: string | null;
    category: string;
    location?: string | null;
    likes: string[];
    bookmarks: string[];
  };
  currentUser: SafeUser | null;
  onLike: () => void;
  onBookmark: () => void;
}

const PostModal: React.FC<PostModalProps> = ({
  isOpen,
  onClose,
  post,
  currentUser,
  onLike,
  onBookmark
}) => {
  const [formattedDate, setFormattedDate] = useState<string>(
    new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  );

  const isLiked = currentUser ? post.likes.includes(currentUser.id) : false;
  const isBookmarked = currentUser ? post.bookmarks.includes(currentUser.id) : false;

  const bodyContent = (
    <div className="flex flex-col">
      <div className="flex items-center mb-4">
        <Link href={`/profile/${post.user.id}`} passHref>
          <div className='drop-shadow'>
            <Avatar src={post.user.image ?? undefined} />
          </div>
        </Link>
        <div className="ml-3 flex flex-col">
          <div className="flex items-center">
            <div className="font-medium pr-1 text-sm">{post.user.name}</div>
            <div className="text-sm text-gray-500">{formattedDate}</div>
          </div>
          {post.location && (
            <div className="text-sm text-gray-600">{post.location}</div>
          )}
        </div>
      </div>
      <p className='text-sm mb-4'>{post.content}</p>
      {post.imageSrc && (
        <div className="rounded-lg overflow-hidden relative mb-4">
          <Image src={post.imageSrc} alt="Post Image" layout='responsive' objectFit="cover" width={500} height={300} />
        </div>
      )}
      <div className="flex space-x-4">
        <button onClick={onLike} className={`flex items-center ${isLiked ? 'text-blue-500' : 'text-gray-500'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
          {post.likes.length}
        </button>
        <button onClick={onBookmark} className={`flex items-center ${isBookmarked ? 'text-blue-500' : 'text-gray-500'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
          </svg>
          {post.bookmarks.length}
        </button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onClose}
      title={post.category}
      body={bodyContent}
      actionLabel="Close"
    />
  );
};

export default PostModal;