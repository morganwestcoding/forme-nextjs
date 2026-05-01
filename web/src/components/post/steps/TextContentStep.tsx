'use client';

import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import { FavouriteIcon, Comment01Icon, Bookmark02Icon } from 'hugeicons-react';
import { SafeUser } from '@/app/types';
import TypeformHeading from '@/components/registration/TypeformHeading';

interface TextContentStepProps {
  content: string;
  onContentChange: (content: string) => void;
  currentUser: SafeUser;
}

const TextContentStep: React.FC<TextContentStepProps> = ({ content, onContentChange, currentUser }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <div>
      <TypeformHeading
        question="What's on your mind?"
        subtitle="Share a thought, tip, or announcement with your audience"
      />

      {/* Newsfeed-style layout: text card + side panel */}
      <div className="flex items-center gap-5">
        {/* Text card — same 9:16 proportions as preview */}
        <div
          className="relative overflow-hidden rounded-2xl bg-stone-100 dark:bg-stone-800 flex-shrink-0"
          style={{
            width: '280px',
            aspectRatio: '9 / 16',
            boxShadow: 'inset 0 0 30px rgba(0,0,0,0.08), inset 0 0 6px rgba(0,0,0,0.04)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900" />
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              placeholder="Write something..."
              maxLength={280}
              className="w-full h-full bg-transparent text-white/90 text-sm leading-relaxed font-medium text-center placeholder:text-white/40 resize-none focus:outline-none"
            />
          </div>
          <div className="absolute top-3 left-3 text-white/20 text-3xl font-serif leading-none select-none pointer-events-none">
            &ldquo;
          </div>
        </div>

        {/* Side panel — avatar, username, engagement */}
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
                <div className="w-full h-full flex items-center justify-center text-stone-500 dark:text-stone-500 text-sm font-medium">
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

          {/* Character count */}
          <div className="mt-3">
            <span className={`text-[11px] ${content.length > 250 ? 'text-amber-500' : 'text-stone-400 dark:text-stone-500'}`}>
              {content.length}/280
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextContentStep;
