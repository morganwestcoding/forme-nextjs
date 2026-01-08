'use client';

import { useFormContext } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';
import TypeformHeading from '../TypeformHeading';

interface PasswordValidation {
  hasMinLength: boolean;
  hasMaxLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export default function AccountStep() {
  const { register, watch, formState: { errors } } = useFormContext();
  const [showPassword, setShowPassword] = useState(false);
  const password = watch('password') || '';

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

  const allValid = Object.values(validation).every(Boolean);

  return (
    <div>
      <TypeformHeading
        question="Let's get you started"
        subtitle="Create your account to continue"
      />

      <div className="space-y-5">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
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
            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="mt-2 text-sm text-red-500">{errors.email.message as string}</p>
          )}
        </div>

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Full name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            {...register('name', {
              required: 'Name is required',
              pattern: {
                value: /^[a-zA-Z\s'.-]+$/,
                message: 'Name can only contain letters and common punctuation'
              }
            })}
            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
            placeholder="John Doe"
          />
          {errors.name && (
            <p className="mt-2 text-sm text-red-500">{errors.name.message as string}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              {...register('password', { required: 'Password is required' })}
              className="w-full px-4 py-3.5 pr-12 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              placeholder="Create a password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>

          {/* Password requirements */}
          {password.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <RequirementItem met={validation.hasMinLength} text="6+ characters" />
              <RequirementItem met={validation.hasMaxLength} text="Max 18 characters" />
              <RequirementItem met={validation.hasUpperCase} text="Uppercase letter" />
              <RequirementItem met={validation.hasLowerCase} text="Lowercase letter" />
              <RequirementItem met={validation.hasNumber} text="Number" />
              <RequirementItem met={validation.hasSpecialChar} text="Special character" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
  return (
    <div className={`flex items-center gap-2 text-sm transition-colors ${met ? 'text-emerald-600' : 'text-gray-400'}`}>
      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${met ? 'bg-emerald-100' : 'bg-gray-100'}`}>
        {met && <FiCheck size={10} />}
      </div>
      {text}
    </div>
  );
}
