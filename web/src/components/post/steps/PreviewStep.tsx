'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { SafeUser } from '@/app/types';
import TypeformHeading from '@/components/registration/TypeformHeading';

interface PreviewStepProps {
  mediaSrc: string;
  mediaType: 'image' | 'video';
  caption: string;
  beforeImageSrc: string;
  currentUser: SafeUser;
  isTextPost?: boolean;
}

const PreviewStep: React.FC<PreviewStepProps> = ({
  mediaSrc,
  caption,
  beforeImageSrc,
  currentUser,
  isTextPost = false,
}) => {
  const [showBefore, setShowBefore] = useState(false);

  const displayImage = showBefore && beforeImageSrc ? beforeImageSrc : mediaSrc;
  const hasBeforeAfter = !!beforeImageSrc && !isTextPost;

  return (
    <div>
      <TypeformHeading
        question="Preview your post"
        subtitle="This is how your post will appear in the feed."
      />

      {/* Card preview */}
      <div className="flex justify-center">
        <div className="relative w-[220px] aspect-square rounded-2xl overflow-hidden shadow-lg">
          {isTextPost ? (
            <>
              {/* Soft gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-stone-100 via-neutral-50 to-white" />

              {/* Subtle pattern overlay */}
              <div
                className="absolute inset-0 opacity-[0.3]"
                style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, #a8a29e 0.5px, transparent 0)`,
                  backgroundSize: '16px 16px',
                }}
              />

              {/* Text content */}
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <p className="text-neutral-800 text-[13px] leading-relaxed font-medium text-center line-clamp-6 break-words whitespace-pre-wrap">
                  {caption}
                </p>
              </div>

              {/* Quote mark accent */}
              <div className="absolute top-3 left-3 text-stone-300 text-3xl font-serif leading-none select-none">
                "
              </div>

              {/* Closing quote mark */}
              <div className="absolute bottom-2 right-3 text-stone-300 text-3xl font-serif leading-none select-none rotate-180">
                "
              </div>
            </>
          ) : (
            <>
              <Image
                src={displayImage}
                alt="Post preview"
                fill
                className="object-cover"
              />

              {/* Before/After badge */}
              {hasBeforeAfter && (
                <button
                  type="button"
                  onClick={() => setShowBefore(!showBefore)}
                  className="absolute bottom-3 left-0 right-0 flex justify-center"
                >
                  <span className="w-[52px] h-[26px] flex items-center justify-center rounded-md text-[11px] font-medium backdrop-blur-md bg-white/95 text-neutral-900">
                    {showBefore ? 'Before' : 'After'}
                  </span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Expanded view preview */}
      <div className="mt-6 bg-gray-50 rounded-xl p-4 space-y-4">
        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide">
          Expanded view
        </h3>

        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            {currentUser.image ? (
              <Image
                src={currentUser.image}
                alt={currentUser.name || 'You'}
                width={40}
                height={40}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm font-medium">
                {(currentUser.name || 'U')[0].toUpperCase()}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              {currentUser.name || 'You'}
            </p>
            <p className="text-xs text-gray-400">
              Just now
            </p>
          </div>
        </div>

        {/* Caption preview */}
        {caption && !isTextPost && (
          <p className="text-sm text-gray-600 line-clamp-3">
            {caption}
          </p>
        )}
        {isTextPost && (
          <p className="text-xs text-gray-400 italic">
            Text post - content shown in card
          </p>
        )}

        {/* Engagement preview (mock) */}
        <div className="flex items-center gap-4 pt-2 text-gray-400">
          <span className="flex items-center gap-1.5 text-xs">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            0
          </span>
          <span className="flex items-center gap-1.5 text-xs">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            0
          </span>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-gray-400">
        Tap Post to share with your followers
      </p>
    </div>
  );
};

export default PreviewStep;
