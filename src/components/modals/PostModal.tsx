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
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const [formattedDate] = useState<string>(formatDate(post.createdAt));
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLiked = currentUser ? post.likes.includes(currentUser.id) : false;
  const isBookmarked = currentUser ? post.bookmarks.includes(currentUser.id) : false;

  useEffect(() => {
    if (isOpen) {
      refreshComments();
    }
  }, [isOpen, refreshComments]);

  const handleSubmitComment = useCallback(async () => {
    if (!comment.trim() || isSubmitting) return;
    if (!currentUser) {
      toast.error('You must be logged in to comment');
      return;
    }

    setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
  }, [comment, post.id, currentUser, onCommentAdded, refreshComments, isSubmitting]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  }, [handleSubmitComment]);

  const categoryColor = categories.find(cat => cat.label === post.category)?.color || 'bg-gray-200';

  const bodyContent = (
    <div className="flex flex-col max-h-[80vh] relative">
      {/* Header - User info */}
      <div className="flex items-center mb-4">
        <Link href={`/profile/${post.user.id}`} passHref>
          <div className='drop-shadow'>
            <Avatar src={post.user.image || undefined} />
          </div>
        </Link>
        <div className="ml-3 flex flex-col">
          <div className="flex items-center">
            <div className="font-medium pr-1 text-sm text-white mb-2">{post.user.name}</div>
            <div className="text-sm text-gray-400 mb-2"> · {formattedDate}</div>
          </div>
          <div className="flex items-center">
            {post.location && (
              <div className="text-sm text-gray-400 mr-2">{post.location}</div>
            )}
            <span className={`ml-2 w-8 h-5 rounded text-white drop-shadow-sm shadow-sm flex items-center justify-center text-xs ${categoryColor}`}>
              {post.category.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>
  
      {/* Post content */}
      <p className='text-sm mb-4 text-white'>{post.content}</p>
  
      {/* Post Image */}
      {post.imageSrc && (
        <div className="rounded-lg overflow-hidden relative w-full h-64 mb-4">
          <Image 
            src={post.imageSrc} 
            alt="Post Image" 
            layout='fill'
            objectFit="cover"
            className="transition-transform duration-300 ease-in-out hover:scale-105"
          />
        </div>
      )}
  
      {/* Like/Bookmark buttons */}
      <div className="flex space-x-4 mb-4">
        <button onClick={onLike} className={`flex items-center ${isLiked ? 'text-blue-500' : 'text-gray-400'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="17" height="17" color={isLiked ? "#a2a2a2" : "#a2a2a2"} fill={isLiked ? "#b1dafe" : "none"}>
            <path d="M2 12.5C2 11.3954 2.89543 10.5 4 10.5C5.65685 10.5 7 11.8431 7 13.5V17.5C7 19.1569 5.65685 20.5 4 20.5C2.89543 20.5 2 19.6046 2 18.5V12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M15.4787 7.80626L15.2124 8.66634C14.9942 9.37111 14.8851 9.72349 14.969 10.0018C15.0369 10.2269 15.1859 10.421 15.389 10.5487C15.64 10.7065 16.0197 10.7065 16.7791 10.7065H17.1831C19.7532 10.7065 21.0382 10.7065 21.6452 11.4673C21.7145 11.5542 21.7762 11.6467 21.8296 11.7437C22.2965 12.5921 21.7657 13.7351 20.704 16.0211C19.7297 18.1189 19.2425 19.1678 18.338 19.7852C18.2505 19.8449 18.1605 19.9013 18.0683 19.9541C17.116 20.5 15.9362 20.5 13.5764 20.5H13.0646C10.2057 20.5 8.77628 20.5 7.88814 19.6395C7 18.7789 7 17.3939 7 14.6239V13.6503C7 12.1946 7 11.4668 7.25834 10.8006C7.51668 10.1344 8.01135 9.58664 9.00069 8.49112L13.0921 3.96056C13.1947 3.84694 13.246 3.79012 13.2913 3.75075C13.7135 3.38328 14.3652 3.42464 14.7344 3.84235C14.774 3.8871 14.8172 3.94991 14.9036 4.07554C15.0388 4.27205 15.1064 4.37031 15.1654 4.46765C15.6928 5.33913 15.8524 6.37436 15.6108 7.35715C15.5838 7.46692 15.5488 7.5801 15.4787 7.80626Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="ml-2">{post.likes.length}</span>
        </button>
        <button onClick={onBookmark} className={`flex items-center ${isBookmarked ? 'text-blue-500' : 'text-gray-400'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="17" height="17" color={isBookmarked ? "#a2a2a2" : "#a2a2a2"} fill={isBookmarked ? "#b1dafe" : "none"}>
            <path d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="ml-2">{post.bookmarks.length}</span>
        </button>
      </div>
  
      <div className="border-t border-gray-600 -mx-6"></div>
  
      {/* Comments section - Scrollable */}
      <div className="flex-1 overflow-y-auto mb-4">
        <h3 className="font-medium my-2 text-white">Comments</h3>
        {comments && comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex items-start mb-4 last:mb-0">
              <Avatar src={comment.user?.image || undefined} />
              <div className="ml-3 flex flex-col">
                <div className="flex items-center">
                  <div className="font-medium text-sm text-white">
                    {comment.user?.name || 'Anonymous'}
                  </div>
                  <div className="text-sm text-gray-400 ml-1"> · {formatDate(comment.createdAt)}</div>
                </div>
                <p className="text-sm text-gray-300">{comment.content}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400">No comments yet.</p>
        )}
      </div>
  
      {/* Comment input - Fixed at bottom */}
      <div className="sticky bottom-0 bg-[#1e1e1e] pt-2">
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Add a comment..." 
            className="w-full bg-gray-700 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSubmitting}
          />
          <button
            onClick={handleSubmitComment}
            disabled={!comment.trim() || isSubmitting}
            className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition"
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmitComment}
      title="Post"
      body={bodyContent}
    />
  );
};

export default PostModal;