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
          className="w-full h-40 px-4 py-3 rounded-2xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition-all"
        />
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-400">
            Optional
          </span>
          <span className={`${remaining < 50 ? 'text-amber-500' : 'text-gray-400'}`}>
            {remaining} characters left
          </span>
        </div>
      </div>

      <div className="mt-6 bg-gray-50 rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-medium text-gray-700">
          Tips for great captions
        </h3>
        <ul className="text-xs text-gray-500 space-y-1.5">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">*</span>
            <span>Mention the service or technique used</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">*</span>
            <span>Keep it concise - let the work speak for itself</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">*</span>
            <span>Add context if there is a story behind it</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CaptionStep;
