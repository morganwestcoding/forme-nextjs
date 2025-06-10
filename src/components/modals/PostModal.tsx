// === 3. PostModal.tsx ===
'use client';

import React from 'react';
import usePostModal from '@/app/hooks/usePostModal';
import Image from 'next/image';
import { format } from 'date-fns';

const PostModal = () => {
  const postModal = usePostModal();
  const post = postModal.post;

  if (!post) return null;

  const formattedDate = format(new Date(post.createdAt), 'PPP');
  const hasComments = Array.isArray(post.comments);

  return (
    <div
      className="
        fixed inset-0 z-50 flex items-center justify-center bg-neutral-800/90
      "
    >
      <div
        className="
          relative w-full max-w-6xl h-[80vh] flex bg-transparent rounded-xl overflow-hidden
        "
      >
        {/* Left: Video/Image + Stats */}
        <div className="flex-1 bg-black relative flex items-center justify-center">
          {post.mediaUrl ? (
            post.mediaType === 'video' ? (
              <video
                src={post.mediaUrl}
                controls
                className="max-h-full max-w-full"
              />
            ) : (
              <Image
                src={post.mediaUrl}
                alt="Post media"
                width={800}
                height={800}
                className="object-contain"
              />
            )
          ) : (
            <p className="text-white p-4">{post.content}</p>
          )}
          <div className="absolute bottom-4 left-4 text-white">
            <p className="font-semibold">{post.user.name}</p>
            <p className="text-sm">{formattedDate}</p>
            <p className="mt-2 max-w-md break-words text-white/80">{post.content}</p>
          </div>
        </div>

        {/* Right: Comments */}
        <div className="w-[360px] bg-white overflow-y-auto border-l border-gray-200">
          <div className="p-4 border-b font-semibold text-gray-800">
            Comments ({hasComments ? post.comments.length : 0})
          </div>
          <div className="divide-y">
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

        {/* Close Button */}
        <button
          onClick={postModal.onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/70 text-white rounded-full hover:bg-black"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default PostModal;
