'use client';

import { useFormContext } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ViewIcon as FiEye, ViewOffIcon as FiEyeOff, Tick02Icon as FiCheck } from 'hugeicons-react';
import TypeformHeading from '../TypeformHeading';
import { titleCaseName } from '@/lib/names';

interface PasswordValidation {
  hasMinLength: boolean;
  hasMaxLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export default function AccountStep() {
  const { register, watch, formState: { errors }, setValue } = useFormContext();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const password = watch('password') || '';
  const confirmPassword = watch('confirmPassword') || '';

  const [validation, setValidation] = useState<PasswordValidation>({
    hasMinLength: false,
    hasMaxLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  useEffect(() => {
    setValidation({
      hasMinLength: password.length >= 6,
      hasMaxLength: password.length > 0 && password.length <= 18,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),]/.test(password),
    });
  }, [password]);

  const firstNameReg = register('firstName', {
    required: 'First name is required',
    pattern: {
      value: /^[a-zA-Z\s'.-]+$/,
      message: 'First name can only contain letters and common punctuation'
    }
  });
  const lastNameReg = register('lastName', {
    required: 'Last name is required',
    pattern: {
      value: /^[a-zA-Z\s'.-]+$/,
      message: 'Last name can only contain letters and common punctuation'
    }
  });

  const handleNameBlur = (field: 'firstName' | 'lastName', reg: typeof firstNameReg) =>
    (e: React.FocusEvent<HTMLInputElement>) => {
      reg.onBlur(e);
      const normalized = titleCaseName(e.target.value);
      if (normalized !== e.target.value) {
        setValue(field, normalized, { shouldValidate: true, shouldDirty: true });
      }
    };

  return (
    <div>
      <TypeformHeading
        question="Let's get you started"
        subtitle="Create your account to continue"
      />

      <div className="space-y-5">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            autoFocus
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email'
              }
            })}
            className="w-full px-4 py-3.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-[box-shadow,border-color] duration-150"
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="mt-2 text-sm text-red-500">{errors.email.message as string}</p>
          )}
        </div>

        {/* First / Last Name — side by side */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">
              First name
            </label>
            <input
              id="firstName"
              type="text"
              autoComplete="given-name"
              {...firstNameReg}
              onBlur={handleNameBlur('firstName', firstNameReg)}
              className={`w-full px-4 py-3.5 bg-stone-50 dark:bg-stone-900 border rounded-xl text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:border-transparent transition-[box-shadow,border-color] duration-150 ${errors.firstName ? 'border-red-400 focus:ring-red-500' : 'border-stone-200 dark:border-stone-800 focus:ring-stone-900'}`}
              placeholder="John"
            />
            {errors.firstName && (
              <p className="mt-2 text-sm text-red-500">{errors.firstName.message as string}</p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">
              Last name
            </label>
            <input
              id="lastName"
              type="text"
              autoComplete="family-name"
              {...lastNameReg}
              onBlur={handleNameBlur('lastName', lastNameReg)}
              className={`w-full px-4 py-3.5 bg-stone-50 dark:bg-stone-900 border rounded-xl text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:border-transparent transition-[box-shadow,border-color] duration-150 ${errors.lastName ? 'border-red-400 focus:ring-red-500' : 'border-stone-200 dark:border-stone-800 focus:ring-stone-900'}`}
              placeholder="Doe"
            />
            {errors.lastName && (
              <p className="mt-2 text-sm text-red-500">{errors.lastName.message as string}</p>
            )}
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              {...register('password', { required: 'Password is required' })}
              className="w-full px-4 py-3.5 pr-12 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-[box-shadow,border-color] duration-150"
              placeholder="Create a password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400  hover:text-stone-600 dark:text-stone-300 transition-colors"
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>

          {/* Password requirements */}
          <AnimatePresence initial={false}>
            {password.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                  <RequirementItem met={validation.hasMinLength} text="6+ characters" />
                  <RequirementItem met={validation.hasMaxLength} text="Max 18 characters" />
                  <RequirementItem met={validation.hasUpperCase} text="Uppercase letter" />
                  <RequirementItem met={validation.hasLowerCase} text="Lowercase letter" />
                  <RequirementItem met={validation.hasNumber} text="Number" />
                  <RequirementItem met={validation.hasSpecialChar} text="Special character" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">
            Confirm password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === password || 'Passwords do not match',
              })}
              className={`w-full px-4 py-3.5 pr-12 bg-stone-50 dark:bg-stone-900 border rounded-xl text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:border-transparent transition-[box-shadow,border-color] duration-150 ${errors.confirmPassword ? 'border-red-400 focus:ring-red-500' : 'border-stone-200 dark:border-stone-800 focus:ring-stone-900'}`}
              placeholder="Re-enter your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:text-stone-300 transition-colors"
            >
              {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-2 text-sm text-red-500">{errors.confirmPassword.message as string}</p>
          )}
          {!errors.confirmPassword && confirmPassword.length > 0 && confirmPassword === password && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
              <FiCheck size={14} />
              Passwords match
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
  return (
    <div className={`flex items-center gap-2 text-sm transition-colors ${met ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-400 dark:text-stone-500'}`}>
      <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${met ? 'bg-emerald-50 border-emerald-200/60 dark:bg-emerald-500/10 dark:border-emerald-500/20' : 'bg-stone-100 border-stone-200/60 dark:bg-stone-800 dark:border-stone-700'}`}>
        {met && <FiCheck size={10} />}
      </div>
      {text}
    </div>
  );
}
