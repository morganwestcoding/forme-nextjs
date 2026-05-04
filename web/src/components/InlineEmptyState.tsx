'use client';

import React from 'react';

/**
 * Inline empty-state block matching the dashed-border photo-upload look used in
 * the registration / listing / shop creation flows. Renders as a button with
 * hover feedback when `onClick` is provided, otherwise a static panel.
 */
interface InlineEmptyStateProps {
  title: string;
  subtitle?: string;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES = {
  sm: 'py-10 px-6',
  md: 'py-14 px-6',
  lg: 'min-h-[60vh] px-6',
};

const InlineEmptyState: React.FC<InlineEmptyStateProps> = ({
  title,
  subtitle,
  onClick,
  className = '',
  size = 'md',
}) => {
  const sizeClass = SIZE_CLASSES[size];
  const baseClass = `w-full flex items-center justify-center ${sizeClass} rounded-2xl border-2 border-dashed border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 transition-colors`;
  const interactiveClass = onClick
    ? 'hover:border-stone-900 dark:hover:border-stone-300 hover:bg-stone-100 dark:bg-stone-800 dark:hover:bg-stone-800 cursor-pointer'
    : '';

  const content = (
    <div className="text-center max-w-[360px]">
      <h3 className="text-[15px] font-semibold text-stone-700 dark:text-stone-200 tracking-[-0.01em] leading-tight">
        {title}
      </h3>
      {subtitle && (
        <p className="mt-1.5 text-[12.5px] text-stone-500 dark:text-stone-400 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${baseClass} ${interactiveClass} ${className}`}>
        {content}
      </button>
    );
  }

  return <div className={`${baseClass} ${className}`}>{content}</div>;
};

export default InlineEmptyState;
