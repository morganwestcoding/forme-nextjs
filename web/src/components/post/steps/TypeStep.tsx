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
                  ? 'border-gray-300 bg-gray-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-200
                ${isSelected ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'}
              `}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{option.label}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-sm text-gray-400 text-center mt-6">
        Select an option to continue
      </p>
    </div>
  );
};

export default TypeStep;
