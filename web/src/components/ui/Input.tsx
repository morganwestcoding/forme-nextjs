'use client';

import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, leftIcon, rightIcon, className = '', id, ...rest }, ref) => {
    const inputId = id || rest.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[12px] font-medium text-stone-700 dark:text-stone-300 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full h-10 bg-white dark:bg-stone-900 rounded-xl border
              text-[13px] text-stone-900 dark:text-stone-100
              placeholder:text-stone-400
              outline-none transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              ${leftIcon ? 'pl-10' : 'pl-3.5'}
              ${rightIcon ? 'pr-10' : 'pr-3.5'}
              ${error
                ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                : 'border-stone-200/60 hover:border-stone-300 focus:border-stone-900 focus:ring-2 focus:ring-stone-100 dark:border-stone-700 dark:hover:border-stone-600 dark:focus:border-stone-100 dark:focus:ring-stone-800'
              }
              ${className}
            `}
            {...rest}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
              {rightIcon}
            </div>
          )}
        </div>
        {(error || helper) && (
          <p className={`text-[11px] mt-1 ${error ? 'text-rose-500 font-medium' : 'text-stone-400'}`}>
            {error || helper}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
