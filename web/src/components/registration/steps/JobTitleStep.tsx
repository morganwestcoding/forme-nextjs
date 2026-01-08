'use client';

import { useFormContext } from 'react-hook-form';
import { motion } from 'framer-motion';
import TypeformHeading from '../TypeformHeading';
import { itemVariants } from '../TypeformStep';

interface JobTitleStepProps {
  userType: string;
  isOwnerManager: boolean;
  onOwnerManagerChange: (value: boolean) => void;
}

export default function JobTitleStep({ userType, isOwnerManager, onOwnerManagerChange }: JobTitleStepProps) {
  const { register, formState: { errors } } = useFormContext();

  const isTeam = userType === 'team';

  return (
    <div>
      <TypeformHeading
        question={isTeam ? "What's your role?" : "What do you do?"}
        subtitle={isTeam ? "Tell us about your position" : "This will be displayed on your profile"}
      />

      <div className="space-y-5">
        {isTeam && (
          <motion.button
            type="button"
            variants={itemVariants}
            onClick={() => onOwnerManagerChange(!isOwnerManager)}
            className={`
              w-full flex items-center gap-4 p-5 rounded-xl border-2 text-left transition-colors duration-200
              ${isOwnerManager
                ? 'border-gray-900 bg-gray-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
              }
            `}
          >
            <div className={`
              w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all
              ${isOwnerManager ? 'border-gray-900 bg-gray-900' : 'border-gray-300'}
            `}>
              {isOwnerManager && (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div>
              <span className="font-medium text-gray-900">I&apos;m the owner or manager</span>
              <p className="text-sm text-gray-500 mt-0.5">You&apos;ll have full access to manage the business</p>
            </div>
          </motion.button>
        )}

        {(!isTeam || !isOwnerManager) && (
          <motion.div variants={itemVariants}>
            <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-2">
              Job title
            </label>
            <input
              id="jobTitle"
              type="text"
              autoFocus={!isTeam}
              {...register('jobTitle', {
                required: !isOwnerManager ? 'Job title is required' : false,
              })}
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              placeholder={isTeam ? "e.g., Senior Stylist, Barber" : "e.g., Hair Stylist, Makeup Artist"}
            />
            {errors.jobTitle && (
              <p className="mt-2 text-sm text-red-500">{errors.jobTitle.message as string}</p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
