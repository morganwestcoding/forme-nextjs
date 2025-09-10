'use client';

import React from 'react';
import { User, Users } from 'lucide-react';
import Heading from '../Heading';

export type UserType = 'customer' | 'individual' | 'team';

interface UserTypeStepProps {
  userType: UserType | '';
  onUserTypeChange: (userType: UserType) => void;
  isLoading?: boolean;
}

const UserTypeStep: React.FC<UserTypeStepProps> = ({
  userType,
  onUserTypeChange,
  isLoading = false,
}) => {
  return (
    <div className="flex flex-col gap-6">
      <Heading
        title="How will you use ForMe?"
        subtitle="This helps us personalize your experience and set up your account properly."
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Just a customer */}
        <button
          type="button"
          onClick={() => onUserTypeChange('customer')}
          disabled={isLoading}
          className={`
            rounded-xl shadow flex flex-col items-center justify-center p-6 space-y-3
            cursor-pointer select-none
            transition-[transform,background-color,color] duration-200 ease-out
            ${userType === 'customer' ? 'bg-[#60A5FA] text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-blue-50'}
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            will-change-transform transform-gpu
            focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#60A5FA]
          `}
        >
          <User
            className={`
              w-8 h-8
              transition-transform duration-200 ease-out
              ${userType === 'customer' ? 'scale-110' : 'scale-100'}
              transform-gpu
            `}
          />
          <div className="text-center">
            <h3
              className={`
                font-medium text-sm leading-none mb-1
                transition-transform duration-200 ease-out
                ${userType === 'customer' ? 'scale-105' : 'scale-100'}
                transform-gpu
              `}
            >
              Just a customer
            </h3>
            <p className={`text-xs opacity-80 ${userType === 'customer' ? 'text-white' : 'text-neutral-500'}`}>
              Book appointments & discover services
            </p>
          </div>
        </button>

        {/* Individual service provider */}
        <button
          type="button"
          onClick={() => onUserTypeChange('individual')}
          disabled={isLoading}
          className={`
            rounded-xl shadow flex flex-col items-center justify-center p-6 space-y-3
            cursor-pointer select-none
            transition-[transform,background-color,color] duration-200 ease-out
            ${userType === 'individual' ? 'bg-[#60A5FA] text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-blue-50'}
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            will-change-transform transform-gpu
            focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#60A5FA]
          `}
        >
          <User
            className={`
              w-8 h-8
              transition-transform duration-200 ease-out
              ${userType === 'individual' ? 'scale-110' : 'scale-100'}
              transform-gpu
            `}
          />
          <div className="text-center">
            <h3
              className={`
                font-medium text-sm leading-none mb-1
                transition-transform duration-200 ease-out
                ${userType === 'individual' ? 'scale-105' : 'scale-100'}
                transform-gpu
              `}
            >
              Individual provider
            </h3>
            <p className={`text-xs opacity-80 ${userType === 'individual' ? 'text-white' : 'text-neutral-500'}`}>
              Offer services independently
            </p>
          </div>
        </button>

        {/* Part of a team */}
        <button
          type="button"
          onClick={() => onUserTypeChange('team')}
          disabled={isLoading}
          className={`
            rounded-xl shadow flex flex-col items-center justify-center p-6 space-y-3
            cursor-pointer select-none
            transition-[transform,background-color,color] duration-200 ease-out
            ${userType === 'team' ? 'bg-[#60A5FA] text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-blue-50'}
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            will-change-transform transform-gpu
            focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#60A5FA]
          `}
        >
          <Users
            className={`
              w-8 h-8
              transition-transform duration-200 ease-out
              ${userType === 'team' ? 'scale-110' : 'scale-100'}
              transform-gpu
            `}
          />
          <div className="text-center">
            <h3
              className={`
                font-medium text-sm leading-none mb-1
                transition-transform duration-200 ease-out
                ${userType === 'team' ? 'scale-105' : 'scale-100'}
                transform-gpu
              `}
            >
              Part of a team
            </h3>
            <p className={`text-xs opacity-80 ${userType === 'team' ? 'text-white' : 'text-neutral-500'}`}>
              Work at an existing business
            </p>
          </div>
        </button>
      </div>

      {/* Additional information based on selection */}
      {userType && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          {userType === 'customer' && (
            <p className="text-sm text-blue-700">
              You'll be able to browse businesses, book appointments, and discover new services in your area.
            </p>
          )}
          {userType === 'individual' && (
            <p className="text-sm text-blue-700">
              We'll help you create your own business listing and manage your services independently.
            </p>
          )}
          {userType === 'team' && (
            <p className="text-sm text-blue-700">
              Next, we'll help you find your business and set up your employee profile with the services you provide.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default UserTypeStep;