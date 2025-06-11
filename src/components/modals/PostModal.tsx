// === 3. PostModal.tsx ===
'use client';

import React from 'react';
import usePostModal from '@/app/hooks/usePostModal';
import Image from 'next/image';
import { format } from 'date-fns';
import { MessageCircle, Heart, Bookmark, Share2 } from 'lucide-react';
import ListingCard from '@/components/listings/ListingCard';
import ShopCard from '@/components/shop/ShopCard';
import Avatar from '@/components/ui/avatar';
import { SafeListing, SafeShop } from '@/app/types';

const PostModal = () => {
  const postModal = usePostModal();
  const post = postModal.post;

  if (!post) return null;

  const formattedDate = format(new Date(post.createdAt), 'PPP');
  const hasComments = Array.isArray(post.comments);

  const postType = (post as any).postType || 'text';
  const isAd = postType === 'ad';
  const isText = postType === 'text';

  const listingAd = (post as any).listing as SafeListing | undefined;
  const shopAd = (post as any).shop as SafeShop | undefined;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-neutral-800/90" onClick={postModal.onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className={`
            relative ${isText ? 'bg-white' : 'bg-black'} rounded-3xl overflow-hidden shadow-xl
            ${isAd ? 'w-[420px] h-[640px]' : 'w-[384px] h-[480px]'}
            flex flex-col justify-between
          `}
        >
          {isAd ? (
            listingAd ? (
              <ListingCard data={listingAd} currentUser={post.user} />
            ) : shopAd ? (
              <ShopCard data={shopAd} currentUser={post.user} />
            ) : null
          ) : post.mediaUrl ? (
            post.mediaType === 'video' ? (
              <video
                src={post.mediaUrl}
                controls
                className="w-full h-full object-cover"
              />
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
            <div className='border border-white rounded-full '>
            <Avatar src={post.user.image ?? undefined} />
            </div>
            <div className="flex flex-col items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none">
                <path d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-xs">{post.likes?.length || 0}</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <MessageCircle className="w-6 h-6" />
              <span className="text-xs">{post.comments?.length || 0}</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <Bookmark className="w-6 h-6" />
              <span className="text-xs">{post.bookmarks?.length || 0}</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <Share2 className="w-6 h-6" />
              <span className="text-xs">1</span>
            </div>
          </div>
        )}

        {!isAd && (
          <div className="fixed top-0 right-0 h-full w-[360px] z-50 bg-white shadow-xl border-l border-gray-200">
            <div className="p-4 border-b font-semibold text-gray-800">
              Comments ({hasComments ? post.comments.length : 0})
            </div>
            <div className="h-full overflow-y-auto divide-y">
              {hasComments && post.comments.map((comment) => (
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
                    <p className="text-xs text-gray-400 mt-1">
                      {format(new Date(comment.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PostModal;
