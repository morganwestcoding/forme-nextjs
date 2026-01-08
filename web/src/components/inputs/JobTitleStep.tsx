'use client';

import React from 'react';
import { Check } from 'lucide-react';
import Heading from '../Heading';
import Input from './Input';
import { FieldErrors, UseFormRegister } from 'react-hook-form';
import { useTheme } from '@/app/context/ThemeContext';

interface JobTitleStepProps {
  isOwnerManager: boolean;
  userType?: 'customer' | 'individual' | 'team';
  onOwnerManagerChange: (isOwnerManager: boolean) => void;
  register: UseFormRegister<any>;
  errors: FieldErrors;
  isLoading?: boolean;
}

const JobTitleStep: React.FC<JobTitleStepProps> = ({
  isOwnerManager,
  userType = 'team',
  onOwnerManagerChange,
  register,
  errors,
  isLoading = false,
}) => {
  const { accentColor } = useTheme();
  const isIndividual = userType === 'individual';
  const isTeam = userType === 'team';

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
        title="What's your job title?"
        subtitle="This appears on your profile and helps clients find the right provider"
      />

      <div className="space-y-3">
        {/* Owner/Manager Option - Only show for team members */}
        {isTeam && (
          <button
            type="button"
            onClick={() => onOwnerManagerChange(!isOwnerManager)}
            disabled={isLoading}
            className={`
              flex items-center gap-3 w-full px-3 py-3 rounded-md text-left
              transition-colors duration-100
              ${isOwnerManager ? 'bg-neutral-100' : 'hover:bg-neutral-50'}
              ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div
              className={`
                w-4 h-4 rounded flex items-center justify-center flex-shrink-0
                transition-all duration-100 border
                ${!isOwnerManager ? 'border-neutral-300' : ''}
              `}
              style={isOwnerManager ? {
                background: `linear-gradient(to bottom, ${accentColor}, ${darkerColor})`,
                borderColor: darkerColor
              } : undefined}
            >
              {isOwnerManager && <Check className="w-3 h-3 text-white" strokeWidth={2.5} />}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-neutral-800">I&apos;m the owner or manager</span>
              <span className="text-xs text-neutral-500">You&apos;ll have full control of this business</span>
            </div>
          </button>
        )}

        {/* Job Title Input */}
        {(isIndividual || !isOwnerManager) && (
          <Input
            id="jobTitle"
            label="Job Title"
            disabled={isLoading}
            register={register}
            errors={errors}
            required={isIndividual || !isOwnerManager}
          />
        )}
      </div>
    </div>
  );
};

export default JobTitleStep;
