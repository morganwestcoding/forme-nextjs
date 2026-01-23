'use client';

import React, { useRef, useEffect } from 'react';
import TypeformHeading from '@/components/registration/TypeformHeading';

interface TextContentStepProps {
  content: string;
  onContentChange: (content: string) => void;
}

const TextContentStep: React.FC<TextContentStepProps> = ({ content, onContentChange }) => {
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

      <div className="flex gap-6 items-start justify-center">
        {/* Text input */}
        <div className="w-[220px]">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder="Write something..."
            maxLength={280}
            className="w-full h-[220px] p-4 rounded-2xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 resize-none focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent text-sm leading-relaxed"
          />

          {/* Character count */}
          <div className="mt-2 text-right">
            <span className={`text-sm ${content.length > 250 ? 'text-amber-500' : 'text-neutral-400'}`}>
              {content.length}/280
            </span>
          </div>
        </div>

        {/* Preview card */}
        <div
          className="relative overflow-hidden rounded-2xl w-[220px] flex-shrink-0 shadow-sm"
          style={{ aspectRatio: '1' }}
        >
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
              {content || 'Your text will appear here...'}
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
        </div>
      </div>
    </div>
  );
};

export default TextContentStep;
