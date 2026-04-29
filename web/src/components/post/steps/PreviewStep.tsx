'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { FavouriteIcon, Comment01Icon, Bookmark02Icon } from 'hugeicons-react';
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
  mediaType,
  caption,
  beforeImageSrc,
  currentUser,
  isTextPost = false,
}) => {
  const [showBefore, setShowBefore] = useState(false);
  const hasBeforeAfter = !!beforeImageSrc && !isTextPost && mediaType !== 'video';

  return (
    <div>
      <TypeformHeading
        question="Preview your post"
        subtitle="This is how your post will appear in the feed."
      />

      {/* Newsfeed-style layout: media card + side panel */}
      <div className="flex items-center gap-5">
        {/* Media card — same 9:16 proportions as newsfeed */}
        <div
          className="relative overflow-hidden rounded-2xl bg-stone-100 dark:bg-stone-800 flex-shrink-0"
          style={{
            width: '280px',
            aspectRatio: '9 / 16',
            boxShadow: 'inset 0 0 30px rgba(0,0,0,0.08), inset 0 0 6px rgba(0,0,0,0.04)',
          }}
          onMouseEnter={() => hasBeforeAfter && setShowBefore(true)}
          onMouseLeave={() => hasBeforeAfter && setShowBefore(false)}
        >
          {isTextPost ? (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900" />
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <p className="text-white/90 text-sm leading-relaxed font-medium text-center line-clamp-8 whitespace-pre-wrap">
                  {caption}
                </p>
              </div>
              <div className="absolute top-3 left-3 text-white/20 text-3xl font-serif leading-none select-none">
                &ldquo;
              </div>
            </>
          ) : mediaType === 'video' ? (
            <video
              src={mediaSrc}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : hasBeforeAfter ? (
            <>
              <Image src={beforeImageSrc} alt="Before image preview" fill className="object-cover" sizes="280px" />
              <div
                className="absolute inset-0 transition-[clip-path] duration-500 ease-out"
                style={{ clipPath: showBefore ? 'inset(0 100% 0 0)' : 'inset(0 0% 0 0)' }}
              >
                <Image src={mediaSrc} alt="After image preview" fill className="object-cover" sizes="280px" />
              </div>
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white dark:bg-stone-900 shadow-[0_0_12px_rgba(255,255,255,0.8)] transition-all duration-500 ease-out z-10"
                style={{ left: showBefore ? '0%' : '100%', opacity: showBefore ? 1 : 0 }}
              />
              <div className="absolute bottom-12 left-0 right-0 flex justify-center pointer-events-none z-20">
                <div className="relative w-[52px] h-[26px]">
                  <span className={`absolute inset-0 flex items-center justify-center rounded-full text-[11px] font-medium bg-white/95 text-stone-900 dark:text-stone-100 backdrop-blur-md transition-all duration-500 ease-out ${showBefore ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'}`}>Before</span>
                  <span className={`absolute inset-0 flex items-center justify-center rounded-full text-[11px] font-medium bg-white/95 text-stone-900 dark:text-stone-100 backdrop-blur-md transition-all duration-500 ease-out ${showBefore ? 'opacity-0 blur-sm' : 'opacity-100 blur-0'}`}>After</span>
                </div>
              </div>
            </>
          ) : (
            <Image
              src={mediaSrc}
              alt="Post preview"
              fill
              className="object-cover"
              sizes="280px"
            />
          )}
        </div>

        {/* Side panel — avatar, caption, engagement */}
        <div className="flex-1 min-w-0">
          {/* User info */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-stone-200 dark:bg-stone-700"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)' }}
            >
              {currentUser.image ? (
                <Image
                  src={currentUser.image}
                  alt={currentUser.name || 'You'}
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-500  dark:text-stone-500 text-sm font-medium">
                  {(currentUser.name || 'U')[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-stone-900 dark:text-stone-100 truncate">
                {currentUser.name || 'You'}
              </p>
              <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">Just now</p>
            </div>
          </div>

          {/* Caption */}
          {caption && (
            <p className="text-[13px] leading-[1.7] text-stone-600 dark:text-stone-300 line-clamp-4 mb-4">
              {caption}
            </p>
          )}

          {/* Engagement buttons */}
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-stone-400 dark:text-stone-500">
              <FavouriteIcon className="w-[18px] h-[18px]" />
              <span className="text-[12px]">0</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-stone-400 dark:text-stone-500">
              <Comment01Icon className="w-[18px] h-[18px]" />
              <span className="text-[12px]">0</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-stone-400 dark:text-stone-500">
              <Bookmark02Icon className="w-[18px] h-[18px]" />
            </div>
          </div>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-stone-400 dark:text-stone-500">
        This is how your post will look in the feed
      </p>
    </div>
  );
};

export default PreviewStep;
