'use client';

import React from 'react';
import { Check } from 'lucide-react';
import Heading from '../Heading';
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

        {/* Job Title Input with floating label */}
        {(isIndividual || !isOwnerManager) && (
          <div className="relative">
            <input
              id="jobTitle"
              type="text"
              placeholder=" "
              disabled={isLoading}
              {...register('jobTitle', { required: isIndividual || !isOwnerManager })}
              className={`
                peer w-full p-3 pt-6 pl-4 h-[58px] bg-white border rounded-xl
                text-base text-neutral-800
                outline-none transition-all duration-200
                hover:border-gray-300
                disabled:opacity-50 disabled:cursor-not-allowed
                ${errors.jobTitle
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                  : 'border-gray-200/60 focus:border-[var(--accent-color)] focus:ring-2 focus:ring-[var(--accent-color-light)]'}
              `}
            />
            <label
              htmlFor="jobTitle"
              className={`
                absolute left-4 top-5 origin-[0] text-sm pointer-events-none
                transition-transform duration-150
                ${errors.jobTitle
                  ? 'text-rose-500 scale-75 -translate-y-4'
                  : 'text-gray-500 -translate-y-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4'
                }
              `}
            >
              Job Title
            </label>
            {errors.jobTitle && (
              <p className="mt-1.5 text-xs text-rose-500 font-medium">Job title is required</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobTitleStep;
