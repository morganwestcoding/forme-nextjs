'use client';

import { useState, useCallback, useEffect } from 'react';
import Modal from './Modal';
import Image from 'next/image';
import Avatar from '../ui/avatar';
import { SafeUser, SafeComment, MediaType } from '@/app/types';
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
    mediaUrl?: string | null;
    mediaType?: MediaType | null;
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
    const postDate = new Date(dateString);
    const now = new Date();
    const differenceInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

    if (differenceInSeconds < 60) {
      return `${differenceInSeconds} seconds ago`;
    } else if (differenceInSeconds < 3600) {
      return `${Math.floor(differenceInSeconds / 60)} minutes ago`;
    } else if (differenceInSeconds < 86400) {
      return `${Math.floor(differenceInSeconds / 3600)} hours ago`;
    } else {
      return postDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const [formattedDate, setFormattedDate] = useState<string>(formatDate(post.createdAt));
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLiked = currentUser ? post.likes.includes(currentUser.id) : false;
  const isBookmarked = currentUser ? post.bookmarks.includes(currentUser.id) : false;

  useEffect(() => {
    if (isOpen) {
      refreshComments();
    }
    
    // Update formatted date periodically
    const updateFormattedDate = () => {
      setFormattedDate(formatDate(post.createdAt));
    };
    
    const timer = setInterval(updateFormattedDate, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, [isOpen, refreshComments, post.createdAt]);

  const categoryColor = categories.find(cat => cat.label === post.category)?.color || 'bg-[#60A5FA]';
  const badgeColor = categoryColor.replace('bg-[', '').replace(']', '') || '#60A5FA';

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

  const renderMedia = () => {
    if (post.imageSrc) {
      return (
        <div className="rounded-lg overflow-hidden relative aspect-video w-full mb-4">
          <Image 
            src={post.imageSrc} 
            alt="Post Image"
            fill
            className="object-cover transition-transform duration-300 ease-in-out hover:scale-105"
          />
        </div>
      );
    }

    if (post.mediaUrl) {
      switch (post.mediaType) {
        case 'video':
          return (
            <div className="rounded-lg overflow-hidden relative aspect-video w-full mb-4">
              <video 
                src={post.mediaUrl}
                controls
                className="w-full h-full object-cover"
                preload="metadata"
              />
            </div>
          );
        case 'gif':
        case 'image':
          return (
            <div className="rounded-lg overflow-hidden relative aspect-video w-full mb-4">
              <Image 
                src={post.mediaUrl} 
                alt="Post Media"
                fill
                className="object-cover transition-transform duration-300 ease-in-out hover:scale-105"
              />
            </div>
          );
      }
    }

    return null;
  };

  const bodyContent = (
    <div className="flex flex-col max-h-[75vh] relative">
      {/* Header - User info */}
      <div className="flex items-center mb-5">
        <Link href={`/profile/${post.user.id}`} passHref>
          <div className="drop-shadow">
            <Avatar src={post.user.image ?? undefined} />
          </div>
        </Link>
        <div className="ml-3 flex flex-col">
          <div className="flex items-center pb-1">
            <span className="font-medium pr-1 text-sm text-[#484848] flex items-center">
              {post.user.name}
              {post.user.isSubscribed && (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  width="21" 
                  height="21" 
                  className="inline-block ml-1 relative"
                  style={{ color: badgeColor }}
                  fill="none"
                >
                  <path 
                    d="M18.9905 19H19M18.9905 19C18.3678 19.6175 17.2393 19.4637 16.4479 19.4637C15.4765 19.4637 15.0087 19.6537 14.3154 20.347C13.7251 20.9374 12.9337 22 12 22C11.0663 22 10.2749 20.9374 9.68457 20.347C8.99128 19.6537 8.52349 19.4637 7.55206 19.4637C6.76068 19.4637 5.63218 19.6175 5.00949 19C4.38181 18.3776 4.53628 17.2444 4.53628 16.4479C4.53628 15.4414 4.31616 14.9786 3.59938 14.2618C2.53314 13.1956 2.00002 12.6624 2 12C2.00001 11.3375 2.53312 10.8044 3.59935 9.73817C4.2392 9.09832 4.53628 8.46428 4.53628 7.55206C4.53628 6.76065 4.38249 5.63214 5 5.00944C5.62243 4.38178 6.7556 4.53626 7.55208 4.53626C8.46427 4.53626 9.09832 4.2392 9.73815 3.59937C10.8044 2.53312 11.3375 2 12 2C12.6625 2 13.1956 2.53312 14.2618 3.59937C14.9015 4.23907 15.5355 4.53626 16.4479 4.53626C17.2393 4.53626 18.3679 4.38247 18.9906 5C19.6182 5.62243 19.4637 6.75559 19.4637 7.55206C19.4637 8.55858 19.6839 9.02137 20.4006 9.73817C21.4669 10.8044 22 11.3375 22 12C22 12.6624 21.4669 13.1956 20.4006 14.2618C19.6838 14.9786 19.4637 15.4414 19.4637 16.4479C19.4637 17.2444 19.6182 18.3776 18.9905 19Z" 
                    stroke="currentColor" 
                    strokeWidth="1.5"
                  />
                  <path 
                    d="M9 12.8929C9 12.8929 10.2 13.5447 10.8 14.5C10.8 14.5 12.6 10.75 15 9.5" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            <span className="text-sm text-neutral-500">&middot; {formattedDate}</span>
          </div>
          <div className={`flex text-sm items-center ${post.location ? 'text-gray-600' : '-ml-2'}`}>
            {post.location && (
              <span>{post.location}</span>
            )}
            <span 
              className="ml-2 py-2 px-3 rounded-sm text-white flex items-center justify-center text-xs"
              style={{ backgroundColor: badgeColor }}
            >
              {post.category}
            </span>
          </div>
        </div>
      </div>
  
      {/* Post content */}
      <p className='text-sm mb-4 text-[#000000]'>{post.content}</p>
  
      {/* Post Media */}
      {renderMedia()}
  
      {/* Interaction buttons */}
      <div className="flex space-x-4 mb-4">
        <div 
          onClick={onLike} 
          style={{
            background: isLiked ? `linear-gradient(to top right, ${badgeColor}33, ${badgeColor}11)` : '',
            boxShadow: isLiked ? `0 0 12px ${badgeColor}33` : ''
          }}
          className={`flex items-center justify-center p-3 rounded-full cursor-pointer transition-all duration-300 relative
            ${isLiked 
              ? '' 
              : 'bg-gray-50 border border-gray-100 hover:shadow-[0_0_12px_rgba(0,0,0,0.05)]'
            }`}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            width={20} 
            height={20}
            style={{ color: isLiked ? badgeColor : 'rgb(82 82 91)' }}
            fill={isLiked ? badgeColor : "none"}
            stroke="currentColor"
            strokeWidth="1.5"
          >
          <path d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          {post.likes.length > 0 && (
            <span 
              className="absolute -top-1 -right-1 rounded-full min-w-[18px] h-[18px] flex items-center justify-center text-[11px] font-medium text-white shadow-sm"
              style={{ backgroundColor: badgeColor }}
            >
              {post.likes.length}
            </span>
          )}
        </div>

        <div
          onClick={onBookmark}
          style={{
            background: isBookmarked ? `linear-gradient(to top right, ${badgeColor}33, ${badgeColor}11)` : '',
            boxShadow: isBookmarked ? `0 0 12px ${badgeColor}33` : '',
            border: isBookmarked ? 'none' : '1px solid rgb(243 244 246)'
          }}
          className="flex items-center justify-center p-3 rounded-full cursor-pointer transition-all duration-300 relative bg-gray-50"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            width={20} 
            height={20}
            style={{ color: isBookmarked ? badgeColor : 'rgb(82 82 91)' }}
            fill={isBookmarked ? badgeColor : "none"}
            stroke="currentColor"
            strokeWidth="1.5"
          >
          <path d="M4 17.9808V9.70753C4 6.07416 4 4.25748 5.17157 3.12874C6.34315 2 8.22876 2 12 2C15.7712 2 17.6569 2 18.8284 3.12874C20 4.25748 20 6.07416 20 9.70753V17.9808C20 20.2867 20 21.4396 19.2272 21.8523C17.7305 22.6514 14.9232 19.9852 13.59 19.1824C12.8168 18.7168 12.4302 18.484 12 18.484C11.5698 18.484 11.1832 18.7168 10.41 19.1824C9.0768 19.9852 6.26947 22.6514 4.77285 21.8523C4 21.4396 4 20.2867 4 17.9808Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 7H20" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          {post.bookmarks.length > 0 && (
            <span 
              className="absolute -top-1 -right-1 rounded-full min-w-[18px] h-[18px] flex items-center justify-center text-[11px] font-medium text-white shadow-sm"
              style={{ backgroundColor: badgeColor }}
            >
              {post.bookmarks.length}
            </span>
          )}
        </div>
      </div>
  
      <div className="border-t border-gray-200 -mx-6 my-3"></div>
  
      {/* Comments section - Scrollable */}
      <div className="flex-1 overflow-y-auto mb-4 pr-2">
        <h3 className="font-medium my-2 text-[#484848]">Comments</h3>
        {comments && comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex items-start mb-4 last:mb-0 bg-gray-50 p-3 rounded-lg">
              <Avatar src={comment.user?.image ?? undefined} />
              <div className="ml-3 flex flex-col">
                <div className="flex items-center">
                  <div className="font-medium text-sm text-[#484848]">
                    {comment.user?.name || 'Anonymous'}
                  </div>
                  <div className="text-sm text-neutral-500 ml-1"> &middot; {formatDate(comment.createdAt)}</div>
                </div>
                <p className="text-sm text-[#000000] mt-1">{comment.content}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-neutral-500 bg-gray-50 p-4 rounded-lg text-center">
            No comments yet. Be the first to comment!
          </div>
        )}
      </div>
  
      {/* Comment input */}
{/* Comment input */}
<div className="border-t border-gray-200 -mx-6 my-2"></div>
<div className="sticky bottom-0 bg-white pt-2 ">
  <div className="flex items-center gap-2">
    <div className="flex-grow">
      <input 
        type="text" 
        placeholder="Add a comment..." 
        className="w-full bg-gray-100 text-[#484848] rounded-lg px-4 py-3 focus:outline-none text-sm shadow-sm"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={isSubmitting}
      />
    </div>
    <button
      onClick={handleSubmitComment}
      disabled={!comment.trim() || isSubmitting}
      className={`px-5 py-3 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition text-sm flex-shrink-0`}
      style={{ backgroundColor: comment.trim() ? badgeColor : '#E5E7EB' }}
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
      onSubmit={() => {}}
      title=""
      body={bodyContent}
      actionLabel=""
    />
  );
};

export default PostModal;