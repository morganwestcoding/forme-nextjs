'use client';

import React from 'react';
import Heading from '../Heading';
import { Check } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';

export type UserType = 'customer' | 'individual' | 'team';

interface UserTypeStepProps {
  userType: UserType | '';
  onUserTypeChange: (userType: UserType) => void;
  isLoading?: boolean;
}

const options = [
  {
    type: 'customer' as const,
    label: 'Book services',
    description: 'Discover and book appointments',
  },
  {
    type: 'individual' as const,
    label: 'Go solo',
    description: 'Create your own profile',
  },
  {
    type: 'team' as const,
    label: 'Start or join a business',
    description: 'Set up or connect to a team',
  },
];

const UserTypeStep: React.FC<UserTypeStepProps> = ({
  userType,
  onUserTypeChange,
  isLoading = false,
}) => {
  const { accentColor } = useTheme();

  // Calculate a slightly darker shade for the gradient (same as VerificationBadge)
  const getDarkerShade = (hex: string): string => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = -20;
    const R = Math.max(0, Math.min(255, (num >> 16) + Math.round(2.55 * amt)));
    const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + Math.round(2.55 * amt)));
    const B = Math.max(0, Math.min(255, (num & 0x0000FF) + Math.round(2.55 * amt)));
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  };

  const darkerColor = getDarkerShade(accentColor);

  return (
    <div className="flex flex-col gap-4">
      <Heading
        title="What brings you to Forme?"
        subtitle="You can always change this later"
      />

      <div className="flex flex-col gap-1">
        {options.map((option) => {
          const isSelected = userType === option.type;

          return (
            <button
              key={option.type}
              type="button"
              onClick={() => onUserTypeChange(option.type)}
              disabled={isLoading}
              className={`
                flex items-center gap-3 px-3 py-3 rounded-md text-left
                transition-colors duration-100
                ${isSelected ? 'bg-neutral-100' : 'hover:bg-neutral-50'}
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div
                className={`
                  w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0
                  transition-all duration-100 border-2
                  ${!isSelected ? 'border-neutral-300' : ''}
                `}
                style={isSelected ? {
                  background: `linear-gradient(to bottom, ${accentColor}, ${darkerColor})`,
                  borderColor: darkerColor
                } : undefined}
              >
                {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-neutral-800">{option.label}</span>
                <span className="text-xs text-neutral-500">{option.description}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default UserTypeStep;
