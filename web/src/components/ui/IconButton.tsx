'use client';

import React, { forwardRef } from 'react';

type Variant = 'ghost' | 'outline' | 'solid';
type Size = 'sm' | 'md' | 'lg';

interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: Variant;
  size?: Size;
  icon: React.ReactNode;
  'aria-label': string;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  ghost: 'text-stone-500 hover:text-stone-900 hover:bg-stone-100 dark:bg-stone-800 dark:text-stone-400 dark:hover:text-stone-100 dark:hover:bg-stone-800',
  outline: 'border border-stone-200 text-stone-700 hover:bg-stone-50 dark:bg-stone-900 hover:border-stone-300 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800',
  solid: 'bg-stone-900 text-white hover:bg-stone-800 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-100',
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'w-7 h-7',
  md: 'w-9 h-9',
  lg: 'w-11 h-11',
};

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = 'ghost', size = 'md', icon, className = '', ...rest }, ref) => {
    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center rounded-xl
          transition-all duration-200 active:scale-[0.94]
          disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2
          ${VARIANT_CLASSES[variant]}
          ${SIZE_CLASSES[size]}
          ${className}
        `}
        {...rest}
      >
        {icon}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

export default IconButton;
