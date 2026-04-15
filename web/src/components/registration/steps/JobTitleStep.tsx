'use client';

import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { motion } from 'framer-motion';
import TypeformHeading from '../TypeformHeading';
import { itemVariants } from '../TypeformStep';

const BLOCKED_TITLES = /\b(owner|manager|ceo|founder|co-founder|president|director)\b/i;

interface JobTitleStepProps {
  userType: string;
  isOwnerManager: boolean;
  onOwnerManagerChange: (value: boolean) => void;
}

export default function JobTitleStep({ userType, isOwnerManager, onOwnerManagerChange }: JobTitleStepProps) {
  const { register, formState: { errors }, watch, setError, clearErrors } = useFormContext();
  const jobTitleValue = watch('jobTitle');

  const isTeam = userType === 'team';

  useEffect(() => {
    if (jobTitleValue && BLOCKED_TITLES.test(jobTitleValue.trim())) {
      const msg = isTeam
        ? 'Use the checkbox above for owner/manager roles'
        : 'Enter your service title instead (e.g., Hair Stylist)';
      setError('jobTitle', { type: 'manual', message: msg });
    } else {
      if (errors.jobTitle?.type === 'manual') clearErrors('jobTitle');
    }
  }, [jobTitleValue, isTeam, setError, clearErrors, errors.jobTitle?.type]);

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
                ? 'border-stone-900 bg-stone-50 dark:bg-stone-900'
                : 'border-stone-200  bg-white dark:bg-stone-900 hover:border-stone-300 dark:border-stone-700'
              }
            `}
          >
            <div className={`
              w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all
              ${isOwnerManager ? 'border-stone-900 bg-stone-900' : 'border-stone-300 dark:border-stone-700'}
            `}>
              {isOwnerManager && (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div>
              <span className="font-medium text-stone-900 dark:text-stone-100">I&apos;m the owner or manager</span>
              <p className="text-sm text-stone-500  dark:text-stone-500 mt-0.5">You&apos;ll have full access to manage the business</p>
            </div>
          </motion.button>
        )}

        {(!isTeam || !isOwnerManager) && (
          <motion.div variants={itemVariants}>
            <label htmlFor="jobTitle" className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">
              Job title
            </label>
            <input
              id="jobTitle"
              type="text"
              autoFocus={!isTeam}
              {...register('jobTitle', {
                // Requiredness is enforced at the flow level via canProceed so
                // that the edit flow (where jobTitle is optional) isn't blocked
                // at final submit by a stale required validation.
                validate: (value: string) => {
                  if (!value) return true;
                  const blocked = /^(owner|manager|owner\/manager|ceo|founder|co-founder|president|director)$/i;
                  if (blocked.test(value)) {
                    return isTeam
                      ? 'Use the checkbox above for owner/manager roles'
                      : 'Enter your service title instead (e.g., Hair Stylist)';
                  }
                  return true;
                },
              })}
              className="w-full px-4 py-3.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all"
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
