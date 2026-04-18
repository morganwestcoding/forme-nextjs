'use client';

import React, { forwardRef } from 'react';

type Padding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: Padding;
  interactive?: boolean;
  children: React.ReactNode;
}

const PADDING_CLASSES: Record<Padding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ padding = 'md', interactive = false, className = '', children, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          rounded-2xl border border-stone-200/60 bg-white
          dark:bg-stone-900 dark:border-stone-800
          ${PADDING_CLASSES[padding]}
          ${interactive
            ? 'transition-all duration-200 hover:border-stone-300 hover:shadow-elevation-2 cursor-pointer'
            : ''}
          ${className}
        `}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
