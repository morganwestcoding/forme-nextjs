'use client';

import React from 'react';
import { Check } from 'lucide-react';
import Heading from '../Heading';
import { FieldErrors, UseFormRegister } from 'react-hook-form';

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
  const isIndividual = userType === 'individual';
  const isTeam = userType === 'team';

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
                transition-colors duration-100 border
                ${isOwnerManager
                  ? 'bg-blue-500 border-blue-500'
                  : 'border-neutral-300'
                }
              `}
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
          <div>
            <input
              id="jobTitle"
              type="text"
              placeholder="Hair Stylist, Barber, Massage Therapist..."
              disabled={isLoading}
              {...register('jobTitle', { required: isIndividual || !isOwnerManager })}
              className={`
                w-full px-4 py-3 rounded-lg border border-neutral-300
                text-sm text-neutral-800 placeholder:text-neutral-400
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                disabled:opacity-50 disabled:cursor-not-allowed
                ${errors.jobTitle ? 'border-red-500' : ''}
              `}
            />
            {errors.jobTitle && (
              <p className="mt-1 text-xs text-red-500">Job title is required</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobTitleStep;
