'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import axios from 'axios';

import usePostModal from '@/app/hooks/usePostModal';
import Avatar from '@/components/ui/avatar';
import ListingCard from '@/components/listings/ListingCard';
import ShopCard from '@/components/shop/ShopCard';
import { SafeListing, SafeShop } from '@/app/types';

const PostModal = () => {
  const postModal = usePostModal();
  const post = postModal.post;
  const currentUser = postModal.currentUser;

  const [likes, setLikes] = useState<string[]>(post?.likes || []);
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userId = useMemo(() => currentUser?.id, [currentUser]);

  useEffect(() => {
    if (post && userId) {
      setLikes(post.likes || []);
      setLiked(post.likes.includes(userId));
    }
  }, [post?.id, userId]);

const handleLike = async () => {
  if (!post || !userId) return;

  // Optimistically update
  const hasLiked = likes.includes(userId);
  const updatedLikes = hasLiked
    ? likes.filter(id => id !== userId)
    : [...likes, userId];

  setLikes(updatedLikes);
  setLiked(!hasLiked);

  try {
    // Call backend
    await axios.post(`/api/postActions/${post.id}/like`);

    // Re-sync with updated data
    const res = await axios.get(`/api/posts/${post.id}`);
    const freshPost = res.data;

    setLikes(freshPost.likes);
    setLiked(freshPost.likes.includes(userId));
    postModal.setPost?.(freshPost);
  } catch (error) {
    console.error('Failed to toggle like:', error);
  }
};



const handleCommentSubmit = async () => {
  if (!comment.trim() || !currentUser || !post) return;

  setIsSubmitting(true);

  try {
    await axios.post(`/api/postActions/${post.id}/comment`, {
      content: comment.trim()
    });

    setComment('');

    // ✅ Re-fetch to get updated comment list
    const res = await axios.get(`/api/posts/${post.id}`);
    postModal.setPost?.(res.data);
  } catch (error) {
    console.error('Failed to submit comment:', error);
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
        <div
          className={`relative ${isText ? 'bg-white' : 'bg-black'} rounded-3xl overflow-hidden shadow-xl
            ${isAd ? 'w-[520px] h-[840px]' : 'w-[425px] h-[700px]'}
            flex flex-col justify-between`}
        >
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
              <Image
                src={post.mediaUrl}
                alt="Post media"
                width={384}
                height={384}
                className="object-cover"
              />
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
                {!isText && (
                  <p className="mt-2 whitespace-pre-line break-words text-white">
                    {post.content}
                  </p>
                )}
              </div>
            </div>
          )}

          <button
            onClick={postModal.onClose}
            className="absolute top-2 right-2 z-10 p-2 bg-black/60 text-white rounded-full hover:bg-black"
          >
            ×
          </button>
        </div>

        {!isAd && (
          <div className="ml-6 flex flex-col items-center gap-6 text-white">
            <div className="border border-white rounded-full">
              <Avatar src={post.user.image ?? undefined} />
            </div>

            <div className="flex flex-col items-center gap-2">
              <button onClick={handleLike} className="transition hover:scale-110">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill={liked ? '#f87171' : 'none'}
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-200"
                >
                  <path d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z" />
                </svg>
              </button>
              <span className="text-xs">{likes.length}</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <button onClick={() => setShowComments(!showComments)} className="transition hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path d="M8 13.5H16M8 8.5H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M6.5 17.5C6.29454 18.5019 5.37769 20.6665 6.31569 21.3651C6.806 21.7218 7.58729 21.3408 9.14987 20.5789C10.2465 20.0441 11.3562 19.4309 12.5546 19.155C12.9931 19.0551 13.4395 19.0125 14 19C17.7712 19 19.6569 19 20.8284 17.8284C22 16.6569 22 14.7712 22 11V10.5C22 6.72876 22 4.84315 20.8284 3.67157C19.6569 2.5 17.7712 2.5 14 2.5H10C6.22876 2.5 4.34315 2.5 3.17157 3.67157C2 4.84315 2 6.72876 2 10.5V11C2 14.7712 2 16.6569 3.17157 17.8284C3.82475 18.4816 4.7987 18.8721 6.09881 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
              <span className="text-xs">{post.comments?.length || 0}</span>
            </div>
          </div>
        )}

        {/* Comments Slideout */}
        {!isAd && (
          <div className={`
            fixed top-0 right-0 h-full w-[400px] z-50 bg-white shadow-xl border-l border-gray-200
            transform transition-transform duration-300 ease-in-out
            ${showComments ? 'translate-x-0' : 'translate-x-full'}
          `}>
            <div className="p-4 border-b font-semibold text-gray-800 flex justify-between items-center">
              Comments ({post.comments?.length || 0})
              <button onClick={() => setShowComments(false)} className="text-sm text-gray-500 hover:text-gray-700">Close</button>
            </div>
            <div className="h-[calc(100%-112px)] overflow-y-auto divide-y">
              {post.comments?.map((comment) => (
                <div key={comment.id} className="flex gap-3 p-4 items-start">
                  <Image
                    src={comment.user.image || '/images/placeholder.jpg'}
                    alt={comment.user.name || 'User'}
                    width={36}
                    height={36}
                    className="rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold">{comment.user.name}</p>
                    <p className="text-sm text-gray-600">{comment.content}</p>
                    <p className="text-xs text-gray-400 mt-1">{format(new Date(comment.createdAt), 'MMM d, yyyy')}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t flex gap-2">
              <input
                type="text"
                placeholder="Write a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm outline-none"
              />
              <button
                onClick={handleCommentSubmit}
                disabled={isSubmitting}
                className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm hover:bg-blue-600 disabled:opacity-50"
              >
                Post
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PostModal;
