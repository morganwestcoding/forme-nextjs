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

      <div className="flex justify-center">
        <div className="flex flex-col items-center gap-2">
          <div
            className="relative overflow-hidden rounded-xl flex-shrink-0"
            style={{
              width: '200px',
              aspectRatio: '9 / 16',
              boxShadow: 'inset 0 0 30px rgba(0,0,0,0.08), inset 0 0 6px rgba(0,0,0,0.04)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900" />
            <div className="absolute inset-0 flex items-center justify-center p-5">
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
          <span className={`text-xs font-medium ${content.length > 250 ? 'text-warning' : 'text-stone-500 dark:text-stone-500'}`}>
            {content.length}/280
          </span>
        </div>
      </div>
    </div>
  );
};

export default TextContentStep;
