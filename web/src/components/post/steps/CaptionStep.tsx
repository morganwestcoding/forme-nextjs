'use client';

import React from 'react';
import TypeformHeading from '@/components/registration/TypeformHeading';

interface CaptionStepProps {
  caption: string;
  onCaptionChange: (caption: string) => void;
}

const CaptionStep: React.FC<CaptionStepProps> = ({
  caption,
  onCaptionChange,
}) => {
  const maxLength = 500;
  const remaining = maxLength - caption.length;

  return (
    <div>
      <TypeformHeading
        question="Add a caption"
        subtitle="Describe your work, share the technique, or tell the story behind it."
      />

      <div className="space-y-2">
        <textarea
          value={caption}
          onChange={(e) => onCaptionChange(e.target.value.slice(0, maxLength))}
          placeholder="Clean fade for the summer..."
          className="w-full h-40 px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-900  placeholder:text-stone-400 dark:text-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent resize-none transition-all"
        />
        <div className="flex justify-between items-center text-xs">
          <span className="text-stone-400 dark:text-stone-500">
            Optional
          </span>
          <span className={`${remaining < 50 ? 'text-amber-500' : 'text-stone-400 dark:text-stone-500'}`}>
            {remaining} characters left
          </span>
        </div>
      </div>

      <div className="mt-6 bg-stone-50 dark:bg-stone-900 rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-medium text-stone-700 dark:text-stone-200">
          Tips for great captions
        </h3>
        <ul className="text-xs text-stone-500  dark:text-stone-500 space-y-1.5">
          <li className="flex items-start gap-2">
            <span className="text-stone-400 dark:text-stone-500 mt-0.5">*</span>
            <span>Mention the service or technique used</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-stone-400 dark:text-stone-500 mt-0.5">*</span>
            <span>Keep it concise - let the work speak for itself</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-stone-400 dark:text-stone-500 mt-0.5">*</span>
            <span>Add context if there is a story behind it</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CaptionStep;
