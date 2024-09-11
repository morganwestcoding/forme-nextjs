'use client';

import { useState, useCallback, useEffect } from 'react';
import Modal from './Modal';
import Image from 'next/image';
import Avatar from '../ui/avatar';
import { SafeUser, SafeComment } from '@/app/types';
import Link from 'next/link';
import { categories } from "../Categories";
import axios from 'axios';
import { toast } from 'react-hot-toast';

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
  comments: SafeComment[];
  onCommentAdded: (newComment: SafeComment) => void;
  refreshComments: () => void;
}

const PostModal: React.FC<PostModalProps> = ({
  isOpen,
  onClose,
  post,
  currentUser,
  onLike,
  onBookmark,
  comments,
  onCommentAdded,
  refreshComments
}) => {
  const [formattedDate] = useState<string>(
    new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  );
  const [comment, setComment] = useState('');

  const isLiked = currentUser ? post.likes.includes(currentUser.id) : false;
  const isBookmarked = currentUser ? post.bookmarks.includes(currentUser.id) : false;

  useEffect(() => {
    if (isOpen) {
      refreshComments();
    }
  }, [isOpen, refreshComments]);

  const handleSubmitComment = useCallback(async () => {
    if (!comment.trim()) return;
  
    try {
      const response = await axios.post('/api/comments', {
        content: comment,
        postId: post.id,
      });
      const newComment: SafeComment = response.data;
      onCommentAdded(newComment);
      setComment('');
      toast.success('Comment added successfully');
      refreshComments();
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error('Failed to add comment');
    }
  }, [comment, post.id, onCommentAdded, refreshComments]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmitComment();
    }
  };

  const getColorByCategory = (categoryName: string) => {
    const category = categories.find(cat => cat.label === categoryName);
    if (!category) return { bgColorClass: 'bg-gray-200', textColorClass: 'text-gray-200', borderColorClass: 'border-gray-200' };

    switch (category.color) {
      case 'bg-yellow-200':
        return { bgColorClass: 'bg-yellow-200', textColorClass: 'text-yellow-200', borderColorClass: 'border-yellow-200' };
      case 'bg-rose-200':
        return { bgColorClass: 'bg-rose-200', textColorClass: 'text-rose-200', borderColorClass: 'border-rose-200' };
      case 'bg-orange-300':
        return { bgColorClass: 'bg-orange-300', textColorClass: 'text-orange-300', borderColorClass: 'border-orange-300' };
      case 'bg-teal-500':
        return { bgColorClass: 'bg-teal-500', textColorClass: 'text-teal-500', borderColorClass: 'border-teal-500' };
      case 'bg-emerald-600':
        return { bgColorClass: 'bg-emerald-600', textColorClass: 'text-emerald-600', borderColorClass: 'border-emerald-600' };
      case 'bg-cyan-600':
        return { bgColorClass: 'bg-cyan-600', textColorClass: 'text-cyan-600', borderColorClass: 'border-cyan-600' };
      case 'bg-blue-800':
        return { bgColorClass: 'bg-blue-800', textColorClass: 'text-blue-800', borderColorClass: 'border-blue-800' };
      case 'bg-indigo-800':
        return { bgColorClass: 'bg-indigo-800', textColorClass: 'text-indigo-800', borderColorClass: 'border-indigo-800' };
      default:
        return { bgColorClass: 'bg-gray-200', textColorClass: 'text-gray-200', borderColorClass: 'border-gray-200' };
    }
  };

  const categoryColors = getColorByCategory(post.category);

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
            <div className="font-medium pr-1 text-sm text-white mb-2">{post.user.name}</div>
            <div className="text-sm text-gray-400 mb-2">{formattedDate}</div>
          </div>
          <div className="flex items-center">
            <span className={`w-8 h-5 rounded text-white drop-shadow-sm shadow-sm flex items-center justify-center text-xs ${categoryColors.bgColorClass}`}>
              {post.category.charAt(0).toUpperCase()}
            </span>
            {post.location && (
              <div className="text-sm text-gray-400 ml-2">{post.location}</div>
            )}
          </div>
        </div>
      </div>
      <p className='text-sm mb-4 text-white'>{post.content}</p>
      {post.imageSrc && (
        <div className="rounded-lg overflow-hidden relative mb-4">
          <Image src={post.imageSrc} alt="Post Image" layout='responsive' objectFit="cover" width={500} height={300} />
        </div>
      )}
      <div className="flex space-x-4 mb-4">
        <button onClick={onLike} className={`flex items-center ${isLiked ? 'text-blue-500' : 'text-gray-400'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
          {post.likes.length}
        </button>
        <button onClick={onBookmark} className={`flex items-center ${isBookmarked ? 'text-blue-500' : 'text-gray-400'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
          </svg>
          {post.bookmarks.length}
        </button>
      </div>
      <div className="border-t border-white -mx-6"></div>
      <div className="pt-4">
        <h3 className="font-medium mb-2 text-white">Comments</h3>
        <div className="max-h-60 overflow-y-auto mb-4">
        {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="flex items-start mb-4">
                <Avatar src={comment.user.image ?? undefined} />
                <div className="ml-3 flex flex-col">
                  <div className="font-medium text-sm text-white">{comment.user.name}</div>
                  <p className="text-sm text-gray-300">{comment.content}</p>
                  <div className="text-xs text-gray-400">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-400">No comments yet.</p>
          )}
        </div>
        <input 
          type="text" 
          placeholder="Add a comment..." 
          className="w-full bg-gray-700 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
        />
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmitComment}
      title="Comments"
      body={bodyContent}
      actionLabel="Submit"
    />
  );
};

export default PostModal;