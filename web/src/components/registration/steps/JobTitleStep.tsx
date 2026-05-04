'use client';

import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { AnimatePresence, motion } from 'framer-motion';
import TypeformHeading from '../TypeformHeading';

const BLOCKED_TITLES = /\b(owner|manager|ceo|founder|co-founder|president|director)\b/i;

interface JobTitleStepProps {
  userType: string;
  isOwnerManager: boolean;
  ownerPerformsServices: boolean | null;
  onOwnerManagerChange: (value: boolean) => void;
  onOwnerPerformsServicesChange: (value: boolean) => void;
}

export default function JobTitleStep({ userType, isOwnerManager, ownerPerformsServices, onOwnerManagerChange, onOwnerPerformsServicesChange }: JobTitleStepProps) {
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
          <button
            type="button"
            onClick={() => onOwnerManagerChange(!isOwnerManager)}
            style={{ WebkitTapHighlightColor: 'transparent' }}
            className={`
              w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200
              ${isOwnerManager
                ? 'border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 shadow-inset-pressed'
                : 'border-stone-200 bg-white dark:bg-stone-900 hover:border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 '
              }
            `}
          >
            <div className={`
              w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all
              ${isOwnerManager ? 'border-stone-900 bg-stone-900' : 'border-stone-300 dark:border-stone-700'}
            `}>
              {isOwnerManager && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div>
              <span className="text-sm font-medium text-stone-900 dark:text-stone-100">I&apos;m the owner or manager</span>
              <p className="text-xs text-stone-500 dark:text-stone-500 mt-0.5">You&apos;ll have full access to manage the business</p>
            </div>
          </button>
        )}

        <AnimatePresence initial={false}>
          {isTeam && isOwnerManager && (
            <motion.div
              key="owner-performs"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0 } }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="space-y-3 pt-1">
                <p className="text-sm font-medium text-stone-700 dark:text-stone-200">Do you also perform services?</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => onOwnerPerformsServicesChange(true)}
                    style={{ WebkitTapHighlightColor: 'transparent', willChange: 'box-shadow, background-color, border-color' }}
                    className={`
                      p-4 rounded-xl border text-left
                      transition-[background-color,border-color,box-shadow] duration-200 ease-out
                      focus:outline-none
                      ${ownerPerformsServices === true
                        ? 'border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 shadow-inset-pressed'
                        : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 shadow-none hover:border-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                      }
                    `}
                  >
                    <span className="font-medium text-stone-900 dark:text-stone-100">Yes, I perform services</span>
                    <p className="text-sm text-stone-500 dark:text-stone-500 mt-0.5">e.g., I also cut hair or do makeup</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOwnerPerformsServicesChange(false)}
                    style={{ WebkitTapHighlightColor: 'transparent', willChange: 'box-shadow, background-color, border-color' }}
                    className={`
                      p-4 rounded-xl border text-left
                      transition-[background-color,border-color,box-shadow] duration-200 ease-out
                      focus:outline-none
                      ${ownerPerformsServices === false
                        ? 'border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 shadow-inset-pressed'
                        : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 shadow-none hover:border-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                      }
                    `}
                  >
                    <span className="font-medium text-stone-900 dark:text-stone-100">No, I just own/manage</span>
                    <p className="text-sm text-stone-500 dark:text-stone-500 mt-0.5">I run the business but don&apos;t take clients</p>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {(!isTeam || !isOwnerManager || ownerPerformsServices === true) && (
            <motion.div
              key="job-title"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0 } }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="pt-1">
                <label htmlFor="jobTitle" className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">
                  Job title
                </label>
                <input
                  id="jobTitle"
                  type="text"
                  autoFocus={!isTeam}
                  {...register('jobTitle', {
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
                  className="w-full px-4 py-3.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-[box-shadow,border-color] duration-150"
                  placeholder={isTeam ? "e.g., Senior Stylist, Barber" : "e.g., Hair Stylist, Makeup Artist"}
                />
                {errors.jobTitle && (
                  <p className="mt-2 text-sm text-danger">{errors.jobTitle.message as string}</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
