'use client';

import React from 'react';
import { Image01Icon, BubbleChatIcon } from 'hugeicons-react';
import TypeformHeading from '@/components/registration/TypeformHeading';

type PostType = 'media' | 'text';

interface TypeStepProps {
  selectedType: PostType | null;
  onTypeSelect: (type: PostType) => void;
}

const options: { type: PostType; label: string; description: string; icon: typeof Image01Icon }[] = [
  {
    type: 'media',
    label: 'Photo or Video',
    description: 'Share your work with images or videos',
    icon: Image01Icon,
  },
  {
    type: 'text',
    label: 'Text Post',
    description: 'Share a thought, tip, or announcement',
    icon: BubbleChatIcon,
  },
];

const TypeStep: React.FC<TypeStepProps> = ({ selectedType, onTypeSelect }) => {
  return (
    <div>
      <TypeformHeading
        question="What would you like to post?"
        subtitle="Choose how you want to share your content"
      />

      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedType === option.type;

          return (
            <button
              key={option.type}
              type="button"
              onClick={() => onTypeSelect(option.type)}
              className={`
                flex flex-col items-center text-center gap-3 p-5 rounded-xl border transition-colors duration-200
                ${isSelected
                  ? 'border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 shadow-inset-pressed'
                  : 'border-stone-200  bg-white dark:bg-stone-900 hover:border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 '
                }
              `}
            >
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-200
                ${isSelected ? 'bg-stone-800 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'}
              `}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900 dark:text-stone-100">{option.label}</h3>
                <p className="text-xs text-stone-500  dark:text-stone-500 mt-0.5">{option.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-sm text-stone-400 dark:text-stone-500 text-center mt-6">
        Select an option to continue
      </p>
    </div>
  );
};

export default TypeStep;
