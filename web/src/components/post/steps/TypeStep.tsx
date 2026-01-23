'use client';

import React from 'react';
import TypeformHeading from '@/components/registration/TypeformHeading';

type PostType = 'media' | 'text';

interface TypeStepProps {
  selectedType: PostType | null;
  onTypeSelect: (type: PostType) => void;
}

const TypeStep: React.FC<TypeStepProps> = ({ selectedType, onTypeSelect }) => {
  const options: { type: PostType; label: string; description: string; icon: React.ReactNode }[] = [
    {
      type: 'media',
      label: 'Photo or Video',
      description: 'Share your work with images or videos',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      ),
    },
    {
      type: 'text',
      label: 'Text Post',
      description: 'Share a thought, tip, or announcement',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
      ),
    },
  ];

  return (
    <div>
      <TypeformHeading
        question="What would you like to post?"
        subtitle="Choose how you want to share your content"
      />

      <div className="flex flex-col gap-3 max-w-md mx-auto">
        {options.map((option) => (
          <button
            key={option.type}
            type="button"
            onClick={() => onTypeSelect(option.type)}
            className={`
              w-full p-4 rounded-xl text-left transition-all duration-200
              flex items-center gap-4
              ${selectedType === option.type
                ? 'bg-neutral-900 text-white ring-2 ring-neutral-900'
                : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
              }
            `}
          >
            <div className={`
              w-12 h-12 rounded-xl flex items-center justify-center
              ${selectedType === option.type ? 'bg-white/10' : 'bg-white'}
            `}>
              {option.icon}
            </div>
            <div className="flex-1">
              <div className="font-medium">{option.label}</div>
              <div className={`text-sm ${selectedType === option.type ? 'text-white/70' : 'text-neutral-500'}`}>
                {option.description}
              </div>
            </div>
            {selectedType === option.type && (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TypeStep;
