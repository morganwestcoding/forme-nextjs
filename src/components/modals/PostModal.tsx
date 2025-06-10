// === 3. PostModal.tsx ===
'use client';

import React from 'react';
import usePostModal from '@/app/hooks/usePostModal';
import Image from 'next/image';
import { format } from 'date-fns';
import { MessageCircle, Heart, Bookmark, Share2 } from 'lucide-react';

const PostModal = () => {
  const postModal = usePostModal();
  const post = postModal.post;

  if (!post) return null;

  const formattedDate = format(new Date(post.createdAt), 'PPP');
  const hasComments = Array.isArray(post.comments);

  return (
    <>
      {/* Dark Backdrop */}
      <div className="fixed inset-0 z-40 bg-neutral-800/90" onClick={postModal.onClose} />

      {/* Fullscreen Layout */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Post Content Centered */}
        <div
          className="
            relative bg-black rounded-3xl overflow-hidden shadow-xl
            w-[420px] h-[640px] flex flex-col justify-between
          "
        >
          {post.mediaUrl ? (
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
          ) : (
            <p className="text-white p-4 text-sm leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          )}

          <div className="text-white px-4 py-3">
            <p className="text-sm font-semibold">{post.user.name}</p>
            <p className="text-xs text-gray-300">{formattedDate}</p>
            <p className="text-sm text-white mt-2 whitespace-pre-line break-words">
              {post.content}
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={postModal.onClose}
            className="absolute top-2 right-2 z-10 p-2 bg-black/60 text-white rounded-full hover:bg-black"
          >
            ×
          </button>
        </div>

        {/* Stats Bar */}
        <div className="ml-6 flex flex-col items-center gap-6 text-white">
          <Image
            src={post.user.image || '/images/placeholder.jpg'}
            alt={post.user.name || 'User'}
            width={48}
            height={48}
            className="rounded-full border-2 border-white"
          />

          <div className="flex flex-col items-center gap-2">
            <Heart className="w-6 h-6" />
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

        {/* Comments Panel */}
        <div
          className="
            fixed top-0 right-0 h-full w-[360px] z-50 bg-white shadow-xl border-l border-gray-200
          "
        >
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
      </div>
    </>
  );
};

export default PostModal;
