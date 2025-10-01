'use client';

import React from 'react';
import { Crown } from 'lucide-react';
import Heading from '../Heading';
import Input from '../inputs/Input';
import { FieldErrors, UseFormRegister } from 'react-hook-form';

interface JobTitleStepProps {
  jobTitle: string;
  isOwnerManager: boolean;
  userType?: 'customer' | 'individual' | 'team';
  onOwnerManagerChange: (isOwnerManager: boolean) => void;
  register: UseFormRegister<any>;
  errors: FieldErrors;
  isLoading?: boolean;
}

const JobTitleStep: React.FC<JobTitleStepProps> = ({
  jobTitle,
  isOwnerManager,
  userType = 'team',
  onOwnerManagerChange,
  register,
  errors,
  isLoading = false,
}) => {
  const isIndividual = userType === 'individual';
  const isTeam = userType === 'team';

  const handleOwnerManagerToggle = () => {
    onOwnerManagerChange(!isOwnerManager);
  };

  return (
    <div className="flex flex-col gap-6">
      <Heading
        title={isIndividual ? "What's your professional title?" : "What's your role?"}
        subtitle={
          isIndividual 
            ? "Let clients know your expertise and specialization."
            : "Help us understand your position at the business."
        }
      />
      
      <div className="space-y-4">
        {/* Owner/Manager Option - Only show for team members */}
        {isTeam && (
          <button
            type="button"
            onClick={handleOwnerManagerToggle}
            disabled={isLoading}
            className={`
              w-full rounded-xl shadow flex items-center justify-center p-4 space-x-3
              cursor-pointer select-none
              transition-[transform,background-color,color] duration-200 ease-out
              ${isOwnerManager ? 'bg-[#60A5FA] text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-blue-50'}
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
              will-change-transform transform-gpu
              focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#60A5FA]
            `}
          >
            <Crown
              className={`
                w-6 h-6
                transition-transform duration-200 ease-out
                ${isOwnerManager ? 'scale-110' : 'scale-100'}
                transform-gpu
              `}
            />
            <div className="text-center">
              <h3
                className={`
                  font-medium text-sm leading-none
                  transition-transform duration-200 ease-out
                  ${isOwnerManager ? 'scale-105' : 'scale-100'}
                  transform-gpu
                `}
              >
                I&apos;m the owner/manager
              </h3>
            </div>
          </button>
        )}

        {/* Job Title Input - show for individuals always, or for team if not owner/manager */}
        {(isIndividual || !isOwnerManager) && (
          <div>
            <Input
              id="jobTitle"
              label={isIndividual ? "Professional Title" : "Job Title"}
              disabled={isLoading}
              register={register}
              errors={errors}
              required={isIndividual || !isOwnerManager}
            />
            <p className="mt-2 text-xs text-neutral-500">
              {isIndividual 
                ? "Enter your professional title or specialty area"
                : "Enter your specific role (e.g., Hair Stylist, Barber, Nail Technician, Massage Therapist)"
              }
            </p>
          </div>
        )}

        {/* Info Box */}
        {isTeam && isOwnerManager && (
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              <strong>Owner/Manager selected.</strong> You&apos;ll have full access to manage this business account, 
              including services, employees, and bookings.
            </p>
          </div>
        )}

        {isIndividual && (
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              <strong>Why we ask:</strong> Your professional title helps clients understand your expertise 
              and find the right service provider for their needs.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobTitleStep;