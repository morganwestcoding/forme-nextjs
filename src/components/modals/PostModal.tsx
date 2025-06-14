'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import axios from 'axios';

import usePostModal from '@/app/hooks/usePostModal';
import Avatar from '@/components/ui/avatar';
import ListingCard from '@/components/listings/ListingCard';
import ShopCard from '@/components/shop/ShopCard';
import { SafeListing, SafeShop, SafeComment } from '@/app/types';
import { usePostStore } from '@/app/hooks/usePostStore';

const PostModal = () => {
  const postModal = usePostModal();
  const post = postModal.post;
  const currentUser = postModal.currentUser;
  
  // Add store access for updating posts
  const { posts, updatePost } = usePostStore();

  const [likes, setLikes] = useState<string[]>([]);
  const [liked, setLiked] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [bookmarked, setBookmarked] = useState(false);
  const [comments, setComments] = useState<SafeComment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showShareSuccess, setShowShareSuccess] = useState(false);

  const userId = useMemo(() => currentUser?.id, [currentUser]);

  useEffect(() => {
    if (post && userId) {
      setLikes(post.likes || []);
      setLiked(post.likes.includes(userId));
      setBookmarks(post.bookmarks || []);
      setBookmarked(post.bookmarks.includes(userId));
      
      // Enhanced comment loading with debugging
      console.log('Loading comments for post:', post.id);
      console.log('Post comments from props:', post.comments);
      setComments(post.comments || []);
    }
  }, [post?.id, userId, post?.likes, post?.bookmarks, post?.comments]);

  const handleLike = async () => {
    if (!post || !userId) return;

    const hasLiked = likes.includes(userId);
    const updatedLikes = hasLiked
      ? likes.filter(id => id !== userId)
      : [...likes, userId];

    try {
      // Optimistic UI update
      setLikes(updatedLikes);
      setLiked(!hasLiked);

      // Update the post in the global store immediately
      updatePost(post.id, {
        likes: updatedLikes,
        bookmarks: bookmarks,
        comments: comments
      });

      // Update the modal's post data immediately
      const updatedPost = { ...post, likes: updatedLikes };
      postModal.setPost?.(updatedPost);

      // Make the API call
      await axios.post(`/api/postActions/${post.id}/like`);
      
      console.log('Like API call successful');
      
    } catch (error) {
      console.error('Failed to toggle like:', error);
      
      // Revert optimistic update on error
      const originalLikes = post.likes || [];
      setLikes(originalLikes);
      setLiked(originalLikes.includes(userId));
      
      // Revert store update
      updatePost(post.id, {
        likes: originalLikes,
        bookmarks: bookmarks,
        comments: comments
      });
      
      // Revert modal update
      postModal.setPost?.({ ...post, likes: originalLikes });
    }
  };

  const handleBookmark = async () => {
    if (!post || !userId) return;

    const hasBookmarked = bookmarks.includes(userId);
    const updatedBookmarks = hasBookmarked
      ? bookmarks.filter(id => id !== userId)
      : [...bookmarks, userId];

    try {
      // Optimistic UI update
      setBookmarks(updatedBookmarks);
      setBookmarked(!hasBookmarked);

      // Update the post in the global store immediately
      updatePost(post.id, {
        likes: likes,
        bookmarks: updatedBookmarks,
        comments: comments
      });

      // Update the modal's post data immediately
      const updatedPost = { ...post, bookmarks: updatedBookmarks };
      postModal.setPost?.(updatedPost);

      // Make the API call
      await axios.post(`/api/postActions/${post.id}/bookmark`);
      
      console.log('Bookmark API call successful');
      
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      
      // Revert optimistic update on error
      const originalBookmarks = post.bookmarks || [];
      setBookmarks(originalBookmarks);
      setBookmarked(originalBookmarks.includes(userId));
      
      // Revert store update
      updatePost(post.id, {
        likes: likes,
        bookmarks: originalBookmarks,
        comments: comments
      });
      
      // Revert modal update
      postModal.setPost?.({ ...post, bookmarks: originalBookmarks });
    }
  };

  const handleShare = async () => {
    if (!post) return;

    try {
      const postUrl = `${window.location.origin}/post/${post.id}`;
      
      // Try to use the Web Share API first (mobile devices)
      if (navigator.share) {
        await navigator.share({
          title: `Post by ${post.user.name}`,
          text: post.content.length > 100 ? post.content.substring(0, 100) + '...' : post.content,
          url: postUrl,
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(postUrl);
        setShowShareSuccess(true);
        setTimeout(() => setShowShareSuccess(false), 2000);
      }
    } catch (error) {
      console.error('Failed to share:', error);
      // Final fallback - try clipboard anyway
      try {
        await navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
        setShowShareSuccess(true);
        setTimeout(() => setShowShareSuccess(false), 2000);
      } catch (clipboardError) {
        console.error('Clipboard failed too:', clipboardError);
      }
    }
  };

  const handleCommentSubmit = async () => {
    if (!comment.trim() || !currentUser || !post) return;
    
    console.log('Submitting comment:', comment.trim());
    setIsSubmitting(true);

    try {
      // Create optimistic comment
      const optimisticComment: SafeComment = {
        id: `temp-${Date.now()}`, // Temporary ID
        content: comment.trim(),
        createdAt: new Date().toISOString(),
        userId: currentUser.id,
        postId: post.id,
        user: {
          id: currentUser.id,
          name: currentUser.name || 'You',
          image: currentUser.image
        }
      };

      // Optimistic UI update
      const updatedComments = [...comments, optimisticComment];
      setComments(updatedComments);
      setComment('');

      // Make the API call to your existing endpoint
      const response = await axios.post(`/api/postActions/${post.id}/comment`, {
        content: comment.trim()
      });
      
      console.log('Comment API response:', response.data);
      
      // Fetch fresh post data using your existing endpoint (no 's' in post)
      const res = await axios.get(`/api/post/${post.id}`);
      const updatedPost = res.data;
      
      console.log('Updated post with new comment:', updatedPost);
      
      // Update local state with real data
      setComments(updatedPost.comments || []);
      setLikes(updatedPost.likes || []);
      setBookmarks(updatedPost.bookmarks || []);
      
      // Update the modal's post data
      postModal.setPost?.(updatedPost);
      
      // Update the post in the global store
      updatePost(post.id, {
        likes: updatedPost.likes,
        bookmarks: updatedPost.bookmarks,
        comments: updatedPost.comments
      });
      
    } catch (error) {
      console.error('Failed to submit comment:', error);
      
      // Revert optimistic update on error
      setComments(comments);
      setComment(comment.trim()); // Restore the comment text
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!post) return null;

  const formattedDate = format(new Date(post.createdAt), 'PPP');
  const postType = post.postType || 'text';
  const isAd = postType === 'ad';
  const isText = postType === 'text';
  const listingAd = post.listing as SafeListing | undefined;
  const shopAd = post.shop as SafeShop | undefined;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-neutral-800/90" onClick={postModal.onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Modal Content */}
        <div className={`relative ${isText ? 'bg-white' : 'bg-black'} rounded-3xl overflow-hidden shadow-xl ${isAd ? 'w-[520px] h-[840px]' : 'w-[425px] h-[700px]'} flex flex-col justify-between`}>
          {isAd ? (
            listingAd ? (
              <ListingCard data={listingAd} currentUser={post.user} />
            ) : shopAd ? (
              <ShopCard data={shopAd} currentUser={post.user} />
            ) : null
          ) : post.mediaUrl ? (
            post.mediaType === 'video' ? (
              <video src={post.mediaUrl} controls className="w-full h-full object-cover" />
            ) : (
              <Image src={post.mediaUrl} alt="Post media" width={384} height={384} className="object-cover" />
            )
          ) : null}

          {!isAd && (
            <div className={`flex flex-col flex-1 ${isText ? 'text-black bg-white' : 'text-white px-4 py-3'}`}>
              {isText && (
                <div className="flex-1 flex items-center justify-center text-center px-6">
                  <p className="text-base whitespace-pre-line">{post.content}</p>
                </div>
              )}
              <div className="px-6 pb-6">
                <p className="text-sm font-semibold">{post.user.name}</p>
                <p className="text-xs text-gray-400">{formattedDate}</p>
                {!isText && <p className="mt-2 whitespace-pre-line break-words text-white">{post.content}</p>}
              </div>
            </div>
          )}


        </div>

        {/* Sidebar */}
        {!isAd && (
          <div className="ml-6 flex flex-col items-center gap-6 text-white">
            {/* Exit Button */}
            <div className="flex flex-col items-center gap-2">
              <button onClick={postModal.onClose} className="transition hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-200">
                  <path d="M18 6L6.00081 17.9992M17.9992 18L6 6.00085" />
                </svg>
              </button>
              <span className="text-xs">Exit</span>
            </div>

            <div className="border border-white rounded-full">
              <Avatar src={post.user.image ?? undefined} />
            </div>

            {/* Like Button */}
            <div className="flex flex-col items-center gap-2">
              <button onClick={handleLike} className="transition hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={liked ? '#f87171' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-200">
                  <path d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z" />
                </svg>
              </button>
              <span className="text-xs">{likes.length}</span>
            </div>

            {/* Comment Toggle */}
            <div className="flex flex-col items-center gap-2">
              <button 
                onClick={() => {
                  console.log('Comment button clicked, current comments:', comments);
                  setShowComments(!showComments);
                }} 
                className="transition hover:scale-110"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path d="M8 13.5H16M8 8.5H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M6.5 17.5C6.29454 18.5019 5.37769 20.6665 6.31569 21.3651C6.806 21.7218 7.58729 21.3408 9.14987 20.5789C10.2465 20.0441 11.3562 19.4309 12.5546 19.155C12.9931 19.0551 13.4395 19.0125 14 19C17.7712 19 19.6569 19 20.8284 17.8284C22 16.6569 22 14.7712 22 11V10.5C22 6.72876 22 4.84315 20.8284 3.67157C19.6569 2.5 17.7712 2.5 14 2.5H10C6.22876 2.5 4.34315 2.5 3.17157 3.67157C2 4.84315 2 6.72876 2 10.5V11C2 14.7712 2 16.6569 3.17157 17.8284C3.82475 18.4816 4.7987 18.8721 6.09881 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
              <span className="text-xs">{comments.length}</span>
            </div>

            {/* Bookmark Button */}
            <div className="flex flex-col items-center gap-2">
              <button onClick={handleBookmark} className="transition hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={bookmarked ? '#fbbf24' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-200">
                  <path d="M4 17.9808V9.70753C4 6.07416 4 4.25748 5.17157 3.12874C6.34315 2 8.22876 2 12 2C15.7712 2 17.6569 2 18.8284 3.12874C20 4.25748 20 6.07416 20 9.70753V17.9808C20 20.2867 20 21.4396 19.2272 21.8523C17.7305 22.6514 14.9232 19.9852 13.59 19.1824C12.8168 18.7168 12.4302 18.484 12 18.484C11.5698 18.484 11.1832 18.7168 10.41 19.1824C9.0768 19.9852 6.26947 22.6514 4.77285 21.8523C4 21.4396 4 20.2867 4 17.9808Z" />
                </svg>
              </button>
              <span className="text-xs">{bookmarks.length}</span>
            </div>

            {/* Share Button - ONLY NEW ADDITION */}
            <div className="flex flex-col items-center gap-2 relative">
              <button onClick={handleShare} className="transition hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-200">
                  <path d="M10.0017 3C7.05534 3.03208 5.41096 3.21929 4.31838 4.31188C2.99988 5.63037 2.99988 7.75248 2.99988 11.9966C2.99988 16.2409 2.99988 18.363 4.31838 19.6815C5.63688 21 7.75899 21 12.0032 21C16.2474 21 18.3695 21 19.688 19.6815C20.7808 18.5887 20.9678 16.9438 20.9999 13.9963" />
                  <path d="M14 3H18C19.4142 3 20.1213 3 20.5607 3.43934C21 3.87868 21 4.58579 21 6V10M20 4L11 13" />
                </svg>
              </button>
              <span className="text-xs">Share</span>
              
              {/* Success Message */}
              {showShareSuccess && (
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-3 py-1 rounded-full whitespace-nowrap">
                  Link copied!
                </div>
              )}
            </div>
          </div>
        )}

        {/* Slide-Out Comments */}
        {!isAd && (
          <div className={`
            fixed top-0 right-0 h-full w-[400px] z-50 bg-white/95 backdrop-blur-2xl border-l border-gray-200
            transform transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]
            ${showComments ? 'translate-x-0' : 'translate-x-full'}
          `}>
            {/* Clean Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-medium text-gray-900">Comments</h3>
                <span className="text-gray-500 text-sm">({comments.length})</span>
              </div>
              <button 
                onClick={() => setShowComments(false)} 
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-300"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            {/* Comments Feed */}
            <div className="flex-1 overflow-y-auto px-6 py-6 pb-24">
              {comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="w-16 h-16 mb-6 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
                      <path d="M8 13.5H16M8 8.5H12" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M6.09881 19C4.7987 18.8721 3.82475 18.4816 3.17157 17.8284C2 16.6569 2 14.7712 2 11V10.5C2 6.72876 2 4.84315 3.17157 3.67157C4.34315 2.5 6.22876 2.5 10 2.5H14C17.7712 2.5 19.6569 2.5 20.8284 3.67157C22 4.84315 22 6.72876 22 10.5V11C22 14.7712 22 16.6569 20.8284 17.8284C19.6569 21.5 17.7712 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="text-gray-900 font-medium text-lg mb-2">The conversation starts here</p>
                  <p className="text-gray-500 text-sm leading-relaxed">Share your perspective and connect<br />with the community</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {comments.map((comment, index) => (
                    <div key={comment.id} className="group relative">
                      <div className="flex gap-4">
                        <div className="relative">
                          <Avatar src={comment.user.image ?? undefined} />
                          {index !== comments.length - 1 && (
                            <div className="absolute left-1/2 top-12 w-px h-8 bg-gradient-to-b from-gray-300 to-transparent -translate-x-px"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="font-medium text-gray-900 text-sm">{comment.user.name || 'Anonymous'}</span>
                            <div className="flex items-center gap-2 text-gray-500 text-xs">
                              <span>{format(new Date(comment.createdAt), 'MMM d')}</span>
                              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                              <span>{format(new Date(comment.createdAt), 'h:mm a')}</span>
                            </div>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p>
                          
                          {/* Hover Actions */}
                          <div className="flex items-center gap-6 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button className="text-xs text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-2">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                              </svg>
                              Like
                            </button>
                            <button className="text-xs text-gray-500 hover:text-gray-900 transition-colors">
                              Reply
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Bottom Input with Padding */}
            <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 p-6">
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 mt-1">
                  <Avatar src={currentUser?.image ?? undefined} />
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <textarea 
                      placeholder="Share your thoughts..." 
                      value={comment} 
                      onChange={(e) => setComment(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey && !isSubmitting && comment.trim()) {
                          e.preventDefault();
                          handleCommentSubmit();
                        }
                      }}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 pr-16 pb-14 text-sm text-gray-900 placeholder-gray-500 resize-none outline-none focus:border-gray-300 focus:bg-white transition-all duration-300"
                      rows={4}
                      disabled={isSubmitting}
                      style={{
                        minHeight: '120px',
                        maxHeight: '200px'
                      }}
                    />
                    <button 
                      onClick={handleCommentSubmit} 
                      disabled={isSubmitting || !comment.trim()} 
                      className="absolute right-1.5 bottom-3 w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 transition-all duration-200"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PostModal;